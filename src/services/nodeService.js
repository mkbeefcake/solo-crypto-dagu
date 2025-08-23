export class NodeService {
  static async getNodeTypes() {
    try {
      const response = await fetch('/api/nodes/types');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch node types:', error);
      throw error;
    }
  }
}