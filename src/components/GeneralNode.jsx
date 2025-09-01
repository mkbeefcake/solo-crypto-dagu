import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import { useEffect, useCallback, useState } from 'react';
import { usePortColors } from '../contexts/PortColorContext';
import { TextField } from "@mui/material";

import './GeneralNode.css';

export function GeneralNode({ id, data, onMidputChange }) {
 
  const {
    label,
    inputs = [],
    midputs = [],
    outputs = [],
  } = data


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
              {/* <input
                type="text"
                className="midput-input"
                placeholder={`${midput.label}`}
              /> */}
              <TextField
                key={midput.name}
                label={midput.label || ''}
                value={midput.value || ''}
                onChange={(e) => onMidputChange(id, midput.name, e.target.value)}
                size="small"
                fullWidth
                margin="dense"
              />
            </div>
          ))}
        </div>
      )}
      
      {inputs.map((input, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={Position.top}
          id={`input-${index}`}
          style={{ 
            backgroundColor: typeColors[input.type],
            left: `${((index + 1) * 100) / (inputs.length + 1)}%`
          }}
          data-type={input.type}
        />
      ))}
      
      {outputs.map((output, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={Position.Bottom}
          id={`output-${index}`}
          style={{ 
            backgroundColor: typeColors[output.type],
            left: `${((index + 1) * 100) / (outputs.length + 1)}%`
          }}
          data-type={output.type}
        />
      ))}
    </div>
  );
}