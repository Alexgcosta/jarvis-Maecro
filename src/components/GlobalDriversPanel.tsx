import React from 'react';
import { Zap, Shield, TrendingUp, TrendingDown, Layers, Compass } from 'lucide-react';

interface DriverItem {
  id: string;
  name: string;
  impact: 'ALTA' | 'BAIXA' | 'NEUTRO';
  weight: string;
  description: string;
  targetAsset: 'WIN' | 'WDO' | 'AMBOS';
}

export const GlobalDriversPanel: React.FC = () => {
  const drivers: DriverItem[] = [
    {
      id: 'd1',
      name: 'VIX em Queda & Apetite Global por Risco',
      impact: 'ALTA',
      weight: 'Alto (25%)',
      description: 'Volatilidade implícita do S&P 500 em baixa favorece fluxo comprador de ativos emergentes e impulsiona o Ibovespa.',
      targetAsset: 'WIN',
    },
    {
      id: 'd2',
      name: 'DXY / Dólar Global Estável',
      impact: 'BAIXA',
      weight: 'Alto (20%)',
      description: 'Dólar no exterior sem pressão compradora alivia a cotação do WDO no intraday.',
      targetAsset: 'WDO',
    },
    {
      id: 'd3',
      name: 'Curva de Juros DI / Treasury 10Y',
      impact: 'NEUTRO',
      weight: 'Médio (20%)',
      description: 'Yields dos Treasuries de 10 anos operam em consolidação, aguardando declarações do Fed.',
      targetAsset: 'AMBOS',
    },
    {
      id: 'd4',
      name: 'Commodities (Petróleo & Minério)',
      impact: 'ALTA',
      weight: 'Médio (15%)',
      description: 'Brent sustentado acima de $78 dá suporte às blue chips Petrobras e Vale.',
      targetAsset: 'WIN',
    },
  ];

  return (
    <section
      id="panel-global-drivers"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              MOTORES GLOBAIS DE MERCADO (DRIVERS)
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Fatores macroeconômicos determinantes no fluxo de capitais
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          ANÁLISE DE IMPACTO
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-orbitron font-bold text-xs text-slate-200">{d.name}</span>
                <span
                  className={`font-tech text-[10px] px-2 py-0.5 rounded font-bold ${
                    d.impact === 'ALTA'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : d.impact === 'BAIXA'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  IMPACTO: {d.impact}
                </span>
              </div>
              <p className="font-tech text-xs text-slate-300">{d.description}</p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-tech text-slate-400">
              <span>Peso no Modelo: <strong className="text-cyan-300">{d.weight}</strong></span>
              <span>Alvo: <strong className="text-slate-200">{d.targetAsset}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
