import React from 'react';
import { DivergenceItem } from '../types/macroTypes';
import { AlertTriangle, ShieldCheck, Clock, Info } from 'lucide-react';

interface DivergencePanelProps {
  divergences: DivergenceItem[];
}

export const DivergencePanel: React.FC<DivergencePanelProps> = ({ divergences }) => {
  return (
    <section
      id="panel-divergences"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-400/40 text-amber-300">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              CONFLITOS E DIVERGÊNCIAS DETECTADAS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Monitor de descasamento entre Preço (WIN/WDO) e Fundamentos Macroeconômicos
            </span>
          </div>
        </div>

        <span
          className={`font-tech text-xs px-2.5 py-0.5 rounded-full font-bold border ${
            divergences.length > 0
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
          }`}
        >
          {divergences.length > 0 ? `⚠️ ${divergences.length} DIVERGÊNCIA(S)` : '🟢 SINAIS ALINHADOS'}
        </span>
      </div>

      {divergences.length > 0 ? (
        <div className="space-y-3">
          {divergences.map((div) => (
            <div
              key={div.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                div.severity === 'ALTA'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-orbitron font-bold text-xs">{div.pair}</span>
                  <span className="font-tech text-[10px] px-2 py-0.2 rounded bg-slate-950 border border-slate-700 uppercase">
                    Tipo: {div.type}
                  </span>
                  <span
                    className={`font-tech text-[10px] px-2 py-0.2 rounded font-bold ${
                      div.severity === 'ALTA' ? 'bg-rose-900 text-rose-300' : 'bg-amber-900 text-amber-300'
                    }`}
                  >
                    SEVERIDADE: {div.severity}
                  </span>
                </div>
                <p className="font-tech text-xs text-slate-200">{div.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-tech text-slate-400 shrink-0">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detectado: {div.formattedTime}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center flex items-center justify-center gap-2 text-slate-300 font-tech text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Nenhuma divergência severa ativa. O fluxo intradiário de preços reflete adequadamente os fundamentos macro.
          </span>
        </div>
      )}
    </section>
  );
};
