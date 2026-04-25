import React, { useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExternalLink } from 'lucide-react';

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

  // Helper to send message to Realm
  const sendToRealm = (data: number) => {
    const payload = { type: 'VIBE_UPDATE', val: data };
    console.log('Broadcast Sending vibe:', data);
    vibeChannel.postMessage(payload);
  };

  // Send message on content change
  useEffect(() => {
    sendToRealm(content.length);
  }, [content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

  const handleKeyDown = () => {
    sendToRealm(content.length);
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-8 md:p-16 z-10">
      <div 
        className={cn(
          "relative w-full max-w-3xl aspect-[4/3]",
          "bg-white/[0.03] backdrop-blur-[24px] border border-white/10 rounded-2xl shadow-2xl",
          "flex flex-col overflow-hidden transition-all duration-700"
        )}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="开始你的心流写作..."
          className={cn(
            "w-full h-full p-12 md:p-20 bg-transparent outline-none resize-none",
            "text-white/80 leading-relaxed",
            fontClasses[fontFamily],
            sizeClasses[fontSize],
            "placeholder:text-white/20 selection:bg-white/20",
            "scrollbar-hide"
          )}
          spellCheck={false}
        />
        
        {/* Subtle inner shadow for depth - keeping it lightweight */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] rounded-2xl" />
      </div>
    </div>
  );
};

export default Editor;
