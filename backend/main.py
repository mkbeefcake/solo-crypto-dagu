from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from contextlib import asynccontextmanager
from lib.log.logger import logger
from lib.variable import temp_venv_directory
from node_definitions import NODE_DEFINITIONS, NodeDefinition, PortType
from mcp_tool import router as mcp_router
from workflow import router as workflow_router
from solomcp.server import mcp
from fastapi.staticfiles import StaticFiles

import uvicorn
import asyncio
import shutil
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start
    logger.info("Starting MCP server")
    
    # logger.info("Started MCP server", available_tools = await mcp.list_tools())
    asyncio.create_task(mcp.run_sse_async(mount_path="/mcp"))
    yield

    # shutdown
     # Delete temporary directory
    shutil.rmtree(temp_venv_directory, ignore_errors=True)
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

app.include_router(mcp_router)
app.include_router(workflow_router)

app.mount("/", StaticFiles(directory="../dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)