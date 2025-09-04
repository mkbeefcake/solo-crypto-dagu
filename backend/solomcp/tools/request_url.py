#!/usr/bin/env python3
import requests
import argparse
from ..server import mcp

@mcp.tool(name="request_url", description="get the content of a URL")
def request_url(url: str) -> str:
    try:           
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; MyBot/1.0; +https://example.com)"
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  #  raise error for bad status codes
        content = response.text
    except Exception as e:
        content = f"Error fetching URL: {e}"

    print(content)
    return content

