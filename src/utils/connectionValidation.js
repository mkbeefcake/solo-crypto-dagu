export const typeCompatibility = {
  int: ['int', 'string'],
  boolean: ['boolean', 'string'],
  string: ['string'],
  list: ['list']
};

export function isValidConnection(connection, nodes) {
  // Find source and target nodes
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  if (!sourceNode || !targetNode) {
    return false;
  }

  // Get node data
  const sourceOutputs = sourceNode.data?.outputs || [];
  const targetInputs = targetNode.data?.inputs || [];
  
  // Parse handle indices from IDs like "output-0" -> 0
  const sourceIndex = parseInt(connection.sourceHandle?.split('-')[1]);
  const targetIndex = parseInt(connection.targetHandle?.split('-')[1]);
  
  // Get the specific input/output definitions
  const sourceOutput = sourceOutputs[sourceIndex];
  const targetInput = targetInputs[targetIndex];
  
  if (!sourceOutput || !targetInput) {
    return false;
  }

  // Check type compatibility
  const isCompatible = typeCompatibility[sourceOutput.type]?.includes(targetInput.type) || false;
  return isCompatible;
}