#!/usr/bin/env python3
import argparse

NODE_DEF = {
    "label": "Last Row",
    "inputs": [{"name": "text", "type": "string"}],
    "midputs": [],
    "outputs": [{"name": "last_item", "type": "string"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Input list data')
    args = parser.parse_args()
    
    # Parse the input data (assuming it's a comma-separated list or similar format)
    data_list = args.data.split(',') if args.data else []
    last_item = data_list[-1].strip() if data_list else ""
    
    print(last_item)
    return last_item

if __name__ == '__main__':
    main()