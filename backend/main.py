from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from solomcp.server import register_mcp_custom_tool
from contextlib import asynccontextmanager
from lib.log.logger import logger
from solomcp.server import mcp
from node_definitions import NODE_DEFINITIONS, NodeDefinition, PortType

import uvicorn
import asyncio
import json


@asynccontextmanager
async def lifespan(app: FastAPI):
    # start
    logger.info("Started MCP server", available_tools = await mcp.list_tools())
    asyncio.create_task(mcp.run_sse_async(mount_path="/mcp"))
    yield

    # shutdown
    logger.info("Stopping MCP server")


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/nodes/types", response_model=List[NodeDefinition])
async def get_node_types():
    return NODE_DEFINITIONS

@app.get("/port-colors")
async def get_port_colors():
    return {port_type.value: port_type.color for port_type in PortType}

@app.get("/")
async def root():
    return {"message": "Zoo-Scape Backend API"}

@app.post("/tool/create_custom_tool"):
async def create_custom_tool(request: Request):
    try:
        body_bytes = await request.body()
        body_str = body_bytes.decode("utf-8")
        
        # Parse JSON
        tool_data = json.loads(body_str)
        register_mcp_custom_tool(tool_data["tool_name"], 
                                 tool_data["description"], 
                                 tool_data["code"], 
                                 tool_data["func_name"])
        return {
            "status": "success",
        }
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing key: {e}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)