from fastapi import FastAPI, Request, HTTPException, APIRouter
from solomcp.server import register_mcp_custom_tool
import json

router = APIRouter(prefix="/api", tags=["mcp"])

@router.post("/tool/create_custom_tool")
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
