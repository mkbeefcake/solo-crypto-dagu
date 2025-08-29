import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DnDProvider } from './components/DnDContext';
import { PortColorProvider } from './contexts/PortColorContext';
import Sidebar from './components/Sidebar';
import WorkFlowTabs from './components/WorkflowTab';
 
function Flow() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '200px'}}>
        <WorkFlowTabs />
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