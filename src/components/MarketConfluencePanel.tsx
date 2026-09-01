import React from 'react';
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
  const currentPoint = confluenceData.find((d) => d.isCurrentNow) || confluenceData[Math.floor(confluenceData.length / 2)];
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
              ESCALA 24H CONTÍNUA // CENÁRIO GLOBAL
            </span>
          </div>
          <p className="font-tech text-xs text-slate-300 mt-1">
            Escala contínua de 24 horas: o cenário global opera ininterruptamente (mesmo com a B3 fechada na Ásia, Europa e Pré-Market), direcionando WIN e WDO de acordo com o sentimento de <strong className="text-emerald-400">🟢 Otimismo (Risk-On)</strong> e <strong className="text-rose-400">🔴 Pessimismo (Risk-Off)</strong>.
          </p>
        </div>

        {/* Current Scenario Badge */}
        <div className="flex items-center gap-3">
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
              <LineChart data={confluenceData} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="formattedTime"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#06b6d4',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    boxShadow: '0 0 20px rgba(6,182,212,0.35)',
                  }}
                  formatter={(value: any, name: string) => {
                    return [`${value} / 100`, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const pt = payload?.[0]?.payload;
                    const statusTag = pt?.isCurrentNow
                      ? '● HORA ATUAL (AO VIVO)'
                      : pt?.isFuture
                      ? 'PROJEÇÃO 24H'
                      : 'CONSOLIDADO';
                    return `Horário: ${label} [${statusTag}]`;
                  }}
                />

                {/* Neutral & Level Reference Lines */}
                <ReferenceLine y={50} stroke="#475569" strokeDasharray="4 4" label={{ value: '50 (Neutro)', fill: '#64748b', fontSize: 10 }} />
                <ReferenceLine y={75} stroke="#059669" strokeDasharray="2 2" opacity={0.3} />
                <ReferenceLine y={25} stroke="#dc2626" strokeDasharray="2 2" opacity={0.3} />

                {/* Session Markers */}
                <ReferenceLine
                  x="09:00"
                  stroke="#10b981"
                  strokeDasharray="4 2"
                  label={{ value: '09h (Abertura)', fill: '#34d399', fontSize: 10, position: 'insideTopLeft' }}
                />
                <ReferenceLine
                  x="18:00"
                  stroke="#f59e0b"
                  strokeDasharray="4 2"
                  label={{ value: '18h (Fechamento)', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
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
                  type="monotone"
                  dataKey="bullishStrength"
                  name="Força de Alta"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#065f46' }}
                />

                {/* 2. 🔴 Bearish Strength (0 to 100 - non-negative) */}
                <Line
                  type="monotone"
                  dataKey="bearishStrength"
                  name="Força de Baixa"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6, fill: '#f87171', stroke: '#991b1b' }}
                />

                {/* 3. 🟡 Risk Score (0 to 100) */}
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  name="Risk Score"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 5, fill: '#fbbf24', stroke: '#b45309' }}
                />

                {/* 4. 🔵 Macro Trail (0 to 100) */}
                <Line
                  type="monotone"
                  dataKey="macroTrail"
                  name="Rastro do Macro"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0284c7' }}
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
        <span className="font-orbitron font-bold text-xs text-slate-300 tracking-wider block mb-2">
          TIMELINE DO CENÁRIO AO LONGO DA SESSÃO
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {confluenceData
            .filter((_, idx) => idx % 4 === 0 || idx === confluenceData.length - 1)
            .map((p, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-lg border text-center shrink-0 ${
                  p.scenario === 'ALTA'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : p.scenario === 'BAIXA'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                }`}
              >
                <span className="font-mono text-[10px] text-slate-400 block">{p.formattedTime}</span>
                <span className="font-orbitron font-bold text-xs">
                  {p.scenario === 'ALTA' ? '🟢 ALTA' : p.scenario === 'BAIXA' ? '🔴 BAIXA' : '🟡 AGUARDAR'}
                </span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
