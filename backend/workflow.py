from fastapi import FastAPI, Request, HTTPException, APIRouter
from solomcp.server import register_mcp_custom_tool
import json

router = APIRouter(prefix="", tags=["workflow"])
