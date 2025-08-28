import { useDnD } from './DnDContext';
import { useNodeTypes } from '../hooks/useNodeTypes';
import './Sidebar.css';

import Button from "@mui/material/Button";

export default function Sidebar() {
  const [_, setType] = useDnD();
  const { nodeTypes, loading, error } = useNodeTypes();

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (loading) {
    return (
      <aside className="sidebar">
        <div className="sidebar-title">Loading nodes...</div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="sidebar">
        <div className="sidebar-title">Error loading nodes</div>
        <div className="error-message">{error}</div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <h4>Drag & Drop Nodes</h4>
      <div style={{ flex: 1, overflowY: "auto" }}>
        
        {nodeTypes.map((nodeType) => (
          <div 
            key={nodeType.name}
            className="dndnode" 
            onDragStart={(event) => onDragStart(event, nodeType.name)} 
            draggable
          >
            {nodeType.name}
          </div>
        ))}
      </div>
      <div style={{ height: "450px", borderTop: "1px solid #ccc", padding: "10px" }}>
        <h4>WorkFlows</h4>
        <Button variant="outlined" color="outline" onClick={() => alert("Clicked!")}>
          New Workflow
        </Button>
        <Button variant="outlined" color="outline" onClick={() => alert("Clicked!")}>
          Save All Workflows
        </Button>
        <h4>Claude AI terminal</h4>
        <textarea style={{ width: '100%', height:'150px'}}/>
        <Button variant="outlined" color="outline" onClick={() => alert("Clicked!")}>
          Run
        </Button>
      </div>

    </aside>
  );
}