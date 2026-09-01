import React from 'react';
import { Flame, Droplets, Gem, TrendingUp, TrendingDown } from 'lucide-react';

export const CommoditiesPanel: React.FC = () => {
  const comms = [
    { name: 'Petróleo Brent', symbol: 'BRENT', price: '$78.42 / bbl', change: '+0.45%', impact: 'Suporte a PETR4 (+0.6%)' },
    { name: 'Petróleo WTI', symbol: 'WTI', price: '$74.15 / bbl', change: '+0.38%', impact: 'Demanda Global Estável' },
    { name: 'Ouro Spot', symbol: 'GOLD', price: '$2,412.50 / oz', change: '+0.12%', impact: 'Hedge Geopolítico Ativo' },
    { name: 'Minério de Ferro (Dalian)', symbol: 'IRON_ORE', price: '$104.80 / t', change: '+1.15%', impact: 'Impulso Direto a VALE3 (+1.2%)' },
    { name: 'Cobre Futuro', symbol: 'COPPER', price: '$4.18 / lb', change: '+0.62%', impact: 'Barômetro de Atividade Global' },
    { name: 'Soja Chicago', symbol: 'SOYBEAN', price: '$1,024 / bu', change: '-0.30%', impact: 'Safra Agrícola BR' },
  ];

  return (
    <section
      id="panel-commodities"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              COMMODITIES // ENERGIA, METAIS & AGRÍCOLAS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Cotações e impacto direto no peso das exportadoras brasileiras (Vale, Petrobras)
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          COMMODITIES
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {comms.map((c, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="font-tech text-[10px] text-slate-400 block">{c.symbol}</span>
              <span className="font-orbitron font-bold text-xs text-slate-200 block truncate mt-0.5">
                {c.name}
              </span>
            </div>

            <div className="my-2">
              <span className="font-mono text-sm font-bold text-slate-100 block">{c.price}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  c.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {c.change}
              </span>
            </div>

            <p className="font-tech text-[10px] text-slate-400 border-t border-slate-800 pt-1 mt-1 truncate">
              {c.impact}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
