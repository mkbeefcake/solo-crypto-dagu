from mcp.server.fastmcp import FastMCP

# Define your MCP server
mcp = FastMCP("sola-fastapi-mcp")

# Example MCP tool
@mcp.tool()
def hello(name: str) -> str:
    return f"Hello, {name}! This is served via MCP."
