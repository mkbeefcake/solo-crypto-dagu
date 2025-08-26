import json
import yaml

def json_file_to_yaml_file(json_file, yaml_file):
    # Load JSON data
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Dump to YAML
    with open(yaml_file, "w", encoding="utf-8") as f:
        yaml.dump(data, f, sort_keys=False, allow_unicode=True)


def json_str_to_yaml_str(json_str: str) -> str:
    # Parse JSON string into Python object
    data = json.loads(json_str)
    
    # Convert Python object to YAML string
    yaml_str = yaml.dump(data, sort_keys=False, allow_unicode=True)
    return yaml_str