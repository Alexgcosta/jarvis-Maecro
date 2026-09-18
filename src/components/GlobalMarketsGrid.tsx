import React from 'react';
import { MacroIndicator } from '../types/macroTypes';
import { Globe, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface GlobalMarketsGridProps {
  indicators: MacroIndicator[];
}

export const GlobalMarketsGrid: React.FC<GlobalMarketsGridProps> = ({ indicators }) => {
  // Filter key global indicators requested by user
  const keyAssetKeys = [
    'SP500',
    'NASDAQ',
    'VIX',
    'DXY',
    'TREASURY10Y',
    'TREASURY2Y',
    'GOLD',
    'COPPER',
    'BRENT',
    'WTI',
    'IRON_ORE',
    'SOY',
    'EWZ',
  ];

  const displayList = indicators.filter((ind) => {
    const id = ind.id || (ind as any).key;
    return keyAssetKeys.includes(id);
  });

  return (
    <section
      id="panel-global-markets"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              GLOBAL MARKETS & COMMODITIES
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Cotações em tempo real e variações dos principais ativos macro
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          MULTIMERCADO
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayList.map((asset) => {
          const id = asset.id || (asset as any).key;
          const symbol = asset.ticker || (asset as any).symbol || id;
          const val = typeof asset.value === 'number' ? asset.value : 0;
          const change = typeof asset.changePercent === 'number' ? asset.changePercent : 0;
          const isPos = change > 0;
          const isNeg = change < 0;

          return (
            <div
              key={id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-orbitron font-bold text-xs text-slate-200">
                    {symbol}
                  </span>
                  <span className="font-tech text-[10px] text-slate-400">{asset.category}</span>
                </div>
                <span className="font-tech text-[11px] text-slate-400 block truncate mt-0.5">
                  {asset.name}
                </span>
              </div>

              <div className="mt-2">
                <span className="font-mono text-sm font-bold text-slate-100 block">
                  {asset.formattedValue || val.toLocaleString('pt-BR', {
                    minimumFractionDigits: val > 100 ? 2 : 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                <div
                  className={`flex items-center gap-1 font-mono text-xs font-bold mt-0.5 ${
                    isPos
                      ? 'text-emerald-400'
                      : isNeg
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {isPos ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : isNeg ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isPos ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
