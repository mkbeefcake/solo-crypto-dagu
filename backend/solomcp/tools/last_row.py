import argparse
import ast
from ..server import mcp

@mcp.tool(name="last_row", description="get the last row of a list string")
def last_row(data: str) -> str:
    try:
        # Safely parse string like '["a", "b", "c"]' into a Python list
        print(f"data: {data}")
        data_list = ast.literal_eval(data)
        if not isinstance(data_list, list):
            data_list = [line.strip() for line in data.splitlines() if line.strip()]
    except Exception as e:
        print(f"Error parsing input: {e}")
        return ""
    
    last_item = data_list[-1] if data_list else ""
    print(last_item)
    return last_item

