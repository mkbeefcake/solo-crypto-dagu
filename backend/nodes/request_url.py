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
    
    try:           
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; MyBot/1.0; +https://example.com)"
        }

        response = requests.get(args.url, headers=headers, timeout=10)
        response.raise_for_status()  #  raise error for bad status codes
        content = response.text
    except Exception as e:
        content = f"Error fetching URL: {e}"

    print(content)
    return content


if __name__ == '__main__':
    main()