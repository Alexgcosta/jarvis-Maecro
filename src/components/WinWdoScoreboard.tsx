import React from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, Shield } from 'lucide-react';
import { BiasClassification } from '../types/macroTypes';

interface WinWdoScoreboardProps {
  winBiasScore: number;
  winClassification: BiasClassification;
  winReturn: number;
  winDrivers: string[];
  winPrice?: number;
  winTarget?: number;
  winStop?: number;
  wdoBiasScore: number;
  wdoClassification: BiasClassification;
  wdoReturn: number;
  wdoDrivers: string[];
  wdoPrice?: number;
  wdoTarget?: number;
  wdoStop?: number;
}

export const WinWdoScoreboard: React.FC<WinWdoScoreboardProps> = ({
  winBiasScore,
  winClassification,
  winReturn,
  winDrivers,
  winPrice = 134250,
  winTarget = 135550,
  winStop = 133800,
  wdoBiasScore,
  wdoClassification,
  wdoReturn,
  wdoDrivers,
  wdoPrice = 5.405,
  wdoTarget = 5.375,
  wdoStop = 5.430,
}) => {
  return (
    <section
      id="panel-win-wdo-scoreboard"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              PLACAR WIN × WDO: COMPARAÇÃO DE VIÉS DIRECIONAL COM PREÇO REAL
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Cálculo quantitativo vinculado a cotações reais do Mosca Broker e correlação EWZ offshore
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          CONFRONTO DIRECIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: WIN Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-orbitron font-bold text-xs text-emerald-300">
                  MINI ÍNDICE (WIN)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-emerald-400 block">
                  {winPrice.toLocaleString('pt-BR')} pts
                </span>
                <span className="font-tech text-[10px] text-emerald-400/80">
                  {winReturn >= 0 ? `+${winReturn.toFixed(2)}%` : `${winReturn.toFixed(2)}%`}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between my-2">
              <span className="font-tech text-xs text-slate-400">Score Direcional:</span>
              <span
                className={`font-orbitron font-bold text-2xl ${
                  winBiasScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {winBiasScore >= 0 ? `+${winBiasScore}` : winBiasScore}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-tech font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                {winClassification}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-300">Alvo: {winTarget.toLocaleString('pt-BR')}</span>
                <span className="text-rose-400">Stop: {winStop.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
            <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
              Drivers Confluentes WIN:
            </span>
            {winDrivers.map((d, i) => (
              <div key={i} className="text-[11px] font-tech text-slate-300 flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: WDO Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span className="font-orbitron font-bold text-xs text-amber-300">
                  MINI DÓLAR (WDO)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-amber-300 block">
                  R$ {wdoPrice.toFixed(4).replace('.', ',')}
                </span>
                <span className="font-tech text-[10px] text-rose-400">
                  {wdoReturn >= 0 ? `+${wdoReturn.toFixed(2)}%` : `${wdoReturn.toFixed(2)}%`}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between my-2">
              <span className="font-tech text-xs text-slate-400">Score Direcional:</span>
              <span
                className={`font-orbitron font-bold text-2xl ${
                  wdoBiasScore >= 0 ? 'text-amber-300' : 'text-cyan-300'
                }`}
              >
                {wdoBiasScore >= 0 ? `+${wdoBiasScore}` : wdoBiasScore}
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-tech font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                {wdoClassification}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-300">Alvo: R$ {wdoTarget.toFixed(3).replace('.', ',')}</span>
                <span className="text-rose-400">Stop: R$ {wdoStop.toFixed(3).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
            <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block">
              Drivers Confluentes WDO:
            </span>
            {wdoDrivers.map((d, i) => (
              <div key={i} className="text-[11px] font-tech text-slate-300 flex items-center gap-1.5">
                <span className="text-amber-400">✓</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
