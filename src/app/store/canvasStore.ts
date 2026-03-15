import { create } from 'zustand';

export interface ViewState {
  x: number;
  y: number;
  scale: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio';
  x: number;
  y: number;
  content: string;
  title: string;
  status?: 'idle' | 'generating' | 'done';
  previewUrl?: string;
}

export interface Connection {
  from: string;
  to: string;
}

export interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface CanvasState {
  nodes: Node[];
  connections: Connection[];
  viewState: ViewState;
  selectedNodeId: string | null;

  // Actions
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setConnections: (connections: Connection[] | ((prev: Connection[]) => Connection[])) => void;
  setViewState: (viewState: ViewState | ((prev: ViewState) => ViewState)) => void;
  setSelectedNodeId: (id: string | null) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (from: string, to: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  connections: [],
  viewState: { x: 0, y: 0, scale: 1 },
  selectedNodeId: null,

  setNodes: (nodes) => 
    set((state) => ({ 
      nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
    })),
    
  setConnections: (connections) => 
    set((state) => ({ 
      connections: typeof connections === 'function' ? connections(state.connections) : connections 
    })),
    
  setViewState: (viewState) => 
    set((state) => ({ 
      viewState: typeof viewState === 'function' ? viewState(state.viewState) : viewState 
    })),
    
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id ? { ...node, ...updates } : node
      )
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      connections: state.connections.filter(
        (conn) => conn.from !== id && conn.to !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    })),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection]
    })),

  removeConnection: (from, to) =>
    set((state) => ({
      connections: state.connections.filter(
        (conn) => !(conn.from === from && conn.to === to)
      )
    }))
}));