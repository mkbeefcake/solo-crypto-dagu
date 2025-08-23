import { useState, useCallback, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GeneralNode } from './components/GeneralNode';
import { FlowControl } from './components/FlowControl';
import { PortTypeLegend } from './components/PortTypeLegend';
import { isValidConnection } from './utils/connectionValidation';
import { DnDProvider, useDnD } from './components/DnDContext';
import { PortColorProvider } from './contexts/PortColorContext';
import { useNodeTypes } from './hooks/useNodeTypes';
import Sidebar from './components/Sidebar';

const nodeTypes = {
  general: GeneralNode,
};
 
const initialNodes = [];
const initialEdges = [];
 
function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { setViewport, screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();
  const { nodeTypes: availableNodeTypes } = useNodeTypes();
  const reactFlowWrapper = useRef(null);
 
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleIsValidConnection = useCallback(
    (connection) => isValidConnection(connection, nodes),
    [nodes],
  );


  const onLoad = useCallback((file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes) setNodes(flow.nodes);
          if (flow.edges) setEdges(flow.edges);
          if (flow.viewport) setViewport(flow.viewport);
        } catch (error) {
          console.error('Error loading flow:', error);
        }
      };
      reader.readAsText(file);
    }
  }, [setNodes, setEdges, setViewport]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const nodeDefinition = availableNodeTypes.find(nt => nt.name === type);
      if (!nodeDefinition) return;

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'general',
        position,
        data: {
          label: nodeDefinition.name,
          inputs: nodeDefinition.inputs || [],
          outputs: nodeDefinition.outputs || [],
          midputs: nodeDefinition.midputs || []
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, availableNodeTypes, setNodes],
  );
 
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '200px' }}>
        <FlowControl onLoad={onLoad} />
        
        <div ref={reactFlowWrapper} style={{ width: '100%', height: 'calc(100vh - 60px)', position: 'relative' }}>
          <PortTypeLegend />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            isValidConnection={handleIsValidConnection}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <PortColorProvider>
          <Flow />
        </PortColorProvider>
      </DnDProvider>
    </ReactFlowProvider>
  );
}