#!/usr/bin/env python3
import requests
import argparse

NODE_DEF = {
    "label": "URL Request",
    "inputs": [],
    "midputs": [{"name": "url", "label":"Enter url", "type": "string", "value": ""}],
    "outputs": [{"name": "content", "type": "string"}],
    "value": {}
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, required=True, help='Target URL')
    args = parser.parse_args()
    
    response = requests.get(args.url)
    content = response.text
    return content

if __name__ == '__main__':
    main()