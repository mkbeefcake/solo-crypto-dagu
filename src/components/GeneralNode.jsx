import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { useEffect } from 'react';
import { usePortColors } from '../contexts/PortColorContext';
import './GeneralNode.css';

export function GeneralNode({ id, data }) {
  const {
    label = 'General Node',
    inputs = [],
    outputs = [],
    midputs = []
  } = data;
  
  const typeColors = usePortColors();
  const updateNodeInternals = useUpdateNodeInternals();
  
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, inputs.length, outputs.length, midputs.length, updateNodeInternals]);

  return (
    <div className="general-node">
      <div className="node-header">
        {label}
      </div>
      
      {midputs.length > 0 && (
        <div className="node-midputs">
          {midputs.map((midput, index) => (
            <div key={`midput-${index}`} className="midput-field">
              {/* <label className="midput-label">
                {midput.name || `Input ${index + 1}`}:
              </label> */}
              <input
                type="text"
                className="midput-input"
                placeholder={`${midput.label}`}
              />
            </div>
          ))}
        </div>
      )}
      
      {inputs.map((input, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.Left}
          id={`input-${index}`}
          style={{ 
            backgroundColor: typeColors[input.type],
            top: `${((index + 1) * 100) / (inputs.length + 1)}%`
          }}
          data-type={input.type}
        />
      ))}
      
      {outputs.map((output, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${index}`}
          style={{ 
            backgroundColor: typeColors[output.type],
            top: `${((index + 1) * 100) / (outputs.length + 1)}%`
          }}
          data-type={output.type}
        />
      ))}
    </div>
  );
}