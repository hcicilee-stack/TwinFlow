import React, { useMemo, useEffect, useState, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Particle {
  element: HTMLSpanElement | null;
  hX: number;
  hY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface AquariumOverlayProps {
  isActive: boolean;
  text: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
  scrollTop: number;
}

// 物理常量
const ATTRACTION = 0.012;
const DAMPING = 0.92;
const REPEL_STRENGTH = 32;
const REPEL_RADIUS = 85;

const FishIcon = ({ angle }: { angle: number }) => (
  <svg 
    width="40" 
    height="20" 
    viewBox="0 0 40 20" 
    style={{ transform: `rotate(${angle}rad)` }}
    className="drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-transform duration-100 ease-out"
  >
    <path 
      d="M5,10 C10,0 30,0 40,10 C30,20 10,20 5,10" 
      fill="white" 
      fillOpacity="0.4"
    />
    <path 
      d="M5,10 L0,5 L0,15 Z" 
      fill="white"
      fillOpacity="0.4"
    />
    <circle cx="32" cy="7" r="1.2" fill="white" fillOpacity="0.8" />
  </svg>
);

const AquariumOverlay: React.FC<AquariumOverlayProps> = ({ 
  isActive, 
  text, 
  fontFamily, 
  fontSize, 
  lineHeight,
  padding,
  scrollTop
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fish, setFish] = useState({ x: -200, y: -200, angle: 0, swing: 0 });
  
  const basePosRef = useRef({ x: -200, y: -200 });
  const activeFactorRef = useRef(0);
  const tailRef = useRef(0);
  const wanderRef = useRef({ 
    phaseX: Math.random() * 100, 
    phaseY: Math.random() * 100,
    offset: { x: 0, y: 0 } 
  });
  
  const particlesRef = useRef<Particle[]>([]);
  const [initialLayout, setInitialLayout] = useState<Array<{ text: string; hX: number; hY: number }>>([]);

  // ResizeObserver for dynamic bounds - Always active
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Recalculate layout when dimensions or text changes
  useEffect(() => {
    if (dimensions.width === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Use the exact font string
    ctx.font = `${fontSize} ${fontFamily}`;

    const segments = text.match(/[\u4e00-\u9fa5]|[^\s\u4e00-\u9fa5]+|\s/g) || [];
    const layout: Array<{ text: string; hX: number; hY: number }> = [];
    
    let curX = padding.left;
    let curY = padding.top - scrollTop;
    const lineH = lineHeight;
    const maxWidth = dimensions.width - padding.right;

    segments.forEach((seg) => {
      if (seg === '\n') {
        curX = padding.left;
        curY += lineH;
        return;
      }
      
      const metrics = ctx.measureText(seg);
      const segW = metrics.width;

      if (curX + segW > maxWidth && curX > padding.left) {
        curX = padding.left;
        curY += lineH;
      }

      layout.push({ text: seg, hX: curX, hY: curY });
      curX += segW;
    });

    setInitialLayout(layout);
    // Initialize/Reset particles
    particlesRef.current = layout.map(item => ({
      element: null,
      hX: item.hX,
      hY: item.hY,
      x: item.hX,
      y: item.hY,
      vx: 0,
      vy: 0
    }));
  }, [text, dimensions, fontSize, fontFamily, lineHeight, padding, scrollTop]);

  useEffect(() => {
    let frameId: number;
    let lastFishX = -200;
    let lastFishY = -200;
    let startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;

      // 1. Smoothly glide factors
      const targetFactor = isActive ? 1 : 0;
      activeFactorRef.current += (targetFactor - activeFactorRef.current) * 0.03;
      
      // If factor is near zero and not active, we still move particles to home and fish away
      const targetBaseX = isActive ? dimensions.width / 2 : -200;
      const targetBaseY = isActive ? dimensions.height / 2 : -200;

      basePosRef.current.x += (targetBaseX - basePosRef.current.x) * 0.02;
      basePosRef.current.y += (targetBaseY - basePosRef.current.y) * 0.02;

      // 2. Fish Motion
      wanderRef.current.offset.x += (Math.random() - 0.5) * 0.5;
      wanderRef.current.offset.y += (Math.random() - 0.5) * 0.5;
      wanderRef.current.offset.x *= 0.98;
      wanderRef.current.offset.y *= 0.98;

      const wx = (
        Math.sin(elapsed * 0.4 + wanderRef.current.phaseX) * (dimensions.width * 0.3) +
        Math.sin(elapsed * 0.7) * 40 +
        wanderRef.current.offset.x
      );
      const wy = (
        Math.cos(elapsed * 0.3 + wanderRef.current.phaseY) * (dimensions.height * 0.25) +
        Math.sin(elapsed * 0.8) * 30 +
        wanderRef.current.offset.y
      );

      let fishX = basePosRef.current.x + wx * activeFactorRef.current;
      let fishY = basePosRef.current.y + wy * activeFactorRef.current;
      
      // Safety bounds only when active
      if (isActive) {
        const safety = 40;
        fishX = Math.max(safety, Math.min(dimensions.width - safety, fishX));
        fishY = Math.max(safety, Math.min(dimensions.height - safety, fishY));
      }

      const dx = fishX - lastFishX;
      const dy = fishY - lastFishY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // Increase tail beat frequency with speed
      tailRef.current += Math.max(0.05, speed * 0.15);
      const swing = Math.sin(tailRef.current) * (0.15 + speed * 0.05);

      setFish(prev => {
        let newAngle = prev.angle;

        // Only update heading if moving significantly to avoid jittering/reversing feel
        if (speed > 0.5) {
          const targetAngle = Math.atan2(dy, dx);
          
          // Shortest path interpolation (Lerp)
          let diff = targetAngle - prev.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          
          // Linear interpolation for smooth turning (0.1 factor as requested)
          newAngle = prev.angle + diff * 0.1;
        }

        return { 
          x: fishX, 
          y: fishY, 
          angle: newAngle,
          swing: swing
        };
      });

      lastFishX = fishX;
      lastFishY = fishY;

      // 3. Physics Simulation
      particlesRef.current.forEach(p => {
        if (!p.element) return;

        let ax = (p.hX - p.x) * ATTRACTION;
        let ay = (p.hY - p.y) * ATTRACTION;

        const diffX = p.x - fishX;
        const diffY = p.y - fishY;
        const distSq = diffX * diffX + diffY * diffY;
        const dist = Math.sqrt(distSq);

        if (dist < REPEL_RADIUS && dist > 0.1) {
          const force = REPEL_STRENGTH * (1 - dist / REPEL_RADIUS) * activeFactorRef.current;
          ax += (diffX / dist) * force;
          ay += (diffY / dist) * force;
        }

        p.vx = (p.vx + ax) * DAMPING;
        p.vy = (p.vy + ay) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, dimensions]);

  // Keep it always rendered but invisible if factor is low
  const isVisible = isActive || activeFactorRef.current > 0.01;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl transition-opacity duration-1000",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* 红色小鱼 - 使用实验室的红颜色 */}
      <div 
        className="absolute z-10"
        style={{ 
          left: fish.x - 20, 
          top: fish.y - 10,
        }}
      >
        <svg 
          width="40" 
          height="20" 
          viewBox="0 0 40 20" 
          style={{ transform: `rotate(${fish.angle + fish.swing}rad)` }}
          className="drop-shadow-[0_0_12px_rgba(255,59,48,0.5)]"
        >
          <path 
            d="M5,10 C10,0 30,0 40,10 C30,20 10,20 5,10" 
            fill="#FF3B30" 
            fillOpacity="0.7"
          />
          <path 
            d="M5,10 L0,5 L0,15 Z" 
            fill="#FF3B30"
            fillOpacity="0.7"
            style={{ 
              transform: `rotate(${fish.swing * 2}rad)`,
              transformOrigin: '5px 10px'
            }}
          />
          <circle cx="32" cy="7" r="1.2" fill="white" fillOpacity="0.9" />
        </svg>
      </div>

      {/* Particle layer */}
      <div className="absolute inset-0 z-20">
        {initialLayout.map((item, index) => (
          <span
            key={`${index}-${item.text}-${item.hX}-${item.hY}`}
            ref={el => {
              if (el && particlesRef.current[index]) {
                particlesRef.current[index].element = el;
              }
            }}
            className="absolute inline-block text-white/80 whitespace-pre will-change-transform"
            style={{ 
              left: 0, 
              top: 0, 
              fontFamily,
              fontSize,
              lineHeight: `${lineHeight}px`,
              transform: `translate3d(${item.hX}px, ${item.hY}px, 0)`
            }}
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AquariumOverlay;
