import argparse
import ast
from ..server import mcp

@mcp.tool(name="last_row", description="get the last row of a list string")
def last_row(data: str) -> str:
    try:
        # Try parsing as Python list
        if data.strip().startswith('[') and data.strip().endswith(']'):
            data_list = ast.literal_eval(data)
            if not isinstance(data_list, list):
                raise ValueError("Not a list")
        else:
            # Fallback: split by newlines
            data_list = [line.strip() for line in data.splitlines() if line.strip()]
    except Exception as e:
        print(f"Error parsing input: {e}")
        return ""
    
    last_item = data_list[-1] if data_list else ""
    print(f"Last item: {last_item}")
    return last_item