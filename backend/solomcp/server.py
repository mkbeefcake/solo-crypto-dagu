from mcp.server.fastmcp import FastMCP
from lib.loader.unsafe_loader import load_function_from_string
# from RestrictedPython import compile_restricted
# from RestrictedPython import safe_globals, limited_builtins

# Define your MCP server
mcp = FastMCP("sola-fastapi-mcp")

# register MCP custom tool
def register_mcp_custom_tool(tool_name: str, description: str, code_str: str, func_name: str):
    """
    Registers the user-submitted function directly as an MCP tool.
    """
        
    # MCP requires an async function
    func = load_function_from_string(code_str, func_name)    

    # Register the actual function (not a wrapper)
    mcp.tool(name=tool_name, description=description)(func)
    

# MCP hello_tool
@mcp.tool()
def hello(name: str) -> str:
    return f"Hello, {name}! This is served via MCP."
