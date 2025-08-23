#!/usr/bin/env python3
import urllib.request
import argparse

NODE_DEF = {
    "name": "URL Request",
    "inputs": [],
    "midputs": [{"name": "url", "label":"Enter url", "type": "string"}],
    "outputs": [{"name": "content", "type": "string"}]
}

def main() -> str:
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', type=str, required=True, help='Target URL')
    args = parser.parse_args()
    
    response = urllib.request.urlopen(args.url)
    content = response.read().decode()
    print(content)
    return content

if __name__ == '__main__':
    main()