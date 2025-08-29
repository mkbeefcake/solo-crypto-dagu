import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Background, MiniMap,  applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow, ReactFlowProvider, BaseEdge } from '@xyflow/react';
import { GeneralNode } from './GeneralNode';
import { FlowControl } from './FlowControl';
import { PortTypeLegend } from './PortTypeLegend';
import { isValidConnection } from '../utils/connectionValidation';
import { useDnD } from './DnDContext';
import { useNodeTypes } from '../hooks/useNodeTypes';
import '@xyflow/react/dist/style.css';
import FloatingChat from './FloatingChat';
import { IconButton } from '@mui/material';
import { ChatBubble, Forum } from '@mui/icons-material';
import { useWorkflow } from './WorkFlowContext';

const nodeTypes = {
  general: GeneralNode,
};
 
const initialNodes = [];
const initialEdges = [];
 
export default function WorkFlow({ workflow }) {
  const { getNodes, getEdges, getViewport, setViewport, screenToFlowPosition } = useReactFlow();
  const { askToClaude } = useWorkflow();
  const [type] = useDnD();

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [showChat, setShowChat] = useState(false);

  const { nodeTypes: availableNodeTypes } = useNodeTypes();
  const reactFlowWrapper = useRef(null);  

  useEffect(() => {
    try {
      setNodes(workflow.nodes??[])
      setEdges(workflow.edges??[])
      setViewport(workflow.viewport??[])
    }
    catch(err) {
      console.log(`Error occurs: ${err}`)
    }
  }, [])
 
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

  const onExecute = useCallback(() => {

  }, [])

  const onDelete = useCallback(() =>{

  }, [])

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
 
  const showFloatingChat = (e) => {
    setShowChat(true);
  }

  const minimizeFloatingChat = (e) => {
    setShowChat(false);
  }

  const sendChat = async (message) => {
    debugger
    try {
      const flow = await askToClaude(message, workflow);
      if (flow.nodes) setNodes(flow.nodes);
      if (flow.edges) setEdges(flow.edges);
      if (flow.viewport) setViewport(flow.viewport);
    } catch (error) {
      console.error('Error loading flow:', error);
    }

  }

  return (
    <div ref={reactFlowWrapper} className='flex w-[calc(100vw-270px)] h-[calc(100vh-120px)]' style={{ position: 'relative' }}>
      <PortTypeLegend />
      <FlowControl onLoad={onLoad} onSave={onSave} onDelete={onDelete} onExecute={onExecute} />
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
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 1000
        }}
        color='primary'
        onClick={showFloatingChat}
      >
        <Forum/>
      </IconButton>
      {showChat && (<FloatingChat triggerMinimize={minimizeFloatingChat} sendChat={sendChat} />)}
    </div>
  );
}
