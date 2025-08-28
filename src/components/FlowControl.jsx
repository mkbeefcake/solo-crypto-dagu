import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export function FlowControl({ onLoad }) {
  const { getNodes, getEdges, getViewport, setViewport } = useReactFlow();

  const onSave = useCallback(() => {
    const flow = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport(),
    };
    
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flow.json';
    link.click();
    URL.revokeObjectURL(url);
  }, [getNodes, getEdges, getViewport]);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && onLoad) {
      onLoad(file);
    }
  }, [onLoad]);

  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      right: 10, 
      zIndex: 1000, 
      display: 'flex', 
      gap: '10px' 
    }}>
      <button 
        onClick={onSave}
        style={{
          padding: '8px 16px',
          backgroundColor: 'blue',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Execute
      </button>

      <button 
        onClick={onSave}
        style={{
          padding: '8px 16px',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Save Flow
      </button>
      
      <label style={{
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '2px solid #000000',
        borderRadius: '4px',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
        cursor: 'pointer'
      }}>
        Load Flow
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}