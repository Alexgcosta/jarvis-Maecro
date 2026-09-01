import React from 'react';
import { LagCorrelationItem } from '../types/macroTypes';
import { GitCommit, Clock, BarChart3, ShieldCheck } from 'lucide-react';

interface LagAnalysisPanelProps {
  lagItems: LagCorrelationItem[];
}

export const LagAnalysisPanel: React.FC<LagAnalysisPanelProps> = ({ lagItems }) => {
  return (
    <section
      id="panel-lag-analysis"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              DESLOCAMENTO SENTIMENTO × PREÇO // DEFASAGEM E CORRELAÇÃO OBSERVADA
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Coeficiente de Pearson (r) e defasagem estatística observada em t+5m, t+15m e t+30m
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          PEARSON (r)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {lagItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron font-bold text-xs text-slate-200">
                  {item.asset} × Sentimento Macro (t+{item.lagMinutes}m)
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  r = {item.pearsonR >= 0 ? `+${item.pearsonR}` : item.pearsonR}
                </span>
              </div>

              <span className="inline-block font-tech text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 my-1">
                {item.observedCorrelation}
              </span>

              <p className="font-tech text-xs text-slate-400 mt-2">{item.interpretation}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-tech text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Janela de Observação Intradiária</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-tech text-slate-400">
        <strong className="text-cyan-300">Rigor Metodológico:</strong> Resultados expressam estritamente correlação observada em dados amostrais intradiários, sem afirmação determinística de causalidade.
      </div>
    </section>
  );
};
