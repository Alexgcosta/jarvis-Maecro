import React from 'react';

interface SpeedometerGaugeProps {
  id?: string;
  value: number; // Pode ser de -100 a +100, ou de 0 a 100
  min?: number;  // Padrão: -100
  max?: number;  // Padrão: +100
  title?: string;
  subtitle?: string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  showTicks?: boolean;
  colorScheme?: 'bidirectional' | 'risk' | 'positive'; // bidirectional: -100 (rose) a +100 (emerald); risk: 0 (emerald) a 100 (rose)
}

/**
 * Modern Speedometer / Gauge Component
 * Cores: Preto, Violeta Neon (#a855f7 / #c084fc) e Cinza de alta legibilidade.
 * Suporta escalas bipolares (-100 a +100 para WIN/WDO/Sentimento) e unipolar (0 a 100).
 */
export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  id,
  value,
  min = -100,
  max = 100,
  title,
  subtitle,
  unit = 'pts',
  size = 'md',
  showTicks = true,
  colorScheme = 'bidirectional',
}) => {
  // Clamping seguro
  const clampedValue = Math.max(min, Math.min(max, isNaN(value) ? 0 : value));

  // Normalização de 0 a 1
  const normalized = (clampedValue - min) / (max - min);

  // Ângulo do ponteiro em graus: de -90deg (extremo esquerdo) até +90deg (extremo direito)
  // Semicírculo de 180 graus
  const needleAngle = -90 + normalized * 180;

  // Dimensões pelo tamanho
  const dimensions = {
    sm: { width: 140, height: 85, radius: 55, strokeWidth: 8, fontSize: 'text-lg', labelSize: 'text-[10px]' },
    md: { width: 200, height: 115, radius: 78, strokeWidth: 10, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { width: 260, height: 150, radius: 100, strokeWidth: 14, fontSize: 'text-3xl', labelSize: 'text-sm' },
  }[size];

  // Identificação da cor atual do valor
  const getValueColor = () => {
    if (colorScheme === 'bidirectional') {
      if (clampedValue >= 30) return 'text-emerald-400';
      if (clampedValue > -30) return 'text-violet-300';
      return 'text-rose-400';
    } else if (colorScheme === 'risk') {
      // Para risco: 0 = bom (verde), 100 = perigoso (vermelho)
      if (clampedValue < 40) return 'text-emerald-400';
      if (clampedValue < 70) return 'text-amber-400';
      return 'text-rose-400';
    } else {
      if (clampedValue >= 60) return 'text-emerald-400';
      if (clampedValue >= 40) return 'text-violet-300';
      return 'text-rose-400';
    }
  };

  const cx = dimensions.width / 2;
  const cy = dimensions.height - 12;
  const r = dimensions.radius;

  // Cálculo das coordenadas de um ponto no arco
  const getCoordinatesForAngle = (angleInDegrees: number, customR = r) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180;
    return {
      x: cx + customR * Math.cos(angleInRadians),
      y: cy + customR * Math.sin(angleInRadians),
    };
  };

  // Coordenadas inicial e final do arco de fundo (180 graus)
  const startArc = getCoordinatesForAngle(0);
  const endArc = getCoordinatesForAngle(180);

  // SVG Path do arco base semicircular
  const arcPath = `M ${startArc.x} ${startArc.y} A ${r} ${r} 0 0 1 ${endArc.x} ${endArc.y}`;

  // Ticks radiais
  const tickAngles = [0, 45, 90, 135, 180];
  const tickLabels = min === -100 && max === 100
    ? ['-100', '-50', '0', '+50', '+100']
    : [`${min}`, `${Math.round((min + max) / 4)}`, `${Math.round((min + max) / 2)}`, `${Math.round((min + max) * 0.75)}`, `${max}`];

  return (
    <div id={id} className="flex flex-col items-center justify-center select-none font-sans">
      {title && (
        <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_#a855f7]" />
          {title}
        </div>
      )}

      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="overflow-visible"
        >
          <defs>
            {/* Gradiente do arco de fundo com acentos de violeta neon e semáforo */}
            <linearGradient id={`gauge-grad-${id || 'default'}`} x1="0%" y1="0%" x2="100%" y2="0%">
              {colorScheme === 'bidirectional' ? (
                <>
                  <stop offset="0%" stopColor="#f43f5e" /> {/* Vermelho (-100) */}
                  <stop offset="35%" stopColor="#fb923c" /> {/* Laranja */}
                  <stop offset="50%" stopColor="#a855f7" /> {/* Violeta Neon Central (Neutro) */}
                  <stop offset="65%" stopColor="#38bdf8" /> {/* Ciano / Azul Claro */}
                  <stop offset="100%" stopColor="#10b981" /> {/* Verde Esmeralda (+100) */}
                </>
              ) : colorScheme === 'risk' ? (
                <>
                  <stop offset="0%" stopColor="#10b981" /> {/* Seguro */}
                  <stop offset="50%" stopColor="#a855f7" /> {/* Risco Moderado */}
                  <stop offset="100%" stopColor="#f43f5e" /> {/* Risco Alto */}
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#c084fc" />
                </>
              )}
            </linearGradient>

            {/* Sombra de brilho neon para o ponteiro e arco */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Trilho de Fundo Escuro */}
          <path
            d={arcPath}
            fill="none"
            stroke="#27272a"
            strokeWidth={dimensions.strokeWidth}
            strokeLinecap="round"
          />

          {/* Arco Colorido com Gradiente Neon */}
          <path
            d={arcPath}
            fill="none"
            stroke={`url(#gauge-grad-${id || 'default'})`}
            strokeWidth={dimensions.strokeWidth - 2}
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Ticks e Marcadores */}
          {showTicks &&
            tickAngles.map((angle, index) => {
              const pOuter = getCoordinatesForAngle(angle, r + 4);
              const pInner = getCoordinatesForAngle(angle, r - (dimensions.strokeWidth - 1));
              return (
                <line
                  key={index}
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke="#52525b"
                  strokeWidth={index === 2 ? 2 : 1}
                />
              );
            })}

          {/* Ponteiro Mecânico/Digital */}
          <g
            style={{
              transform: `rotate(${needleAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Linha do ponteiro com acabamento violeta e branco */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - r + 8}
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            />
            {/* Ponta em formato de agulha */}
            <polygon
              points={`${cx - 3},${cy - 10} ${cx + 3},${cy - 10} ${cx},${cy - r + 4}`}
              fill="#c084fc"
            />
          </g>

          {/* Pivô Central com Halo Violeta Neon */}
          <circle cx={cx} cy={cy} r="6" fill="#18181b" stroke="#a855f7" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
        </svg>

        {/* Labels laterais dos extremos */}
        {showTicks && (
          <div className="flex justify-between w-full px-2 -mt-2 text-[9px] font-mono text-zinc-500">
            <span>{tickLabels[0]}</span>
            <span className="text-violet-400 font-semibold">{tickLabels[2]}</span>
            <span>{tickLabels[4]}</span>
          </div>
        )}
      </div>

      {/* Valor Central Digital em Destaque */}
      <div className="flex flex-col items-center mt-0.5">
        <div className="flex items-baseline gap-1">
          <span className={`font-mono font-black ${dimensions.fontSize} tracking-tight ${getValueColor()} drop-shadow-[0_0_8px_rgba(168,85,247,0.35)]`}>
            {min < 0 && clampedValue > 0 ? `+${clampedValue}` : clampedValue}
          </span>
          {unit && <span className="text-[10px] font-mono text-zinc-400 font-semibold">{unit}</span>}
        </div>

        {subtitle && (
          <span className="text-[10px] font-mono font-medium text-zinc-400 tracking-wide mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
