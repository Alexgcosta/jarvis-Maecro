import React from 'react';
import { Database, TrendingUp, TrendingDown, Percent, Activity } from 'lucide-react';

export const FredMacroPanel: React.FC = () => {
  const fredMetrics = [
    { name: 'Fed Funds Rate (EUA)', value: '5.25% - 5.50%', change: 'Estável', category: 'Política Monetária' },
    { name: 'US CPI / Inflação Anual', value: '2.9% a.a.', change: '-0.1%', category: 'Inflação' },
    { name: 'US Core PCE', value: '2.6% a.a.', change: 'Meta Fed 2.0%', category: 'Inflação' },
    { name: 'Non-Farm Payroll', value: '175k', change: '+12k vs Exp', category: 'Emprego' },
    { name: 'US GDP / PIB Real Q2', value: '2.8% a.a.', change: 'Expansão Sólida', category: 'Atividade Econômica' },
    { name: 'Yield Spread (10Y - 2Y)', value: '+0.04%', change: 'Desinversão Positiva', category: 'Curva de Juros' },
  ];

  return (
    <section
      id="panel-fred-macro"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              MACRO EUA // FRED ECONOMIC DATA
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Indicadores macroeconômicos fundamentais dos Estados Unidos
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          FRED / ST. LOUIS FED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {fredMetrics.map((m, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="font-tech text-[10px] text-slate-400 block">{m.category}</span>
              <span className="font-orbitron font-bold text-xs text-slate-200 block truncate mt-0.5">
                {m.name}
              </span>
            </div>

            <div className="my-2">
              <span className="font-mono text-base font-bold text-cyan-200 block">{m.value}</span>
              <span className="font-tech text-[11px] text-emerald-400">{m.change}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
