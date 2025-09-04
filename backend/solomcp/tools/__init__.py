# Import all tool files so decorators run
from . import last_row
from . import list_select
from . import request_url

def register_all_tools():
    """
    Importing this module auto-registers all MCP tools
    defined with @mcp.tool decorators.
    """
    return True
