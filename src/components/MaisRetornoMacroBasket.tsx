import React, { useState, useEffect } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Search,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  DollarSign,
  Flame,
  Clock
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface MacroBasketItem {
  id: string;
  name: string;
  ticker: string;
  category: string;
  basketGroup?: string;
  maisRetornoIdentifier?: string;
  value: number;
  formattedValue: string;
  changePercent: number;
  change5d?: number;
  weight: number;
  globalDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  brazilDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  winDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  wdoDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  interpretation: string;
  timestamp: string;
  formattedTime: string;
  source: string;
  delayMinutes: number;
  status: 'LIVE' | 'DELAYED' | 'STALE' | 'SIMULATED';
}

interface MacroCategory {
  id: string;
  title: string;
  description: string;
  indicators: MacroBasketItem[];
}

export const MaisRetornoMacroBasket: React.FC = () => {
  const [categories, setCategories] = useState<MacroCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');

  const fetchBasket = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/maisretorno/macro-basket');
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
        setLastSyncTime(data.lastSync || new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (err) {
      console.error('Erro ao carregar cesta macro Mais Retorno:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBasket = async () => {
    try {
      soundFX.playClick();
      setSyncing(true);
      setSyncMessage(null);
      const res = await fetch('/api/maisretorno/sync-macro-basket', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setSyncMessage(`Extração concluída em ${data.durationMs}ms com dados atualizados.`);
        await fetchBasket();
      } else {
        setSyncMessage(`Aviso: ${data.error || 'Falha na sincronização'}`);
      }
    } catch (err: any) {
      console.error('Erro ao sincronizar cesta macro:', err);
      setSyncMessage(`Erro: ${err.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  useEffect(() => {
    fetchBasket();
  }, []);

  const totalAssets = categories.reduce((acc, cat) => acc + (cat.indicators?.length || 0), 0);

  const getImpactBadge = (winDirection: string) => {
    switch (winDirection) {
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            ALTA WIN
          </span>
        );
      case 'BEARISH':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
            <TrendingDown className="w-3 h-3 text-rose-400" />
            BAIXA WIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-700">
            <Minus className="w-3 h-3" />
            NEUTRO
          </span>
        );
    }
  };

  return (
    <div id="mais-retorno-macro-basket-container" className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
                  CESTA DE EXTRAÇÃO MACRO // MAIS RETORNO API
                </h3>
                <p className="font-tech text-xs text-slate-300">
                  25+ ativos divididos rigorosamente nos 5 grupos estratégicos de impacto no Mini Índice (WIN) e no mercado financeiro brasileiro.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sincronizado: <strong className="text-cyan-300">{lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('pt-BR') : '--:--:--'}</strong></span>
            </div>

            <button
              id="btn-sync-macro-basket"
              onClick={handleSyncBasket}
              disabled={syncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'EXTRAINDO DADOS...' : 'EXTRAIR COTAÇÕES AGORA'}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-tech text-cyan-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Filter and search row */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGroupFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              TODOS ({totalAssets})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedGroupFilter(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedGroupFilter === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.title.split('/')[0]} ({cat.indicators?.length || 0})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ativo, ticker ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-tech"
            />
          </div>
        </div>
      </div>

      {/* Render 5 Strategic Groups */}
      <div className="space-y-6">
        {categories
          .filter((cat) => selectedGroupFilter === 'ALL' || selectedGroupFilter === cat.id)
          .map((cat) => {
            const filteredIndicators = (cat.indicators || []).filter((ind) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return (
                ind.name.toLowerCase().includes(q) ||
                ind.ticker.toLowerCase().includes(q) ||
                ind.id.toLowerCase().includes(q) ||
                (ind.maisRetornoIdentifier && ind.maisRetornoIdentifier.toLowerCase().includes(q))
              );
            });

            if (filteredIndicators.length === 0) return null;

            return (
              <div
                key={cat.id}
                id={`basket-group-${cat.id}`}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                      <span>{cat.title}</span>
                    </h4>
                    <p className="font-tech text-xs text-slate-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold self-start sm:self-auto">
                    {filteredIndicators.length} ATIVOS MONITORADOS
                  </span>
                </div>

                {/* Grid of Indicators in this Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredIndicators.map((ind) => {
                    const isPos = ind.changePercent > 0;
                    const isNeg = ind.changePercent < 0;

                    return (
                      <div
                        key={ind.id}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-orbitron font-bold text-xs text-cyan-200 group-hover:text-cyan-400 transition-colors">
                              {ind.ticker}
                            </span>
                            {getImpactBadge(ind.winDirection)}
                          </div>

                          <h5 className="font-tech text-xs text-slate-300 font-medium line-clamp-1" title={ind.name}>
                            {ind.name}
                          </h5>

                          <div className="mt-2.5 flex items-baseline justify-between">
                            <span className="font-mono text-base font-extrabold text-slate-100 tracking-tight">
                              {ind.formattedValue}
                            </span>
                            <div
                              className={`flex items-center gap-0.5 font-mono text-xs font-bold ${
                                isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400'
                              }`}
                            >
                              {isPos ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                              ) : isNeg ? (
                                <TrendingDown className="w-3.5 h-3.5" />
                              ) : (
                                <Minus className="w-3.5 h-3.5" />
                              )}
                              <span>{isPos ? '+' : ''}{ind.changePercent.toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>ID Mais Retorno:</span>
                            <code className="text-cyan-400 font-bold bg-slate-900 px-1 rounded">
                              {ind.maisRetornoIdentifier || `${ind.ticker.toLowerCase()}:mcp`}
                            </code>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Peso WIN:</span>
                            <span className="text-slate-300 font-bold">{ind.weight}%</span>
                          </div>
                          <p className="font-tech text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug" title={ind.interpretation}>
                            {ind.interpretation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
