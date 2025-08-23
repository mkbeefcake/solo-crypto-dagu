import importlib
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class PortType(str, Enum):
    STRING = "string"
    INT = "int"
    FLOAT = "float"
    BOOLEAN = "boolean"
    LIST = "list"

    @property
    def color(self) -> str:
        color_map = {
            "string": "#2563eb",
            "int": "#005820", 
            "float": "#009e3a", 
            "boolean": "#dc2626",
            "list": "#9333ea"
        }
        return color_map.get(self.value, "#6b7280")

class Port(BaseModel):
    name: Optional[str] = Field(None, description="Port name (optional)")
    label: Optional[str] = Field(None, description="Port label (optional)")
    type: PortType = Field(..., description="Data type")

class NodeDefinition(BaseModel):
    name: str = Field(..., description="Node name")
    inputs: List[Port] = Field(default_factory=list, description="Input ports")
    outputs: List[Port] = Field(default_factory=list, description="Output ports")
    midputs: List[Port] = Field(default_factory=list, description="User parameters")
    
    class Config:
        use_enum_values = True

def _port_from_dict(port_dict: dict) -> Port:
    return Port(
        name=port_dict.get("name"),
        label=port_dict.get("label"),
        type=PortType(port_dict["type"])
    )

def discover_nodes() -> list[NodeDefinition]:
    nodes = []
    nodes_dir = Path(__file__).parent / "nodes"
    
    for py_file in nodes_dir.glob("*.py"):
        if py_file.name.startswith("_"):
            continue
            
        module_name = f"nodes.{py_file.stem}"
        try:
            module = importlib.import_module(module_name)
            if hasattr(module, "NODE_DEF"):
                node_def = module.NODE_DEF
                nodes.append(NodeDefinition(
                    name=node_def["name"],
                    inputs=[_port_from_dict(p) for p in node_def.get("inputs", [])],
                    midputs=[_port_from_dict(p) for p in node_def.get("midputs", [])],
                    outputs=[_port_from_dict(p) for p in node_def.get("outputs", [])]
                ))
        except Exception as e:
            print(f"Warning: Could not load node from {py_file}: {e}")
    
    return nodes

NODE_DEFINITIONS = discover_nodes()