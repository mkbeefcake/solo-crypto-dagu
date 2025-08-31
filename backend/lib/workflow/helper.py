import os
import json
from ..variable import database_file

def load_workflows():
    if not os.path.exists(database_file):
        return []
    with open(database_file, "r") as f:
        return json.load(f)

def save_workflows(workflows):
    with open(database_file, "w") as f:
        json.dump(workflows, f, indent=2)
