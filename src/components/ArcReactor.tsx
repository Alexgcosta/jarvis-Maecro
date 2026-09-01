import React, { useEffect, useRef } from 'react';
import { HUDTheme } from '../types';
import { soundFX } from '../utils/soundEffects';

interface ArcReactorProps {
  theme: HUDTheme;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  powerOutput?: string;
  onClick?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  theme,
  isSpeaking,
  isListening,
  isProcessing,
  powerOutput = '3.25 GW',
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Theme color definitions for holographic canvas
  const getThemeColors = () => {
    switch (theme) {
      case 'amber':
        return {
          primary: 'rgba(245, 158, 11, 0.9)',
          primaryGlow: 'rgba(245, 158, 11, 0.3)',
          secondary: 'rgba(251, 191, 36, 0.6)',
          core: '#fef3c7',
        };
      case 'crimson':
        return {
          primary: 'rgba(239, 68, 68, 0.9)',
          primaryGlow: 'rgba(239, 68, 68, 0.3)',
          secondary: 'rgba(248, 113, 113, 0.6)',
          core: '#fee2e2',
        };
      case 'emerald':
        return {
          primary: 'rgba(16, 185, 129, 0.9)',
          primaryGlow: 'rgba(16, 185, 129, 0.3)',
          secondary: 'rgba(52, 211, 153, 0.6)',
          core: '#d1fae5',
        };
      case 'cyan':
      default:
        return {
          primary: 'rgba(6, 182, 212, 0.95)',
          primaryGlow: 'rgba(6, 182, 212, 0.35)',
          secondary: 'rgba(56, 189, 248, 0.6)',
          core: '#ecfeff',
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle1 = 0;
    let angle2 = 0;
    let angle3 = 0;
    let pulseVal = 0;

    // Particles array
    const particles: Array<{
      radius: number;
      angle: number;
      speed: number;
      size: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 36; i++) {
      particles.push({
        radius: 30 + Math.random() * 80,
        angle: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      // Multiplier when speaking or listening
      const activityMultiplier = isSpeaking ? 2.5 : isListening ? 2.0 : isProcessing ? 3.0 : 1.0;
      
      angle1 += 0.012 * activityMultiplier;
      angle2 -= 0.008 * activityMultiplier;
      angle3 += 0.018 * activityMultiplier;
      pulseVal += 0.05 * activityMultiplier;

      const dynamicRadius = 14 + Math.sin(pulseVal) * (isSpeaking ? 5 : isListening ? 4 : 2);

      // 1. Outer Hologram Glow Halo
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 130);
      gradient.addColorStop(0, colors.primaryGlow);
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Outer Ring with Hash Marks
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle1);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;

      // Outer segmented circle
      ctx.beginPath();
      ctx.arc(0, 0, 115, 0, Math.PI * 2);
      ctx.stroke();

      // Hash ticks
      const totalTicks = 24;
      for (let i = 0; i < totalTicks; i++) {
        const tickAngle = (i * (Math.PI * 2)) / totalTicks;
        const tickLen = i % 4 === 0 ? 8 : 4;
        const x1 = Math.cos(tickAngle) * (115 - tickLen);
        const y1 = Math.sin(tickAngle) * (115 - tickLen);
        const x2 = Math.cos(tickAngle) * (115 + tickLen);
        const y2 = Math.sin(tickAngle) * (115 + tickLen);

        ctx.strokeStyle = i % 4 === 0 ? colors.primary : colors.secondary;
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Middle Gear Ring (Counter-rotating)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle2);
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;

      // 10 Segments of Arc Reactor coils
      const coils = 10;
      for (let i = 0; i < coils; i++) {
        const start = (i * (Math.PI * 2)) / coils;
        const end = start + (Math.PI * 2) / (coils * 1.5);
        ctx.beginPath();
        ctx.arc(0, 0, 85, start, end);
        ctx.stroke();

        // Coil connection bars
        const midAngle = (start + end) / 2;
        const cx1 = Math.cos(midAngle) * 75;
        const cy1 = Math.sin(midAngle) * 75;
        const cx2 = Math.cos(midAngle) * 95;
        const cy2 = Math.sin(midAngle) * 95;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Inner Ring with Frequency Spikes
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle3);
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;

      const innerSpikes = 16;
      ctx.beginPath();
      for (let i = 0; i <= innerSpikes; i++) {
        const spikeAngle = (i * (Math.PI * 2)) / innerSpikes;
        const noise = (isSpeaking || isListening) ? Math.sin(spikeAngle * 5 + pulseVal) * 8 : 0;
        const r = 55 + noise;
        const x = Math.cos(spikeAngle) * r;
        const y = Math.sin(spikeAngle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // 5. Energy Particles swirling
      particles.forEach((p) => {
        p.angle += p.speed * activityMultiplier;
        const px = centerX + Math.cos(p.angle) * p.radius;
        const py = centerY + Math.sin(p.angle) * p.radius;

        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 6. Central Arc Core (Bright Palladium / Vibranium Glow)
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        dynamicRadius + 15
      );
      coreGradient.addColorStop(0, colors.core);
      coreGradient.addColorStop(0.3, colors.primary);
      coreGradient.addColorStop(0.8, colors.primaryGlow);
      coreGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius + 18, 0, Math.PI * 2);
      ctx.fill();

      // Inner Solid Core
      ctx.fillStyle = colors.core;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core Reticle Crosshair
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY);
      ctx.lineTo(centerX - dynamicRadius - 4, centerY);
      ctx.moveTo(centerX + dynamicRadius + 4, centerY);
      ctx.lineTo(centerX + 35, centerY);
      ctx.moveTo(centerX, centerY - 35);
      ctx.lineTo(centerX, centerY - dynamicRadius - 4);
      ctx.moveTo(centerX, centerY + dynamicRadius + 4);
      ctx.lineTo(centerX, centerY + 35);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, isSpeaking, isListening, isProcessing]);

  const handleCoreClick = () => {
    soundFX.playArcPulse();
    if (onClick) onClick();
  };

  return (
    <div
      id="arc-reactor-module"
      onClick={handleCoreClick}
      className="relative flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Canvas Hologram */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="w-full h-full drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        />

        {/* Central Overlay Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {isSpeaking && (
            <span className="font-tech text-xs tracking-widest text-cyan-300 uppercase animate-pulse bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
              TRANSMITINDO
            </span>
          )}
          {isListening && (
            <span className="font-tech text-xs tracking-widest text-emerald-300 uppercase animate-pulse bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              ESCUTANDO
            </span>
          )}
          {isProcessing && (
            <span className="font-tech text-xs tracking-widest text-amber-300 uppercase animate-pulse bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              PROCESSANDO
            </span>
          )}
        </div>
      </div>

      {/* Core Telemetry Strip */}
      <div className="flex items-center gap-4 mt-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-tech text-xs text-cyan-300">CORE MK-85</span>
        </div>
        <div className="w-px h-3 bg-cyan-500/30" />
        <span className="font-orbitron text-xs font-semibold text-cyan-100">{powerOutput}</span>
        <div className="w-px h-3 bg-cyan-500/30" />
        <span className="font-tech text-[10px] text-cyan-400/80">99.98% ESTÁVEL</span>
      </div>
    </div>
  );
};
