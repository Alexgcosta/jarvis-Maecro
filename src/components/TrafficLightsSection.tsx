import React from 'react';
import { TrafficLightState, BiasClassification } from '../types/macroTypes';
import { Shield, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Circle } from 'lucide-react';

interface TrafficLightsSectionProps {
  winLight: {
    state: TrafficLightState;
    label: string;
    description: string;
    biasScore: number;
    confidence: number;
    drivers: string[];
  };
  wdoLight: {
    state: TrafficLightState;
    label: string;
    description: string;
    biasScore: number;
    confidence: number;
    drivers: string[];
  };
}

export const TrafficLightsSection: React.FC<TrafficLightsSectionProps> = ({
  winLight,
  wdoLight,
}) => {
  const renderLightBulbs = (state: TrafficLightState) => {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
        {/* Red bulb */}
        <div
          className={`w-4 h-4 rounded-full transition-all ${
            state === 'VERMELHO'
              ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e] ring-2 ring-rose-400'
              : 'bg-rose-950/40 border border-rose-900/40 opacity-40'
          }`}
        />
        {/* Yellow bulb */}
        <div
          className={`w-4 h-4 rounded-full transition-all ${
            state === 'AMARELO'
              ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] ring-2 ring-amber-300'
              : 'bg-amber-950/40 border border-amber-900/40 opacity-40'
          }`}
        />
        {/* Green bulb */}
        <div
          className={`w-4 h-4 rounded-full transition-all ${
            state === 'VERDE'
              ? 'bg-emerald-400 shadow-[0_0_12px_#34d399] ring-2 ring-emerald-300'
              : 'bg-emerald-950/40 border border-emerald-900/40 opacity-40'
          }`}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Farol WIN */}
      <div
        id="farol-win-card"
        className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
          winLight.state === 'VERDE'
            ? 'bg-gradient-to-br from-slate-900/90 to-emerald-950/30 border-emerald-500/40'
            : winLight.state === 'VERMELHO'
            ? 'bg-gradient-to-br from-slate-900/90 to-rose-950/30 border-rose-500/40'
            : 'bg-gradient-to-br from-slate-900/90 to-amber-950/30 border-amber-500/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                  🚦 FAROL WIN // MINI ÍNDICE
                </h3>
                <span className="font-tech text-xs text-slate-400">
                  Direcional Quântico Intraday B3
                </span>
              </div>
            </div>

            {renderLightBulbs(winLight.state)}
          </div>

          <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-tech text-xs text-slate-400 block">Status Operacional</span>
              <span className="font-orbitron font-bold text-sm text-slate-100">
                {winLight.label}
              </span>
            </div>
            <div className="text-right">
              <span className="font-tech text-xs text-slate-400 block">Score / Confiança</span>
              <span className="font-mono font-bold text-sm text-cyan-300">
                {winLight.biasScore >= 0 ? `+${winLight.biasScore}` : winLight.biasScore} pts ({winLight.confidence}%)
              </span>
            </div>
          </div>

          <p className="font-tech text-xs text-slate-300 mt-3">{winLight.description}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="font-tech text-[10px] uppercase text-slate-400 tracking-wider block mb-1.5">
            Principais Drivers Confluentes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {winLight.drivers.map((driver, idx) => (
              <span
                key={idx}
                className="font-tech text-[11px] px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300"
              >
                ✓ {driver}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Farol WDO */}
      <div
        id="farol-wdo-card"
        className={`p-5 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
          wdoLight.state === 'VERDE'
            ? 'bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border-cyan-500/40'
            : wdoLight.state === 'VERMELHO'
            ? 'bg-gradient-to-br from-slate-900/90 to-rose-950/30 border-rose-500/40'
            : 'bg-gradient-to-br from-slate-900/90 to-amber-950/30 border-amber-500/40'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                  🚦 FAROL WDO // MINI DÓLAR
                </h3>
                <span className="font-tech text-xs text-slate-400">
                  Pressão Cambial & Fluxo Institucional USD/BRL
                </span>
              </div>
            </div>

            {renderLightBulbs(wdoLight.state)}
          </div>

          <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <span className="font-tech text-xs text-slate-400 block">Status Operacional</span>
              <span className="font-orbitron font-bold text-sm text-slate-100">
                {wdoLight.label}
              </span>
            </div>
            <div className="text-right">
              <span className="font-tech text-xs text-slate-400 block">Score / Confiança</span>
              <span className="font-mono font-bold text-sm text-amber-300">
                {wdoLight.biasScore >= 0 ? `+${wdoLight.biasScore}` : wdoLight.biasScore} pts ({wdoLight.confidence}%)
              </span>
            </div>
          </div>

          <p className="font-tech text-xs text-slate-300 mt-3">{wdoLight.description}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="font-tech text-[10px] uppercase text-slate-400 tracking-wider block mb-1.5">
            Condutores Cambiais:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {wdoLight.drivers.map((driver, idx) => (
              <span
                key={idx}
                className="font-tech text-[11px] px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300"
              >
                ✓ {driver}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
