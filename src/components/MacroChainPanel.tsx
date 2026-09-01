import React from 'react';
import { ArrowRight, Link, ShieldCheck, Activity } from 'lucide-react';

export const MacroChainPanel: React.FC = () => {
  const chains = [
    {
      title: 'Cadeia Cambial & Custo de Capital',
      steps: ['DXY / Dólar Global', 'USD/BRL (Spot)', 'WDO (Mini Dólar)', 'Expectativas de Inflação', 'Curva DI', 'WIN (Mini Índice)'],
      observedCorrelation: 'Correlação observada mostra que recuo no Dólar e fechamento de juros reduzem taxa de desconto e impulsionam o Ibovespa.',
    },
    {
      title: 'Cadeia de Commodities & Inflação',
      steps: ['Petróleo Brent / Minério', 'Petrobras / Vale', 'Arrecadação Fiscal', 'Balança Comercial', 'Estabilidade Selic'],
      observedCorrelation: 'Correlação observada indica que alta nas commodities melhora os termos de troca do Brasil, atraindo fluxo cambial.',
    },
  ];

  return (
    <section
      id="panel-macro-chain"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Link className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              CADEIA MACROECONÔMICA BRASILEIRA // TRANSMISSÃO DE PREÇOS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Relações causais fundamentais e mecanismos de transmissão de política monetária
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          TRANSMISSÃO MACRO
        </span>
      </div>

      <div className="space-y-4">
        {chains.map((c, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <span className="font-orbitron font-bold text-xs text-cyan-200 block mb-3">
              {c.title}
            </span>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {c.steps.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-xs font-tech text-slate-200 font-bold">
                    {s}
                  </div>
                  {i < c.steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <p className="font-tech text-xs text-slate-300 border-t border-slate-800 pt-2.5">
              <strong className="text-cyan-300">Mecanismo Observado:</strong> {c.observedCorrelation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
