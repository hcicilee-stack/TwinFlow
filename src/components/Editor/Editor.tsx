import React, { useEffect, useRef, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Download, ExternalLink, Wind } from 'lucide-react';
import AquariumOverlay from './AquariumOverlay';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  fontFamily?: 'serif' | 'sans' | 'mono' | 'handwriting';
  fontSize?: 'small' | 'medium' | 'large';
}

const vibeChannel = new BroadcastChannel('twinflow_vibe');

const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  fontFamily = 'handwriting', 
  fontSize = 'small' 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isBreathActive, setIsBreathActive] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  const [undoBuffer, setUndoBuffer] = useState('');

  // Helper to send message to Realm
  const sendToRealm = (data: number) => {
    const payload = { type: 'VIBE_UPDATE', val: data };
    console.log('Broadcast Sending vibe:', data);
    vibeChannel.postMessage(payload);
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Snapshot if deleting or clearing - "单步快照"
    if (newValue.length < content.length || newValue === '') {
      setUndoBuffer(content);
    }
    
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Listen for Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (undoBuffer) {
        e.preventDefault();
        // Restore from snapshot
        onChange(undoBuffer);
        // Clear buffer or swap? Let's just restore per request.
        setUndoBuffer(''); 
      }
    }
    
    sendToRealm(content.length);
  };

  // Restored: focus logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Restored: scroll sync
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Restored: font and size maps
  const fontClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
    handwriting: 'font-handwriting',
  };

  const sizeClasses = {
    small: 'text-lg md:text-xl',
    medium: 'text-xl md:text-2xl',
    large: 'text-2xl md:text-4xl',
  };

  // Restored: typography engine
  const getTypographyConfig = () => {
    const isMobile = window.innerWidth < 768;
    
    const families = {
      serif: 'Georgia, "Times New Roman", serif',
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      handwriting: '"LXGW WenKai Lite", serif',
    };

    const sizes = {
      small: isMobile ? '18px' : '20px',
      medium: isMobile ? '20px' : '24px',
      large: isMobile ? '24px' : '36px',
    };

    const lineHeights = {
      small: isMobile ? 28 : 32,
      medium: isMobile ? 32 : 36,
      large: isMobile ? 36 : 48,
    };

    return {
      family: families[fontFamily],
      size: sizes[fontSize],
      lineHeight: lineHeights[fontSize]
    };
  };

  const handleExport = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinflow-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const config = getTypographyConfig();

  return (
    <div className="flex items-center justify-center w-full h-full p-8 md:p-16 z-10">
      <div 
        className={cn(
          "group relative w-full max-w-3xl aspect-[4/3]",
          "bg-white/[0.03] backdrop-blur-[24px] border border-white/10 rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden transition-all duration-700"
        )}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleEditorChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          placeholder="开始你的心流写作..."
          className={cn(
            "w-full h-full p-12 md:p-20 bg-transparent outline-none resize-none",
            "text-white/80",
            fontClasses[fontFamily],
            sizeClasses[fontSize],
            "placeholder:text-white/20 selection:bg-white/20",
            "scrollbar-hide",
            "transition-opacity duration-500",
            isBreathActive ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          style={{ lineHeight: `${config.lineHeight}px` }}
          spellCheck={false}
        />

        {/* Aquarium Overlay */}
        <AquariumOverlay 
          isActive={isBreathActive}
          text={content}
          fontFamily={config.family}
          fontSize={config.size}
          lineHeight={config.lineHeight}
          padding={{ 
            top: window.innerWidth < 768 ? 48 : 80, 
            right: window.innerWidth < 768 ? 48 : 80, 
            bottom: window.innerWidth < 768 ? 48 : 80, 
            left: window.innerWidth < 768 ? 48 : 80 
          }}
          scrollTop={scrollTop}
        />

        {/* Export Button - Left corner */}
        <div className={cn(
          "absolute bottom-6 left-8 flex items-center gap-4 transition-all duration-500 z-50",
          "opacity-0 translate-y-2 group-hover:opacity-40 hover:!opacity-100 group-hover:translate-y-0",
          isBreathActive && "opacity-0 pointer-events-none"
        )}>
          <button
            onClick={handleExport}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500",
              "text-[10px] uppercase tracking-[2px] font-medium backdrop-blur-md",
              "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            )}
          >
            <Download size={12} />
            Export
          </button>
        </div>
        
        {/* Breath Button - Visible on hover or when active */}
        <div className={cn(
          "absolute bottom-6 right-8 flex items-center gap-4 transition-all duration-500 z-50",
          isBreathActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-40 hover:!opacity-100 group-hover:translate-y-0"
        )}>
          <button
            onClick={() => setIsBreathActive(!isBreathActive)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500",
              "text-[10px] uppercase tracking-[2px] font-medium backdrop-blur-md",
              isBreathActive 
                ? "bg-white/20 border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
            )}
          >
            <Wind size={12} className={cn("transition-transform duration-700", isBreathActive && "rotate-180")} />
            {isBreathActive ? "Release" : "Breath"}
          </button>
        </div>

        {/* Subtle inner shadow for depth */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] rounded-2xl" />
      </div>
    </div>
  );
};

export default Editor;
