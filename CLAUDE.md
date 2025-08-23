# Zoo-Scape Architecture Notes

## API Routing
- Vite proxy: `/api/*` → `http://localhost:8001/*` (removes `/api` prefix)

## Backend Structure
- **PortType enum** (`backend/node_definitions.py`): STRING, INT, FLOAT, BOOLEAN, LIST
- **API endpoints**:
  - `/nodes/types` - Node definitions
  - `/port-colors` - Port type color mapping

## Frontend Components
- **GeneralNode** (`src/components/GeneralNode.jsx`): Main node component
