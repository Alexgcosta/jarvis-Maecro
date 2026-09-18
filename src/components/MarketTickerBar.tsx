import React from 'react';
import { MacroMarketQuote } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerBarProps {
  quotes: MacroMarketQuote[];
  onSelectQuote?: (ticker: string) => void;
}

export const MarketTickerBar: React.FC<MarketTickerBarProps> = ({ quotes, onSelectQuote }) => {
  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-850 overflow-x-auto py-1.5 px-4">
      <div className="flex items-center gap-2.5 min-w-max">
        <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider pr-3 border-r border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold">COTAÇÕES GLOBAIS:</span>
        </div>

        {quotes.map((quote) => {
          return (
            <div
              key={quote.ticker}
              onClick={() => onSelectQuote && onSelectQuote(quote.ticker)}
              className="flex items-center gap-2 font-mono text-xs bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850 transition-all cursor-pointer group"
              title={`${quote.name} (${quote.category})`}
            >
              <span className="text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">
                {quote.ticker}
              </span>
              <span className="text-zinc-200 font-semibold tabular-nums">{quote.price}</span>
              <span
                className={`flex items-center text-[11px] font-semibold tabular-nums ${
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


