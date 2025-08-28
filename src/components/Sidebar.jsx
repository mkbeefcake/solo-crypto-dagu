import { useDnD } from './DnDContext';
import { useNodeTypes } from '../hooks/useNodeTypes';
import './Sidebar.css';

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
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div className="sidebar-title">Drag & Drop Nodes</div>
        
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
      <div style={{ height: "300px", borderTop: "1px solid #ccc", padding: "10px" }}>
        <h4>Claude AI terminal</h4>
        <textarea style={{ width: '100%', height:'200px'}}/>
        <button> Run </button>
      </div>

    </aside>
  );
}