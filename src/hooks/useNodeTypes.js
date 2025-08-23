import { useState, useEffect } from 'react';
import { NodeService } from '../services/nodeService';

export function useNodeTypes() {
  const [nodeTypes, setNodeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodeTypes = async () => {
      try {
        setLoading(true);
        const types = await NodeService.getNodeTypes();
        setNodeTypes(types);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNodeTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNodeTypes();
  }, []);

  return { nodeTypes, loading, error };
}