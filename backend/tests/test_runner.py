import pytest
import anyio
import tempfile
import os
import requests
from lib.loader.unsafe_loader import run_sandboxed_script
from lib.variable import temp_venv_directory
from lib.workflow.runner import WorkflowRunner

@pytest.mark.anyio
async def test_last_row_node():
    result = run_sandboxed_script(
        file_path="nodes/last_row.py",
        func_name="main",
        kwargs={"data": "10 20 30, 40 50 60, 70 80 90"}
    )

    assert result == "70 80 90"

@pytest.mark.anyio
async def test_last_row_node_multiline():
    result = run_sandboxed_script(
        file_path="nodes/last_row.py",
        func_name="main",
        kwargs={"data": "modeldate,approve,disapprove,approve_lo,approve_hi,disapprove_lo,disapprove_hi\r\r\n1/21/2025,51.62839,39.97147,45.85058,57.40619,34.19366,45.74928\r\r\n1/22/2025,51.62839,39.97147,45.85058,57.40619,34.19366,45.74928\r\r\n"}
    )

    assert result == "45.74928"

@pytest.mark.anyio
async def test_workflow_runner():
    test_dir = os.path.dirname(os.path.abspath(__file__))
    yaml_path = os.path.join(test_dir, "flow.yaml")  # file located next to this test file

    runner = WorkflowRunner(yaml_file=yaml_path)
    result = runner.run_workflow(kwargs={"url": "https://static.dwcdn.net/data/kSCt4.csv"})

    response = requests.get("https://static.dwcdn.net/data/kSCt4.csv")
    content = response.text

    assert result == content.split(",")[-1].strip()

