'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { AssistantState } from '@partner/shared';

interface OrbProps {
  state: AssistantState;
  audioLevel?: number; // 0–1 normalized audio amplitude
  onClick?: () => void;
}

/**
 * Animated orb — the central visual element of Partner.
 *
 * States:
 *   IDLE/READY/STOPPED/OFF  → Slow breathing glow
 *   LISTENING               → Audio-reactive expanding rings
 *   PROCESSING              → Rotating orbital rings
 *   SPEAKING                → Audio-reactive pulse
 */
export default function Orb({ state, audioLevel = 0, onClick }: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    
    // Modern approach using addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  const isIdle = [
    AssistantState.READY,
    AssistantState.OFF,
    AssistantState.STOPPED,
    AssistantState.PERMISSION_REQUIRED,
    AssistantState.NO_NETWORK,
  ].includes(state);
  const isListening = state === AssistantState.LISTENING || state === AssistantState.CONTINUOUS_LISTENING;
  const isWakeDetected = state === AssistantState.WAKE_DETECTED;
  const isProcessing = state === AssistantState.PROCESSING || state === AssistantState.CONFIRMING;
  const isSpeaking = state === AssistantState.SPEAKING;
  const isError = state === AssistantState.ERROR;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const dpr = window.devicePixelRatio || 1;
      
      // Base radius calculation. Using 0.12 so 4x radius (0.48) fits perfectly in the canvas.
      const baseRadius = Math.min(width, height) * 0.12; 
      
      // Smooth out audio level
      const smoothedAudio = Math.min(audioLevel, 1.0);
      
      ctx.clearRect(0, 0, width, height);

      // Animation speeds based on accessibility
      const speedMult = reducedMotion ? 0 : 1.0;
      const time = t * speedMult;

      // Base states
      const breathe = reducedMotion ? 0 : Math.sin(time * 1.0) * 0.02; // Very slow breathing, tiny scale variation
      
      // Determine target colors
      let coreColor = { r: 255, g: 255, b: 255 };
      let glowColor = { r: 210, g: 240, b: 255 };
      let intensity = 1.0;
      let scale = 1.0 + breathe;

      if (isError) {
        // Brief subtle visual disturbance, soft brightness change, NO red flashing
        glowColor = { r: 180, g: 200, b: 220 };
        intensity = 0.7 + (Math.sin(time * 10) * 0.1); 
        scale = 0.98;
      } else if (isWakeDetected) {
        // Smooth brightness increase, one elegant outward ripple
        coreColor = { r: 240, g: 255, b: 255 };
        glowColor = { r: 100, g: 220, b: 255 };
        intensity = 1.3;
        scale = 1.05;
      } else if (isListening) {
        coreColor = { r: 230, g: 250, b: 255 };
        glowColor = { r: 56, g: 189, b: 248 };
        intensity = 1.2 + smoothedAudio * 0.5;
        scale = 1.02 + smoothedAudio * 0.05;
      } else if (isProcessing) {
        coreColor = { r: 245, g: 245, b: 255 };
        glowColor = { r: 180, g: 180, b: 255 };
        intensity = 1.1 + (Math.sin(time * 1.5) * 0.1);
        scale = 1.02;
      } else if (isSpeaking) {
        coreColor = { r: 240, g: 255, b: 250 };
        glowColor = { r: 56, g: 189, b: 248 };
        intensity = 1.2 + smoothedAudio * 0.6;
        scale = 1.0 + smoothedAudio * 0.08;
      }

      if (reducedMotion) {
        scale = 1.0;
        intensity = Math.min(intensity, 1.2);
      }

      const orbRadius = baseRadius * scale;

      // ── LAYER 5: OUTER FIELD (extremely soft blurred light) ──
      const outerRadius = orbRadius * 4;
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerRadius);
      const outerAlpha = reducedMotion ? 0.05 : 0.08 * intensity;
      outerGrad.addColorStop(0, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${outerAlpha})`);
      outerGrad.addColorStop(0.5, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${outerAlpha * 0.3})`);
      outerGrad.addColorStop(1, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, 0)`);
      
      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fill();

      // ── LAYER 4: RING 3 (very subtle atmospheric glow) ──
      const atmRadius = orbRadius * 2.2;
      const atmGrad = ctx.createRadialGradient(cx, cy, orbRadius * 0.5, cx, cy, atmRadius);
      const atmAlpha = 0.15 * intensity;
      atmGrad.addColorStop(0, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${atmAlpha})`);
      atmGrad.addColorStop(1, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, 0)`);
      
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, atmRadius, 0, Math.PI * 2);
      ctx.fill();

      // ── WAVE RINGS (Listening state soft outward waves, or Wake single ripple) ──
      if ((isListening || isWakeDetected) && !reducedMotion) {
        const waveCount = isWakeDetected ? 1 : 2;
        const speed = isWakeDetected ? 2.5 : 1.2;
        for(let i=0; i<waveCount; i++) {
            const waveOffset = (time * speed + i * Math.PI) % (Math.PI * 2);
            const waveScale = 1 + (waveOffset / (Math.PI * 2));
            const waveAlpha = (1 - (waveOffset / (Math.PI * 2))) * (isWakeDetected ? 0.4 : 0.2) * intensity;
            
            ctx.beginPath();
            ctx.arc(cx, cy, orbRadius * waveScale * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${waveAlpha})`;
            ctx.lineWidth = 1.5 / dpr;
            ctx.stroke();
        }
      }

      // ── ROTATING LIGHT (Thinking state) ──
      if (isProcessing && !reducedMotion) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.8);
        
        const procGrad = ctx.createLinearGradient(-orbRadius*1.5, -orbRadius*1.5, orbRadius*1.5, orbRadius*1.5);
        procGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        procGrad.addColorStop(0.5, `rgba(255, 255, 255, 0.4)`);
        procGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.beginPath();
        ctx.arc(0, 0, orbRadius * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = procGrad;
        ctx.lineWidth = 1.5 / dpr;
        ctx.stroke();
        ctx.restore();
      }

      // ── LAYER 3: RING 2 (thin translucent glass ring) ──
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 1.1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * intensity})`;
      ctx.lineWidth = 1 / dpr;
      ctx.stroke();
      
      const glassGrad = ctx.createRadialGradient(cx, cy, orbRadius * 0.8, cx, cy, orbRadius * 1.1);
      glassGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      glassGrad.addColorStop(1, `rgba(255, 255, 255, ${0.05 * intensity})`);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // ── LAYER 2: RING 1 (soft inner light ring) ──
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.95, 0, Math.PI * 2);
      const innerLightGrad = ctx.createRadialGradient(cx, cy, orbRadius * 0.5, cx, cy, orbRadius);
      innerLightGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      innerLightGrad.addColorStop(1, `rgba(255, 255, 255, ${0.4 * intensity})`);
      ctx.fillStyle = innerLightGrad;
      ctx.fill();

      // ── LAYER 1: CENTER (glowing AI core) ──
      const coreGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.3,
        cy - orbRadius * 0.3,
        0,
        cx,
        cy,
        orbRadius * 0.95
      );
      
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * intensity})`);
      coreGrad.addColorStop(0.4, `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${0.8 * intensity})`);
      coreGrad.addColorStop(1, `rgba(${coreColor.r - 20}, ${coreColor.g - 20}, ${coreColor.b - 10}, ${0.4 * intensity})`);

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      
      // Shadow for depth
      ctx.shadowColor = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${0.2 * intensity})`;
      ctx.shadowBlur = orbRadius * 0.5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = orbRadius * 0.1;
      
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Surface Specular Highlight (glass effect)
      const specGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.4,
        cy - orbRadius * 0.4,
        0,
        cx - orbRadius * 0.1,
        cy - orbRadius * 0.1,
        orbRadius * 0.6
      );
      specGrad.addColorStop(0, `rgba(255, 255, 255, 0.6)`);
      specGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
      
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.95, 0, Math.PI * 2);
      ctx.fillStyle = specGrad;
      ctx.fill();
      
    },
    [isIdle, isListening, isWakeDetected, isProcessing, isSpeaking, isError, audioLevel, reducedMotion]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      timeRef.current += delta;

      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, timeRef.current);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw]);

  return (
    <div className="orb-wrapper" onClick={onClick} role="button" tabIndex={0} aria-label="Partner assistant orb">
      <canvas ref={canvasRef} className="orb-canvas" />
    </div>
  );
}
