import React from 'react';
import { MacroMarketQuote } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface MarketTickerBarProps {
  quotes: MacroMarketQuote[];
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({ quotes }) => {
  return (
    <div className="w-full bg-slate-950/90 border-b border-cyan-500/25 backdrop-blur-md overflow-x-auto no-scrollbar py-2 px-4 shadow-[0_2px_15px_rgba(6,182,212,0.1)]">
      <div className="flex items-center gap-6 min-w-max">
        <div className="flex items-center gap-1.5 text-cyan-400 font-tech text-[11px] uppercase tracking-wider pr-2 border-r border-cyan-500/20">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>STARK QUANT FEED // REAL-TIME MACRO:</span>
        </div>

        {quotes.map((quote) => {
          return (
            <div
              key={quote.ticker}
              className="flex items-center gap-2 font-tech text-xs bg-slate-900/60 px-3 py-1 rounded-lg border border-cyan-500/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
              title={`${quote.name} (${quote.category})`}
            >
              <span className="text-slate-300 font-semibold">{quote.ticker}</span>
              <span className="text-cyan-100 font-bold">{quote.price}</span>
              <span
                className={`flex items-center text-[11px] font-bold ${
                  quote.positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {quote.positive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {quote.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
