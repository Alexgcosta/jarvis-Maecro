import React from 'react';
import { Percent, TrendingUp, TrendingDown, Landmark } from 'lucide-react';

export const InterestRatesPanel: React.FC = () => {
  const rates = [
    { country: '🇺🇸 Estados Unidos', asset: 'Treasury 10Y', rate: '4.22%', change: '-0.02%', status: 'Alívio' },
    { country: '🇺🇸 Estados Unidos', asset: 'Treasury 2Y', rate: '4.18%', change: '-0.03%', status: 'Alívio' },
    { country: '🇧🇷 Brasil', asset: 'Selic Meta', rate: '10.50%', change: '0.00%', status: 'Neutro' },
    { country: '🇪🇺 Zona do Euro', asset: 'German Bund 10Y', rate: '2.24%', change: '+0.01%', status: 'Estável' },
    { country: '🇯🇵 Japão', asset: 'JGB 10Y', rate: '0.88%', change: '0.00%', status: 'Carry Trade' },
    { country: '🇬🇧 Reino Unido', asset: 'Gilt 10Y', rate: '3.95%', change: '-0.01%', status: 'Alívio' },
  ];

  return (
    <section
      id="panel-interest-rates"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              ESTRUTURA GLOBAL DE TAXAS DE JUROS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Yields soberanos dos principais bancos centrais e diferencial de juros (Carry Trade)
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          GLOBAL YIELDS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {rates.map((r, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="font-tech text-[10px] text-slate-400 block">{r.country}</span>
              <span className="font-orbitron font-bold text-xs text-slate-200 block truncate mt-0.5">
                {r.asset}
              </span>
            </div>

            <div className="my-2">
              <span className="font-mono text-base font-bold text-slate-100 block">{r.rate}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  r.change.startsWith('-') ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {r.change}
              </span>
            </div>

            <span className="font-tech text-[10px] text-cyan-400 border-t border-slate-800 pt-1.5 block">
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
