import yaml
from celery import Celery
from lib.loader.unsafe_loader import load_function_from_file, get_imported_packages

celery_app = Celery(
    "workflow",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)


class WorkflowRunner:
    def __init__(self, yaml_file):
        with open(yaml_file, "r") as f:
            self.workflow = yaml.safe_load(f)["workflow"]
        self.task_results = {}

    def __init__(self, yaml_str):
        self.workflow = yaml.safe_load(yaml_str)
        self.task_results = {}


    def run_workflow(self):
        for node in self.workflow:
            task_id = node["name"]
            result = self.run_node(node)
            self.task_results[task_id] = result.get()  # Wait for completion
        return self.task_results
