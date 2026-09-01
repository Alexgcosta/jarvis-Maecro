import React from 'react';
import { ShieldCheck, Cpu, Lock, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-cyan-500/20 bg-slate-950/90 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-tech text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </div>
          <div>
            <span className="font-orbitron font-bold text-slate-200">
              GLOBAL EYE // QUANTITATIVE MACRO TERMINAL
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              J.A.R.V.I.S. Core Engine v4.2 • Conformidade com Seções 1 a 77 do Manual Quântico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Princípio de Não-Circularidade Ativo
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">B3 • Fed • BCB • CME Group</span>
        </div>
      </div>
    </footer>
  );
};
