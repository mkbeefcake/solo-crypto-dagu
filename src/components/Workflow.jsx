import { useState, useCallback, useRef } from 'react';
import { ReactFlow, Background, MiniMap,  applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow, ReactFlowProvider, BaseEdge } from '@xyflow/react';
import { GeneralNode } from './GeneralNode';
import { FlowControl } from './FlowControl';
import { PortTypeLegend } from './PortTypeLegend';
import { isValidConnection } from '../utils/connectionValidation';
import { useDnD } from './DnDContext';
import { useNodeTypes } from '../hooks/useNodeTypes';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  general: GeneralNode,
};
 
const initialNodes = [];
const initialEdges = [];
 
export default function WorkFlow({ workflow }) {
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
    console.log('OnDragOver event:', event);
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      console.log('OnDrop event:', event);
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
    <div ref={reactFlowWrapper} className='flex w-[calc(100vw-270px)] h-[calc(100vh-120px)]' style={{ position: 'relative' }}>
      <PortTypeLegend />
      <FlowControl onLoad={onLoad} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesFocusable={true}
        edgesFocusable={true}
        // defaultEdgeOptions={{ animated: true }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        isValidConnection={handleIsValidConnection}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
      >
        <Background/>
      </ReactFlow>
    </div>
  );
}
