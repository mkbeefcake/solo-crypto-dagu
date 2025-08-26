import pytest
import anyio
import tempfile
import os
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
async def test_workflow_runner():
    test_dir = os.path.dirname(os.path.abspath(__file__))
    yaml_path = os.path.join(test_dir, "flow.yaml")  # file located next to this test file

    runner = WorkflowRunner(yaml_file=yaml_path)
    runner.run_workflow()
    # assert False
