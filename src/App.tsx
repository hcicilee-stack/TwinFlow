import React, { useState, useRef, useEffect } from 'react';
import Editor from './components/Editor/Editor';
import { FontSwitcher } from './components/UI/FontSwitcher';
import { Nexus } from './components/UI/Nexus';

type Mode = 'rainy' | 'snowy';

export default function App() {
  const [currentMode, setCurrentMode] = useState<Mode>('rainy');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono' | 'handwriting'>('handwriting');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('small');
  const [content, setContent] = useState('');
  const [rainVolume, setRainVolume] = useState(0.4);
  const [snowVolume, setSnowVolume] = useState(0.7);
  const [bgImage, setBgImage] = useState('https://raw.githubusercontent.com/hcicilee-stack/FlowSpace/main/222.jpg');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const RAIN_AUDIO = 'https://raw.githubusercontent.com/hcicilee-stack/FlowSpace/main/rain.MP3';
  const SNOW_AUDIO = 'https://raw.githubusercontent.com/hcicilee-stack/FlowSpace/main/snow.MP3';

  const currentVolume = currentMode === 'rainy' ? rainVolume : snowVolume;
  const [isAudioActivated, setIsAudioActivated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio System Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentMode === 'rainy' ? RAIN_AUDIO : SNOW_AUDIO);
      audioRef.current.loop = true;
      audioRef.current.volume = currentVolume;
    }
  }, []);

  // Handle Mode Change for Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentMode === 'rainy' ? RAIN_AUDIO : SNOW_AUDIO;
      if (isAudioActivated && isPlaying) {
        audioRef.current.play().catch(() => {
          console.log("Autoplay prevented or failed");
          setIsPlaying(false);
        });
      }
    }
  }, [currentMode, isAudioActivated]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, [currentVolume]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBgImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVolumeChange = (v: number) => {
    if (currentMode === 'rainy') setRainVolume(v);
    else setSnowVolume(v);
    
    // Auto-activate audio on first volume change if not already
    if (!isAudioActivated && v > 0) {
      setIsAudioActivated(true);
      setIsPlaying(true);
      audioRef.current?.play().catch(console.error);
    }
  };

  return (
    <main className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Background Layer - Static Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* UI Overlay Layer - Left */}
      <FontSwitcher
        currentFont={fontFamily}
        onFontChange={setFontFamily}
        currentSize={fontSize}
        onSizeChange={setFontSize}
      />

      {/* UI Overlay Layer - Right */}
      <Nexus 
        volume={currentVolume}
        onVolumeChange={handleVolumeChange}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* Editor Layer */}
      <Editor 
        content={content} 
        onChange={setContent} 
        fontFamily={fontFamily} 
        fontSize={fontSize} 
      />
    </main>
  );
}
