import pytest
import anyio

from mcp.shared.memory import create_connected_server_and_client_session as client_session
from mcp.types import TextContent

from solomcp.server import mcp

@pytest.mark.anyio
async def test_echo_tool():

    async with client_session(mcp._mcp_server) as client:
        result = await client.call_tool("hello", {"name": "Ethan"})
        assert len(result.content) == 1
        content = result.content[0]
        assert isinstance(content, TextContent)
        assert content.text == "Hello, Ethan! This is served via MCP."