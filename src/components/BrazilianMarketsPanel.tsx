import React from 'react';
import { Flag, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { MacroIndicator } from '../types/macroTypes';

interface BrazilianMarketsPanelProps {
  indicators?: MacroIndicator[];
}

export const BrazilianMarketsPanel: React.FC<BrazilianMarketsPanelProps> = ({ indicators = [] }) => {
  const winInd = indicators.find((i) => i.id === 'WIN');
  const ibovInd = indicators.find((i) => i.id === 'IBOV');
  const wdoInd = indicators.find((i) => i.id === 'WDO');
  const usdInd = indicators.find((i) => i.id === 'USD_BRL');
  const ewzInd = indicators.find((i) => i.id === 'EWZ');
  const flowInd = indicators.find((i) => i.id === 'FOREIGN_FLOW');
  const diInd = indicators.find((i) => i.id === 'DI_FUTURO');
  const selicInd = indicators.find((i) => i.id === 'SELIC');
  const cdsInd = indicators.find((i) => i.id === 'CDS_BRASIL');

  const winValue = winInd
    ? `${Math.round(winInd.value).toLocaleString('pt-BR')} pts`
    : '186.930 pts';
  const winChange = winInd ? `${winInd.changePercent >= 0 ? '+' : ''}${winInd.changePercent.toFixed(2)}%` : '+0.39%';

  const ibovValue = ibovInd
    ? `${Math.round(ibovInd.value).toLocaleString('pt-BR')} pts`
    : '135.400 pts';
  const ibovChange = ibovInd ? `${ibovInd.changePercent >= 0 ? '+' : ''}${ibovInd.changePercent.toFixed(2)}%` : '+0.48%';

  const wdoValue = wdoInd
    ? `${wdoInd.value.toFixed(1).replace('.', ',')} pts`
    : '5.128,1 pts';
  const wdoChange = wdoInd ? `${wdoInd.changePercent >= 0 ? '+' : ''}${wdoInd.changePercent.toFixed(2)}%` : '-0.37%';

  const usdValue = usdInd
    ? `R$ ${usdInd.value.toFixed(4).replace('.', ',')}`
    : 'R$ 5,4050';
  const usdChange = usdInd ? `${usdInd.changePercent >= 0 ? '+' : ''}${usdInd.changePercent.toFixed(2)}%` : '-0.35%';

  const ewzValue = ewzInd ? `US$ ${ewzInd.value.toFixed(2).replace('.', ',')}` : 'US$ 29,85';
  const ewzChange = ewzInd ? `${ewzInd.changePercent >= 0 ? '+' : ''}${ewzInd.changePercent.toFixed(2)}%` : '+1.42%';

  const flowValue = flowInd ? `+R$ ${(flowInd.value / 1000).toFixed(2)}B` : '+R$ 1.85B';
  const flowChange = flowInd ? `${flowInd.changePercent >= 0 ? '+' : ''}${flowInd.changePercent.toFixed(1)}%` : '+15.0%';

  const diValue = diInd ? `${diInd.value.toFixed(2).replace('.', ',')}%` : '11,85%';
  const diChange = diInd ? `${diInd.changePercent >= 0 ? '+' : ''}${diInd.changePercent.toFixed(2)}%` : '-0.75%';

  const cdsValue = cdsInd ? `${cdsInd.value} pts` : '148 pts';
  const cdsChange = cdsInd ? `${cdsInd.changePercent >= 0 ? '+' : ''}${cdsInd.changePercent.toFixed(2)}%` : '-0.65%';

  const brMetrics = [
    {
      name: 'Mini Índice WIN (Futuro)',
      value: winValue,
      change: winChange,
      positive: winInd ? winInd.changePercent >= 0 : true,
      detail: `${winInd?.source || 'Mais Retorno / B3'} • Cotação Real`,
    },
    {
      name: 'Ibovespa À Vista (IBOV)',
      value: ibovValue,
      change: ibovChange,
      positive: ibovInd ? ibovInd.changePercent >= 0 : true,
      detail: 'Mercado de Ações B3 à vista',
    },
    {
      name: 'Mini Dólar (WDO) / USD',
      value: wdoValue,
      change: wdoChange,
      positive: wdoInd ? wdoInd.changePercent <= 0 : true,
      detail: `Spot: ${usdValue} (${usdChange})`,
    },
    {
      name: 'iShares MSCI Brazil (EWZ)',
      value: ewzValue,
      change: ewzChange,
      positive: ewzInd ? ewzInd.changePercent >= 0 : true,
      detail: 'Correlação Macro Offshore NY (NYSE Arca)',
    },
    {
      name: 'Fluxo Gringo B3 Acumulado',
      value: flowValue,
      change: flowChange,
      positive: flowInd ? flowInd.changePercent >= 0 : true,
      detail: 'Entrada Líquida Institucional',
    },
    {
      name: 'DI Futuro / Risco CDS',
      value: diValue,
      change: diChange,
      positive: diInd ? diInd.changePercent <= 0 : true,
      detail: `CDS 5A: ${cdsValue} (${cdsChange})`,
    },
  ];

  return (
    <section
      id="panel-brazilian-markets"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/40 text-emerald-300">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              BRASIL MACRO & FLUXO INSTITUCIONAL (B3)
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Câmbio, Índice à Vista, Risco País e Saldo de Capital Estrangeiro
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300">
          MERCADO LOCAL
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {brMetrics.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <span className="font-orbitron font-bold text-xs text-slate-300 block">
                {item.name}
              </span>
              <div className="flex items-baseline justify-between my-2">
                <span className="font-mono text-xl font-bold text-slate-100">{item.value}</span>
                <span
                  className={`font-mono text-xs font-bold ${
                    item.positive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>

            <p className="font-tech text-[11px] text-slate-400 border-t border-slate-800 pt-2 mt-1">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
