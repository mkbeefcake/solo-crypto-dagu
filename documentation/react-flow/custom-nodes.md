# React Flow Custom Nodes Documentation

## Overview

React Flow custom nodes are React components that provide interactive, draggable elements in flow diagrams. They automatically receive essential props and support custom handles for connections.

## Basic Custom Node Creation

### 1. Create Custom Node Component

Custom nodes are standard React components wrapped by React Flow:

```jsx
import { Handle, Position } from '@xyflow/react';

export function CustomNode(props) {
  const { id, data } = props;
  
  return (
    <div className="custom-node">
      {/* Target handle (input) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="input"
      />
      
      <div>Custom Node Content</div>
      
      {/* Source handle (output) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="output"
      />
    </div>
  );
}
```

### 2. Register Node Types

Define node types outside components to prevent re-renders:

```jsx
const nodeTypes = {
  custom: CustomNode,
};

function FlowComponent() {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      // ... other props
    />
  );
}
```

### 3. Use Custom Nodes

Specify the custom type in node definitions:

```jsx
const nodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { label: 'Custom Node' }
  }
];
```

## Node Props

Custom nodes automatically receive these props:

- `id`: Unique node identifier
- `data`: Custom data object
- `selected`: Boolean indicating selection state
- `dragging`: Boolean indicating drag state
- `position`: Node position { x, y }

## Handles Configuration

### Handle Types
- `source`: Connection starting point (output)
- `target`: Connection ending point (input)

### Handle Positions
```jsx
import { Position } from '@xyflow/react';

// Available positions:
Position.Top
Position.Right  
Position.Bottom
Position.Left
```

### Handle Props
```jsx
<Handle
  type="source"           // 'source' | 'target'
  position={Position.Right}
  id="unique-handle-id"   // Optional: multiple handles need unique IDs
  isConnectable={true}    // Default: true
  isConnectableStart={true} // Can start connections from this handle
  isConnectableEnd={true}   // Can end connections at this handle
/>
```

## Left-Right Connection Nodes

For horizontal flow layouts with left-right connections:

```jsx
export function HorizontalNode({ data }) {
  return (
    <div className="horizontal-node">
      {/* Left side - inputs (targets) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-input"
      />
      
      <div className="node-content">
        {data.label}
      </div>
      
      {/* Right side - outputs (sources) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right-output"
      />
    </div>
  );
}
```

### Multiple Left-Right Handles

```jsx
export function MultiHandleNode({ data }) {
  return (
    <div className="multi-handle-node">
      {/* Multiple inputs on left */}
      <Handle type="target" position={Position.Left} id="input-1" style={{ top: 20 }} />
      <Handle type="target" position={Position.Left} id="input-2" style={{ top: 50 }} />
      
      <div className="node-body">
        {data.label}
      </div>
      
      {/* Multiple outputs on right */}
      <Handle type="source" position={Position.Right} id="output-1" style={{ top: 20 }} />
      <Handle type="source" position={Position.Right} id="output-2" style={{ top: 50 }} />
    </div>
  );
}
```

## Nodes with User Input Fields

Add interactive elements inside nodes using the `nodrag` class to prevent interference:

```jsx
import { useCallback } from 'react';

export function InputNode({ id, data }) {
  const onChange = useCallback((evt) => {
    // Update node data
    console.log(`Node ${id} input changed:`, evt.target.value);
  }, [id]);

  return (
    <div className="input-node">
      <Handle type="target" position={Position.Left} />
      
      <div className="node-content">
        <label htmlFor={`input-${id}`}>Value:</label>
        <input 
          id={`input-${id}`}
          className="nodrag"  // Prevents dragging when interacting with input
          onChange={onChange}
          defaultValue={data.value || ''}
        />
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

### Complex Form Node

```jsx
export function FormNode({ id, data }) {
  const handleInputChange = useCallback((field, value) => {
    // Handle form updates
  }, []);

  return (
    <div className="form-node">
      <Handle type="target" position={Position.Left} id="trigger" />
      
      <div className="form-content">
        <h3>{data.title}</h3>
        
        <div className="form-field">
          <label>Name:</label>
          <input 
            className="nodrag"
            type="text"
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
        
        <div className="form-field">
          <label>Type:</label>
          <select 
            className="nodrag"
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} id="result" />
    </div>
  );
}
```

## Typed Connections with Validation

### Connection Validation

Implement connection validation to restrict connections by type:

```jsx
function FlowComponent() {
  const isValidConnection = useCallback((connection) => {
    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    // Validate connection based on data types
    const sourceType = sourceNode?.data?.outputType;
    const targetType = targetNode?.data?.inputType;
    
    return sourceType === targetType;
  }, [nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      isValidConnection={isValidConnection}
      // ... other props
    />
  );
}
```

### Typed Handle Node

```jsx
export function TypedNode({ id, data }) {
  const inputTypes = data.inputTypes || [];  // ['string', 'number']
  const outputTypes = data.outputTypes || []; // ['boolean']

  return (
    <div className="typed-node">
      {/* Dynamic input handles based on types */}
      {inputTypes.map((type, index) => (
        <Handle
          key={`input-${type}-${index}`}
          type="target"
          position={Position.Left}
          id={`input-${type}-${index}`}
          style={{ top: 20 + (index * 30) }}
          data-type={type}  // Store type for validation
        />
      ))}
      
      <div className="node-content">
        <div className="node-title">{data.label}</div>
        <div className="type-info">
          <div>Inputs: {inputTypes.join(', ')}</div>
          <div>Outputs: {outputTypes.join(', ')}</div>
        </div>
      </div>
      
      {/* Dynamic output handles based on types */}
      {outputTypes.map((type, index) => (
        <Handle
          key={`output-${type}-${index}`}
          type="source"
          position={Position.Right}
          id={`output-${type}-${index}`}
          style={{ top: 20 + (index * 30) }}
          data-type={type}
        />
      ))}
    </div>
  );
}
```

### Advanced Type Validation

```jsx
const isValidConnection = useCallback((connection) => {
  const sourceHandle = connection.sourceHandle;
  const targetHandle = connection.targetHandle;
  
  // Find the actual handle elements to get type data
  const sourceElement = document.querySelector(`[data-handleid="${sourceHandle}"]`);
  const targetElement = document.querySelector(`[data-handleid="${targetHandle}"]`);
  
  const sourceType = sourceElement?.getAttribute('data-type');
  const targetType = targetElement?.getAttribute('data-type');
  
  // Allow connections between compatible types
  const compatibilityMap = {
    'string': ['string'],
    'number': ['number', 'string'], // numbers can connect to strings
    'boolean': ['boolean', 'string'],
    'any': ['string', 'number', 'boolean'] // any type accepts all
  };
  
  return compatibilityMap[sourceType]?.includes(targetType) || false;
}, []);
```

## Best Practices

1. **Performance**: Define `nodeTypes` outside components to prevent re-renders
2. **Interactions**: Use `className="nodrag"` on interactive elements
3. **Validation**: Implement `isValidConnection` for type safety
4. **Handles**: Use unique `id` props for multiple handles per node
5. **Styling**: Position handles with inline styles for precise placement
6. **Data Flow**: Store type information in node data for validation

## Common Patterns

### Variable Input/Output Node
```jsx
export function VariableIONode({ data }) {
  const inputCount = data.inputCount || 1;
  const outputCount = data.outputCount || 1;
  
  return (
    <div className="variable-io-node">
      {Array.from({ length: inputCount }, (_, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={Position.Left}
          id={`input-${i}`}
          style={{ top: `${((i + 1) * 100) / (inputCount + 1)}%` }}
        />
      ))}
      
      <div className="node-content">{data.label}</div>
      
      {Array.from({ length: outputCount }, (_, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={Position.Right}
          id={`output-${i}`}
          style={{ top: `${((i + 1) * 100) / (outputCount + 1)}%` }}
        />
      ))}
    </div>
  );
}
```

This documentation provides comprehensive guidance for creating custom React Flow nodes with left-right connections, user inputs, and typed connections with validation.