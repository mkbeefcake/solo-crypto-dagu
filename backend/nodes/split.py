#!/usr/bin/env python3
import argparse

NODE_DEF = {
    "label": "Split",
    "inputs": [{"name": "text", "type": "string"}],
    "midputs": [{"name": "text", "label": "Enter text to split (use , for delimiter)", "type": "string"}],
    "outputs": [{"name": "items", "type": "list"}]
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--text', type=str, required=True, help='Text to split')
    args = parser.parse_args()
    
    # Split by comma and strip whitespace
    items = [item.strip() for item in args.text.split(',')]
    result = ','.join(items)
    
    print(result)
    return result

if __name__ == '__main__':
    main()