import React, { useState } from 'react';
import { AssetSignal, MacroNewsItem } from '../types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  Sparkles,
  DollarSign,
  BarChart3,
  Flame,
  Zap,
  HelpCircle,
  Newspaper,
  Clock,
  ExternalLink,
  Tag,
  Filter,
  ChevronDown,
  ChevronUp,
  Minus,
  Sliders,
  Activity,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { useVolatilitySpikeDetector, VolatilityDetectorHookResult } from '../hooks/useVolatilitySpikeDetector';
import { VolatilityConfigModal } from './VolatilityConfigModal';

interface TradeSignalsPanelProps {
  dollarSignal: AssetSignal;
  indexSignal: AssetSignal;
  news?: any[];
  onAskJarvis: (prompt: string) => void;
  onOpenCalculator: (asset: 'DOL' | 'IND') => void;
  volatilityDetectorOverride?: VolatilityDetectorHookResult;
}

export const TradeSignalsPanel: React.FC<TradeSignalsPanelProps> = ({
  dollarSignal,
  indexSignal,
  news = [],
  onAskJarvis,
  onOpenCalculator,
  volatilityDetectorOverride,
}) => {
  // Background Volatility Spike Detector Engine
  const internalDetector = useVolatilitySpikeDetector({
    dollarPrice: dollarSignal.currentPrice,
    indexPrice: indexSignal.currentPrice,
    enabled: true,
  });

  const volatilityDetector = volatilityDetectorOverride || internalDetector;
  const [isVolatilityModalOpen, setIsVolatilityModalOpen] = useState<boolean>(false);

  // State for active tag filter per card
  const [dollarSelectedTag, setDollarSelectedTag] = useState<string>('ALL');
  const [indexSelectedTag, setIndexSelectedTag] = useState<string>('ALL');
  const [isDollarNewsOpen, setIsDollarNewsOpen] = useState<boolean>(true);
  const [isIndexNewsOpen, setIsIndexNewsOpen] = useState<boolean>(true);

  // Helper to filter news specifically relevant to the asset
  const getRelatedNewsForAsset = (
    asset: 'DOL' | 'IND',
    selectedTag: string
  ): { filtered: any[]; allTags: string[] } => {
    const isDollar = asset === 'DOL';

    // Primary filter: match asset-specific criteria (tags, impacts, keywords)
    const baseRelated = news.filter((item: any) => {
      // Tag matching
      const hasMatchingTag = item.tags?.some((t: string) => {
        const lower = t.toLowerCase();
        if (isDollar) {
          return (
            lower.includes('dólar') ||
            lower.includes('dolar') ||
            lower.includes('câmbio') ||
            lower.includes('cambio') ||
            lower.includes('dxy') ||
            lower.includes('usd') ||
            lower.includes('cme') ||
            lower.includes('forex') ||
            lower.includes('fed') ||
            lower.includes('treasur')
          );
        } else {
          return (
            lower.includes('bovespa') ||
            lower.includes('ibovespa') ||
            lower.includes('b3') ||
            lower.includes('ações') ||
            lower.includes('acoes') ||
            lower.includes('fiscal') ||
            lower.includes('juros') ||
            lower.includes('selic') ||
            lower.includes('copom') ||
            lower.includes('petr4') ||
            lower.includes('vale3') ||
            lower.includes('commodities') ||
            lower.includes('s&p')
          );
        }
      });

      // Impact matching
      const hasImpact = isDollar
        ? item.impactDollar !== 'NEUTRO'
        : item.impactIndex !== 'NEUTRO';

      // Keyword matching in headline or summary
      const text = `${item.headline} ${item.summary}`.toLowerCase();
      const hasKeyword = isDollar
        ? text.includes('dólar') ||
          text.includes('dolar') ||
          text.includes('câmbio') ||
          text.includes('cambio') ||
          text.includes('dxy') ||
          text.includes('usd') ||
          text.includes('cme 6l') ||
          text.includes('moeda') ||
          text.includes('fed') ||
          text.includes('treasur')
        : text.includes('bovespa') ||
          text.includes('ibovespa') ||
          text.includes('b3') ||
          text.includes('ações') ||
          text.includes('acoes') ||
          text.includes('bolsa') ||
          text.includes('fiscal') ||
          text.includes('selic') ||
          text.includes('copom') ||
          text.includes('juros') ||
          text.includes('di');

      return hasMatchingTag || hasImpact || hasKeyword;
    });

    // Extract all unique tags present in these related news
    const tagsSet = new Set<string>();
    baseRelated.forEach((item) => {
      if (item.tags) {
        item.tags.forEach((t) => tagsSet.add(t));
      }
    });

    // Apply active tag filter if selected
    const filtered =
      selectedTag === 'ALL'
        ? baseRelated
        : baseRelated.filter((item) => item.tags?.includes(selectedTag));

    return { filtered, allTags: Array.from(tagsSet) };
  };

  const renderImpactBadge = (
    asset: 'DOL' | 'IND',
    impact: 'ALTA' | 'BAIXA' | 'NEUTRO'
  ) => {
    const isDollar = asset === 'DOL';
    if (impact === 'ALTA') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-emerald-950/90 border border-emerald-500/50 text-emerald-300">
          <ArrowUpRight className="w-3 h-3" />
          {isDollar ? 'Impacto no Dólar: ALTA (+)' : 'Impacto no Índice: ALTA (+)'}
        </span>
      );
    }
    if (impact === 'BAIXA') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-tech font-bold bg-rose-950/90 border border-rose-500/50 text-rose-300">
          <ArrowDownRight className="w-3 h-3" />
          {isDollar ? 'Impacto no Dólar: QUEDA (-)' : 'Impacto no Índice: QUEDA (-)'}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-tech bg-slate-900 border border-slate-700 text-slate-400">
        <Minus className="w-3 h-3" />
        {isDollar ? 'Impacto no Dólar: Neutro' : 'Impacto no Índice: Neutro'}
      </span>
    );
  };

  const renderSignalCard = (signal: AssetSignal) => {
    if (!signal) return null;
    const isDollar = signal.asset === 'DOL';
    const isBuy = signal.action === 'BUY';
    const isSell = signal.action === 'SELL';
    const selectedTag = isDollar ? dollarSelectedTag : indexSelectedTag;
    const setSelectedTag = isDollar ? setDollarSelectedTag : setIndexSelectedTag;
    const isNewsOpen = isDollar ? isDollarNewsOpen : isIndexNewsOpen;
    const setIsNewsOpen = isDollar ? setIsDollarNewsOpen : setIsIndexNewsOpen;

    // Background Volatility Spike State for this asset
    const currentAssetVol = isDollar
      ? volatilityDetector?.dollarVolatility
      : volatilityDetector?.indexVolatility;
    const isExtremeVol = Boolean(currentAssetVol?.isExtremeVolatility);

    const { filtered: relatedNews, allTags } = getRelatedNewsForAsset(
      signal.asset,
      selectedTag
    );

    return (
      <div
        key={signal.asset}
        id={`trade-signal-card-${signal.asset.toLowerCase()}`}
        className={`flex flex-col rounded-2xl bg-slate-900/70 border backdrop-blur-md p-5 transition-all relative overflow-hidden ${
          isExtremeVol
            ? 'border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/40'
            : isBuy
            ? 'border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
            : isSell
            ? 'border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.12)]'
            : 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
        }`}
      >
        {/* Glow corner indicator */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none opacity-20 ${
            isExtremeVol
              ? 'bg-rose-600 animate-pulse'
              : isBuy
              ? 'bg-emerald-500'
              : isSell
              ? 'bg-rose-500'
              : 'bg-amber-500'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isDollar
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              }`}
            >
              {isDollar ? <DollarSign className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-bold text-sm text-cyan-50 tracking-wider">
                  {signal.name}
                </h3>
                <span className="font-tech text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-cyan-500/30 text-cyan-300">
                  {signal.ticker}
                </span>
                {/* Inline Extreme Volatility Tag */}
                {isExtremeVol && (
                  <span
                    id={`extreme-volatility-chip-${signal.asset.toLowerCase()}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/90 border border-rose-500/70 text-rose-200 font-orbitron font-bold text-[9px] tracking-wide animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                  >
                    <Flame className="w-2.5 h-2.5 text-rose-400 animate-bounce" />
                    Extreme Volatility
                  </span>
                )}
              </div>
              <span className="font-tech text-xs text-slate-400">
                Horizonte: {signal.timeframe}
              </span>
            </div>
          </div>

          {/* Action Badge & Extreme Volatility */}
          <div className="flex flex-col items-end gap-1.5">
            {/* Extreme Volatility Badge */}
            {isExtremeVol && (
              <div
                id={`extreme-volatility-badge-${signal.asset.toLowerCase()}`}
                onClick={() => {
                  soundFX.playBlip(1000);
                  setIsVolatilityModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-950/95 via-red-900/90 to-amber-950/90 border border-rose-500 text-rose-200 font-orbitron font-extrabold text-[11px] tracking-wider flex items-center gap-1.5 shadow-[0_0_16px_rgba(244,63,94,0.45)] ring-1 ring-rose-400/60 animate-pulse cursor-pointer hover:brightness-110 transition-all"
                title={`Desvio padrão das variações (σ = ${(currentAssetVol?.stdDevPriceChangePercent ?? 0).toFixed(3)}%) excedeu o limiar configurado (${(currentAssetVol?.thresholdPercent ?? 0.3).toFixed(3)}%). Clique para calibrar.`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                <span>Extreme Volatility</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300 font-bold">
                  σ {(currentAssetVol?.stdDevPriceChangePercent ?? 0).toFixed(2)}%
                </span>
              </div>
            )}

            <div
              className={`px-3.5 py-1.5 rounded-xl font-orbitron font-extrabold text-xs tracking-wider flex items-center gap-1.5 border ${
                isBuy
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : isSell
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/60'
              }`}
            >
              {isBuy ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  SINAL: COMPRA (BUY)
                </>
              ) : isSell ? (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  SINAL: VENDA (SELL)
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  SINAL: NEUTRO / ESPERA
                </>
              )}
            </div>
            <div className="font-tech text-[11px] text-slate-400 mt-1">
              Confiança: <span className="text-cyan-300 font-bold">{signal.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Volatility Metric & Background Status Strip */}
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/70 border border-cyan-500/20 mb-3 font-tech text-xs">
          <div className="flex items-center gap-2">
            <Activity className={`w-3.5 h-3.5 ${isExtremeVol ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="text-slate-400 text-[11px]">Desvio Padrão das Variações (σ):</span>
            <span className={`font-mono font-bold ${isExtremeVol ? 'text-rose-300' : 'text-cyan-200'}`}>
              {(currentAssetVol?.stdDevPriceChangePercent ?? 0).toFixed(3)}%
            </span>
            <span className="text-slate-500 text-[10px]">
              (Limiar: {(currentAssetVol?.thresholdPercent ?? (isDollar ? 0.3 : 0.35)).toFixed(2)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isExtremeVol ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-500/60 font-orbitron font-bold text-[10px] animate-pulse">
                <Flame className="w-3 h-3 text-rose-400" />
                Extreme Volatility
              </span>
            ) : (
              <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Volatilidade Normal
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                soundFX.playBlip(1000);
                setIsVolatilityModalOpen(true);
              }}
              className="text-cyan-400 hover:text-cyan-200 underline text-[10px] transition-colors ml-1"
              title="Calibrar limiar de desvio padrão e amostras"
            >
              Calibrar
            </button>
          </div>
        </div>

        {/* Prices & Target Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 font-tech text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] uppercase">Preço Atual</span>
            <div className="font-bold text-sm text-cyan-100 mt-0.5">
              {isDollar
                ? `R$ ${(typeof signal.currentPrice === 'number' && !isNaN(signal.currentPrice) ? signal.currentPrice : 5.405).toFixed(3)}`
                : `${(typeof signal.currentPrice === 'number' && !isNaN(signal.currentPrice) ? Math.round(signal.currentPrice) : 134250).toLocaleString('pt-BR')} pts`}
            </div>
            <span className={`text-[10px] font-bold ${(signal.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(signal.changePercent ?? 0) >= 0 ? `+${signal.changePercent ?? 0}%` : `${signal.changePercent ?? 0}%`}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> Preço Alvo (Gain)
            </span>
            <div className="font-bold text-sm text-emerald-300 mt-0.5">
              {isDollar
                ? `R$ ${(typeof signal.targetPrice === 'number' && !isNaN(signal.targetPrice) ? signal.targetPrice : 5.370).toFixed(3)}`
                : `${(typeof signal.targetPrice === 'number' && !isNaN(signal.targetPrice) ? Math.round(signal.targetPrice) : 135500).toLocaleString('pt-BR')} pts`}
            </div>
            <span className="text-[10px] text-slate-400">Risco/Retorno: {signal.riskRewardRatio || '1:2.0'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> Stop Loss
            </span>
            <div className="font-bold text-sm text-rose-300 mt-0.5">
              {isDollar
                ? `R$ ${(typeof signal.stopLoss === 'number' && !isNaN(signal.stopLoss) ? signal.stopLoss : 5.430).toFixed(3)}`
                : `${(typeof signal.stopLoss === 'number' && !isNaN(signal.stopLoss) ? Math.round(signal.stopLoss) : 133800).toLocaleString('pt-BR')} pts`}
            </div>
            <span className="text-[10px] text-slate-400">Proteção de Capital</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <span className="text-slate-400 text-[10px] uppercase">Suporte / Resistência</span>
            <div className="font-bold text-xs text-cyan-200 mt-0.5 truncate">
              {isDollar
                ? `S: ${(signal.supportLevel ?? 5.38).toFixed(2)} | R: ${(signal.resistanceLevel ?? 5.44).toFixed(2)}`
                : `S: ${(((signal.supportLevel ?? 133500)) / 1000).toFixed(1)}k | R: ${(((signal.resistanceLevel ?? 135000)) / 1000).toFixed(1)}k`}
            </div>
            <span className="text-[10px] text-slate-400">Níveis Técnicos</span>
          </div>
        </div>

        {/* Macro Rationale Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/25 mb-4">
          <div className="flex items-center gap-2 mb-1.5 font-tech text-xs text-cyan-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>RACIONAL MACROECONÔMICO J.A.R.V.I.S.:</span>
          </div>
          <p className="font-body text-xs text-slate-300 leading-relaxed">
            {signal.macroRationale}
          </p>

          {/* Key Drivers */}
          <div className="mt-3 pt-2.5 border-t border-cyan-500/15">
            <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
              CATALISADORES CRÍTICOS (DRIVERS):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {signal.keyDrivers.map((driver, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-cyan-500/30 font-tech text-[11px] text-cyan-200 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-cyan-400" />
                  {driver}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* NEW DYNAMIC SECTION: NOTÍCIAS RELACIONADAS AO ATIVO */}
        <div
          id={`related-news-section-${signal.asset.toLowerCase()}`}
          className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/25 mb-4 flex flex-col gap-3 transition-all"
        >
          {/* Section Header with Toggle */}
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                <Newspaper className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-orbitron font-semibold text-xs text-cyan-100 tracking-wide">
                    NOTÍCIAS RELACIONADAS // {signal.name.toUpperCase()}
                  </h4>
                  <span className="font-tech text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-bold">
                    {relatedNews.length} {relatedNews.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFX.playBlip(950);
                setIsNewsOpen(!isNewsOpen);
              }}
              className="font-tech text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 p-1"
              title={isNewsOpen ? 'Recolher notícias' : 'Expandir notícias'}
            >
              <span className="text-[10px] hidden sm:inline">
                {isNewsOpen ? 'Ocultar' : 'Expandir'}
              </span>
              {isNewsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isNewsOpen && (
            <>
              {/* Dynamic Tag Filters Bar */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="font-tech text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-cyan-400" /> Tags:
                  </span>
                  <button
                    onClick={() => {
                      soundFX.playBlip(1000);
                      setSelectedTag('ALL');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-tech whitespace-nowrap transition-all border ${
                      selectedTag === 'ALL'
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-semibold'
                        : 'bg-slate-900 border-cyan-500/20 text-slate-400 hover:text-cyan-300'
                    }`}
                  >
                    Todas ({relatedNews.length})
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        soundFX.playBlip(1050);
                        setSelectedTag(selectedTag === tag ? 'ALL' : tag);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-tech whitespace-nowrap transition-all border ${
                        selectedTag === tag
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-semibold'
                          : 'bg-slate-900 border-cyan-500/20 text-slate-400 hover:text-cyan-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* News List */}
              {relatedNews.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-cyan-500/10 text-center font-tech text-xs text-slate-400">
                  Nenhuma notícia encontrada para a tag selecionada.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {relatedNews.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col gap-2"
                    >
                      {/* Meta bar */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-tech">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-cyan-400" />
                            {item.timestamp}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-cyan-500/20 text-cyan-300">
                            {item.source}
                          </span>
                          {item.urgency === 'HIGH' && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-1 font-bold">
                              <Flame className="w-2.5 h-2.5" /> ALTO IMPACTO
                            </span>
                          )}
                        </div>

                        {item.sourceUrl && (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            referrerPolicy="no-referrer"
                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition-colors"
                            title="Abrir portal da notícia"
                          >
                            <span>Fonte</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Headline */}
                      <h5 className="font-orbitron font-semibold text-xs text-cyan-50 leading-snug">
                        {item.headline}
                      </h5>

                      {/* Summary */}
                      <p className="font-body text-[11px] text-slate-300 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Tags and Asset Impact Footnote */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/10">
                        <div className="flex items-center gap-2">
                          {renderImpactBadge(
                            signal.asset,
                            isDollar ? item.impactDollar : item.impactIndex
                          )}

                          {/* Tag chips */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1">
                              {item.tags.slice(0, 3).map((t, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    soundFX.playBlip(1000);
                                    setSelectedTag(t);
                                  }}
                                  className="text-[9px] font-tech text-slate-400 hover:text-cyan-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800"
                                >
                                  #{t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick AI Check for this specific news */}
                        <button
                          onClick={() => {
                            soundFX.playBlip(1100);
                            onAskJarvis(
                              `MCP Macro Hub, como a notícia "${item.headline}" afeta diretamente o posicionamento quantitativo de ${signal.action === 'BUY' ? 'COMPRA' : 'VENDA'} no ${signal.name} (${signal.ticker})? Devemos ajustar o alvo (${signal.targetPrice}) ou o stop loss (${signal.stopLoss})?`
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-violet-950/70 hover:bg-violet-900 border border-violet-500/30 text-violet-200 text-[10px] font-mono flex items-center gap-1 transition-all ml-auto"
                          title="Analisar impacto desta notícia na posição"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-violet-300" />
                          <span>Impacto na Operação →</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2.5 pt-1 mt-auto">
          <button
            onClick={() => {
              soundFX.playBlip(1100);
              onAskJarvis(
                `MCP Macro Hub: Analise os motivos técnicos e macroeconômicos para a recomendação de ${signal.action === 'BUY' ? 'COMPRA' : 'VENDA'} no ${signal.name} e qual a melhor estratégia quantitativa de execução agora.`
              );
            }}
            className="flex-1 px-3 py-2 rounded-xl bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 text-violet-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Análise Quantitativa ({signal.asset === 'DOL' ? 'Dólar' : 'Índice'})
          </button>

          <button
            onClick={() => {
              soundFX.playBlip(900);
              onOpenCalculator(signal.asset);
            }}
            className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-violet-900/40 hover:border-violet-500/50 text-zinc-300 hover:text-violet-200 font-mono text-xs flex items-center gap-1.5 transition-all"
            title="Calcular Posição e Gestão de Risco"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Calcular Risco (Contratos)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="trade-signals-panel" className="flex flex-col gap-5">
      {/* Top Banner Notice with Volatility Spike Engine Status & Config */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              volatilityDetector.hasExtremeVolatility ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-ping'
            }`}
          />
          <span className="font-tech text-xs text-cyan-200">
            MOTOR QUANTITATIVO STARK MACRO // SCANNER DE OPORTUNIDADES & FEED VINCULADO
          </span>
          {volatilityDetector.hasExtremeVolatility && (
            <span
              id="extreme-volatility-panel-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-950 border border-rose-500 text-rose-300 font-orbitron font-extrabold text-[10px] tracking-wider animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Extreme Volatility</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Limiar / Config button */}
          <button
            type="button"
            onClick={() => {
              soundFX.playBlip(1000);
              setIsVolatilityModalOpen(true);
            }}
            id="btn-volatility-config"
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-tech text-xs flex items-center gap-1.5 transition-all"
            title="Configurar limiar de desvio padrão e detecção de volatilidade em background"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Limiar Volatilidade: DOL {(volatilityDetector?.config?.dollarThresholdPercent ?? 0.3).toFixed(2)}% | IND {(volatilityDetector?.config?.indexThresholdPercent ?? 0.35).toFixed(2)}%
            </span>
          </button>

          <span className="font-tech text-[10px] text-slate-400">
            CALIBRAÇÃO: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Extreme Volatility Global Alert Banner when Spike is Active */}
      {volatilityDetector?.hasExtremeVolatility && (
        <div
          id="extreme-volatility-active-alert"
          className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-950/90 border border-rose-500/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-900/80 border border-rose-500/60 text-rose-200">
              <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-xs text-rose-200 tracking-wider">
                  Extreme Volatility
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-900 border border-rose-500/60 text-[10px] font-tech text-rose-200 font-bold uppercase">
                  Spike Detectado em Background ({(volatilityDetector?.activeSpikeAssets ?? []).join(' & ')})
                </span>
              </div>
              <p className="font-tech text-xs text-rose-300/90 mt-0.5">
                O desvio padrão das variações de preço superou o limiar configurável (
                {(volatilityDetector?.activeSpikeAssets ?? [])
                  .map((a) => {
                    const stdDev = a === 'DOL'
                      ? volatilityDetector?.dollarVolatility?.stdDevPriceChangePercent ?? 0
                      : volatilityDetector?.indexVolatility?.stdDevPriceChangePercent ?? 0;
                    const thresh = a === 'DOL'
                      ? volatilityDetector?.config?.dollarThresholdPercent ?? 0.3
                      : volatilityDetector?.config?.indexThresholdPercent ?? 0.35;
                    return `${a}: σ ${stdDev.toFixed(3)}% > Limiar ${thresh.toFixed(3)}%`;
                  })
                  .join(' | ')}
                ). Gestão rigorosa de risco recomendada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsVolatilityModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-tech text-xs flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustar Limiar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playBlip(900);
                volatilityDetector.resetSpikes();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-tech text-xs transition-all"
            >
              Dispensar
            </button>
          </div>
        </div>
      )}

      {/* Grid of Dollar and Index Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderSignalCard(dollarSignal)}
        {renderSignalCard(indexSignal)}
      </div>

      {/* Volatility Threshold Calibration Modal */}
      <VolatilityConfigModal
        isOpen={isVolatilityModalOpen}
        onClose={() => setIsVolatilityModalOpen(false)}
        detector={volatilityDetector}
      />
    </div>
  );
};

