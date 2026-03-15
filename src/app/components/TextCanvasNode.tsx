import React, { useState, memo, useRef } from 'react';
import { 
  Type, Plus, Maximize, Copy, Bold, Italic, 
  List, ListOrdered, Minus, Pilcrow, Heading1, 
  Heading2, Heading3, Sparkles, ChevronUp, ChevronDown, Zap 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Node } from '../store/canvasStore';
import { motion, AnimatePresence } from 'motion/react';

interface TextCanvasNodeProps {
  node: Node;
  isSelected: boolean;
  isGenerating: boolean;
  onPointerDown: (e: React.PointerEvent, node: Node) => void;
  onSettingsClick: (e: React.MouseEvent, id: string) => void;
  onPortPointerDown?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
  onPortPointerUp?: (e: React.PointerEvent, nodeId: string, port: 'left' | 'right') => void;
}

export const TextCanvasNode = memo(({ 
  node, 
  isSelected, 
  isGenerating,
  onPointerDown, 
  onSettingsClick,
  onPortPointerDown,
  onPortPointerUp
}: TextCanvasNodeProps) => {
  const [content, setContent] = useState(node.content || "1. 开启你的创作...");
  const [prompt, setPrompt] = useState("");
  const [showModels, setShowModels] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [bgColor, setBgColor] = useState("bg-[#1a1a1a]"); // Default color
  const [selectedModel, setSelectedModel] = useState("Gemini 3.1 Flash Lite");
  const [generating, setGenerating] = useState(false);

  const models = [
    { name: "Gemini 3.1 Pro", time: "10 ~ 20s" },
    { name: "Gemini 3.1 Flash Lite", desc: "Gemini 3.1 系列轻量快速 AI 模型", time: "5 ~ 10s" },
    { name: "Gemini 3 Flash", time: "10 ~ 20s" },
    { name: "Gemini 2.5 Flash", time: "5 ~ 10s" },
    { name: "Gemini 2.5 Pro", time: "20 s" },
  ];

  const colors = [
    "bg-[#1a1a1a]", // Default dark
    "bg-[#4a2e2e]", // Red
    "bg-[#4a3620]", // Orange
    "bg-[#454020]", // Yellow
    "bg-[#2d402b]", // Green
    "bg-[#244042]", // Cyan
    "bg-[#243545]", // Blue
    "bg-[#3d2a45]"  // Purple
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setContent(`### ${prompt}\n\n1. [场景一] 画面展现...\n2. [场景二] 旁白接入...\n3. [场景三] 产品特写...`);
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
      {/* 1. Top Toolbar (Floating) */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-16 flex items-center gap-1 p-1.5 rounded-full bg-[#1e1e1e] border border-white/10 shadow-xl"
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging node when clicking toolbar
          >
            {/* Color Picker */}
            <div className="relative group/btn">
              <button 
                onClick={() => setShowColors(!showColors)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
                背景颜色
              </div>
              <AnimatePresence>
                {showColors && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-10 left-0 bg-[#1e1e1e] border border-white/10 p-2 rounded-2xl flex flex-col gap-2 shadow-2xl z-50"
                  >
                    {colors.map((c, i) => (
                      <button 
                        key={i}
                        onClick={() => { setBgColor(c); setShowColors(false); }}
                        className={cn("w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110", c)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Heading1 size={14} /></button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">标题 1</div>
            </div>
            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Heading2 size={14} /></button>
            </div>
            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Heading3 size={14} /></button>
            </div>
            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-full"><Pilcrow size={14} /></button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">正文</div>
            </div>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Bold size={14} /></button>
            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Italic size={14} /></button>
            
            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><List size={14} /></button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">无序列表</div>
            </div>
            
            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><ListOrdered size={14} /></button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">有序列表</div>
            </div>

            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"><Minus size={14} /></button>

            <div className="w-px h-5 bg-white/10 mx-1" />

            <div className="relative group/btn">
              <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full"
              >
                <Copy size={14} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
                复制全部
              </div>
            </div>

            <div className="relative group/btn">
              <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-full">
                <Maximize size={14} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-[10px] rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity">
                全屏
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Content Editor */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 mb-2 px-1 text-white/60">
          <Pilcrow size={14} />
          <span className="text-xs font-medium">Text</span>
        </div>
        
        <div className={cn(
          "w-[240px] h-[240px] rounded-2xl border transition-all p-4",
          bgColor,
          isSelected ? "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "border-white/10 hover:border-white/20 shadow-2xl"
        )}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()} // Stop drag when focusing text
            className="w-full h-full bg-transparent text-sm text-white/80 resize-none outline-none placeholder:text-white/20"
            placeholder="在此输入内容..."
          />
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
            className="absolute top-full mt-4 w-[420px] bg-[#1e1e1e] border border-white/10 rounded-2xl p-4 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()} // Prevent dragging
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-16 bg-transparent text-sm text-white/90 resize-none outline-none placeholder:text-white/30"
              placeholder="描述任何你想要生成的内容"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="relative">
                <button 
                  onClick={() => setShowModels(!showModels)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/90 font-medium text-sm"
                >
                  <Sparkles size={14} className="text-white/60" />
                  {selectedModel}
                </button>
                
                <AnimatePresence>
                  {showModels && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full mb-2 left-0 w-[300px] bg-[#2a2a2a] border border-white/10 rounded-xl py-2 shadow-2xl z-50 overflow-hidden"
                    >
                      {models.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setSelectedModel(m.name); setShowModels(false); }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left",
                            selectedModel === m.name ? "bg-white/5" : ""
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Sparkles size={14} className={selectedModel === m.name ? "text-blue-400" : "text-white/40"} />
                              <span className="text-sm font-medium text-white/90">{m.name}</span>
                            </div>
                            {m.desc && <div className="text-[11px] text-white/40 mt-1 ml-6">{m.desc}</div>}
                          </div>
                          <span className="text-[11px] text-white/30">{m.time}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-white/50 text-sm font-medium">1x</span>
                <div className="flex items-center gap-2 bg-white/10 border border-white/5 rounded-full pl-3 pr-1 py-1">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="15" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="15" r="6" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-white/80 text-sm font-medium mr-1">1</span>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ChevronUp size={16} className="text-white" />
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

TextCanvasNode.displayName = 'TextCanvasNode';