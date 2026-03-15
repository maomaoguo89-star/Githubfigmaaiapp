import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCanvasStore } from '../store/canvasStore';
import { 
  Plus, MousePointer2, Image as ImageIcon, Video, Type, Music, 
  Upload, Settings, Share2, Download, Play, Sparkles, Hand, X,
  Camera, Sun, Maximize, Layers, Zap, ChevronRight, ChevronLeft,
  MoreHorizontal, RefreshCw, Eraser, Wand2,
  Shapes, Layout, MessageCircle, History, Grid, Minus, HelpCircle,
  Map as MapIcon, Save, FolderOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NodeEditorPanel } from './NodeEditorPanel';
import { TextCanvasNode } from './TextCanvasNode';
import { ImageCanvasNode } from './ImageCanvasNode';
import { VideoCanvasNode } from './VideoCanvasNode';
import { AudioCanvasNode } from './AudioCanvasNode';

const INITIAL_NODES: Node[] = [
  { id: '1', type: 'text', x: 100, y: 200, title: 'Text', content: '1. 开启你的创作...' },
  { id: '2', type: 'image', x: 500, y: 200, title: 'Image', content: '', status: 'done', previewUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=400&h=300&fit=crop' },
  { id: '3', type: 'video', x: 900, y: 200, title: 'Video', content: '', status: 'generating' },
  { id: '4', type: 'audio', x: 500, y: 550, title: 'Audio', content: '' },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '1', to: '4' },
];

const WORLD_SIZE = 4000;
const WORLD_OFFSET = 2000;

const CanvasNode = memo(({ 
  node, 
  isSelected, 
  isGenerating,
  onPointerDown, 
  onSettingsClick 
}: { 
  node: Node, 
  isSelected: boolean, 
  isGenerating: boolean,
  onPointerDown: (e: React.PointerEvent, node: Node) => void,
  onSettingsClick: (e: React.MouseEvent, id: string) => void
}) => {
  return (
    <div
      className={cn(
        "node-element absolute rounded-xl border bg-[#111] backdrop-blur-xl shadow-2xl transition-shadow cursor-default",
        isSelected ? "border-blue-500/50 shadow-blue-500/20" : "border-white/10 hover:border-white/20"
      )}
      style={{
        width: 220,
        height: node.type === 'image' ? 180 : 160,
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        willChange: 'transform',
      }}
      onPointerDown={(e) => onPointerDown(e, node)}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5 rounded-t-xl">
        <div className="flex items-center gap-2">
          {node.type === 'text' && <Type size={14} className="text-blue-400" />}
          {node.type === 'image' && <ImageIcon size={14} className="text-purple-400" />}
          {node.type === 'video' && <Video size={14} className="text-pink-400" />}
          <span className="text-xs font-medium text-white/80">{node.title}</span>
        </div>
        <button 
          className="p-1 hover:bg-white/10 rounded"
          onClick={(e) => onSettingsClick(e, node.id)}
        >
          <Settings size={12} className="text-white/40" />
        </button>
      </div>

      <div className="p-3 h-full flex flex-col pointer-events-none">
        {node.type === 'text' && (
          <p className="text-xs text-white/60 line-clamp-4 leading-relaxed">
            {node.content}
          </p>
        )}
        
        {node.type === 'image' && (
          <div className="flex-1 w-full rounded-lg overflow-hidden bg-black/50 border border-white/5 relative">
            {node.previewUrl ? (
              <img src={node.previewUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                <ImageIcon size={24} />
              </div>
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
        
        {node.type === 'video' && (
          <div className="flex-1 w-full rounded-lg overflow-hidden bg-black/50 border border-white/5 relative flex items-center justify-center">
            <Video size={24} className="text-white/20" />
          </div>
        )}
      </div>
    </div>
  );
});

CanvasNode.displayName = 'CanvasNode';

export const InfiniteCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Zustand State
  const nodes = useCanvasStore((state) => state.nodes);
  const setNodes = useCanvasStore((state) => state.setNodes);
  const connections = useCanvasStore((state) => state.connections);
  const setConnections = useCanvasStore((state) => state.setConnections);
  const { scale, x, y } = useCanvasStore((state) => state.viewState);
  const setViewState = useCanvasStore((state) => state.setViewState);
  
  // Mapping local state to Zustand viewState for smooth transition
  const position = { x, y };
  const setPosition = (pos: { x: number, y: number } | ((prev: { x: number, y: number }) => { x: number, y: number })) => {
    if (typeof pos === 'function') {
      const newPos = pos({ x, y });
      setViewState(prev => ({ ...prev, x: newPos.x, y: newPos.y }));
    } else {
      setViewState(prev => ({ ...prev, x: pos.x, y: pos.y }));
    }
  };
  const setScale = (newScale: number | ((prev: number) => number)) => {
    if (typeof newScale === 'function') {
      setViewState(prev => ({ ...prev, scale: newScale(prev.scale) }));
    } else {
      setViewState(prev => ({ ...prev, scale: newScale }));
    }
  };

  const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1920, height: typeof window !== 'undefined' ? window.innerHeight : 1080 });

  // Initialize store with default data on mount
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(INITIAL_NODES);
      setConnections(INITIAL_CONNECTIONS);
    }
  }, []);

  // Interaction states
  const [isPanning, setIsPanning] = useState(false);
  const [dragInfo, setDragInfo] = useState<{ startX: number, startY: number, startPosX: number, startPosY: number } | null>(null);
  const tempConnectionRef = useRef<{
    fromNode: string;
    fromPort: 'left' | 'right';
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [tempConnectionState, setTempConnectionState] = useState<{
    fromNode: string;
    fromPort: 'left' | 'right';
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const setTempConnection = useCallback((val: React.SetStateAction<{
    fromNode: string;
    fromPort: 'left' | 'right';
    mouseX: number;
    mouseY: number;
  } | null>) => {
    tempConnectionRef.current = typeof val === 'function' ? val(tempConnectionRef.current) : val;
    setTempConnectionState(tempConnectionRef.current);
  }, []);

  const tempConnection = tempConnectionState;
  
  const dragNodesDataRef = useRef<{ 
    startX: number; 
    startY: number; 
    currentX: number; 
    currentY: number; 
    nodesMap: Map<string, {startX: number; startY: number}> 
  } | null>(null);
  const dragRafRef = useRef<number | null>(null);
  
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const selectedNodesRef = useRef(selectedNodes);
  const nodesRef = useRef(nodes);

  // Sync selectedNodeId with Zustand for Side Panel
  const setSelectedNodeId = useCanvasStore((state) => state.setSelectedNodeId);
  useEffect(() => {
    if (selectedNodes.length === 1) {
      setSelectedNodeId(selectedNodes[0]);
    } else {
      setSelectedNodeId(null);
    }
  }, [selectedNodes, setSelectedNodeId]);

  useEffect(() => {
    selectedNodesRef.current = selectedNodes;
    nodesRef.current = nodes;
  }, [selectedNodes, nodes]);

  const selectionVisualRef = useRef<HTMLDivElement>(null);
  const selectionDataRef = useRef<{ 
    startX: number, startY: number, 
    currentX: number, currentY: number, 
    startMouseX: number, startMouseY: number, 
    active: boolean 
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [generatingNodes, setGeneratingNodes] = useState<Record<string, boolean>>({});
  
  // New UI states
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMinimapOpen, setIsMinimapOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [showZoomToast, setShowZoomToast] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Panning with spacebar
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  const viewStateRef = useRef({ position, scale });
  useEffect(() => {
    viewStateRef.current = { position, scale };
  }, [position, scale]);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [clipboardNodes, setClipboardNodes] = useState<Node[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement).isContentEditable
      ) return;
      if (e.code === 'Space') {
        setIsSpacePressed(true);
        e.preventDefault();
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodesRef.current.length > 0) {
    const updatedNodes = useCanvasStore.getState().nodes.filter(n => !selectedNodesRef.current.includes(n.id));
    useCanvasStore.getState().setNodes(updatedNodes);
    const updatedConns = useCanvasStore.getState().connections.filter(c => !selectedNodesRef.current.includes(c.from) && !selectedNodesRef.current.includes(c.to));
    useCanvasStore.getState().setConnections(updatedConns);
    setSelectedNodes([]);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (selectedNodesRef.current.length > 0) {
          const nodesToCopy = nodesRef.current.filter(n => selectedNodesRef.current.includes(n.id));
          setClipboardNodes(nodesToCopy);
        }
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        setClipboardNodes(prevClipboard => {
          if (prevClipboard.length > 0) {
            const newNodes = prevClipboard.map(n => ({
              ...n,
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              x: n.x + 50,
              y: n.y + 50,
            }));
            setNodes(prev => [...prev, ...newNodes]);
            setSelectedNodes(newNodes.map(n => n.id));
            return newNodes;
          }
          return prevClipboard;
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      setIsSpacePressed(false);
      setIsPanning(false);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const triggerZoomToast = () => {
    setShowZoomToast(true);
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => setShowZoomToast(false), 1000);
  };

  const handleZoom = useCallback((direction: 'in' | 'out', center?: { x: number, y: number }) => {
    const scaleBy = 1.1;
    const oldScale = scale;
    const pointer = center || { x: windowSize.width / 2, y: windowSize.height / 2 };

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    let newScale = direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy;
    newScale = Math.max(0.1, Math.min(5, newScale));
    
    if (newScale === oldScale) return;

    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    });
    triggerZoomToast();
  }, [scale, position, windowSize]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.1, scale * Math.exp(delta)), 5);
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const ratio = 1 - newScale / scale;
      const newX = position.x + (mouseX - position.x) * ratio;
      const newY = position.y + (mouseY - position.y) * ratio;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
      triggerZoomToast();
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  }, [scale, position]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (e.button === 1 || isSpacePressed) {
      e.preventDefault();
      setIsPanning(true);
      setDragInfo({
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y
      });
    } else if (e.button === 0) {
      const target = e.target as HTMLElement;
      if (target.closest('.node-element') || target.closest('.ui-overlay') || target.closest('.no-drag')) {
        return;
      }
      setSelectedNodes([]);
      setIsAgentOpen(false);
      setIsMinimapOpen(false);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;
        selectionDataRef.current = { 
          startX: x, startY: y, 
          currentX: x, currentY: y, 
          startMouseX: e.clientX, startMouseY: e.clientY,
          active: false 
        };
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (tempConnection) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - position.x) / scale;
        const y = (e.clientY - rect.top - position.y) / scale;
        setTempConnection(prev => prev ? { ...prev, mouseX: x, mouseY: y } : null);
      }
    } else if (isPanning && dragInfo) {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          setPosition({
            x: dragInfo.startPosX + (e.clientX - dragInfo.startX),
            y: dragInfo.startPosY + (e.clientY - dragInfo.startY)
          });
          rafRef.current = null;
        });
      }
    } else if (dragNodesDataRef.current) {
      const data = dragNodesDataRef.current;
      data.currentX = e.clientX;
      data.currentY = e.clientY;
      
      if (dragRafRef.current === null) {
        dragRafRef.current = requestAnimationFrame(() => {
          if (dragNodesDataRef.current) {
            const currentData = dragNodesDataRef.current;
            const dx = (currentData.currentX - currentData.startX) / scale;
            const dy = (currentData.currentY - currentData.startY) / scale;
            
            setNodes(prev => {
              let changed = false;
              const nextNodes = prev.map(n => {
                const startPos = currentData.nodesMap.get(n.id);
                if (startPos) {
                  changed = true;
                  return { ...n, x: startPos.startX + dx, y: startPos.startY + dy };
                }
                return n;
              });
              return changed ? nextNodes : prev;
            });
          }
          dragRafRef.current = null;
        });
      }
    } else if (selectionDataRef.current) {
      const data = selectionDataRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      
      if (!data.active) {
        const dx = e.clientX - data.startMouseX;
        const dy = e.clientY - data.startMouseY;
        if (Math.sqrt(dx * dx + dy * dy) > 3) {
          data.active = true;
          if (selectionVisualRef.current) {
            selectionVisualRef.current.classList.remove('hidden');
          }
        }
      }
      
      if (data.active) {
        data.currentX = x;
        data.currentY = y;
        
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            const currentData = selectionDataRef.current;
            if (currentData && currentData.active && selectionVisualRef.current) {
              const minX = Math.min(currentData.startX, currentData.currentX);
              const maxX = Math.max(currentData.startX, currentData.currentX);
              const minY = Math.min(currentData.startY, currentData.currentY);
              const maxY = Math.max(currentData.startY, currentData.currentY);
              
              selectionVisualRef.current.style.left = `${minX}px`;
              selectionVisualRef.current.style.top = `${minY}px`;
              selectionVisualRef.current.style.width = `${maxX - minX}px`;
              selectionVisualRef.current.style.height = `${maxY - minY}px`;
              
              const newlySelected = nodesRef.current.filter(n => {
                const nodeW = 220;
                const nodeH = n.type === 'image' ? 180 : 160;
                return (
                  n.x < maxX &&
                  n.x + nodeW > minX &&
                  n.y < maxY &&
                  n.y + nodeH > minY
                );
              }).map(n => n.id);
              
              const isSame = newlySelected.length === selectedNodesRef.current.length && 
                newlySelected.every((id, idx) => id === selectedNodesRef.current[idx]);
                
              if (!isSame) {
                setSelectedNodes(newlySelected);
              }
            }
            rafRef.current = null;
          });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
    setIsPanning(false);
    setDragInfo(null);
    setTempConnection(null);
    
    if (dragNodesDataRef.current) {
      dragNodesDataRef.current = null;
    }
    if (dragRafRef.current !== null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    
    if (selectionDataRef.current) {
      selectionDataRef.current = null;
      if (selectionVisualRef.current) {
        selectionVisualRef.current.classList.add('hidden');
      }
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handlePortPointerDown = useCallback((e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { position, scale } = viewStateRef.current;
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    setTempConnection({
      fromNode: nodeId,
      fromPort: port,
      mouseX: x,
      mouseY: y
    });
  }, []);

  const handlePortPointerUp = useCallback((e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => {
    e.stopPropagation();
    if (tempConnectionRef.current && tempConnectionRef.current.fromNode !== nodeId) {
      const temp = tempConnectionRef.current;
      setConnections(prev => {
        const exists = prev.some(c => 
          (c.from === temp.fromNode && c.to === nodeId) ||
          (c.to === temp.fromNode && c.from === nodeId)
        );
        if (exists) return prev;

        let from = temp.fromNode;
        let to = nodeId;
        // Adjust direction if dragged from left to right port
        if (temp.fromPort === 'left' && port === 'right') {
          from = nodeId;
          to = temp.fromNode;
        } else if (temp.fromPort === 'right' && port === 'left') {
          from = temp.fromNode;
          to = nodeId;
        }

        return [...prev, { from, to }];
      });
    }
    setTempConnection(null);
  }, [setTempConnection]);

  const handleNodePointerDown = useCallback((e: React.PointerEvent, node: Node) => {
    if (e.button !== 0 || isSpacePressed) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    setIsAgentOpen(false);
    setIsMinimapOpen(false);
    
    let activeNodes = selectedNodesRef.current;
    if (!activeNodes.includes(node.id)) {
      activeNodes = [node.id];
      setSelectedNodes(activeNodes);
    }
    
    const nodesMap = new Map();
    activeNodes.forEach(id => {
      const n = nodesRef.current.find(node => node.id === id);
      if (n) {
        nodesMap.set(n.id, { startX: n.x, startY: n.y });
      }
    });

    dragNodesDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      nodesMap
    };
  }, [isSpacePressed]);

  const handleSettingsClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedNodesRef.current.includes(id)) {
      setIsPanelOpen(true);
    }
  }, []);

  const generateMockContent = (prompt: string, params?: Record<string, unknown>) => {
    if (selectedNodes.length === 0) return;
    const targetId = selectedNodes[0];
    setGeneratingNodes(prev => ({ ...prev, [targetId]: true }));
    setTimeout(() => {
      setGeneratingNodes(prev => ({ ...prev, [targetId]: false }));
      setNodes(prev => prev.map(n => {
        if (n.id === targetId) {
          return {
            ...n,
            previewUrl: `https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=400&h=300&fit=crop&sig=${Math.random()}`,
            status: 'done'
          };
        }
        return n;
      }));
    }, 2000);
  };

  const nodeMap = React.useMemo(() => {
    const map: Record<string, Node> = {};
    nodes.forEach(n => map[n.id] = n);
    return map;
  }, [nodes]);

  const selectedNode = selectedNodes.length === 1 ? nodeMap[selectedNodes[0]] : null;

  const getNodePortCoords = (node: Node, port: 'left' | 'right') => {
    let w = 240, h = 264;
    if (node.type === 'image' || node.type === 'video') {
      w = 320; h = 228;
    } else if (node.type === 'audio') {
      w = 320; h = 188;
    } else if (node.type !== 'text') {
      w = 220; h = 160;
    }
    const x = port === 'left' ? node.x - 20 : node.x + w + 20;
    const y = node.y + h / 2;
    return { x, y };
  };

  const ConnectionsLayer = React.memo(({ 
    connections, 
    nodeMap, 
    tempConnection 
  }: { 
    connections: Connection[], 
    nodeMap: Record<string, Node>,
    tempConnection: { fromNode: string, fromPort: 'left'|'right', mouseX: number, mouseY: number } | null
  }) => {
    return (
      <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none z-0">
        {connections.map((conn, idx) => {
          const fromNode = nodeMap[conn.from];
          const toNode = nodeMap[conn.to];
          if (!fromNode || !toNode) return null;

          const fromCoords = getNodePortCoords(fromNode, 'right');
          const toCoords = getNodePortCoords(toNode, 'left');

          const cp1X = fromCoords.x + 80;
          const cp1Y = fromCoords.y;
          const cp2X = toCoords.x - 80;
          const cp2Y = toCoords.y;

          const pathData = `M ${fromCoords.x} ${fromCoords.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toCoords.x} ${toCoords.y}`;

          return (
            <path
              key={idx}
              d={pathData}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
            />
          );
        })}
        {tempConnection && (
          (() => {
            const fromNode = nodeMap[tempConnection.fromNode];
            if (!fromNode) return null;
            const fromCoords = getNodePortCoords(fromNode, tempConnection.fromPort);
            const toX = tempConnection.mouseX;
            const toY = tempConnection.mouseY;
            
            const cp1X = fromCoords.x + (tempConnection.fromPort === 'right' ? 80 : -80);
            const cp1Y = fromCoords.y;
            const cp2X = toX + (tempConnection.fromPort === 'right' ? -80 : 80);
            const cp2Y = toY;

            const pathData = `M ${fromCoords.x} ${fromCoords.y} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${toX} ${toY}`;

            return (
              <path
                d={pathData}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            );
          })()
        )}
      </svg>
    );
  });

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden font-sans flex text-white select-none">
      {/* --- Main Content Area --- */}
      <div className="relative flex-1 h-full overflow-hidden flex flex-col">
        {/* --- Top Header --- */}
        <header className="absolute top-0 left-0 right-0 h-14 z-[45] flex items-center justify-between px-6 pointer-events-none ui-overlay">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <div className="w-4 h-4 bg-white/20 rounded-full backdrop-blur-sm" />
            </div>
            <span className="text-sm font-medium text-white/90">Visual Strategy (0224)</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center bg-white/5 rounded-lg p-1 mr-2">
              <button 
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <RefreshCw size={14} className="-rotate-90" />
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <RefreshCw size={14} className="rotate-90" />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors">
              <Zap size={14} className="text-white/60" />
              <span className="text-xs font-bold text-white/80">1558</span>
            </button>
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </header>

        {/* --- Left Sidebar (Dock) --- */}
        <aside 
          className="absolute left-6 top-1/2 -translate-y-1/2 z-[45] ui-overlay"
          onMouseEnter={() => setIsAddMenuOpen(true)}
          onMouseLeave={() => setIsAddMenuOpen(false)}
        >
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-2 rounded-[32px] flex flex-col items-center gap-2 shadow-2xl relative">
            {/* Top Toggle Button (Plus/Close) */}
            <button className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
              isAddMenuOpen ? "bg-white/10 text-white/60" : "bg-white text-black hover:scale-110"
            )}>
              {isAddMenuOpen ? <X size={20} /> : <Plus size={20} strokeWidth={2.5} />}
            </button>
            
            <div className="flex flex-col gap-1">
              <SidebarButton icon={Shapes} label="Assets" />
              <SidebarButton icon={Layout} label="Layout" />
              <SidebarButton icon={MessageCircle} label="Chat" />
              <SidebarButton icon={History} label="History" />
              <SidebarButton icon={ImageIcon} label="Images" />
              <SidebarButton icon={HelpCircle} label="Shortcuts" onClick={() => setIsHelpOpen(true)} />
            </div>

            <div className="h-px w-6 bg-white/10 my-1" />

            {/* Bottom Count Button */}
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold hover:bg-white/10 transition-colors">
              3
            </button>

            {/* --- Secondary Add Menu --- */}
            <AnimatePresence>
              {isAddMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -12, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -12, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="absolute left-[64px] top-0 w-[280px] bg-[#161616]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-3 px-2">添加节点</h3>
                      <div className="space-y-1">
                        <AddMenuItem 
                          icon={Type} 
                          title="文本" 
                          description="脚本、广告词、品牌文案" 
                          active 
                          onClick={() => {
                            const newNode: Node = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: 'text',
                              x: (-position.x + windowSize.width / 2) / scale - 120,
                              y: (-position.y + windowSize.height / 2) / scale - 120,
                              title: 'Text',
                              content: ''
                            };
                            setNodes(prev => [...prev, newNode]);
                            setSelectedNodes([newNode.id]);
                            setIsAddMenuOpen(false);
                          }}
                        />
                        <AddMenuItem 
                          icon={ImageIcon} 
                          title="图片" 
                          onClick={() => {
                            const newNode: Node = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: 'image',
                              x: (-position.x + windowSize.width / 2) / scale - 160,
                              y: (-position.y + windowSize.height / 2) / scale - 100,
                              title: 'Image',
                              content: ''
                            };
                            setNodes(prev => [...prev, newNode]);
                            setSelectedNodes([newNode.id]);
                            setIsAddMenuOpen(false);
                          }}
                        />
                        <AddMenuItem 
                          icon={Video} 
                          title="视频" 
                          onClick={() => {
                            const newNode: Node = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: 'video',
                              x: (-position.x + windowSize.width / 2) / scale - 160,
                              y: (-position.y + windowSize.height / 2) / scale - 100,
                              title: 'Video',
                              content: ''
                            };
                            setNodes(prev => [...prev, newNode]);
                            setSelectedNodes([newNode.id]);
                            setIsAddMenuOpen(false);
                          }}
                        />
                        <AddMenuItem 
                          icon={Music} 
                          title="音频" 
                          onClick={() => {
                            const newNode: Node = {
                              id: Math.random().toString(36).substr(2, 9),
                              type: 'audio',
                              x: (-position.x + windowSize.width / 2) / scale - 160,
                              y: (-position.y + windowSize.height / 2) / scale - 80,
                              title: 'Audio',
                              content: ''
                            };
                            setNodes(prev => [...prev, newNode]);
                            setSelectedNodes([newNode.id]);
                            setIsAddMenuOpen(false);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-3 px-2">添加资源</h3>
                      <div className="space-y-1">
                        <AddMenuItem icon={Upload} title="上传" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* --- Help Panel --- */}
        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm ui-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-[600px] bg-[#161616] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">快捷键与帮助</h2>
                  <button 
                    onClick={() => setIsHelpOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-white/40 text-sm font-medium mb-4">视图操作</h3>
                      <div className="space-y-4">
                        <ShortcutRow label="平移画布" keys={['Space', 'Drag']} icon={<MousePointer2 size={12} />} />
                        <ShortcutRow label="缩放画布" keys={['Ctrl', 'Scroll']} />
                        <ShortcutRow label="重置视图" keys={['Shift', '1']} />
                        <ShortcutRow label="适应屏幕" keys={['Shift', '2']} />
                      </div>
                    </section>
                  </div>
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-white/40 text-sm font-medium mb-4">其他</h3>
                      <div className="space-y-4">
                        <ShortcutRow label="删除" keys={['Del']} />
                        <ShortcutRow label="撤销" keys={['Ctrl', 'Z']} />
                        <ShortcutRow label="重做" keys={['Shift', 'Ctrl', 'Z']} />
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Minimap Layer --- */}
        <AnimatePresence>
          {isMinimapOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-20 left-6 z-40 w-[240px] h-[180px] bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden group ui-overlay no-drag"
            >
              <Minimap 
                nodes={nodes} 
                canvasPosition={position} 
                canvasScale={scale} 
                windowSize={windowSize}
                isAgentOpen={isAgentOpen}
                onNavigate={(newPos: any) => setPosition(newPos)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Bottom Left Controls --- */}
        <div className="absolute bottom-6 left-6 z-[45] flex items-center gap-3 ui-overlay no-drag">
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl flex items-center gap-1 shadow-2xl">
            <button 
              onClick={() => setIsMinimapOpen(!isMinimapOpen)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl transition-all",
                isMinimapOpen ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <MapIcon size={16} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Grid size={16} /></button>
            <button 
              onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
              className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Maximize size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="flex items-center gap-3 px-3">
              <button 
                onClick={() => handleZoom('out')}
                className="text-white/20 hover:text-white transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-[10px] font-bold text-white/40 min-w-[32px] text-center tabular-nums">
                {Math.round(scale * 100)}%
              </span>
              <button 
                onClick={() => handleZoom('in')}
                className="text-white/20 hover:text-white transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl flex items-center gap-1 shadow-2xl">
            <button 
              className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="导出项目 (Ctrl+S)"
            >
              <Save size={16} />
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="导入项目 (Ctrl+O)"
            >
              <FolderOpen size={16} />
            </button>
          </div>
          
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="w-11 h-11 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all shadow-2xl"
          >
            <HelpCircle size={18} />
          </button>
        </div>

        {/* --- Zoom Toast --- */}
        <AnimatePresence>
          {showZoomToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl pointer-events-none ui-overlay"
            >
              <span className="text-2xl font-bold text-white/90 tabular-nums">
                {Math.round(scale * 100)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Floating Agent Button --- */}
        {!isAgentOpen && (
          <button 
            onClick={() => setIsAgentOpen(true)}
            className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all z-50 group ui-overlay no-drag"
          >
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}

        {/* Main Canvas Area */}
        <div 
          ref={containerRef}
          className={cn(
            "absolute inset-0 z-0",
            isSpacePressed ? "cursor-grab" : "cursor-default",
            isPanning ? "cursor-grabbing" : ""
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background Grid */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundPosition: `${position.x}px ${position.y}px`
            }}
          />

          <div 
            className="absolute origin-top-left"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            {/* Selection Box Layer */}
            <div 
              ref={selectionVisualRef}
              className="absolute border border-blue-500/50 bg-blue-500/10 pointer-events-none z-10 hidden"
            />

            {/* Connections Layer */}
            <ConnectionsLayer connections={connections} nodeMap={nodeMap} tempConnection={tempConnection} />

            {/* Nodes Layer */}
            {nodes.map(node => {
              const commonProps = {
                node,
                isSelected: selectedNodes.includes(node.id),
                isGenerating: !!generatingNodes[node.id],
                onPointerDown: handleNodePointerDown,
                onSettingsClick: handleSettingsClick,
                onPortPointerDown: handlePortPointerDown,
                onPortPointerUp: handlePortPointerUp
              };
              
              if (node.type === 'text') return <TextCanvasNode key={node.id} {...commonProps} />;
              if (node.type === 'image') return <ImageCanvasNode key={node.id} {...commonProps} />;
              if (node.type === 'video') return <VideoCanvasNode key={node.id} {...commonProps} />;
              if (node.type === 'audio') return <AudioCanvasNode key={node.id} {...commonProps} />;
              
              return <CanvasNode key={node.id} {...commonProps} />;
            })}
          </div>
        </div>

        {/* --- Right Sidebar (Agent Chat) --- */}
        <AnimatePresence>
          {isAgentOpen && (
            <motion.aside
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[400px] h-full bg-[#0a0a0a]/80 backdrop-blur-2xl border-l border-white/5 flex flex-col z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] ui-overlay no-drag"
            >
              <button 
                onClick={() => setIsAgentOpen(false)}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#0a0a0a] border-l border-y border-white/5 rounded-l-lg flex items-center justify-center text-white/40 hover:text-white transition-colors shadow-[-5px_0_10px_rgba(0,0,0,0.2)]"
              >
                <ChevronRight size={14} />
              </button>

              <div className="p-8 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-4xl font-bold tracking-tight text-white flex flex-col">
                    <span>Hi,</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Creator</span>
                  </h2>
                  <p className="text-white/60 text-lg font-medium mt-2">在寻找哪方面的灵感?</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <History size={20} />
                </button>
              </div>

              <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
                <div className="bg-[#161616] border border-white/5 rounded-3xl p-5 space-y-5 shadow-xl">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=400&h=225&fit=crop" 
                      alt="Tip" 
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                    拖拽图片/视频节点到对话框中，解锁根据节点内容 生成提示词 等进阶玩法，可为创作提供更多灵感~
                  </p>
                  <div className="flex justify-end">
                    <button className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-bold text-white/80 transition-colors">
                      知道了
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
                <div className="bg-[#161616] border border-white/10 rounded-[32px] p-2 shadow-2xl">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-4 pt-2">
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white/60 hover:bg-white/10 cursor-pointer transition-colors">
                        <MessageCircle size={12} />
                        <span>对话模式</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-colors">
                        <Sparkles size={12} />
                        <span>Gemini3 Flash</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 pb-1">
                      <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 transition-colors">
                        <Plus size={20} />
                      </button>
                      <input 
                        type="text" 
                        placeholder="开启你的灵感之旅..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 py-2"
                      />
                      <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-all shadow-lg">
                        <ChevronRight size={20} className="-rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-center text-white/20 font-medium">
                  AI 可能会产生错误，请核实重要信息
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* --- Node Floating Toolbar --- */}
        <AnimatePresence>
          {selectedNodes.length === 1 && !isPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 glass bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl flex items-center gap-1 z-[55] ui-overlay no-drag shadow-2xl"
            >
              <NodeAction icon={RefreshCw} label="Redraw" />
              <NodeAction icon={Eraser} label="Erase" />
              <NodeAction icon={Wand2} label="Enhance" />
              <div className="w-px h-4 bg-white/10 mx-1" />
              <NodeAction icon={MoreHorizontal} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
      </AnimatePresence>

      {selectedNode && (
        <NodeEditorPanel
          node={selectedNode}
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onGenerate={generateMockContent}
          isGenerating={generatingNodes[selectedNode.id] || false}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

interface SidebarButtonProps {
  icon: React.ElementType;
  label?: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarButton = ({ icon: Icon, label, active, onClick }: SidebarButtonProps) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative",
      active ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={18} strokeWidth={2} />
    {label && (
      <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-4px] group-hover:translate-x-0 uppercase tracking-widest whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    )}
  </button>
);

interface NodeActionProps {
  icon: React.ElementType;
  label?: string;
}

const NodeAction = ({ icon: Icon, label }: NodeActionProps) => (
  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
    <Icon size={14} />
    {label && <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>}
  </button>
);

interface AddMenuItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
}

const AddMenuItem = ({ icon: Icon, title, description, active, onClick }: AddMenuItemProps) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 p-2 rounded-2xl transition-all cursor-pointer group",
      active ? "bg-white/[0.08]" : "hover:bg-white/5"
    )}
  >
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
      active ? "bg-white/10 text-white" : "bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10"
    )}>
      <Icon size={18} />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-white/90 leading-tight">{title}</span>
      {description && <span className="text-[10px] text-white/30 mt-0.5">{description}</span>}
    </div>
  </div>
);

interface ShortcutRowProps {
  label: string;
  keys: string[];
  icon?: React.ReactNode;
}

const ShortcutRow = ({ label, keys, icon }: ShortcutRowProps) => (
  <div className="flex items-center justify-between">
    <span className="text-white/80 text-sm">{label}</span>
    <div className="flex items-center gap-1.5">
      {keys?.map((key: string) => (
        <span key={key} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-white/60 min-w-[24px] text-center">
          {key}
        </span>
      ))}
      {icon && <span className="text-lg grayscale opacity-60 flex items-center justify-center w-6">{icon}</span>}
    </div>
  </div>
);

interface MinimapProps {
  nodes: Node[];
  canvasPosition: { x: number; y: number };
  canvasScale: number;
  windowSize: { width: number; height: number };
  isAgentOpen: boolean;
  onNavigate: (pos: { x: number; y: number }) => void;
}

const Minimap = ({ nodes, canvasPosition, canvasScale, windowSize, isAgentOpen, onNavigate }: MinimapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const MW = 240;
  const MH = 180;
  
  const toMapX = (x: number) => ((x + WORLD_OFFSET) / WORLD_SIZE) * MW;
  const toMapY = (y: number) => ((y + WORLD_OFFSET) / WORLD_SIZE) * MH;
  const fromMapX = (mx: number) => (mx / MW) * WORLD_SIZE - WORLD_OFFSET;
  const fromMapY = (my: number) => (my / MH) * WORLD_SIZE - WORLD_OFFSET;

  const viewportWidth = (windowSize.width - (isAgentOpen ? 400 : 0)) / canvasScale;
  const viewportHeight = windowSize.height / canvasScale;
  
  const viewportX = -canvasPosition.x / canvasScale;
  const viewportY = -canvasPosition.y / canvasScale;

  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    
    const worldX = fromMapX(mx);
    const worldY = fromMapY(my);
    
    onNavigate({
      x: -(worldX - viewportWidth / 2) * canvasScale,
      y: -(worldY - viewportHeight / 2) * canvasScale
    });
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      ref={mapRef}
      className="relative w-full h-full cursor-crosshair bg-black/40"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleInteract(e);
      }}
      onMouseMove={(e) => {
        if (isDragging) handleInteract(e);
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {nodes.map((node: any) => (
        <div 
          key={node.id}
          className="absolute bg-white/20 rounded-[1px]"
          style={{
            left: toMapX(node.x),
            top: toMapY(node.y),
            width: (220 / WORLD_SIZE) * MW,
            height: ((node.type === 'text' ? 120 : 180) / WORLD_SIZE) * MH,
          }}
        />
      ))}

      <div 
        className="absolute border border-blue-500/50 bg-blue-500/10 cursor-grab active:cursor-grabbing transition-shadow group"
        style={{
          left: toMapX(viewportX),
          top: toMapY(viewportY),
          width: (viewportWidth / WORLD_SIZE) * MW,
          height: (viewportHeight / WORLD_SIZE) * MH,
          boxShadow: '0 0 0 1000px rgba(0,0,0,0.2)'
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <MousePointer2 size={12} className="text-blue-400 rotate-45" />
        </div>
      </div>
    </div>
  );
};

export default InfiniteCanvas;