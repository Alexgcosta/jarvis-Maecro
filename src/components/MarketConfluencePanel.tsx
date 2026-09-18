import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ConfluencePoint, MarketCrossing, ScenarioType } from '../types/macroTypes';
import { B3_DISPLAY_X_TICKS } from '../data/mockMarketTimeline';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface MarketConfluencePanelProps {
  confluenceData: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  currentConfluence: {
    bullishStrength: number;
    bearishStrength: number;
    riskScore: number;
    macroTrail: number;
    scenario: ScenarioType;
    confidence: number;
    optimisticPct: number;
    pessimisticPct: number;
    optimisticConditions: string[];
    pessimisticConditions: string[];
    winReturn: number;
    wdoReturn: number;
    alignedCount: number;
    totalComponents: number;
    explanation: string;
    hasDivergence: boolean;
  };
  crossings: MarketCrossing[];
  currentTime?: string;
}

export const MarketConfluencePanel: React.FC<MarketConfluencePanelProps> = ({
  confluenceData,
  currentConfluence,
  crossings,
  currentTime,
}) => {
  const [sessionFilter, setSessionFilter] = useState<'REGULAR' | 'ALL'>('REGULAR');

  // Filtrar dados para o horário de funcionamento da B3 (09:00 às 18:30) por padrão
  const displayData = useMemo(() => {
    const raw = sessionFilter === 'REGULAR'
      ? confluenceData.filter((p) => {
          const [h, m] = p.formattedTime.split(':').map(Number);
          const mins = h * 60 + (m || 0);
          return mins >= 540 && mins <= 1110;
        })
      : confluenceData;

    // Assegura que pontos futuros não tenham valores de linha contínua
    return raw.map((p) => {
      if (p.isFuture) {
        return {
          ...p,
          bullishStrength: null,
          bearishStrength: null,
          riskScore: null,
          macroTrail: null,
          confluencePercentage: null,
          confidence: null,
        };
      }
      return p;
    });
  }, [confluenceData, sessionFilter]);

  const currentPoint = displayData.find((d) => d.isCurrentNow) || displayData[displayData.length - 1] || displayData[0];
  const chartReferenceTick = currentPoint?.formattedTime || '13:00';
  const displayCurrentTime = currentTime || currentPoint?.formattedTime || '13:00';

  const {
    bullishStrength = 50,
    bearishStrength = 50,
    riskScore = 50,
    macroTrail = 50,
    scenario = 'AGUARDAR',
    confidence = 50,
    optimisticPct = 50,
    pessimisticPct = 50,
    optimisticConditions = ['Apetite por risco nas bolsas globais', 'Curva de juros estável'],
    pessimisticConditions = ['Possível volatilidade cambial'],
    winReturn = 0,
    wdoReturn = 0,
    alignedCount = 2,
    totalComponents = 4,
    explanation = 'Monitorando alinhamento dos pilares macroeconômicos.',
    hasDivergence = false,
  } = currentConfluence || {};

  // Key change markers along session
  const changeMarkers = confluenceData.filter((p) => p.marker);

  return (
    <section
      id="panel-confluence-master"
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-cyan-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)]"
    >
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Layers className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wide text-cyan-100">
              RASTRO DO MACRO
            </h2>
            <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold tracking-widest uppercase">
              PREGÃO B3 // 09:00 ÀS 18:00
            </span>
          </div>
          <p className="font-tech text-xs text-slate-300 mt-1">
            Escala oficial de funcionamento da B3 (09:00 às 18:00): monitoramento contínuo das 4 forças quantitativas ao longo do pregão, direcionando WIN e WDO de acordo com o fluxo de <strong className="text-emerald-400">🟢 Otimismo (Risk-On)</strong> e <strong className="text-rose-400">🔴 Pessimismo (Risk-Off)</strong>.
          </p>
        </div>

        {/* Current Scenario Badge & Controles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Session Switcher Toggle */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-cyan-500/30 font-tech">
            <button
              onClick={() => setSessionFilter('REGULAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sessionFilter === 'REGULAR'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              🇧🇷 09h - 18h (Pregão B3)
            </button>
            <button
              onClick={() => setSessionFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sessionFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
            >
              🌐 Visão Expandida
            </button>
          </div>

          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-lg ${
              scenario === 'ALTA'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-900/30'
                : scenario === 'BAIXA'
                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-rose-900/30'
                : 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-amber-900/30'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                scenario === 'ALTA'
                  ? 'bg-emerald-400 animate-ping'
                  : scenario === 'BAIXA'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <div>
              <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider block">
                CENÁRIO: {scenario}
              </span>
              <span className="font-tech text-[10px] opacity-90">
                Confluência: {confidence}% ({alignedCount}/{totalComponents} Alinhados)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content: Chart (Left) + Scenario Probabilities (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Column: 4-Line Normalized Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-tech text-slate-400">
              <span>ESCALA DE CONFLUÊNCIA (0 A 100)</span>
            </div>

            {/* 4 Lines Legend with Section 14 colors */}
            <div className="flex flex-wrap items-center gap-3 font-tech text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="text-emerald-300 font-bold">🟢 Força de Alta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
                <span className="text-rose-300 font-bold">🔴 Força de Baixa</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                <span className="text-amber-300 font-bold">🟡 Risk Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                <span className="text-sky-300 font-bold">🔵 Rastro do Macro</span>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="formattedTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  ticks={sessionFilter === 'REGULAR' ? B3_DISPLAY_X_TICKS : undefined}
                  interval={sessionFilter === 'REGULAR' ? 0 : 'preserveStartEnd'}
                />
                <YAxis
                  stroke="#64748b"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ stroke: '#ffffff', strokeWidth: 1.2, strokeOpacity: 0.8 }}
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#06b6d4',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 0 20px rgba(6,182,212,0.35)',
                  }}
                  formatter={(value: any, name: string) => {
                    if (value === null || value === undefined) return ['Em aberto (aguardando horário)', name];
                    return [`${value} / 100`, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const pt = payload?.[0]?.payload;
                    const statusTag = pt?.isCurrentNow
                      ? '● HORA ATUAL (AO VIVO)'
                      : pt?.isFuture
                      ? 'AGUARDANDO HORÁRIO DO PREGÃO'
                      : 'CONSOLIDADO B3';
                    return `Horário: ${label} [${statusTag}]`;
                  }}
                />

                {/* Neutral & Level Reference Lines */}
                <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 4" label={{ value: '50 (Neutro)', fill: '#64748b', fontSize: 10 }} />
                <ReferenceLine y={75} stroke="#059669" strokeDasharray="2 2" opacity={0.3} />
                <ReferenceLine y={25} stroke="#dc2626" strokeDasharray="2 2" opacity={0.3} />

                {/* Marcadores de Sessão Regular B3 */}
                <ReferenceLine
                  x="09:00"
                  stroke="#10b981"
                  strokeDasharray="4 2"
                  label={{ value: '09h Abertura B3', fill: '#34d399', fontSize: 10, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  x="10:00"
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  label={{ value: '10h Ações B3', fill: '#7dd3fc', fontSize: 9, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  x="10:30"
                  stroke="#818cf8"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: '10h30 Wall St', fill: '#a5b4fc', fontSize: 9, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  x="16:30"
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  label={{ value: '16h30 Ajuste B3', fill: '#fcd34d', fontSize: 9, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  x="18:00"
                  stroke="#f43f5e"
                  strokeDasharray="4 2"
                  label={{ value: '18h Fechamento B3', fill: '#fb7185', fontSize: 10, position: 'insideTopRight' }}
                />

                {/* LIVE CURRENT TIME TRACKER LINE */}
                <ReferenceLine
                  x={chartReferenceTick}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  strokeDasharray="2 2"
                  label={{
                    value: `● AGORA (${displayCurrentTime})`,
                    fill: '#22d3ee',
                    fontSize: 11,
                    fontWeight: 'bold',
                    position: 'top',
                  }}
                />

                {/* 1. 🟢 Bullish Strength (0 to 100) */}
                <Line
                  type="linear"
                  dataKey="bullishStrength"
                  name="Força de Alta"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#22c55e', strokeWidth: 2 }}
                />

                {/* 2. 🔴 Bearish Strength (0 to 100 - non-negative) */}
                <Line
                  type="linear"
                  dataKey="bearishStrength"
                  name="Força de Baixa"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2 }}
                />

                {/* 3. 🟡 Risk Score (0 to 100) */}
                <Line
                  type="linear"
                  dataKey="riskScore"
                  name="Risk Score"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#eab308', strokeWidth: 2 }}
                />

                {/* 4. 🔵 Macro Trail (0 to 100) */}
                <Line
                  type="linear"
                  dataKey="macroTrail"
                  name="Rastro do Macro"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Change Markers Bar (Section 33) */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
              Marcadores de Transição:
            </span>
            {changeMarkers.length > 0 ? (
              changeMarkers.map((m, idx) => (
                <span
                  key={idx}
                  className={`font-tech text-[11px] px-2 py-0.5 rounded flex items-center gap-1 border ${
                    m.marker === 'ALTA_ASSUMIU'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : m.marker === 'BAIXA_ASSUMIU'
                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <strong>{m.formattedTime}</strong>
                  <span>
                    {m.marker === 'ALTA_ASSUMIU'
                      ? '🟢 ALTA ASSUMIU'
                      : m.marker === 'BAIXA_ASSUMIU'
                      ? '🔴 BAIXA ASSUMIU'
                      : '🟡 CONFLUÊNCIA PERDIDA'}
                  </span>
                </span>
              ))
            ) : (
              <span className="font-tech text-xs text-slate-400">
                Sessão em andamento sem transições bruscas de cenário.
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Cenário Otimista vs Pessimista (Sections 21 & 22) (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Cenário Otimista Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="font-orbitron font-bold text-xs text-emerald-300">
                  CENÁRIO OTIMISTA
                </span>
              </div>
              <span className="font-orbitron font-extrabold text-xl text-emerald-300">
                {optimisticPct}%
              </span>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3 border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${optimisticPct}%` }}
              />
            </div>

            <div className="space-y-1">
              {optimisticConditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-tech text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cenário Pessimista Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="font-orbitron font-bold text-xs text-rose-300">
                  CENÁRIO PESSIMISTA
                </span>
              </div>
              <span className="font-orbitron font-extrabold text-xl text-rose-300">
                {pessimisticPct}%
              </span>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3 border border-slate-800">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pessimisticPct}%` }}
              />
            </div>

            <div className="space-y-1">
              {pessimisticConditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-tech text-slate-300">
                  <span className="text-rose-400">✓</span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bloco: CONFLUÊNCIA ATUAL (Section 28) */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-orbitron font-bold text-xs text-slate-300 tracking-wider">
            CONFLUÊNCIA ATUAL DOS 4 PILARES
          </span>
          <span className="font-tech text-xs text-cyan-300">
            Alinhamento: {alignedCount} de {totalComponents} Pilares
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* WIN Pillar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 block">MINI ÍNDICE (WIN)</span>
            <span
              className={`font-orbitron font-bold text-xs block mt-1 ${
                winReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {winReturn >= 0 ? '🟢 ALTA' : '🔴 BAIXA'} ({winReturn >= 0 ? `+${winReturn}%` : `${winReturn}%`})
            </span>
          </div>

          {/* WDO Pillar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 block">MINI DÓLAR (WDO)</span>
            <span
              className={`font-orbitron font-bold text-xs block mt-1 ${
                wdoReturn <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {wdoReturn <= 0 ? '🟢 QUEDA (ALÍVIO)' : '🔴 ALTA (PRESSÃO)'} ({wdoReturn >= 0 ? `+${wdoReturn}%` : `${wdoReturn}%`})
            </span>
          </div>

          {/* MACRO Pillar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 block">RASTRO DO MACRO</span>
            <span
              className={`font-orbitron font-bold text-xs block mt-1 ${
                macroTrail >= 55 ? 'text-emerald-400' : macroTrail <= 45 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {macroTrail >= 55 ? '🟢 POSITIVO' : macroTrail <= 45 ? '🔴 NEGATIVO' : '🟡 NEUTRO'} ({macroTrail}/100)
            </span>
          </div>

          {/* RISK Pillar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center">
            <span className="font-tech text-[10px] text-slate-400 block">RISK SCORE</span>
            <span
              className={`font-orbitron font-bold text-xs block mt-1 ${
                riskScore >= 55 ? 'text-emerald-400' : riskScore <= 45 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {riskScore >= 55 ? '🟢 FAVORÁVEL' : riskScore <= 45 ? '🔴 AVERSÃO' : '🟡 NEUTRO'} ({riskScore}/100)
            </span>
          </div>

          {/* DIVERGÊNCIA Pillar */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="font-tech text-[10px] text-slate-400 block">DIVERGÊNCIAS</span>
            <span
              className={`font-orbitron font-bold text-xs block mt-1 ${
                hasDivergence ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {hasDivergence ? '⚠️ SIM (PRESENTE)' : '🟢 NÃO (ALINHADO)'}
            </span>
          </div>
        </div>

        {/* Narrative interpretation */}
        <p className="font-tech text-xs text-slate-300 mt-3 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <strong className="text-cyan-300">Interpretação Quantitativa:</strong> {explanation}
        </p>
      </div>

      {/* 4. Bloco: CRUZAMENTOS DE MERCADO (Sections 25, 26, 27) */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20">
        <span className="font-orbitron font-bold text-xs text-slate-300 tracking-wider block mb-2.5">
          CRUZAMENTOS DE VALIDAÇÃO MACRO
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {crossings.map((cross) => (
            <div
              key={cross.id}
              className={`p-3 rounded-lg border flex flex-col justify-between ${
                cross.color === 'VERDE'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : cross.color === 'VERMELHO'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron font-bold text-xs">{cross.pairName}</span>
                <span className="font-tech text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700">
                  {cross.status}
                </span>
              </div>
              <p className="font-tech text-xs mt-1">{cross.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Timeline do Cenário (Section 34) */}
      <div className="mt-4 pt-3 border-t border-cyan-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-orbitron font-bold text-xs text-slate-300 tracking-wider">
            TIMELINE DO CENÁRIO {sessionFilter === 'REGULAR' ? 'NO PREGÃO B3 (09:00 ÀS 18:00)' : 'AO LONGO DAS 24H'}
          </span>
          <span className="font-tech text-[11px] text-cyan-300 font-bold">
            {sessionFilter === 'REGULAR' ? 'Horário Oficial B3' : 'Visão Expandida'}
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {displayData
            .filter((p, idx) => {
              if (sessionFilter === 'REGULAR') {
                const parts = p.formattedTime.split(':');
                const m = Number(parts[1] || 0);
                return m === 0 || idx === displayData.length - 1 || p.isCurrentNow;
              }
              return idx % 4 === 0 || idx === displayData.length - 1 || p.isCurrentNow;
            })
            .map((p, idx) => {
              const isNow = !!p.isCurrentNow;
              const isFuture = !!p.isFuture;

              let cardStyle = 'bg-amber-950/60 border-amber-500/40 text-amber-300';
              let badgeText = '🟡 AGUARDAR';

              if (isFuture) {
                cardStyle = 'bg-slate-950/40 border-dashed border-slate-700/60 text-slate-500';
                badgeText = '⏳ AGUARDAR';
              } else if (p.scenario === 'ALTA') {
                cardStyle = 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
                badgeText = '🟢 ALTA';
              } else if (p.scenario === 'BAIXA') {
                cardStyle = 'bg-rose-950/60 border-rose-500/40 text-rose-300';
                badgeText = '🔴 BAIXA';
              }

              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border text-center shrink-0 transition-all ${cardStyle} ${
                    isNow ? 'ring-2 ring-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)] bg-cyan-950/80' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[10px] text-slate-300 block">{p.formattedTime}</span>
                    {isNow && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                  </div>
                  <span className="font-orbitron font-bold text-xs">
                    {badgeText}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};
