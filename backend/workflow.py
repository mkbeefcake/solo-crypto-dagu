from fastapi import FastAPI, Request, HTTPException, APIRouter
from solomcp.server import register_mcp_custom_tool
from dotenv import load_dotenv
import json
import os
import requests
import anthropic
from node_definitions import NODE_DEFINITIONS
from langsmith import traceable
from langsmith.wrappers import wrap_anthropic

load_dotenv()

router = APIRouter(prefix="", tags=["workflow"])


client = wrap_anthropic(anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY")))

@traceable
@router.post("/workflow/claude")
async def chat(request: Request):
    print(f"/workflow/cluade is called")

    body = await request.json()
    user_request = body.get("user_request", "")
    current_json = body.get("current_json", "{}")

    print(f"user_request: {user_request}, current_json: {current_json}")

    prompt_template = f"""
You are an assistant that creates or modifies React Flow JSON graphs.

- Input: A user request and optionally an existing React Flow JSON.
- Task: If a JSON exists, modify it according to the request.  
       If no JSON exists or the user requests a new one, create a valid new JSON from scratch.
- Rules:
  1. Always output only valid JSON, nothing else.  
  2. If creating a new flow, use the following reference templates as examples:
     - Simple two-node flow with one edge
     {{
       "nodes": [
         {{ "id": "node_1", "type": "input", "data": {{ "label": "Start" }}, "position": {{ "x": 100, "y": 100 }} }},
         {{ "id": "node_2", "data": {{ "label": "End" }}, "position": {{ "x": 400, "y": 100 }} }}
       ],
       "edges": [
         {{ "id": "edge_1-2", "source": "node_1", "target": "node_2" }}
       ]
     }}
  3. Preserve existing fields unless explicitly changed.
  4. Ensure schema is valid for React Flow: `nodes` (with id, data, position) and `edges`.

User Request:
{user_request}

Node Definitions: {NODE_DEFINITIONS}

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

    return {"updated_json": updated_json}