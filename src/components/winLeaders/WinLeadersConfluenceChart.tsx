import React, { useState } from 'react';
import { IntradayConfluenceTimelinePoint } from '../../types/winGlobalLeadersTypes';
import { LineChart, Activity, Flag, Info, Clock, Sparkles } from 'lucide-react';

interface WinLeadersConfluenceChartProps {
  timeline: IntradayConfluenceTimelinePoint[];
}

export const WinLeadersConfluenceChart: React.FC<WinLeadersConfluenceChartProps> = ({ timeline }) => {
  const [hoveredPoint, setHoveredPoint] = useState<IntradayConfluenceTimelinePoint | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'NET_CONFLUENCE' | 'MULTI_CURVES'>('NET_CONFLUENCE');

  if (!timeline || timeline.length === 0) return null;

  const width = 1000;
  const height = 320;
  const padding = { top: 25, right: 40, bottom: 45, left: 65 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // X coordinate based on 5-minute intervals
  const getX = (index: number) => padding.left + (index / Math.max(1, (timeline?.length || 1) - 1)) * chartW;

  // Y coordinate for Net Confluence scale (-100.0% to +100.0%, 0% at center, 0.5% steps)
  const getYNet = (val: number) => {
    const clamped = Math.max(-100, Math.min(100, val));
    // When clamped = +100 -> top; clamped = 0 -> center; clamped = -100 -> bottom
    return padding.top + (chartH / 2) - (clamped / 100) * (chartH / 2);
  };

  // Y coordinate for 0 to 100 strength scores
  const getYRaw = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    return padding.top + chartH - (clamped / 100) * chartH;
  };

  const yZero = getYNet(0);

  // SVG Paths for Net Confluence (-100% to +100%, 0.5% resolution)
  const netPath = timeline.map((p, i) => {
    const netVal = p.netScorePercent ?? (p.bullishStrength - p.bearishStrength);
    return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYNet(netVal)}`;
  }).join(' ');

  // Positive area (above 0%)
  const positiveAreaPoints = timeline.map((p, i) => {
    const netVal = Math.max(0, p.netScorePercent ?? (p.bullishStrength - p.bearishStrength));
    return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYNet(netVal)}`;
  }).join(' ');
  const positiveAreaClosed = `${positiveAreaPoints} L ${getX(timeline.length - 1)} ${yZero} L ${getX(0)} ${yZero} Z`;

  // Negative area (below 0%)
  const negativeAreaPoints = timeline.map((p, i) => {
    const netVal = Math.min(0, p.netScorePercent ?? (p.bullishStrength - p.bearishStrength));
    return `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYNet(netVal)}`;
  }).join(' ');
  const negativeAreaClosed = `${negativeAreaPoints} L ${getX(timeline.length - 1)} ${yZero} L ${getX(0)} ${yZero} Z`;

  // Multi-curve paths (0 to 100)
  const bullishPath = timeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYRaw(p.bullishStrength)}`).join(' ');
  const bearishPath = timeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYRaw(p.bearishStrength)}`).join(' ');
  const riskPath = timeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYRaw(p.globalRiskScore)}`).join(' ');
  const macroPath = timeline.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYRaw(p.macroTrail)}`).join(' ');

  // Current session now index
  const nowIndex = timeline.findIndex((p) => p.isCurrentNow);
  const nowX = nowIndex !== -1 ? getX(nowIndex) : null;

  return (
    <div id="win_leaders_confluence_chart" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-lg">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-tech text-white flex items-center gap-2">
              <span>GRÁFICO DE CONFLUÊNCIA INTRADAY</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                5 MINUTOS // -100% a +100% (Passo 0,5%)
              </span>
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Escala temporal em intervalos de 5m (09:00 às 18:00) com confluência ponderada referenciada ao WIN
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="btn_view_net_confluence"
            onClick={() => setChartViewMode('NET_CONFLUENCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
              chartViewMode === 'NET_CONFLUENCE'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            CONFLUÊNCIA LÍQUIDA (-100% a +100%)
          </button>
          <button
            id="btn_view_multi_curves"
            onClick={() => setChartViewMode('MULTI_CURVES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
              chartViewMode === 'MULTI_CURVES'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            FORÇAS RELATIVAS (0 a 100)
          </button>
        </div>
      </div>

      {/* Legend & Resolution Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tech px-1">
        {chartViewMode === 'NET_CONFLUENCE' ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
              <span className="text-emerald-300 font-bold">🟢 CONFLUÊNCIA COMPRADORA (+0.5% a +100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-400 inline-block border-t border-dashed border-slate-400" />
              <span className="text-slate-300 font-bold">⚪ NEUTRO (0,0%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-400 rounded-full inline-block" />
              <span className="text-rose-300 font-bold">🔴 CONFLUÊNCIA VENDEDORA (-0.5% a -100%)</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
              <span className="text-emerald-300 font-bold">🟢 BULLISH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" />
              <span className="text-rose-300 font-bold">🔴 BEARISH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span className="text-amber-300 font-bold">🟡 RISCO GLOBAL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-400 inline-block" />
              <span className="text-blue-300 font-bold">🔵 MACRO TRAIL</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intervalo: <strong className="text-cyan-300">5 min</strong></span>
          <span>•</span>
          <span>Resolução: <strong className="text-emerald-300">0,5%</strong></span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
        <div className="min-w-[850px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            <defs>
              {/* Emerald positive gradient */}
              <linearGradient id="bullishAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Rose negative gradient */}
              <linearGradient id="bearishAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.45" />
              </linearGradient>

              {/* Net line glow filter */}
              <filter id="netGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* GRID & Y-AXIS LABELS */}
            {chartViewMode === 'NET_CONFLUENCE' ? (
              // Net Confluence Scale: +100% to -100%, center at 0%
              [-100, -75, -50, -25, 0, 25, 50, 75, 100].map((level) => {
                const y = getYNet(level);
                const isZero = level === 0;
                const isMajor = level === 50 || level === -50 || level === 100 || level === -100;

                return (
                  <g key={`net-level-${level}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isZero ? '#06b6d4' : isMajor ? '#334155' : '#1e293b'}
                      strokeDasharray={isZero ? 'none' : isMajor ? '4 4' : '2 3'}
                      strokeWidth={isZero ? '1.5' : '1'}
                      opacity={isZero ? '0.9' : '0.7'}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill={isZero ? '#38bdf8' : level > 0 ? '#34d399' : '#f87171'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isZero ? 'bold' : 'normal'}
                    >
                      {level > 0 ? `+${level},0%` : `${level},0%`}
                    </text>
                  </g>
                );
              })
            ) : (
              // Multi-Curves Scale: 0 to 100
              [0, 25, 50, 75, 100].map((level) => {
                const y = getYRaw(level);
                const isFifty = level === 50;

                return (
                  <g key={`raw-level-${level}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={isFifty ? '#475569' : '#1e293b'}
                      strokeDasharray={isFifty ? '4 4' : '2 2'}
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {level}
                    </text>
                  </g>
                );
              })
            )}

            {/* RENDER NET CONFLUENCE VIEW */}
            {chartViewMode === 'NET_CONFLUENCE' && (
              <>
                {/* Positive area fill */}
                <path d={positiveAreaClosed} fill="url(#bullishAreaGrad)" />
                {/* Negative area fill */}
                <path d={negativeAreaClosed} fill="url(#bearishAreaGrad)" />

                {/* Main Net Line (-100% to +100%, with 0.5% resolution steps) */}
                <path
                  d={netPath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  filter="url(#netGlow)"
                />
              </>
            )}

            {/* RENDER MULTI-CURVES VIEW */}
            {chartViewMode === 'MULTI_CURVES' && (
              <>
                <path d={macroPath} fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.8" />
                <path d={riskPath} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
                <path d={bearishPath} fill="none" stroke="#f43f5e" strokeWidth="2.5" />
                <path d={bullishPath} fill="none" stroke="#10b981" strokeWidth="2.5" />
              </>
            )}

            {/* SESSION NOW VERTICAL MARKER */}
            {nowX !== null && (
              <g>
                <line
                  x1={nowX}
                  y1={padding.top}
                  x2={nowX}
                  y2={height - padding.bottom}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx={nowX} cy={padding.top - 6} r="4" fill="#38bdf8" />
                <text
                  x={nowX}
                  y={padding.top - 12}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  AGORA
                </text>
              </g>
            )}

            {/* 5-MINUTE TICKS & INTERACTIVE HOVER COLUMNS */}
            {timeline.map((pt, i) => {
              const x = getX(i);
              const isLabelTick = i % 6 === 0; // Every 30 minutes (09:00, 09:30, 10:00, etc.)
              const netVal = pt.netScorePercent ?? (pt.bullishStrength - pt.bearishStrength);
              const nodeY = chartViewMode === 'NET_CONFLUENCE' ? getYNet(netVal) : getYRaw(pt.bullishStrength);
              const isMarked = !!pt.marker;

              return (
                <g key={`pt-${pt.formattedTime}-${i}`} className="cursor-pointer">
                  {/* Subtle 5-minute tick line at axis */}
                  <line
                    x1={x}
                    y1={height - padding.bottom}
                    x2={x}
                    y2={height - padding.bottom + (isLabelTick ? 8 : 4)}
                    stroke={isLabelTick ? '#64748b' : '#334155'}
                    strokeWidth={isLabelTick ? 1.5 : 0.8}
                  />

                  {/* Wide transparent bar for ultra-easy hover selection */}
                  <rect
                    x={x - (chartW / timeline.length) / 2}
                    y={padding.top}
                    width={chartW / timeline.length}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPoint(pt)}
                  />

                  {/* Marker badge flag */}
                  {isMarked && (
                    <g transform={`translate(${x}, ${nodeY - 14})`}>
                      <circle
                        r="5.5"
                        fill={
                          pt.marker === 'ALTA_ASSUMIU'
                            ? '#10b981'
                            : pt.marker === 'BAIXA_ASSUMIU'
                            ? '#f43f5e'
                            : pt.marker === 'DIVERGENCIA'
                            ? '#eab308'
                            : '#06b6d4'
                        }
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <line x1="0" y1="5.5" x2="0" y2="14" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  )}

                  {/* X Axis Time Labels (every 30 minutes) */}
                  {isLabelTick && (
                    <text
                      x={x}
                      y={height - padding.bottom + 22}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pt.formattedTime}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Hovered Vertical Reticle */}
            {hoveredPoint && (
              <line
                x1={getX(timeline.findIndex((p) => p.formattedTime === hoveredPoint.formattedTime))}
                y1={padding.top}
                x2={getX(timeline.findIndex((p) => p.formattedTime === hoveredPoint.formattedTime))}
                y2={height - padding.bottom}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Hovered details tooltip box with 0.5% precision */}
      {hoveredPoint ? (
        <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-500/50 text-xs font-mono grid grid-cols-2 sm:grid-cols-6 gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-in fade-in duration-150">
          <div>
            <span className="text-slate-400 block text-[10px]">HORÁRIO (5M):</span>
            <span className="text-cyan-300 font-black text-sm">{hoveredPoint.formattedTime}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">CONFLUÊNCIA LÍQUIDA:</span>
            <span className={`font-black text-sm ${(hoveredPoint.netScorePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(hoveredPoint.netScorePercent ?? 0) >= 0 ? `+${(hoveredPoint.netScorePercent ?? 0).toFixed(1)}%` : `${(hoveredPoint.netScorePercent ?? 0).toFixed(1)}%`}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">WIN ESTIMADO:</span>
            <span className="text-white font-bold">{hoveredPoint.winPrice.toLocaleString('pt-BR')} pts</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">FORÇA BULLISH:</span>
            <span className="text-emerald-300 font-bold">{hoveredPoint.bullishStrength.toFixed(1)}%</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">FORÇA BEARISH:</span>
            <span className="text-rose-300 font-bold">{hoveredPoint.bearishStrength.toFixed(1)}%</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px]">MACRO TRAIL:</span>
            <span className="text-blue-300 font-bold">{hoveredPoint.macroTrail.toFixed(1)}%</span>
          </div>

          {hoveredPoint.markerReason && (
            <div className="col-span-full pt-2 border-t border-slate-800/80 text-cyan-300 flex items-center gap-2">
              <Flag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Marcador Institucional ({hoveredPoint.marker}):</strong> {hoveredPoint.markerReason}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-center text-xs font-mono text-slate-400">
          Passe o cursor sobre os pontos de 5 em 5 minutos para inspecionar confluência líquida (-100% a +100%) com resolução de 0,5%.
        </div>
      )}
    </div>
  );
};
