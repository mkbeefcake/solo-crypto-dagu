import importlib.util
import os
import tempfile
import subprocess
import sys
import json
import ast

from lib.log.logger import logger
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

    if "os" in packages:
        packages.remove("os")
    if "sys" in packages:
        packages.remove("sys")
    if "ast" in packages:
        packages.remove("ast")
        
    return list(packages)

def run_sandboxed_script(file_path: str, func_name: str, kwargs: dict):
    """
    Run a Python script in a sandboxed subprocess with optional package installation.
    """

    # Get imported packages
    packages = get_imported_packages(file_path)

    if not os.path.exists(temp_venv_directory):
        os.makedirs(temp_venv_directory)
        
    # Create a temporary virtual environment
    venv_dir = os.path.join(temp_venv_directory, "_venv_")
    subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)

    # Path to pip and python inside the venv
    python_bin = os.path.join(venv_dir, "Scripts" if os.name == "nt" else "bin", "python")
    pip_bin = os.path.join(venv_dir, "Scripts" if os.name == "nt" else "bin", "pip")

    # Install additional packages if any
    if packages:
        logger.info("Dependencies", packages = packages)
        subprocess.run([pip_bin, "install", *packages], check=True)

    # Prepare a small runner script
    marker = "RUNNER_RESULT:"
    runner_code = f"""
import json
import sys
from temp_node import {func_name}

kwargs = json.loads(sys.argv[1])
def kwargs_to_cli_args(kwargs: dict) -> list:
    args = []
    for k, v in kwargs.items():
        args.append(f"--{{k}}")
        args.append(str(v))
    return args

args = kwargs_to_cli_args(kwargs)
sys.argv = ["_runner.py"] + args  
result = {func_name}()
print(f"{marker}{{result}}")
"""
    # copy node file into temp_venv_directory
    with open(file_path, "r") as f:
        data = f.read()
        temp_node_file = os.path.join(temp_venv_directory, "temp_node.py")
        with open(temp_node_file, "w") as ff:
            ff.write(data)

    # create runner file
    runner_file = os.path.join(temp_venv_directory, "_runner.py")
    with open(runner_file, "w") as f:
        f.write(runner_code)
    
    result = subprocess.run(
        [python_bin, runner_file, json.dumps(kwargs)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode())

    # Parse output
    value = None
    output = result.stdout.decode()
    if marker in output:
        value = output.split(marker, 1)[1].strip()

    logger.info("result", output=output, result=value)
    return value
