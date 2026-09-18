import React from 'react';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-heading font-semibold text-zinc-200">
              MacroDesk // Terminal Quantitativo B3 & Mercados Globais
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Inteligência Estatística Intraday para Mini Índice (WIN) e Mini Dólar (WDO)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Princípio de Não-Circularidade
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">B3 • CME • FED • BCB • Mais Retorno</span>
        </div>
      </div>
    </footer>
  );
};

