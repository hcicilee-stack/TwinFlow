import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Volume2, Settings } from 'lucide-react';

interface NexusProps {
  volume: number;
  onVolumeChange: (v: number) => void;
  onUploadClick: () => void;
}

export const Nexus: React.FC<NexusProps> = ({ 
  volume, 
  onVolumeChange, 
  onUploadClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed top-8 right-8 z-50 flex flex-col items-end gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger Icon */}
      <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/40 hover:text-white transition-all duration-500 cursor-pointer shadow-lg">
        <Settings size={18} />
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-5 p-5 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl min-w-[180px] origin-top-right"
          >
            {/* Background Section */}
            <div className="flex flex-col gap-2">
              <div className="px-1 text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans font-medium">背景</div>
              <button
                onClick={onUploadClick}
                className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all duration-300 shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.05)] group"
              >
                <ImageIcon size={16} className="text-white/40 group-hover:text-white transition-colors" />
                <span className="text-xs font-medium">更换背景图</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mx-1" />

            {/* Volume Section */}
            <div className="flex flex-col gap-3">
              <div className="px-1 text-[10px] uppercase tracking-[0.2em] text-white/20 font-sans font-medium">音量</div>
              <div className="flex items-center gap-3 px-2">
                <Volume2 size={14} className="text-white/20" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-white/80 transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
