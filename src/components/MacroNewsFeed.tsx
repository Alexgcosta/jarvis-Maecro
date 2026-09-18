import React, { useState } from 'react';
import { MacroNewsItem } from '../types';
import {
  Newspaper,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Filter,
  DollarSign,
  BarChart3,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface MacroNewsFeedProps {
  news: MacroNewsItem[];
  onAskJarvis: (prompt: string) => void;
}

export const MacroNewsFeed: React.FC<MacroNewsFeedProps> = ({ news, onAskJarvis }) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'Todas as Notícias' },
    { id: 'CENTRAL_BANKS', label: 'Bancos Centrais & Juros' },
    { id: 'BRAZIL', label: 'Brasil & Fiscal' },
    { id: 'GLOBAL', label: 'Global & EUA' },
    { id: 'COMMODITIES', label: 'Commodities' },
  ];

  const filteredNews =
    filterCategory === 'ALL'
      ? news
      : news.filter((item) => item.category === filterCategory);

  const getImpactBadge = (asset: 'DOL' | 'IND', impact: 'ALTA' | 'BAIXA' | 'NEUTRO') => {
    const isDollar = asset === 'DOL';
    if (impact === 'ALTA') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-tech font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
          <ArrowUpRight className="w-3 h-3" />
          {isDollar ? 'Dólar: ALTA' : 'Índice: ALTA'}
        </span>
      );
    }
    if (impact === 'BAIXA') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-tech font-bold bg-rose-950/80 border border-rose-500/40 text-rose-300">
          <ArrowDownRight className="w-3 h-3" />
          {isDollar ? 'Dólar: QUEDA' : 'Índice: QUEDA'}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-tech bg-slate-900 border border-slate-700 text-slate-400">
        <Minus className="w-3 h-3" />
        {isDollar ? 'Dólar: Neutro' : 'Índice: Neutro'}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header & Filter Pills */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-cyan-100 tracking-wider">
              RADAR DE NOTÍCIAS MACROECONÔMICAS // IMPACTO NO DÓLAR & ÍNDICE
            </h2>
            <p className="font-tech text-xs text-slate-400">
              Processamento em linguagem natural de fatos relevantes, discursos e dados econômicos
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playBlip(1200);
                setFilterCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-tech text-xs whitespace-nowrap transition-all border ${
                filterCategory === cat.id
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-semibold'
                  : 'bg-slate-900/80 border-cyan-500/20 text-slate-400 hover:text-cyan-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Cards List */}
      <div className="flex flex-col gap-4">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-slate-900/70 border border-cyan-500/20 hover:border-cyan-400/40 backdrop-blur-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              {/* Meta tags */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-tech text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> {item.timestamp}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-cyan-500/20 text-cyan-300">
                    {item.source}
                  </span>
                  {item.urgency === 'HIGH' && (
                    <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> ALTO IMPACTO
                    </span>
                  )}
                </div>

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 text-xs font-tech transition-colors"
                  >
                    <span>Acessar Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Headline */}
              <h3 className="font-orbitron font-semibold text-xs sm:text-sm text-cyan-100 mb-1.5 leading-snug">
                {item.headline}
              </h3>

              {/* Summary */}
              <p className="font-body text-xs text-slate-300 leading-relaxed max-w-4xl">
                {item.summary}
              </p>

              {/* Tags & Impacts */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-cyan-500/15">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-tech text-[10px] text-slate-400 uppercase mr-1">
                    VETOR DE IMPACTO:
                  </span>
                  {getImpactBadge('DOL', item.impactDollar)}
                  {getImpactBadge('IND', item.impactIndex)}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-tech text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-500/20"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ask MCP Macro Hub button */}
            <button
              onClick={() => {
                soundFX.playBlip(1100);
                onAskJarvis(
                  `MCP Macro Hub: Analise o impacto da seguinte notícia macroeconômica no Dólar (WDO/DOL) e no Índice (WIN/IBOV): "${item.headline}". Qual a leitura de mercado e implicação para o posicionamento quantitativo intradiário?`
                );
              }}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/40 hover:bg-violet-600/30 text-violet-200 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Análise Macroeconômica da Notícia
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
