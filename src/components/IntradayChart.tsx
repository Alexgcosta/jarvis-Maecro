import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { IntradayTimelinePoint } from '../types/macroTypes';
import { Activity, Clock, Globe, Zap } from 'lucide-react';
import { getMarketSessionInfo } from '../data/mockMarketTimeline';

interface IntradayChartProps {
  data: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  currentTime?: string;
}

export const IntradayChart: React.FC<IntradayChartProps> = ({ data, currentTime }) => {
  const sessionInfo = getMarketSessionInfo(new Date());

  // Find the exact or closest current time point in data
  const currentPoint = data.find((d) => d.isCurrentNow) || data[Math.floor(data.length / 2)];
  const chartReferenceTick = currentPoint?.formattedTime || '13:00';
  const displayCurrentTime = currentTime || currentPoint?.formattedTime || '13:00';

  return (
    <div
      id="panel-intraday-chart"
      className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/30 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* 1. Header with 24h & Live Tracking Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-orbitron font-extrabold text-sm sm:text-base tracking-wide text-cyan-100">
              TIMELINE 24 HORAS // WIN × WDO × GLOBAL SENTIMENT
            </h2>
            <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              ESCALA 24H CONTÍNUA
            </span>
          </div>
          <p className="font-tech text-xs text-slate-300 mt-1">
            Escala horária contínua de 24 horas (00:00 às 23:55). Os gráficos acompanham em tempo real o horário do dia com alinhamento macro.
          </p>
        </div>

        {/* Live Session & Current Time Indicator */}
        <div className="flex flex-wrap items-center gap-3 font-tech">
          {/* Active Session Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-2">
            <span className="text-sm">{sessionInfo.icon}</span>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase leading-none">SESSÃO ATUAL</span>
              <span className="text-xs font-bold text-cyan-300">{sessionInfo.name}</span>
            </div>
          </div>

          {/* Current Time Clock Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <div>
              <span className="text-[10px] text-cyan-400/80 block uppercase leading-none font-bold">HORA DO DIA</span>
              <span className="text-xs font-orbitron font-extrabold text-cyan-100 tracking-wider">
                {displayCurrentTime} (AO VIVO)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 24h Global Sessions Progression Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-tech text-xs">
        <div
          className={`p-2 rounded-lg border transition-all ${
            sessionInfo.sessionKey === 'ASIA_OVERNIGHT'
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">🌙 Ásia / Overnight</span>
            <span className="text-[10px] opacity-75">00h - 06h</span>
          </div>
          <p className="text-[10px] opacity-70 mt-0.5 truncate">Tóquio, Dalian & Commodities</p>
        </div>

        <div
          className={`p-2 rounded-lg border transition-all ${
            sessionInfo.sessionKey === 'EUROPE_PREMARKET'
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">🇪🇺 Europa / Pré-Mkt</span>
            <span className="text-[10px] opacity-75">06h - 09h</span>
          </div>
          <p className="text-[10px] opacity-70 mt-0.5 truncate">Londres, EWZ & Futuros NY</p>
        </div>

        <div
          className={`p-2 rounded-lg border transition-all ${
            sessionInfo.sessionKey === 'REGULAR_SESSION'
              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">🇧🇷 Pregão Regular B3</span>
            <span className="text-[10px] opacity-75 font-orbitron text-emerald-400">09h - 18h</span>
          </div>
          <p className="text-[10px] opacity-70 mt-0.5 truncate">WIN & WDO, Wall Street, DI</p>
        </div>

        <div
          className={`p-2 rounded-lg border transition-all ${
            sessionInfo.sessionKey === 'AFTER_MARKET'
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-950/50 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1">🌐 After-Market</span>
            <span className="text-[10px] opacity-75">18h - 24h</span>
          </div>
          <p className="text-[10px] opacity-70 mt-0.5 truncate">Fechamento & Balanços Globais</p>
        </div>
      </div>

      {/* 3. Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 font-tech text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-emerald-300 font-bold">WIN Return %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="text-rose-300 font-bold">WDO Return %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
            <span className="text-sky-300 font-bold">Global Sentiment (-100 a +100)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="inline-block w-2.5 h-0.5 bg-cyan-400" />
          <span>Linha Vertical Ciano = Posição Atual no Dia</span>
        </div>
      </div>

      {/* 4. Chart Canvas: Full 24-Hour Timeline */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            
            {/* 24-Hour X-Axis */}
            <XAxis
              dataKey="formattedTime"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              interval="preserveStartEnd"
            />
            
            {/* Left Y Axis: Price return in % */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val}%`}
              domain={['auto', 'auto']}
            />

            {/* Right Y Axis: Global Sentiment -100 to +100 */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#0284c7"
              tick={{ fontSize: 11, fill: '#38bdf8' }}
              tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val}`}
              domain={[-100, 100]}
              ticks={[-100, -50, 0, 50, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#06b6d4',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 0 25px rgba(6,182,212,0.35)',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'WIN Return %') return [`${value >= 0 ? '+' : ''}${value}%`, name];
                if (name === 'WDO Return %') return [`${value >= 0 ? '+' : ''}${value}%`, name];
                if (name === 'Global Sentiment') return [`${value >= 0 ? '+' : ''}${value} pts`, name];
                return [value, name];
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

            {/* Baseline 0 Reference Lines */}
            <ReferenceLine y={0} yAxisId="left" stroke="#475569" strokeDasharray="3 3" />
            <ReferenceLine y={0} yAxisId="right" stroke="#0369a1" strokeDasharray="3 3" opacity={0.4} />

            {/* Canonical Market Session Markers */}
            <ReferenceLine
              x="09:00"
              stroke="#10b981"
              strokeDasharray="4 2"
              label={{ value: 'Abertura B3 (09:00)', fill: '#34d399', fontSize: 10, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              x="18:00"
              stroke="#f59e0b"
              strokeDasharray="4 2"
              label={{ value: 'Fechamento B3 (18:00)', fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }}
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

            {/* 1. WIN Return % in Green */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="winReturn"
              name="WIN Return %"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#065f46' }}
            />

            {/* 2. WDO Return % in Red */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wdoReturn"
              name="WDO Return %"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#f87171', stroke: '#991b1b' }}
            />

            {/* 3. Global Sentiment in Blue (-100 to +100) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="globalSentiment"
              name="Global Sentiment"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0284c7' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Footer Specs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tech text-slate-400 mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Escala: 24h Completa (00:00 às 23:55) | Sincronismo Contínuo com o Relógio do Dia</span>
        </div>
        <span className="text-cyan-300">
          WDO plotado em escala percentual real sem inversão artificial.
        </span>
      </div>
    </div>
  );
};
