import pytest
import anyio
from lib.loader.unsafe_loader import run_sandboxed_script

@pytest.mark.anyio
async def test_hello_tool():
    # Run reverse_text.py in sandbox
    result = run_sandboxed_script(
        file_path="nodes/last_row.py",
        func_name="main",
        kwargs={"data": "10 20 30, 40 50 60, 70 80 90"}
    )

    print(result.get())  # Output: "olleh"
