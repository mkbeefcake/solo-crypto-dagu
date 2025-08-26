from mcp.server.fastmcp import FastMCP
# from RestrictedPython import compile_restricted
# from RestrictedPython import safe_globals, limited_builtins
import tempfile
import importlib.util
import os

# Define your MCP server
mcp = FastMCP("sola-fastapi-mcp")

# register MCP custom tool
def register_mcp_custom_tool(tool_name: str, description: str, code_str: str, func_name: str):
    """
    Registers the user-submitted function directly as an MCP tool.
    """
    # Create custom function from code string
    def load_mcp_custom_tool(code_str: str, func_name: str):
        """
        Save user code to a temp file and load it as a module.
        """
        # Create temporary Python file
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".py") as tmp:
            tmp.write(code_str)
            tmp_path = tmp.name

        # Dynamically import module
        spec = importlib.util.spec_from_file_location("user_module", tmp_path)
        user_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(user_module)

        # Get the function
        func = getattr(user_module, func_name, None)
        if func is None or not callable(func):
            os.remove(tmp_path)
            raise ValueError(f"Function '{func_name}' not found in uploaded code")
        
        return func
        
    # MCP requires an async function
    func = load_mcp_custom_tool(code_str, func_name)    

    # Register the actual function (not a wrapper)
    mcp.tool(name=tool_name, description=description)(func)
    

# MCP hello_tool
@mcp.tool()
def hello(name: str) -> str:
    return f"Hello, {name}! This is served via MCP."
