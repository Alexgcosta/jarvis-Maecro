import React from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, Shield } from 'lucide-react';
import { BiasClassification } from '../types/macroTypes';
import { SpeedometerGauge } from './SpeedometerGauge';

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
      className="p-5 rounded-2xl bg-zinc-900/90 border border-violet-900/40 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-950 border border-violet-500/40 text-violet-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-zinc-100">
              PLACAR WIN × WDO: COMPARAÇÃO DE VIÉS DIRECIONAL COM PREÇO REAL
            </h3>
            <span className="font-mono text-xs text-zinc-400">
              Cálculo quantitativo vinculado a cotações reais do Mosca Broker e correlação EWZ offshore
            </span>
          </div>
        </div>

        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-zinc-950 border border-violet-500/40 text-violet-300">
          CONFRONTO DIRECIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: WIN Card */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-heading font-bold text-xs text-emerald-300">
                  MINI ÍNDICE (WIN)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-emerald-400 block">
                  {winPrice.toLocaleString('pt-BR')} pts
                </span>
                <span className="font-mono text-[10px] text-emerald-400/80">
                  {winReturn >= 0 ? `+${winReturn.toFixed(2)}%` : `${winReturn.toFixed(2)}%`}
                </span>
              </div>
            </div>

            {/* Speedometer Gauge for WIN */}
            <div className="py-2 flex justify-center bg-zinc-900/60 rounded-xl border border-zinc-800/80 my-2">
              <SpeedometerGauge
                id="gauge-win-bias"
                value={winBiasScore}
                min={-100}
                max={100}
                unit="pts"
                size="sm"
                title="Score Direcional WIN"
                subtitle={winClassification}
                colorScheme="bidirectional"
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                {winClassification}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-300">Alvo: {winTarget.toLocaleString('pt-BR')}</span>
                <span className="text-rose-400">Stop: {winStop.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
              Drivers Confluentes WIN:
            </span>
            {winDrivers.map((d, i) => (
              <div key={i} className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: WDO Card */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-400" />
                <span className="font-heading font-bold text-xs text-amber-300">
                  MINI DÓLAR (WDO)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-amber-300 block">
                  R$ {wdoPrice.toFixed(4).replace('.', ',')}
                </span>
                <span className="font-mono text-[10px] text-rose-400">
                  {wdoReturn >= 0 ? `+${wdoReturn.toFixed(2)}%` : `${wdoReturn.toFixed(2)}%`}
                </span>
              </div>
            </div>

            {/* Speedometer Gauge for WDO */}
            <div className="py-2 flex justify-center bg-zinc-900/60 rounded-xl border border-zinc-800/80 my-2">
              <SpeedometerGauge
                id="gauge-wdo-bias"
                value={wdoBiasScore}
                min={-100}
                max={100}
                unit="pts"
                size="sm"
                title="Score Direcional WDO"
                subtitle={wdoClassification}
                colorScheme="bidirectional"
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800">
              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                {wdoClassification}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-300">Alvo: R$ {wdoTarget.toFixed(3).replace('.', ',')}</span>
                <span className="text-rose-400">Stop: R$ {wdoStop.toFixed(3).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
              Drivers Confluentes WDO:
            </span>
            {wdoDrivers.map((d, i) => (
              <div key={i} className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
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
