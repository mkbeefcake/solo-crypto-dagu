#!/usr/bin/env python3
import argparse
import ast

NODE_DEF = {
    "label": "Select index from list",
    "inputs": [{"name": "text", "type": "list"}],
    "midputs": [{"name": "index", "label": "Enter index (0-based)", "type": "int"}],
    "outputs": [{"name": "selected_item", "type": "string"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Input list data')
    parser.add_argument('--index', type=int, required=True, help='Index to select')
    args = parser.parse_args()
    
    try:
        # Parse input into a Python list (safe parsing of strings like '["a","b","c"]')
        data_list = ast.literal_eval(args.data)
        if not isinstance(data_list, list):
            raise ValueError("Provided --list_data is not a list")
    except Exception as e:
        print(f"Error parsing list_data: {e}")
        return ""
        
    # Get selected element safely
    if 0 <= args.index < len(data_list):
        selected_item = data_list[args.index]
    else:
        selected_item = ""

    print(selected_item)
    return selected_item

if __name__ == '__main__':
    main()