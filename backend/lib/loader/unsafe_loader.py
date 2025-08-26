import importlib.util
import os
import tempfile
import subprocess
import sys
import json
import ast

from lib.variable import temp_venv_directory

def load_function_from_file(file_path, func_name):
    """
    Dynamically load a function from a Python file
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found")
    
    spec = importlib.util.spec_from_file_location("user_module", file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    func = getattr(module, func_name, None)
    if func is None:
        raise ValueError(f"Function '{func_name}' not found in {file_path}")
    return func

def load_function_from_string(code_str: str, func_name: str):
    """
    Save user code to a temp file and load it as a module.
    """
    # Create temporary Python file
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".py") as tmp:
        tmp.write(code_str)
        tmp_path = tmp.name

    # Dynamically import module
    spec = importlib.util.spec_from_file_location("user_module", tmp_path)
    user_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(user_module)

    # Get the function
    func = getattr(user_module, func_name, None)
    if func is None or not callable(func):
        os.remove(tmp_path)
        raise ValueError(f"Function '{func_name}' not found in uploaded code")
    
    return func

def get_imported_packages(file_path):
    with open(file_path, "r") as f:
        tree = ast.parse(f.read(), filename=file_path)

    packages = set()
    for node in ast.walk(tree):
        # Handle `import package`
        if isinstance(node, ast.Import):
            for alias in node.names:
                packages.add(alias.name.split(".")[0])
        # Handle `from package import something`
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                packages.add(node.module.split(".")[0])

    return list(packages)

def run_sandboxed_script(file_path: str, func_name: str, kwargs: dict):
    """
    Run a Python script in a sandboxed subprocess with optional package installation.
    """

    # Get imported packages
    packages = get_imported_packages(file_path)

    # Create a temporary virtual environment
    venv_dir = os.path.join(temp_venv_directory, "venv")
    subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)

    # Path to pip and python inside the venv
    python_bin = os.path.join(venv_dir, "Scripts" if os.name == "nt" else "bin", "python")
    pip_bin = os.path.join(venv_dir, "Scripts" if os.name == "nt" else "bin", "pip")

    # Install additional packages if any
    if packages:
        subprocess.run([pip_bin, "install", *packages], check=True)

    # Prepare a small runner script
    runner_code = f"""
import json
import sys
from {os.path.splitext(os.path.basename(file_path))[0]} import {func_name}

args = json.loads(sys.argv[1])
result = {func_name}(**args)
print(json.dumps(result))
"""

    runner_file = os.path.join(temp_venv_directory, "runner.py")
    with open(runner_file, "w") as f:
        f.write(runner_code)

    # Run the script in subprocess
    result = subprocess.run(
        [python_bin, runner_file, json.dumps(kwargs)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(file_path)
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode())

    # Parse output
    output = json.loads(result.stdout.decode())
    return output
