import React, { useState, memo, useEffect } from 'react';
import { 
  Plus, ImageIcon, Upload, Sparkles, ChevronUp, RefreshCw, SlidersHorizontal, Camera, Monitor, Zap,
  Eraser, Wand2, Maximize, Scissors, Sun, Pen, Crop, Download, Fullscreen, X, Send,
  ChevronDown, Settings2, Pencil, ImagePlus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Node } from '../store/canvasStore';
import { motion, AnimatePresence } from 'motion/react';

interface ImageCanvasNodeProps {
  node: Node;
  isSelected: boolean;
  isGenerating: boolean;
  onPointerDown: (e: React.PointerEvent, node: Node) => void;
  onSettingsClick: (e: React.MouseEvent, id: string) => void;
  onPortPointerDown?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
  onPortPointerUp?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
}

const TOOLS = [
  { id: 'redraw', icon: Wand2, label: '重绘' },
  { id: 'erase', icon: Eraser, label: '擦除' },
  { id: 'enhance', icon: ImagePlus, label: '增强' },
  { id: 'expand', icon: Maximize, label: '扩图' },
  { id: 'cutout', icon: Scissors, label: '抠图' },
  { id: 'multi', icon: RefreshCw, label: '多角度' },
  { id: 'light', icon: Sun, label: '打光' },
  { id: 'paint', icon: Pencil, label: '画笔' },
  { id: 'crop', icon: Crop, label: '裁剪' },
  { id: 'download', icon: Download, label: '下载' },
  { id: 'fullscreen', icon: Fullscreen, label: '放大' },
];

const MODELS = [
  { id: 'banana-pro', name: 'Banana Pro', icon: '🍌' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
  { id: 'dalle3', name: 'DALL-E 3', icon: '🖼️' },
  { id: 'sdxl', name: 'Stable Diffusion XL', icon: '🤖' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1' },
  { id: '4:3', label: '4:3' },
  { id: '3:4', label: '3:4' },
  { id: '16:9', label: '16:9' },
  { id: '9:16', label: '9:16' },
  { id: '4:5', label: '4:5 · 4K' },
];

const STYLES = [
  { id: 'realistic', name: '写实', color: '#4A90E2' },
  { id: 'anime', name: '动漫', color: '#E24A90' },
  { id: 'artistic', name: '艺术', color: '#E2A44A' },
  { id: 'cinematic', name: '电影', color: '#4AE2A4' },
];

const CAMERAS = [
  { id: 'sony', name: 'Sony Venice', icon: '📷' },
  { id: 'fuji', name: 'Fujifilm', icon: '📸' },
  { id: 'canon', name: 'Canon EOS', icon: '🎥' },
  { id: 'nikon', name: 'Nikon', icon: '📹' },
];

export const ImageCanvasNode = memo(({ 
  node, 
  isSelected, 
  isGenerating,
  onPointerDown, 
  onSettingsClick,
  onPortPointerDown,
  onPortPointerUp
}: ImageCanvasNodeProps) => {
  const [prompt, setPrompt] = useState(node.content || "");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(node.previewUrl || "");
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const [params, setParams] = useState({
    model: 'banana-pro',
    aspectRatio: '4:5',
    style: 'realistic',
    camera: 'sony',
    count: 1,
  });
  
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [showStyleSelect, setShowStyleSelect] = useState(false);
  const [showAspectSelect, setShowAspectSelect] = useState(false);
  const [showCameraSelect, setShowCameraSelect] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowModelSelect(false);
      setShowStyleSelect(false);
      setShowAspectSelect(false);
      setShowCameraSelect(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setPreview("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&h=300&fit=crop");
      setGenerating(false);
    }, 2000);
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === 'download') {
      if (preview) {
        const link = document.createElement('a');
        link.href = preview;
        link.download = `${node.title || 'image'}-${node.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  return (
    <div
      className={cn(
        "absolute cursor-default flex flex-col items-center",
        isSelected ? "z-20" : "z-10"
      )}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        willChange: 'transform',
      }}
      onPointerDown={(e) => onPointerDown(e, node)}
    >
      {/* 1. Top Toolbar */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 flex items-center gap-0.5 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 px-2 py-1.5 rounded-xl shadow-2xl whitespace-nowrap"
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToolClick(tool.id);
                }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all text-[11px] font-medium",
                  activeTool === tool.id
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                title={tool.label}
              >
                <tool.icon size={13} />
                <span>{tool.label}</span>
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                // We don't really have a close action for the node itself other than deselecting, which is handled by clicking outside.
                // We'll just leave it for visual parity or trigger deselect if we had a prop.
              }}
              className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="关闭"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Content Editor */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 mb-2 px-1 text-white/60">
          <ImageIcon size={14} />
          <span className="text-xs font-medium">Image</span>
        </div>
        
        <div className={cn(
          "w-[320px] h-[200px] rounded-xl border bg-[#1a1a1a] transition-all p-1 relative overflow-hidden",
          isSelected ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "border-white/10 hover:border-white/20 shadow-2xl"
        )}>
          {preview ? (
            <img src={preview} alt="Generated" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <ImageIcon size={32} />
            </div>
          )}
          {generating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Connection Ports */}
        <div 
          onPointerDown={(e) => { 
            e.stopPropagation(); 
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
            onPortPointerDown?.(e, node.id, 'left'); 
          }}
          onPointerUp={(e) => { e.stopPropagation(); onPortPointerUp?.(e, node.id, 'left'); }}
          className="absolute top-[50%] -left-8 w-6 h-6 -mt-3 rounded-full border border-white/20 bg-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-white/10 hover:border-white/40"
        >
          <Plus size={12} className="text-white/60" />
        </div>
        <div 
          onPointerDown={(e) => { 
            e.stopPropagation(); 
            try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err) {}
            onPortPointerDown?.(e, node.id, 'right'); 
          }}
          onPointerUp={(e) => { e.stopPropagation(); onPortPointerUp?.(e, node.id, 'right'); }}
          className="absolute top-[50%] -right-8 w-6 h-6 -mt-3 rounded-full border border-white/20 bg-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair hover:bg-white/10 hover:border-white/40"
        >
          <Plus size={12} className="text-white/60" />
        </div>
      </div>

      {/* 3. Bottom Control Bar */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-4 w-[420px] bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-visible origin-top"
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Prompt Input */}
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要的图片..."
                  className="w-full h-16 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-white/90 text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-white/20"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerate();
                  }}
                  disabled={generating || !prompt.trim()}
                  className={cn(
                    "absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    generating || !prompt.trim()
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90"
                  )}
                >
                  {generating ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Parameters Bar */}
            <div className="flex items-center gap-1 px-2 py-2 overflow-visible relative">
              {/* Model */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModelSelect(!showModelSelect);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0d0d0d] border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 transition-all text-xs"
                >
                  <span>{MODELS.find(m => m.id === params.model)?.icon}</span>
                  <span className="max-w-[60px] truncate">
                    {MODELS.find(m => m.id === params.model)?.name}
                  </span>
                  <ChevronDown size={12} className="text-white/40" />
                </button>
                
                {showModelSelect && (
                  <div 
                    className="absolute bottom-[calc(100%+8px)] left-0 w-40 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setParams({ ...params, model: model.id });
                          setShowModelSelect(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors text-xs",
                          params.model === model.id ? "bg-white/10 text-white" : "text-white/70"
                        )}
                      >
                        <span>{model.icon}</span>
                        <span>{model.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Aspect Ratio */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAspectSelect(!showAspectSelect);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 bg-[#0d0d0d] border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 transition-all text-xs"
                >
                  <span>{ASPECT_RATIOS.find(r => r.id === params.aspectRatio)?.label}</span>
                  <ChevronDown size={12} className="text-white/40" />
                </button>
                
                {showAspectSelect && (
                  <div 
                    className="absolute bottom-[calc(100%+8px)] left-0 flex gap-1 p-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => {
                          setParams({ ...params, aspectRatio: ratio.id });
                          setShowAspectSelect(false);
                        }}
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap",
                          params.aspectRatio === ratio.id
                            ? "bg-white/20 text-white"
                            : "text-white/40 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Style */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStyleSelect(!showStyleSelect);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-[#0d0d0d] border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 transition-all text-xs"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STYLES.find(s => s.id === params.style)?.color }}
                  />
                  <span>风格</span>
                  <ChevronDown size={12} className="text-white/40" />
                </button>
                
                {showStyleSelect && (
                  <div 
                    className="absolute bottom-[calc(100%+8px)] left-0 w-28 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setParams({ ...params, style: style.id });
                          setShowStyleSelect(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors text-xs",
                          params.style === style.id ? "bg-white/10 text-white" : "text-white/70"
                        )}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: style.color }}
                        />
                        <span>{style.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Camera */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCameraSelect(!showCameraSelect);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 bg-[#0d0d0d] border border-white/10 rounded-lg text-white/70 hover:text-white hover:border-white/20 transition-all text-xs"
                >
                  <span>{CAMERAS.find(c => c.id === params.camera)?.icon}</span>
                  <span className="max-w-[50px] truncate">
                    {CAMERAS.find(c => c.id === params.camera)?.name}
                  </span>
                  <ChevronDown size={12} className="text-white/40" />
                </button>
                
                {showCameraSelect && (
                  <div 
                    className="absolute bottom-[calc(100%+8px)] left-0 w-36 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {CAMERAS.map((camera) => (
                      <button
                        key={camera.id}
                        onClick={() => {
                          setParams({ ...params, camera: camera.id });
                          setShowCameraSelect(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors text-xs",
                          params.camera === camera.id ? "bg-white/10 text-white" : "text-white/70"
                        )}
                      >
                        <span>{camera.icon}</span>
                        <span>{camera.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Count */}
              <div className="flex items-center gap-1 px-2 py-1.5 bg-[#0d0d0d] border border-white/10 rounded-lg text-xs">
                <Settings2 size={12} className="text-white/40" />
                <span className="text-white/70">{params.count}x</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ImageCanvasNode.displayName = 'ImageCanvasNode';
