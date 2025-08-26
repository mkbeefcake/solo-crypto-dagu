import pytest
import anyio
import tempfile
from lib.loader.unsafe_loader import run_sandboxed_script
from lib.variable import temp_venv_directory

@pytest.mark.anyio
async def test_last_row_node():
    # Run reverse_text.py in sandbox
    result = run_sandboxed_script(
        file_path="nodes/last_row.py",
        func_name="main",
        kwargs={"data": "10 20 30, 40 50 60, 70 80 90"}
    )

    assert result == "70 80 90"
