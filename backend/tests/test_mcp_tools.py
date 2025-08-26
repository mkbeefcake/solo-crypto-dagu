import pytest
import anyio
import json

from mcp.shared.memory import create_connected_server_and_client_session as client_session
from mcp.types import TextContent

from solomcp.server import mcp, register_mcp_custom_tool

@pytest.mark.anyio
async def test_hello_tool():

    async with client_session(mcp._mcp_server) as client:
        result = await client.call_tool("hello", {"name": "Ethan"})
        assert len(result.content) == 1
        content = result.content[0]
        assert isinstance(content, TextContent)
        assert content.text == "Hello, Ethan! This is served via MCP."


@pytest.mark.anyio
async def test_dynamic_tool_echo():
    dynamic_tool_str = """
def reverse_text(text):
    return text[::-1]
"""   
    # add dynamic tool in server side        
    register_mcp_custom_tool(
        tool_name="reverse_tool",
        description="This reverts the text order",
        code_str=dynamic_tool_str,
        func_name="reverse_text"
    )
    
    print(await mcp.list_tools())

    # client side code for calling dynamic tool
    async with client_session(mcp._mcp_server) as client:
        result = await client.call_tool("reverse_tool", {'text': 'Hahaha'} )
        content = result.content[0]
        assert content.text == "ahahaH"