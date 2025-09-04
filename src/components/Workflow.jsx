import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';

// const nodeTypes = {
//   general: GeneralNode,
// };


const initialNodes = [];
const initialEdges = [];

export default function WorkFlow({ workflow, id, name }) {
  const { getNodes, getEdges, getViewport, setViewport, screenToFlowPosition } = useReactFlow();
  const { askToClaude, saveWorkflow, deleteWorkflow, executeWorkflow, loadAllWorkflows } = useWorkflow();
  const [type] = useDnD();

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [showChat, setShowChat] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [claudeFlowLoaded, setClaudeFlowLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { nodeTypes: availableNodeTypes } = useNodeTypes();
  const reactFlowWrapper = useRef(null);  
  
  const handleClose = (confirmed) => {
    setOpen(false);
  };

  const handleMidputChange = useCallback((nodeId, midputName, newValue) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                midputs: node.data.midputs.map((m) =>
                  m.name === midputName ? { ...m, value: newValue } : m
                ),
              },
            }
          : node
      )
    );
  }, [setNodes]);

  // Update midput values inside node.data
  const nodeTypes = useMemo(() => ({ 
    general: (props) => <GeneralNode {...props} onMidputChange={handleMidputChange} /> 
  }), [handleMidputChange]);

  useEffect(() => {
    try {
      if (!workflow) return;
      setNodes(workflow.nodes??[])
      setEdges(workflow.edges??[])
      setViewport(workflow.viewport??[])
    }
    catch(err) {
      console.log(`Error occurs: ${err}`)
    }
  }, [name, id, workflow])
 
  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot) ),
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

  // Handle Execute button 
  const handleExecute = async () => {
    const data = await executeWorkflow(id);
    if (data.error) {
      setResult(data.error);
    }
    else{
      setResult(data.message);
    }
    setOpen(true);
  }
  const onExecute = useCallback(async () => {
    setLoading(true);
    await handleExecute();
    setLoading(false);
  }, []);

  // Handle Delete button 
  const handleDelete = async() => {
    await deleteWorkflow(id);
    await loadAllWorkflows();
  }

  const onDelete = useCallback(async () =>{
    setLoading(true);
    await handleDelete();
    setLoading(false);
    // alert("Deleted successfully!");
  }, []);

  // Handle Save button 
  const handleSave = async () => {
    const flow = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport(),
    };

    const newWorkflow = {
      id: id,
      name: name,
      flow: {
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      }
    }

    console.log(`Saving workflow: ${JSON.stringify(newWorkflow)}`);
    await saveWorkflow(newWorkflow);
    await loadAllWorkflows();
  }

  const onSave = useCallback(async () => {
    setLoading(true);
    await handleSave();
    setLoading(false);
    // alert('Saved successfully!');

    // Save to File code 
    
    // const dataStr = JSON.stringify(flow, null, 2);
    // const dataBlob = new Blob([dataStr], { type: 'application/json' });
    // const url = URL.createObjectURL(dataBlob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'flow.json';
    // link.click();
    // URL.revokeObjectURL(url);
  }, [getNodes, getEdges, getViewport, id, name, saveWorkflow]);


  // Handle onLoad button 
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
      
      const nodeDefinition = availableNodeTypes.find(nt => nt.label === type);
      if (!nodeDefinition) return;

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'general',
        position,
        data: {
          label: nodeDefinition.label,
          inputs: nodeDefinition.inputs || [],
          outputs: nodeDefinition.outputs || [],
          midputs: nodeDefinition.midputs || [],
          value: nodeDefinition.value || {},          
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

  // Handle Chat button
  const sendChat = async (message) => {
    try {
      setLoading(true);
      const { flow, text } = await askToClaude(message, workflow);
      debugger

      if (flow.nodes) setNodes(flow.nodes);
      if (flow.edges) setEdges(flow.edges);
      if (flow.viewport) setViewport(flow.viewport);
      if (flow.nodes && flow.edges && flow.viewport) {
        // setClaudeFlowLoaded(true);
      }
      else {
        setResult(text);
        setOpen(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading flow:', error);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
      if (claudeFlowLoaded) {
        setLoading(true);
        const runWorkflow = async () => {
          setClaudeFlowLoaded(false);
          await handleSave();
          await handleExecute();
          setLoading(false);
        }
        runWorkflow();
      }

  }, [claudeFlowLoaded, onSave, onExecute])


  return (
    <div ref={reactFlowWrapper} className='flex w-[calc(100vw-270px)] h-[calc(100vh-120px)]' style={{ position: 'relative' }}>
      <PortTypeLegend />
      <FlowControl 
        onLoad={onLoad} 
        onSave={onSave} 
        onDelete={onDelete} 
        onExecute={onExecute} />
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

      <Dialog
        open={open}
        onClose={() => handleClose(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Workflow Result</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {result}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(true)} color="error" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}
