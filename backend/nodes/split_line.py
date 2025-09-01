#!/usr/bin/env python3
import argparse

NODE_DEF = {
    "label": "Split text into lines",
    "inputs": [{"name": "data", "type": "string"}],
    "midputs": [],
    "outputs": [{"name": "items", "type": "list"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, required=True, help='Text to split into lines')
    args = parser.parse_args()
    
    # Split into lines and strip whitespace
    items = [line.strip() for line in args.data.splitlines() if line.strip()]        
    
    print(items)
    return items

if __name__ == '__main__':
    main()