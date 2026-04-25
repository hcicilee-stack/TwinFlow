import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Image as ImageIcon } from 'lucide-react';

type FontFamily = 'serif' | 'sans' | 'mono' | 'handwriting';
type FontSize = 'small' | 'medium' | 'large';

interface ScenePanelProps {
  currentFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  currentSize: FontSize;
  onSizeChange: (size: FontSize) => void;
  onUploadClick: () => void;
}

export const ScenePanel: React.FC<ScenePanelProps> = ({ 
  currentFont, 
  onFontChange,
  currentSize,
  onSizeChange,
  onUploadClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const fonts: { id: FontFamily; label: string }[] = [
    { id: 'serif', label: 'Serif' },
    { id: 'sans', label: 'Sans' },
    { id: 'mono', label: 'Mono' },
    { id: 'handwriting', label: 'Klee' },
  ];

  const sizes: { id: FontSize; label: string }[] = [
    { id: 'small', label: '小' },
    { id: 'medium', label: '中' },
    { id: 'large', label: '大' },
  ];

  return (
    <div 
      className="fixed top-8 left-8 z-50 flex flex-col items-start gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger Icon */}
      <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/40 hover:text-white transition-all duration-500 cursor-pointer shadow-lg">
        <Sliders size={18} />
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-5 p-5 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl min-w-[200px] origin-top-left"
          >
            {/* Font Family Section */}
            <div className="flex flex-col gap-1">
              <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans font-medium">字体</div>
              <div className="grid grid-cols-2 gap-1">
                {fonts.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => onFontChange(font.id)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 text-center ${
                      currentFont === font.id 
                        ? 'bg-white/10 text-white shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.1)]' 
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Section */}
            <div className="flex flex-col gap-1">
              <div className="px-2 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans font-medium">字号</div>
              <div className="flex gap-1 p-1 bg-black/20 rounded-2xl">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => onSizeChange(size.id)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-xl transition-all duration-300 ${
                      currentSize === size.id 
                        ? 'bg-white/10 text-white shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.1)]' 
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mx-2" />

            {/* Background Section */}
            <div className="flex flex-col gap-2">
              <div className="px-2 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans font-medium">场景</div>
              <button
                onClick={onUploadClick}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all duration-300 shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.05)] group"
              >
                <ImageIcon size={16} className="text-white/40 group-hover:text-white transition-colors" />
                <span className="text-xs font-medium">更换背景底图</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
