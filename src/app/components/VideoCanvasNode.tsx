import React, { useState, memo } from 'react';
import { 
  Plus, Video, Upload, Sparkles, ChevronUp, RefreshCw, Volume2, Play, Monitor, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Node } from './InfiniteCanvas';
import { motion, AnimatePresence } from 'motion/react';

interface VideoCanvasNodeProps {
  node: Node;
  isSelected: boolean;
  isGenerating: boolean;
  onPointerDown: (e: React.PointerEvent, node: Node) => void;
  onSettingsClick: (e: React.MouseEvent, id: string) => void;
  onPortPointerDown?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
  onPortPointerUp?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
}

export const VideoCanvasNode = memo(({ 
  node, 
  isSelected, 
  isGenerating,
  onPointerDown, 
  onSettingsClick,
  onPortPointerDown,
  onPortPointerUp
}: VideoCanvasNodeProps) => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(node.previewUrl || "");

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setPreview("https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=400&h=300&fit=crop");
      setGenerating(false);
    }, 3000);
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
            className="absolute -top-12 flex items-center p-1.5 rounded-full bg-[#1e1e1e]/80 backdrop-blur-xl border border-white/10 shadow-xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button className="flex items-center gap-2 px-3 py-1 hover:bg-white/10 rounded-full text-white/80 text-xs font-medium transition-colors">
              <Upload size={14} />
              上传
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Content Editor */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 mb-2 px-1 text-white/60">
          <Video size={14} />
          <span className="text-xs font-medium">Video</span>
        </div>
        
        <div className={cn(
          "w-[320px] h-[200px] rounded-xl border bg-[#1a1a1a] transition-all p-1 relative overflow-hidden",
          isSelected ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "border-white/10 hover:border-white/20 shadow-2xl"
        )}>
          {preview ? (
            <div className="relative w-full h-full">
              <img src={preview} alt="Generated" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <button className="w-12 h-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm hover:scale-105 transition-transform">
                  <Play size={20} className="ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <div className="w-12 h-12 rounded-2xl border-2 border-white/10 flex items-center justify-center">
                <Play size={24} className="ml-1" />
              </div>
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
            className="absolute top-full mt-4 w-[480px] bg-[#1e1e1e] border border-white/10 rounded-2xl p-3 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-col items-start gap-2">
               <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/80 font-medium">
                 文生视频
               </div>
               <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                 <RefreshCw size={14} />
               </button>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-12 bg-transparent text-sm text-white/90 resize-none outline-none placeholder:text-white/30"
              placeholder="描述任何你想要生成的内容"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/90 font-medium text-xs">
                  <Sparkles size={14} className="text-white/60" />
                  Kling 3.0 Omni
                </button>
                <div className="w-px h-3 bg-white/10 mx-1" />
                <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                  标准 · 
                  <span className="flex items-center gap-1"><Monitor size={12} /> 16:9</span> · 
                  自适应 · 
                  8s · 
                  <Volume2 size={12} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white/50 text-xs font-medium">1x</span>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                  <div className="flex items-center gap-1 opacity-70">
                    <Zap size={12} className="text-white" />
                    <span className="text-white/80 text-xs font-medium">15/秒</span>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ChevronUp size={14} className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

VideoCanvasNode.displayName = 'VideoCanvasNode';