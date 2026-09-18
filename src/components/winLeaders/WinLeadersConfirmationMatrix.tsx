import React from 'react';
import { ConfluenceGroupAlignment, WdoPriceState, WinPriceState } from '../../types/winGlobalLeadersTypes';
import { CheckCircle2, XCircle, MinusCircle, Layers, ArrowUpDown, ShieldCheck } from 'lucide-react';

interface WinLeadersConfirmationMatrixProps {
  groups: ConfluenceGroupAlignment[];
  winPriceState: WinPriceState;
  wdoPriceState: WdoPriceState;
}

export const WinLeadersConfirmationMatrix: React.FC<WinLeadersConfirmationMatrixProps> = ({
  groups = [],
  winPriceState,
  wdoPriceState,
}) => {
  const winReturn = winPriceState?.returnPercent ?? 0;
  const wdoReturn = wdoPriceState?.returnPercent ?? 0;
  const isWinUp = winReturn >= 0;
  const isWdoUp = wdoReturn >= 0;

  let relationshipTag = 'FLUXO MISTO';
  let relationshipColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  if (isWinUp && !isWdoUp) {
    relationshipTag = 'RISK-ON BRASIL';
    relationshipColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (!isWinUp && isWdoUp) {
    relationshipTag = 'RISK-OFF BRASIL';
    relationshipColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. MATRIZ DE CONFIRMAÇÃO DOS 9 PILARES */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech text-white">
                MATRIZ DE CONFIRMAÇÃO (9 GRUPOS INDEPENDENTES)
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Cada pilar atua como evidência autônoma no cômputo da confluência
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
            {groups.filter((g) => g.status === 'ALINHADO_ALTA').length}/9 Alinhados em Alta
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {groups.map((group) => {
            const isBull = group.status === 'ALINHADO_ALTA';
            const isBear = group.status === 'ALINHADO_BAIXA';

            return (
              <div
                key={group.groupId}
                className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                  isBull
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isBear
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-tech font-bold text-white leading-tight">
                    {group.groupName}
                  </span>
                  <span>
                    {isBull ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isBear ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <MinusCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </span>
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-400 line-clamp-2">
                  {group.summary}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Peso: {group.weight}%</span>
                  <span className={`font-bold ${isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-amber-400'}`}>
                    Score: {group.score > 0 ? `+${group.score}` : group.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MATRIZ WIN × WDO (RELAÇÃO CAMBIAL & BOLSA) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 rounded-lg">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech text-white">
                MATRIZ WIN × WDO
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Correlação cruzada e fluxo cambial
              </p>
            </div>
          </div>

          <div className="my-4 p-3 rounded-lg border text-center space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              CLASSIFICAÇÃO RELACIONAL
            </div>
            <div className={`text-lg font-black font-tech py-1 px-3 rounded-lg border inline-block ${relationshipColor}`}>
              {relationshipTag}
            </div>
            <p className="text-xs font-mono text-slate-300">
              {wdoPriceState.relationshipDescription}
            </p>
          </div>

          {/* 4 Quadrants Matrix Visual */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-tech">
            <div className={`p-2 rounded border ${
              isWinUp && !isWdoUp ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              WIN ↑ / WDO ↓
              <span className="block text-[10px] font-mono mt-0.5">RISK-ON BRASIL</span>
            </div>
            <div className={`p-2 rounded border ${
              !isWinUp && isWdoUp ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              WIN ↓ / WDO ↑
              <span className="block text-[10px] font-mono mt-0.5">RISK-OFF BRASIL</span>
            </div>
            <div className={`p-2 rounded border ${
              isWinUp && isWdoUp ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              WIN ↑ / WDO ↑
              <span className="block text-[10px] font-mono mt-0.5">FLUXO MISTO</span>
            </div>
            <div className={`p-2 rounded border ${
              !isWinUp && !isWdoUp ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' : 'bg-slate-950/40 border-slate-800 text-slate-500'
            }`}>
              WIN ↓ / WDO ↓
              <span className="block text-[10px] font-mono mt-0.5">FLUXO MISTO</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
          <span>WIN: <strong className={isWinUp ? 'text-emerald-400' : 'text-rose-400'}>{isWinUp ? `+${winPriceState.returnPercent}%` : `${winPriceState.returnPercent}%`}</strong></span>
          <span>WDO: <strong className={isWdoUp ? 'text-rose-400' : 'text-emerald-400'}>{isWdoUp ? `+${wdoPriceState.returnPercent}%` : `${wdoPriceState.returnPercent}%`}</strong></span>
        </div>
      </div>
    </div>
  );
};
