import React from 'react';
import { TrafficLightState } from '../types/macroTypes';
import { Globe, Radio } from 'lucide-react';

interface GlobalTrafficLightProps {
  globalIndexState: TrafficLightState;
  globalDollarState: TrafficLightState;
  reasonIndex: string;
  reasonDollar: string;
}

export const GlobalTrafficLight: React.FC<GlobalTrafficLightProps> = ({
  globalIndexState,
  globalDollarState,
  reasonIndex,
  reasonDollar,
}) => {
  const getBadge = (state: TrafficLightState) => {
    if (state === 'VERDE') return 'bg-emerald-950/80 border-emerald-400 text-emerald-300';
    if (state === 'VERMELHO') return 'bg-rose-950/80 border-rose-400 text-rose-300';
    return 'bg-amber-950/80 border-amber-400 text-amber-300';
  };

  return (
    <section
      id="panel-global-traffic-light"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              FAROL GLOBAL // MACRO REGIME
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Consenso internacional para Risco Global (Bolsas) e Dólar (DXY/FX)
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          REGIME MACRO
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Global Equities Light */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron font-bold text-xs text-slate-200">
              BOLSAS GLOBAIS (EQUITIES)
            </span>
            <span
              className={`font-orbitron font-bold text-xs px-2.5 py-0.5 rounded border ${getBadge(
                globalIndexState
              )}`}
            >
              {globalIndexState === 'VERDE'
                ? '🟢 COMPRADOR / APETITE'
                : globalIndexState === 'VERMELHO'
                ? '🔴 VENDEDOR / AVERSÃO'
                : '🟡 AGUARDAR / NEUTRO'}
            </span>
          </div>
          <p className="font-tech text-xs text-slate-300 mt-2">{reasonIndex}</p>
        </div>

        {/* Global Dollar Light */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron font-bold text-xs text-slate-200">
              DÓLAR GLOBAL (DXY & FX)
            </span>
            <span
              className={`font-orbitron font-bold text-xs px-2.5 py-0.5 rounded border ${getBadge(
                globalDollarState
              )}`}
            >
              {globalDollarState === 'VERDE'
                ? '🟢 FORTE / ALTA DO DÓLAR'
                : globalDollarState === 'VERMELHO'
                ? '🔴 FRACO / ALÍVIO DO DÓLAR'
                : '🟡 LATERAL / CONSOLIDAÇÃO'}
            </span>
          </div>
          <p className="font-tech text-xs text-slate-300 mt-2">{reasonDollar}</p>
        </div>
      </div>
    </section>
  );
};
