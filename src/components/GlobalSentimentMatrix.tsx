import React from 'react';
import { Layers, Globe, Shield, Activity } from 'lucide-react';

export const GlobalSentimentMatrix: React.FC = () => {
  const pillars = [
    {
      title: '1. Bolsas Internacionais (US Equities)',
      score: '+65 pts',
      state: 'Otimista',
      weight: '30%',
      items: ['S&P 500 (+0.35%)', 'Nasdaq (+0.48%)', 'Dow Jones (+0.22%)'],
    },
    {
      title: '2. Volatilidade & Renda Fixa Global',
      score: '+70 pts',
      state: 'Apetite por Risco',
      weight: '25%',
      items: ['VIX (14.92 / -5.5%)', 'US 10Y (4.22% / -2bps)'],
    },
    {
      title: '3. Moedas & Câmbio Global',
      score: '+55 pts',
      state: 'Dólar Estável',
      weight: '25%',
      items: ['DXY (104.15 / -0.12%)', 'EUR/USD (+0.15%)'],
    },
    {
      title: '4. Commodities & Energia',
      score: '+50 pts',
      state: 'Neutro / Suportado',
      weight: '20%',
      items: ['Brent ($78.40 / +0.4%)', 'Ouro ($2,410 / +0.1%)'],
    },
  ];

  return (
    <section
      id="panel-sentiment-matrix"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              MATRIZ DE SENTIMENTO GLOBAL // 4 PILARES MACRO
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Decomposição analítica dos fatores determinantes do apetite por risco
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          DECOMPOSIÇÃO
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pillars.map((p, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-orbitron font-bold text-xs text-slate-200">{p.title}</span>
                <span className="font-tech text-[10px] text-cyan-400 font-bold">{p.weight}</span>
              </div>

              <div className="flex items-baseline justify-between my-2">
                <span className="font-tech text-xs text-slate-400">Score Pilar:</span>
                <span className="font-orbitron font-bold text-lg text-emerald-400">{p.score}</span>
              </div>

              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 mb-3">
                {p.state}
              </span>

              <div className="space-y-1 border-t border-slate-800 pt-2">
                {p.items.map((it, i) => (
                  <div key={i} className="text-[11px] font-tech text-slate-400 flex items-center gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
