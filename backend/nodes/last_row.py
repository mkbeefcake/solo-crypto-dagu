#!/usr/bin/env python3
import argparse
import ast

NODE_DEF = {
    "label": "Select last row",
    "inputs": [{"name": "text", "type": "string"}],
    "midputs": [],
    "outputs": [{"name": "last_item", "type": "string"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Input list data')
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
        print(f"Error parsing input: {e}")
        return ""
    
    last_item = data_list[-1] if data_list else ""
    print(last_item)
    return last_item

if __name__ == '__main__':
    main()