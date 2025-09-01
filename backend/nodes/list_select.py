#!/usr/bin/env python3
import argparse

NODE_DEF = {
    "label": "List Select",
    "inputs": [{"name": "list_data", "type": "list"}],
    "midputs": [{"name": "index", "label": "Enter index (0-based)", "type": "int"}],
    "outputs": [{"name": "selected_item", "type": "string"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--list_data', type=str, required=True, help='Input list data')
    parser.add_argument('--index', type=int, required=True, help='Index to select')
    args = parser.parse_args()
    
    # Parse the input data (assuming it's a comma-separated list)
    data_list = args.list_data.split(',') if args.list_data else []
    
    try:
        selected_item = data_list[args.index].strip() if 0 <= args.index < len(data_list) else ""
    except (IndexError, ValueError):
        selected_item = ""
    
    print(selected_item)
    return selected_item

if __name__ == '__main__':
    main()