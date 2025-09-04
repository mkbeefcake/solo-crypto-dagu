from fastapi import FastAPI, Request, HTTPException, APIRouter
from solomcp.server import register_mcp_custom_tool
from dotenv import load_dotenv
import json
import os
import requests
import anthropic
import uuid
import yaml
from node_definitions import NODE_DEFINITIONS
from langsmith import traceable
from langsmith.wrappers import wrap_anthropic
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from lib.workflow.helper import load_workflows, save_workflows
from lib.log.logger import logger
from lib.variable import temp_venv_directory
from lib.workflow.runner import WorkflowRunner
from solomcp.server import mcp
import copy

load_dotenv()

router = APIRouter(prefix="", tags=["workflow"])
client = wrap_anthropic(anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY")))

class Flow(BaseModel):
    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []
    viewports: List[Dict[str, Any]] = []

class Workflow(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    flow: Optional[Flow] = None


@traceable
@router.post("/workflow/claude")
async def chat(request: Request):
    print(f"/workflow/cluade is called")

    body = await request.json()
    user_request = body.get("user_request", "")
    current_json = body.get("current_json", "{}")

    print(f"user_request: {user_request}")

    prompt_template = f"""
You are an autonomous AI agent. 
Your goal is to achieve the user’s objective by reasoning step by step, 
using available tools when necessary, and clearly returning results. 

Guidelines:
- Think out loud about what steps are needed.
- If a tool is available that helps, call it instead of guessing.
- Only request a tool with valid JSON input matching its schema.
- After receiving tool results, incorporate them into your reasoning.
- Continue this loop until the user’s request is fulfilled.
- Provide a final, complete answer to the user's request.
- Do not ask any further clarifying questions or additional follow-ups.
- If information is missing, state what is missing instead of asking for it.

Remember:
- Always check your available tools before answering.
- Do not hallucinate information — rely on tools or user input.
- Stay within the user’s intent and avoid irrelevant actions.
"""
    tools = await mcp.list_tools()
    available_tools = [{
        "name": tool.name,
        "description": tool.description,
        "input_schema": tool.inputSchema
    } for tool in tools]

    # Ask Claude - initial message
    messages = [
        {"role": "user", "content": user_request},
    ]

    # Iterate claude request and response
    final_text = []
    tool_call_orders = []
    tool_results = {}

    while True:
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",  # Claude Sonnet 4
            max_tokens=3000,
            system=prompt_template,
            messages=messages,
            tools=available_tools
        )

        logger.info("Claude response", content=response)
        if response.stop_reason == 'end_turn':
            final_text = response.content[0].text
            break

        # Process response and handle tool calls        
        assistant_message_content = []
        for content in response.content:
            if content.type == 'text':
                final_text.append(content.text)
                assistant_message_content.append(content)

            elif content.type == 'tool_use':
                tool_id = content.id
                tool_name = content.name
                tool_args = copy.deepcopy(content.input)
                for k, v in tool_args.items():
                    if v in tool_results:
                        tool_args[k] = tool_results[v]

                # Execute tool call & parse its result
                result = await mcp.call_tool(tool_name, tool_args)
                
                tool_call_orders.append(f"[Calling tool {tool_name} with args {tool_args}]")

                text_contents, result_dict = result
                content_value = result_dict.get("result")
                if not content_value and text_contents:
                    content_value = getattr(text_contents[0], "text", str(text_contents[0]))

                tool_results[f"result_{tool_id}"] = content_value

                # adjust messages
                assistant_message_content.append(content)
                messages.append({
                    "role": "assistant",
                    "content": assistant_message_content
                })
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": content.id,
                            "content": f"result_{tool_id}"
                        }
                    ]
                })

    # adjust final_text with real tool results
    for k, v in tool_results.items():
        if k in final_text:
            final_text = final_text.replace(k, str(v))

    logger.info("Final response to user", final_text=final_text)
    workflow = create_react_flow(tool_call_orders)

    return {"updated_json": {"flow": workflow, "text": final_text}}


@traceable
def create_react_flow(tool_call_order:list, current_json:str = ""):
    print(f"create_react_flow is called")    
    # print(f"tool_call_order: {tool_call_order}, current_json: {current_json}")

    prompt_template = f"""
You are an assistant that creates or modifies React Flow JSON graphs.

- Input: A React flow node sequences and optionally an existing React Flow JSON.
- Task: If a JSON exists, modify it according to the React flow sequence.  
       If no JSON exists or create a valid new JSON from scratch.
- Rules:
  1. Always output only valid JSON, nothing else.  
  2. If creating a new flow, use the following reference templates as examples:
     - Simple two-node flow with one edge
     {{
       "nodes": [
         {{ "id": "node_1", "type": "general", "data": {{ "label": "Start", "inputs": [], "midputs":[{{"name": "url", "label":"Enter url", "type": "string", "value": ""}}], "outputs":[{{"name": "content", "type": "string"}}] }}, "position": {{ "x": 100, "y": 100 }} }},
         {{ "id": "node_2", "type": "general", "data": {{ "label": "End", "inputs": [{{"name": "text", "type": "string"}}], "midputs":[], "outputs":[] }}, "position": {{ "x": 400, "y": 100 }} }}
       ],
       "edges": [
         {{ "id": "edge_1-2", "source": "node_1", "target": "node_2", "sourceHandle": "output-0", "targetHandle": "input-0" }}
       ]
     }}
  3. Preserve existing fields unless explicitly changed.
  4. Ensure schema is valid for React Flow: `nodes` (with id, data, position) and `edges`.
  5. Ensure data fields match the following node definitions exactly.
  6. If the user provides values for a specific component, use them as the values for that component's midputs
  7. For each edge, the output type of the source component must match the input type of the target component.

React flow sequence:
{tool_call_order}

Each Node's data field schema definitions: {json.dumps(jsonable_encoder(NODE_DEFINITIONS))}

Current JSON (can be empty or null):
{current_json}

Return the updated or newly created JSON only:

"""

    response = client.messages.create(
        model="claude-3-5-sonnet-20240620",  # Claude Sonnet 4
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt_template}]
    )

    try:
        updated_json = json.loads(response.content[0].text)        
    except Exception:
        updated_json = {"error": "Claude returned invalid JSON", "raw": response.content[0].text}

    return updated_json









# @traceable
# @router.post("/workflow/claude")
# async def chat(request: Request):
#     print(f"/workflow/cluade is called")

#     body = await request.json()
#     user_request = body.get("user_request", "")
#     current_json = body.get("current_json", "{}")

#     print(f"user_request: {user_request}, current_json: {current_json}")

#     prompt_template = f"""
# You are an assistant that creates or modifies React Flow JSON graphs.

# - Input: A user request and optionally an existing React Flow JSON.
# - Task: If a JSON exists, modify it according to the request.  
#        If no JSON exists or the user requests a new one, create a valid new JSON from scratch.
# - Rules:
#   1. Always output only valid JSON, nothing else.  
#   2. If creating a new flow, use the following reference templates as examples:
#      - Simple two-node flow with one edge
#      {{
#        "nodes": [
#          {{ "id": "node_1", "type": "general", "data": {{ "label": "Start", "inputs": [], "midputs":[{{"name": "url", "label":"Enter url", "type": "string", "value": ""}}], "outputs":[{{"name": "content", "type": "string"}}] }}, "position": {{ "x": 100, "y": 100 }} }},
#          {{ "id": "node_2", "type": "general", "data": {{ "label": "End", "inputs": [{{"name": "text", "type": "string"}}], "midputs":[], "outputs":[] }}, "position": {{ "x": 400, "y": 100 }} }}
#        ],
#        "edges": [
#          {{ "id": "edge_1-2", "source": "node_1", "target": "node_2", "sourceHandle": "output-0", "targetHandle": "input-0" }}
#        ]
#      }}
#   3. Preserve existing fields unless explicitly changed.
#   4. Ensure schema is valid for React Flow: `nodes` (with id, data, position) and `edges`.
#   5. Ensure data fields match the following node definitions exactly.
#   6. If the user provides values for a specific component, use them as the values for that component's midputs
#   7. For each edge, the output type of the source component must match the input type of the target component.

# User Request:
# {user_request}

# Each Node's data field schema definitions: {json.dumps(jsonable_encoder(NODE_DEFINITIONS))}

# Current JSON (can be empty or null):
# {current_json}

# Return the updated or newly created JSON only:

# """

#     response = client.messages.create(
#         model="claude-3-5-sonnet-20240620",  # Claude Sonnet 4
#         max_tokens=1500,
#         messages=[{"role": "user", "content": prompt_template}]
#     )

#     try:
#         updated_json = json.loads(response.content[0].text)        
#     except Exception:
#         updated_json = {"error": "Claude returned invalid JSON", "raw": response.content[0].text}

#     return {"updated_json": updated_json}

@router.get("/run-workflow/{workflow_id}")
def execute_workflow(workflow_id):
    # load specific workflow by id
    workflows = load_workflows()
    json_data = None
    for wf in workflows:
        if wf["id"] == workflow_id:
            json_data = wf
            break
        
    # save into yaml file and execute
    yaml_str = yaml.dump(json_data, sort_keys=False, allow_unicode=True)

    # for debug reason
    # yaml_path = os.path.dirname(os.path.abspath(__file__))
    # yaml_path = os.path.join(yaml_path, temp_venv_directory)
    # yaml_path = os.path.join(yaml_path, "flow.yaml") 
    # with open(yaml_path, "w") as ff:
    #     ff.write(yaml_str)

    # run WorkRunner
    try:
        runner = WorkflowRunner(yaml_str=yaml_str)
        result = runner.run_workflow()
        logger.info("Final workflow result", result=result)
        return {"message": f"{result}"}

    except Exception as e:
        logger.error("Error run_workflow():", error=str(e))
        raise HTTPException(status_code=500, detail=f"Error executing workflow: {str(e)}")



@router.get("/workflows")
def list_workflows():
    return load_workflows()

@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str):
    workflows = load_workflows()
    for wf in workflows:
        if wf["id"] == workflow_id:
            return wf
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.post("/workflows")
def create_workflow(workflow: Workflow):
    workflows = load_workflows()
    workflow.id = str(uuid.uuid4())
    workflows.append(workflow.dict())
    save_workflows(workflows)
    return workflow

@router.put("/workflows/{workflow_id}")
def update_workflow(workflow_id: str, workflow: Workflow):
    workflows = load_workflows()
    print(f"Updating workflow {workflow_id} with data: {workflow}")
    print(f"original workflows: {workflows}")

    for i, wf in enumerate(workflows):
        if wf["id"] == workflow_id:
            # overwrite with new content
            workflow.id = workflow_id
            workflows[i] = workflow.dict()
            save_workflows(workflows)
            return workflow
    raise HTTPException(status_code=404, detail="Workflow not found")

@router.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: str):
    workflows = load_workflows()
    new_workflows = [wf for wf in workflows if wf["id"] != workflow_id]
    if len(new_workflows) == len(workflows):
        raise HTTPException(status_code=404, detail="Workflow not found")
    save_workflows(new_workflows)
    return {"message": "Workflow deleted"}
