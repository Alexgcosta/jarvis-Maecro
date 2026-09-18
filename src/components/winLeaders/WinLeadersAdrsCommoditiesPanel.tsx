import React from 'react';
import { AdrItem, CommoditiesEngineState } from '../../types/winGlobalLeadersTypes';
import { Landmark, Flame, Droplets, TrendingUp, TrendingDown, Layers, Sparkles } from 'lucide-react';

interface WinLeadersAdrsCommoditiesPanelProps {
  adrs: AdrItem[];
  adrScore: number;
  commodities: CommoditiesEngineState;
}

export const WinLeadersAdrsCommoditiesPanel: React.FC<WinLeadersAdrsCommoditiesPanelProps> = ({
  adrs,
  adrScore,
  commodities,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. ADRs BRASILEIRAS (VALE, PBR, ITUB, BBD, ABEV, GGB) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-lg">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech text-white">
                ADRs BRASILEIRAS EM NOVA YORK (NYSE)
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Pesos: VALE (25%), PBR (25%), ITUB (20%), BBD (15%), ABEV (5%), GGB (10%)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">ADR SCORE</span>
            <span className={`text-lg font-black font-tech ${adrScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {adrScore >= 0 ? `+${adrScore}` : adrScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(adrs || []).map((adr) => {
            const price = adr.price ?? 0;
            const chg = adr.changePercent ?? 0;
            const isPos = chg >= 0;
            return (
              <div
                key={adr.symbol}
                className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-tech font-bold text-white text-sm block leading-none">{adr.symbol}</span>
                    <span className="text-[10px] font-mono text-slate-500">{adr.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {adr.weight ?? 0}%
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xs font-mono text-slate-300">US$ {price.toFixed(2)}</span>
                  <span className={`text-xs font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`}
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Força Relativa:</span>
                  <span className="text-cyan-300 font-bold">{adr.relativeStrength ?? 50}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. COMMODITIES (MINÉRIO, PETRÓLEO, COBRE, SOJA, OURO) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-400/30 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-tech text-white">
                COMMODITIES GLOBAIS & SEPARADOR DE IMPACTO
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Minério, Cobre, Soja e Petróleo (Benefício Fiscal vs Risco Inflação)
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block">COMMODITY SCORE</span>
            <span className={`text-lg font-black font-tech ${commodities.compositeCommodityScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {commodities.compositeCommodityScore >= 0 ? `+${commodities.compositeCommodityScore}` : commodities.compositeCommodityScore}
            </span>
          </div>
        </div>

        {/* Oil Impact Split Banner */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="border-r border-slate-800 pr-2">
            <span className="text-emerald-400 font-bold block">PETRÓLEO &rarr; BENEFÍCIO BRASIL</span>
            <span className="text-slate-400 text-[11px]">Geração caixa Petrobras & Royalties (+{commodities.oilBrazilBenefit} pts)</span>
          </div>
          <div className="pl-1">
            <span className="text-amber-400 font-bold block">PETRÓLEO &rarr; RISCO INFLAÇÃO</span>
            <span className="text-slate-400 text-[11px]">Pressão em combustíveis e juros (-{commodities.oilInflationRisk} pts)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(commodities?.items || []).map((c) => {
            const price = c.price ?? 0;
            const chg = c.changePercent ?? 0;
            const isPos = chg >= 0;
            return (
              <div
                key={c.id}
                className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className="font-tech font-bold text-white text-xs block leading-tight truncate">{c.name}</span>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs font-mono text-slate-300">{price.toFixed(1)}</span>
                  <span className={`text-xs font-mono font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`}
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Impacto WIN:</span>
                  <span className={`font-bold ${(c.score ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {(c.score ?? 0) >= 0 ? `+${c.score ?? 0}` : c.score ?? 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
