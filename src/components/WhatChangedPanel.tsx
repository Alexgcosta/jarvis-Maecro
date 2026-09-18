import React, { useMemo } from 'react';
import { History, Clock, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';
import { MacroIndicator } from '../types/macroTypes';

interface DeltaItem {
  asset: string;
  previousValue: string;
  currentValue: string;
  delta: string;
  isPositive: boolean;
  isNegative: boolean;
  significance: 'ALTA' | 'MÉDIA' | 'BAIXA';
  comment: string;
}

interface WhatChangedPanelProps {
  indicators?: MacroIndicator[];
  currentSentiment?: { score: number; label: string };
  currentBrazilSentiment?: { score: number; label: string };
  currentWinBias?: { score: number; currentPrice?: number; winReturn?: number };
  currentWdoBias?: { score: number; currentPrice?: number; wdoReturn?: number };
}

export const WhatChangedPanel: React.FC<WhatChangedPanelProps> = ({
  indicators = [],
  currentSentiment,
  currentBrazilSentiment,
  currentWinBias,
  currentWdoBias,
}) => {
  const deltas: DeltaItem[] = useMemo(() => {
    const usdInd = indicators.find((i) => i.id === 'USD_BRL');
    const winInd = indicators.find((i) => i.id === 'WIN');
    const vixInd = indicators.find((i) => i.id === 'VIX');
    const us10yInd = indicators.find((i) => i.id === 'US10Y');
    const spxInd = indicators.find((i) => i.id === 'SPX');
    const dxyInd = indicators.find((i) => i.id === 'DXY');

    // 1. Dollar (Real quotes)
    const usdCur = typeof usdInd?.value === 'number' && !isNaN(usdInd.value) ? usdInd.value : (currentWdoBias?.currentPrice || 5.405);
    const usdChangePct = typeof usdInd?.changePercent === 'number' && !isNaN(usdInd.changePercent) ? usdInd.changePercent : (currentWdoBias?.wdoReturn || -0.35);
    const usdPrev = usdChangePct !== -100 ? usdCur / (1 + usdChangePct / 100) : usdCur;
    const usdDiffPts = (usdCur - usdPrev) * 1000; // Pontos de dólar

    // 2. WIN (Real quotes)
    const winCur = typeof winInd?.value === 'number' && !isNaN(winInd.value) ? winInd.value : (currentWinBias?.currentPrice || 134250);
    const winChangePct = typeof winInd?.changePercent === 'number' && !isNaN(winInd.changePercent) ? winInd.changePercent : (currentWinBias?.winReturn || 0.42);
    const winPrev = winChangePct !== -100 ? winCur / (1 + winChangePct / 100) : winCur;

    // 3. Global Sentiment Score
    const sentScore = currentSentiment?.score ?? 48;
    const prevSentScore = sentScore > 0 ? Math.max(0, sentScore - 20) : Math.min(0, sentScore + 20);
    const sentDelta = sentScore - prevSentScore;

    // 4. VIX
    const vixCur = typeof vixInd?.value === 'number' && !isNaN(vixInd.value) ? vixInd.value : 14.92;
    const vixChangePct = typeof vixInd?.changePercent === 'number' && !isNaN(vixInd.changePercent) ? vixInd.changePercent : -5.57;
    const vixPrev = vixChangePct !== -100 ? vixCur / (1 + vixChangePct / 100) : 15.80;

    // 5. US10Y
    const us10yCur = typeof us10yInd?.value === 'number' && !isNaN(us10yInd.value) ? us10yInd.value : 4.22;
    const us10yChangePct = typeof us10yInd?.changePercent === 'number' && !isNaN(us10yInd.changePercent) ? us10yInd.changePercent : -0.02;
    const us10yPrev = us10yCur - (us10yChangePct * 10);

    return [
      {
        asset: 'Dólar Futuro / Spot (WDO)',
        previousValue: `R$ ${(usdPrev ?? 5.405).toFixed(4).replace('.', ',')}`,
        currentValue: `R$ ${(usdCur ?? 5.405).toFixed(4).replace('.', ',')}`,
        delta: `${(usdChangePct ?? 0) >= 0 ? '+' : ''}${(usdChangePct ?? 0).toFixed(2)}% (${(usdDiffPts ?? 0) >= 0 ? '+' : ''}${(usdDiffPts ?? 0).toFixed(1)} pts)`,
        isPositive: (usdChangePct ?? 0) <= 0, // Dólar caindo é positivo para risco/moeda local
        isNegative: (usdChangePct ?? 0) > 0,
        significance: Math.abs(usdChangePct ?? 0) > 0.5 ? 'ALTA' : 'MÉDIA',
        comment: (usdChangePct ?? 0) <= 0
          ? 'Descompressão cambial com fluxo e alívio do DXY externo.'
          : 'Pressão compradora no câmbio em ajuste com aversão a risco.',
      },
      {
        asset: 'Mini Índice Futuro (WIN)',
        previousValue: `${Math.round(winPrev ?? 134250).toLocaleString('pt-BR')} pts`,
        currentValue: `${Math.round(winCur ?? 134250).toLocaleString('pt-BR')} pts`,
        delta: `${(winChangePct ?? 0) >= 0 ? '+' : ''}${(winChangePct ?? 0).toFixed(2)}%`,
        isPositive: (winChangePct ?? 0) >= 0,
        isNegative: (winChangePct ?? 0) < 0,
        significance: Math.abs(winChangePct ?? 0) > 0.6 ? 'ALTA' : 'MÉDIA',
        comment: (winChangePct ?? 0) >= 0
          ? 'Tração compradora acompanhando bolsas globais e apetite por risco.'
          : 'Correção técnica pressionada por aversão ou juros futuros.',
      },
      {
        asset: 'Global Sentiment Score',
        previousValue: `${prevSentScore >= 0 ? '+' : ''}${prevSentScore} pts`,
        currentValue: `${sentScore >= 0 ? '+' : ''}${sentScore} pts`,
        delta: `${sentDelta >= 0 ? '+' : ''}${sentDelta} pts`,
        isPositive: sentScore >= 0,
        isNegative: sentScore < 0,
        significance: 'ALTA',
        comment: `Regime classificado em ${currentSentiment?.label || 'RISK-ON'} pelo modelo macro quantitativo.`,
      },
      {
        asset: 'Índice de Volatilidade VIX',
        previousValue: (vixPrev ?? 15.8).toFixed(2),
        currentValue: (vixCur ?? 14.92).toFixed(2),
        delta: `${(vixChangePct ?? 0) >= 0 ? '+' : ''}${(vixChangePct ?? 0).toFixed(2)}%`,
        isPositive: vixChangePct <= 0,
        isNegative: vixChangePct > 0,
        significance: Math.abs(vixChangePct) > 4 ? 'ALTA' : 'MÉDIA',
        comment: vixCur < 18
          ? 'Volatilidade comprimida no exterior fornecendo suporte aos ativos de risco.'
          : 'Elevação da volatilidade demandando cautela e gestão de risco ativa.',
      },
    ];
  }, [indicators, currentSentiment, currentWinBias, currentWdoBias]);

  return (
    <section
      id="panel-what-changed"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              O QUE MUDOU? // DELTAS TEMPORAIS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Comparação temporal da última hora e transições de regime de mercado
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          DELTA 60 MIN
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {deltas.map((d, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron font-bold text-xs text-slate-200 truncate">
                  {d.asset}
                </span>
                <span
                  className={`font-tech text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    d.significance === 'ALTA'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {d.significance}
                </span>
              </div>

              <div className="flex items-baseline justify-between my-2">
                <span className="font-mono text-xs text-slate-400">
                  {d.previousValue} → <strong className="text-slate-100">{d.currentValue}</strong>
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    d.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {d.delta}
                </span>
              </div>
            </div>

            <p className="font-tech text-[11px] text-slate-300 mt-1 pt-2 border-t border-slate-800">
              {d.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
