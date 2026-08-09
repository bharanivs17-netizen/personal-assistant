'use client';

import { useRef, useEffect, useCallback } from 'react';
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

  const isIdle = [
    AssistantState.READY,
    AssistantState.OFF,
    AssistantState.STOPPED,
    AssistantState.PERMISSION_REQUIRED,
    AssistantState.NO_NETWORK,
  ].includes(state);
  const isListening = state === AssistantState.LISTENING || state === AssistantState.WAKE_DETECTED;
  const isProcessing = state === AssistantState.PROCESSING;
  const isSpeaking = state === AssistantState.SPEAKING;
  const isError = state === AssistantState.ERROR;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const dpr = window.devicePixelRatio || 1;
      const baseRadius = Math.min(width, height) * 0.22;

      ctx.clearRect(0, 0, width, height);

      // ── Outer glow ──
      const glowRadius = baseRadius * 2.5;
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.5, cx, cy, glowRadius);

      if (isError) {
        const errPulse = 0.08 + Math.sin(t * 3) * 0.04;
        glowGrad.addColorStop(0, `rgba(255, 68, 102, ${errPulse})`);
        glowGrad.addColorStop(1, 'rgba(255, 68, 102, 0)');
      } else if (isListening) {
        const listenGlow = 0.1 + audioLevel * 0.15;
        glowGrad.addColorStop(0, `rgba(0, 212, 255, ${listenGlow})`);
        glowGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
      } else if (isProcessing) {
        const procGlow = 0.08 + Math.sin(t * 2) * 0.05;
        glowGrad.addColorStop(0, `rgba(123, 97, 255, ${procGlow})`);
        glowGrad.addColorStop(1, 'rgba(123, 97, 255, 0)');
      } else if (isSpeaking) {
        const speakGlow = 0.08 + audioLevel * 0.12;
        glowGrad.addColorStop(0, `rgba(0, 230, 138, ${speakGlow})`);
        glowGrad.addColorStop(1, 'rgba(0, 230, 138, 0)');
      } else {
        const breathe = 0.06 + Math.sin(t * 0.8) * 0.03;
        glowGrad.addColorStop(0, `rgba(0, 212, 255, ${breathe})`);
        glowGrad.addColorStop(1, 'rgba(0, 212, 255, 0)');
      }

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // ── Orbital rings (processing state) ──
      if (isProcessing) {
        for (let i = 0; i < 3; i++) {
          const ringRadius = baseRadius * (1.3 + i * 0.2);
          const rotationSpeed = (i % 2 === 0 ? 1 : -1) * (1.5 + i * 0.5);
          const angle = t * rotationSpeed + (i * Math.PI) / 3;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRadius, ringRadius * 0.35, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(123, 97, 255, ${0.25 - i * 0.06})`;
          ctx.lineWidth = 1.5 / dpr;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Listening rings (audio-reactive) ──
      if (isListening) {
        const ringCount = 3;
        for (let i = 0; i < ringCount; i++) {
          const expansion = audioLevel * 0.3;
          const ringRadius = baseRadius * (1.15 + i * 0.18 + expansion);
          const alpha = 0.2 - i * 0.05 + audioLevel * 0.1;

          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 212, 255, ${Math.max(0.05, alpha)})`;
          ctx.lineWidth = (2 - i * 0.4) / dpr;
          ctx.stroke();
        }
      }

      // ── Speaking pulse rings ──
      if (isSpeaking) {
        const pulseCount = 2;
        for (let i = 0; i < pulseCount; i++) {
          const pulse = audioLevel * 0.25;
          const ringRadius = baseRadius * (1.1 + i * 0.2 + pulse);

          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 230, 138, ${0.2 - i * 0.07 + audioLevel * 0.08})`;
          ctx.lineWidth = (1.5 - i * 0.3) / dpr;
          ctx.stroke();
        }
      }

      // ── Core orb ──
      const breatheScale = isIdle ? 1 + Math.sin(t * 0.8) * 0.03 : 1;
      const listenScale = isListening ? 1 + audioLevel * 0.08 : 1;
      const speakScale = isSpeaking ? 1 + audioLevel * 0.06 : 1;
      const scale = breatheScale * listenScale * speakScale;
      const orbRadius = baseRadius * scale;

      // Core gradient
      const coreGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.2,
        cy - orbRadius * 0.2,
        0,
        cx,
        cy,
        orbRadius
      );

      if (isError) {
        coreGrad.addColorStop(0, 'rgba(255, 100, 130, 0.9)');
        coreGrad.addColorStop(0.7, 'rgba(200, 50, 80, 0.6)');
        coreGrad.addColorStop(1, 'rgba(150, 30, 50, 0.3)');
      } else if (isListening) {
        coreGrad.addColorStop(0, 'rgba(0, 230, 255, 0.85)');
        coreGrad.addColorStop(0.6, 'rgba(0, 180, 220, 0.5)');
        coreGrad.addColorStop(1, 'rgba(0, 120, 180, 0.2)');
      } else if (isProcessing) {
        coreGrad.addColorStop(0, 'rgba(140, 120, 255, 0.85)');
        coreGrad.addColorStop(0.6, 'rgba(100, 80, 220, 0.5)');
        coreGrad.addColorStop(1, 'rgba(70, 50, 180, 0.2)');
      } else if (isSpeaking) {
        coreGrad.addColorStop(0, 'rgba(0, 240, 150, 0.85)');
        coreGrad.addColorStop(0.6, 'rgba(0, 200, 120, 0.5)');
        coreGrad.addColorStop(1, 'rgba(0, 150, 90, 0.2)');
      } else {
        coreGrad.addColorStop(0, 'rgba(0, 220, 255, 0.7)');
        coreGrad.addColorStop(0.6, 'rgba(0, 160, 200, 0.35)');
        coreGrad.addColorStop(1, 'rgba(0, 100, 150, 0.1)');
      }

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Inner highlight
      const highlightGrad = ctx.createRadialGradient(
        cx - orbRadius * 0.25,
        cy - orbRadius * 0.3,
        0,
        cx - orbRadius * 0.1,
        cy - orbRadius * 0.1,
        orbRadius * 0.6
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      // Subtle border
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      const borderAlpha = isIdle ? 0.15 + Math.sin(t * 0.8) * 0.05 : 0.2;
      ctx.strokeStyle = isError
        ? `rgba(255, 68, 102, ${borderAlpha})`
        : isProcessing
          ? `rgba(123, 97, 255, ${borderAlpha})`
          : isSpeaking
            ? `rgba(0, 230, 138, ${borderAlpha})`
            : `rgba(0, 212, 255, ${borderAlpha})`;
      ctx.lineWidth = 1 / dpr;
      ctx.stroke();

      // ── Floating particles (idle + ready) ──
      if (isIdle || isListening) {
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + t * 0.3;
          const dist = baseRadius * (1.5 + Math.sin(t * 0.5 + i * 1.2) * 0.3);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          const pSize = 1.5 + Math.sin(t + i) * 0.5;

          ctx.beginPath();
          ctx.arc(px, py, pSize / dpr, 0, Math.PI * 2);
          ctx.fillStyle = isListening
            ? `rgba(0, 212, 255, ${0.3 + audioLevel * 0.2})`
            : `rgba(0, 212, 255, ${0.15 + Math.sin(t + i) * 0.1})`;
          ctx.fill();
        }
      }
    },
    [isIdle, isListening, isProcessing, isSpeaking, isError, audioLevel]
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
