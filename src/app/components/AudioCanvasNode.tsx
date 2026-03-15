import React, { useState, memo } from 'react';
import { 
  Plus, Music, Upload, ChevronUp, Mic, SlidersHorizontal, Zap, Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Node } from '../store/canvasStore';
import { motion, AnimatePresence } from 'motion/react';

interface AudioCanvasNodeProps {
  node: Node;
  isSelected: boolean;
  isGenerating: boolean;
  onPointerDown: (e: React.PointerEvent, node: Node) => void;
  onSettingsClick: (e: React.MouseEvent, id: string) => void;
  onPortPointerDown?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
  onPortPointerUp?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
}

export const AudioCanvasNode = memo(({ 
  node, 
  isSelected, 
  isGenerating,
  onPointerDown, 
  onSettingsClick,
  onPortPointerDown,
  onPortPointerUp
}: AudioCanvasNodeProps) => {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setPreview(true);
      setGenerating(false);
    }, 1500);
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
          <Music size={14} />
          <span className="text-xs font-medium">Audio</span>
        </div>
        
        <div className={cn(
          "w-[320px] h-[160px] rounded-xl border bg-[#1a1a1a] transition-all p-1 relative overflow-hidden",
          isSelected ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "border-white/10 hover:border-white/20 shadow-2xl"
        )}>
          {preview ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-4">
              <div className="flex items-center justify-center gap-1 h-8">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [8, h * 6, 8] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className="w-1 bg-white/40 rounded-full"
                  />
                ))}
              </div>
              <div className="text-xs">00:00 / 00:15</div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <div className="flex items-center justify-center gap-1">
                {[2, 4, 6, 4, 2].map((h, i) => (
                  <div key={i} className="w-1.5 bg-white/20 rounded-full" style={{ height: h * 4 }} />
                ))}
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
            className="absolute top-full mt-4 w-[480px] bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={3000}
                className="w-full h-16 bg-transparent text-sm text-white/90 resize-none outline-none placeholder:text-white/30 pr-8"
                placeholder="描述你想要生成的任何内容。可用方括号描述情感，如 [咯咯笑]"
              />
              <button className="absolute top-0 right-0 text-white/40 hover:text-white">
                <Maximize2 size={14} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/90 font-medium text-xs">
                  <Mic size={14} />
                  文字转语音
                </button>
                <div className="w-px h-3 bg-white/10" />
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/90 font-medium text-xs">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-white/60" />
                    <div className="w-1 h-3 bg-white/60" />
                  </div>
                  ElevenLabs V3
                </button>
                <div className="w-px h-3 bg-white/10" />
                <button className="w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded-lg text-white/60">
                  <SlidersHorizontal size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white/30 text-xs">{prompt.length}/3000</span>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                  <div className="flex items-center gap-1 opacity-70">
                    <Zap size={12} className="text-white" />
                    <span className="text-white/80 text-xs font-medium">5/百字符</span>
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

AudioCanvasNode.displayName = 'AudioCanvasNode';