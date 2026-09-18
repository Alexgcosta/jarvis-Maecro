import React from 'react';
import { LeaderRankItem } from '../../types/winGlobalLeadersTypes';
import { Crown, TrendingUp, TrendingDown, HelpCircle, Activity } from 'lucide-react';

interface WinLeadersRankingPanelProps {
  ranking: LeaderRankItem[];
}

export const WinLeadersRankingPanel: React.FC<WinLeadersRankingPanelProps> = ({ ranking }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-400/30 rounded-lg">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-tech text-white tracking-wide">
              # QUEM ESTÁ LIDERANDO O WIN?
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Ranking ordenado por contribuição ponderada e correlação dinâmica
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 self-start sm:self-auto">
          Princípio: Confluência Multi-Fatorial
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(ranking || []).map((item, index) => {
          const chg = item.changePercent ?? 0;
          const isPositive = chg >= 0;
          const contrib = item.contributionToWin ?? 0;
          const corr = item.correlation ?? 0;

          return (
            <div
              key={item.id || index}
              className={`p-3 rounded-lg border transition-all ${
                index === 0
                  ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black font-tech ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950'
                      : index === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-bold font-tech text-white block leading-tight">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] block">
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-mono font-bold block ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isPositive ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Peso: {item.weight ?? 0}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Contribuição:</span>
                  <span className={`font-bold ${
                    contrib > 0 ? 'text-emerald-300' : contrib < 0 ? 'text-rose-300' : 'text-slate-400'
                  }`}>
                    {contrib > 0 ? `+${contrib} pts` : `${contrib} pts`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Corr:</span>
                  <span className="text-cyan-400 font-bold">{corr.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
