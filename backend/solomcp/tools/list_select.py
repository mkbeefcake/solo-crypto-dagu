#!/usr/bin/env python3
import argparse
import ast
from ..server import mcp

@mcp.tool(name="list_select_by_index", description="select an element from a list by index")
def list_select_by_index(data: str, index: int) -> str:
    try:
        # Parse input into a Python list (safe parsing of strings like '["a","b","c"]')
        data_list = ast.literal_eval(data)
        if not isinstance(data_list, list):
            data_list = [line.strip() for line in data.splitlines() if line.strip()]
    except Exception as e:
        print(f"Error parsing list_data: {e}")
        return ""
        
    # Get selected element safely
    if 0 <= index < len(data_list):
        selected_item = data_list[index]
    else:
        selected_item = ""

    print(selected_item)
    return selected_item
