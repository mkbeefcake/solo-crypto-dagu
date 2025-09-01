import yaml
from celery import Celery
from lib.loader.unsafe_loader import load_function_from_file, get_imported_packages, run_sandboxed_script
from node_definitions import get_node_path
from lib.log.logger import logger

celery_app = Celery(
    "workflow",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

class WorkflowRunner:
    def __init__(self, yaml_file=None, yaml_str=None):
        if yaml_file:
            with open(yaml_file, "r") as f:
                self.workflow = yaml.safe_load(f)
        elif yaml_str:
            self.workflow = yaml.safe_load(yaml_str)
        else:
            raise ValueError("Either yaml_file or yaml_str need to be provided")
        
        self.task_results = {}

    def parse_kwargs_for_node(self, kwargs, node):
       
        # Extract from midputs (user-provided values)
        for midput in node.get("midputs", []):
            name = midput.get("name")
            value = midput.get("value")
            if name and value is not None:
                kwargs[name] = value

        # Optionally extract from inputs too, if they carry values
        # for inp in node.get("inputs", []):
        #     name = inp.get("name")
        #     value = inp.get("value")
        #     if name and value is not None:
        #         kwargs[name] = value

        return kwargs

    def run_workflow(self, kwargs = {}):

        source = ""
        target = ""

        params = kwargs
        result = ""

        label = ""

        # Extract workflow details
        id = self.workflow["id"]
        name = self.workflow["name"]
        flow = self.workflow["flow"]

        # iterate source nodes
        nodes = flow["nodes"]
        for edge in flow.get("edges", []):
            # detect source & target nodes
            source = edge["source"]
            target = edge["target"]

            # find out source node
            node_source_path = ""
            for node in nodes:
                if node["id"] == source:
                    label = node["data"]["label"]
                    node_source_path = get_node_path(node["data"]["label"])
                    break
            
            # Log info
            if node_source_path != "":
                params = self.parse_kwargs_for_node(params, node["data"])

                logger.info("run_sandboxed_script:", label=label, node_source_path=node_source_path)
                result = run_sandboxed_script(
                    file_path=node_source_path,
                    func_name="main",
                    kwargs=params
                )
                logger.info("output", result=result)
                params = {"data": result}

        # find out last node from last target variable
        node_source_path = ""
        for node in nodes:
            if node["id"] == target:
                label = node["data"]["label"]
                node_source_path = get_node_path(node["data"]["label"])
                break

        # Log info
        if node_source_path != "":
            params = self.parse_kwargs_for_node(params, node["data"])

            logger.info("run_sandboxed_script:", label=label, node_source_path=node_source_path)
            result = run_sandboxed_script(
                file_path=node_source_path,
                func_name="main",
                kwargs=params
            )

        logger.info("output", result=result)
        return result