import pytest
import anyio
import tempfile
import json
import yaml
import os
from lib.variable import temp_venv_directory
from lib.formatter.converter import json_str_to_yaml_str
from lib.log.logger import logger

@pytest.mark.anyio
async def test_json_to_yml():
    test_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(test_dir, "flow.json")  # file located next to this test file
    yaml_path = os.path.join(test_dir, "flow.yaml")  # file located next to this test file

    logger.info("Workflow file path", file_path = json_path)

    with open(json_path, "r") as f:
        data = json.load(f)
        yaml_str = yaml.dump(data, sort_keys=False, allow_unicode=True)

        logger.info("Yaml string", yaml_str = yaml_str)
        
        with open(yaml_path, "w") as ff:
            ff.write(yaml_str)