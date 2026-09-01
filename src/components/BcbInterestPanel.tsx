import React from 'react';
import { Landmark, TrendingUp, TrendingDown, Clock, Percent } from 'lucide-react';

export const BcbInterestPanel: React.FC = () => {
  const diCurve = [
    { maturity: 'DI1F25', rate: '10.65%', change: '-0.02%', status: 'Alívio' },
    { maturity: 'DI1F26', rate: '11.15%', change: '-0.04%', status: 'Fechamento' },
    { maturity: 'DI1F27', rate: '11.60%', change: '-0.03%', status: 'Fechamento' },
    { maturity: 'DI1F29', rate: '12.05%', change: '+0.01%', status: 'Estável' },
    { maturity: 'DI1F31', rate: '12.28%', change: '+0.02%', status: 'Prêmio Leve' },
  ];

  return (
    <section
      id="panel-bcb-interest"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/40 text-emerald-300">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              JUROS BRASIL // BANCO CENTRAL & ESTRUTURA A TERMO (DI)
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Taxa Selic Meta: <strong>10.50% a.a.</strong> | Curva de Juros Futuros B3
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
          CURVA DI
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {diCurve.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-orbitron font-bold text-xs text-slate-200">{item.maturity}</span>
              <span className="font-tech text-[10px] text-slate-400">{item.status}</span>
            </div>

            <div className="my-2">
              <span className="font-mono text-lg font-bold text-slate-100 block">{item.rate}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  item.change.startsWith('-') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.change}
              </span>
            </div>

            <span className="font-tech text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 block">
              {item.change.startsWith('-') ? 'Fechamento de Curva' : 'Abertura de Curva'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
