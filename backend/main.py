from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import asyncio

from lib.log.logger import logger
from solo_mcp.server import mcp
from node_definitions import NODE_DEFINITIONS, NodeDefinition, PortType

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_server():
    logger.info("Started MCP server")
    asyncio.create_task(mcp.run_sse_async(mount_path="/mcp"))

@app.get("/nodes/types", response_model=List[NodeDefinition])
async def get_node_types():
    return NODE_DEFINITIONS

@app.get("/port-colors")
async def get_port_colors():
    return {port_type.value: port_type.color for port_type in PortType}

@app.get("/")
async def root():
    return {"message": "Zoo-Scape Backend API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)