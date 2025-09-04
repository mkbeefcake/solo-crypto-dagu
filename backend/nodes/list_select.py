#!/usr/bin/env python3
import argparse
import ast

NODE_DEF = {
    "label": "Select index from list",
    "inputs": [{"name": "text", "type": "string"}],
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
        # Try parsing as Python list
        if args.data.strip().startswith('[') and args.data.strip().endswith(']'):
            data_list = ast.literal_eval(args.data)
            if not isinstance(data_list, list):
                raise ValueError("Not a list")
        else:
            # Fallback: split by newlines
            data_list = [line.strip() for line in args.data.splitlines() if line.strip()]

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