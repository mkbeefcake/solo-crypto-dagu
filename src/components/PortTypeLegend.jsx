import { usePortColors } from '../contexts/PortColorContext';

export function PortTypeLegend() {
  const typeColors = usePortColors();

  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1000,
      backgroundColor: '#ffffff',
      border: '2px solid #000000',
      borderRadius: '4px',
      padding: '12px',
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '8px',
        borderBottom: '1px solid #000000',
        paddingBottom: '4px'
      }}>
        <span>Port Types</span>
      </div>
      
      {Object.entries(typeColors).map(([type, color]) => (
        <div key={type} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '4px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: color,
            borderRadius: '50%',
            color: 'black',
            border: '1px solid #000000'
          }} />
          <span>{type}</span>
        </div>
      ))}
    </div>
  );
}