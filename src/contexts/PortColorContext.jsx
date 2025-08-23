import { createContext, useContext, useEffect, useState } from 'react';

const PortColorContext = createContext();

export function PortColorProvider({ children }) {
  const [typeColors, setTypeColors] = useState({});

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch('/api/port-colors');
        if (response.ok) {
          const colors = await response.json();
          setTypeColors(colors);
        }
      } catch (error) {
        console.warn('Failed to fetch port colors:', error);
      }
    };
    
    fetchColors();
  }, []);

  return (
    <PortColorContext.Provider value={typeColors}>
      {children}
    </PortColorContext.Provider>
  );
}

export function usePortColors() {
  const context = useContext(PortColorContext);
  if (context === undefined) {
    throw new Error('usePortColors must be used within a PortColorProvider');
  }
  return context;
}