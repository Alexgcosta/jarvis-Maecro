import React from 'react';
import {
  BetaEngineItem,
  CorrelationEngineItem,
  DivergenceItemState,
  LeadLagItem,
} from '../../types/winGlobalLeadersTypes';
import { AlertOctagon, GitCommit, Network, Activity, BarChart2, ShieldCheck } from 'lucide-react';

interface WinLeadersDivergenceLeadLagPanelProps {
  divergences: DivergenceItemState[];
  correlations: CorrelationEngineItem[];
  betas: BetaEngineItem[];
  leadLags: LeadLagItem[];
}

export const WinLeadersDivergenceLeadLagPanel: React.FC<WinLeadersDivergenceLeadLagPanelProps> = ({
  divergences = [],
  correlations = [],
  betas = [],
  leadLags = [],
}) => {
  const safeDivergences = divergences || [];
  const safeLeadLags = leadLags || [];
  const safeCorrelations = correlations || [];
  const safeBetas = betas || [];

  return (
    <div className="space-y-4">
      {/* 1. DIVERGÊNCIAS DETECTADAS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-400/30 rounded-lg">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech text-white">
                MOTOR DE DIVERGÊNCIAS (DIVERGENCE ENGINE)
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Detecção de descompassos entre preço local, EWZ, ADRs, Macro e Câmbio
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {safeDivergences.length} Ativas
          </span>
        </div>

        {safeDivergences.length === 0 ? (
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Nenhuma divergência severa ativa. Preço local e líderes internacionais perfeitamente convergentes.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeDivergences.map((div) => (
              <div
                key={div.id}
                className={`p-3 rounded-lg border ${
                  div.severity === 'SEVERA'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-tech font-bold text-sm text-white">{div.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700">
                    {div.severity}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-1.5">{div.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. LEAD / LAG ENGINE & CORRELAÇÕES DINÂMICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* LEAD / LAG TABLE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 text-purple-400 border border-purple-400/30 rounded-lg">
                <GitCommit className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-tech text-white">
                  LEAD / LAG ENGINE (TESTES t+5m, 15m, 30m, 60m)
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Antecedência estatística observada sem assunção causal
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2">LÍDER / ATIVO</th>
                  <th className="pb-2">DEFASAGEM ÓTIMA</th>
                  <th className="pb-2">CORRELAÇÃO NO LAG</th>
                  <th className="pb-2">ESTABILIDADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {safeLeadLags.map((item) => (
                  <tr key={item.driver} className="hover:bg-slate-950/40">
                    <td className="py-2.5 font-bold text-white">{item.driver}</td>
                    <td className="py-2.5 text-cyan-300 font-bold">t + {item.bestLagMinutes} min</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{(item.correlationAtLag ?? 0).toFixed(2)}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 border border-slate-800 text-[10px]">
                        {item.stability}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CORRELAÇÕES DINÂMICAS & BETAS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 rounded-lg">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-tech text-white">
                  CORRELAÇÃO DINÂMICA (5D=40%, 10D=30%, 20D=20%, 60D=10%)
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Estabilidade Pearson e Betas do modelo
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-2">PAR</th>
                  <th className="pb-2">5D (40%)</th>
                  <th className="pb-2">DINÂMICA</th>
                  <th className="pb-2">ESTABILIDADE</th>
                  <th className="pb-2">BETA WIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {safeCorrelations.slice(0, 6).map((c) => {
                  const betaMatch = safeBetas.find((b) => c.pair.includes(b.asset))?.betaDynamic || 1.0;
                  return (
                    <tr key={c.pair} className="hover:bg-slate-950/40">
                      <td className="py-2.5 font-bold text-white">{c.pair}</td>
                      <td className="py-2.5 text-slate-300">{(c.corr5d ?? 0).toFixed(2)}</td>
                      <td className="py-2.5 text-cyan-300 font-bold">{(c.dynamicCorrelation ?? 0).toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          c.stabilityScore >= 85 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {c.stabilityScore}% ({c.stabilityClass})
                        </span>
                      </td>
                      <td className="py-2.5 text-indigo-300 font-bold">{betaMatch.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
