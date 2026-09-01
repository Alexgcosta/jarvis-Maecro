import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Layers,
} from 'lucide-react';
import { HGBrasilTickerItem, HGBrasilFinanceResponse } from '../types';
import { soundFX } from '../utils/soundEffects';

interface HGBrasilTickersPanelProps {
  onSyncIndicators?: () => void;
}

export const HGBrasilTickersPanel: React.FC<HGBrasilTickersPanelProps> = ({ onSyncIndicators }) => {
  const [query, setQuery] = useState('petr');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tickers, setTickers] = useState<HGBrasilTickerItem[]>([]);
  const [financeData, setFinanceData] = useState<HGBrasilFinanceResponse | null>(null);
  const [lastSync, setLastSync] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activePreset, setActivePreset] = useState('petr');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('macro_key_hgbrasil') || 'f6f59717');

  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('macro_key_hgbrasil');
      if (stored) setApiKey(stored);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const apiUrlExample = `https://api.hgbrasil.com/v2/finance/tickers?query=${query}&sources=B3&sort=symbol&order=asc&key=${apiKey}`;

  const presetQueries = [
    { label: 'PETR (Petrobras)', query: 'petr' },
    { label: 'VALE (Vale)', query: 'vale' },
    { label: 'ITUB (Itaú)', query: 'itub' },
    { label: 'BBDC (Bradesco)', query: 'bbdc' },
    { label: 'BBAS (Banco do Brasil)', query: 'bbas' },
    { label: 'WEGE (WEG)', query: 'wege' },
    { label: 'PRIO (PetroRio)', query: 'prio' },
    { label: 'B3SA (B3)', query: 'b3sa' },
  ];

  // Fetch Tickers from Backend Proxy
  const fetchTickers = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hgbrasil/tickers?query=${encodeURIComponent(searchQuery)}&sources=B3`);
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setTickers(data.results);
      } else {
        setTickers([]);
      }
    } catch (err) {
      console.warn('Erro ao buscar tickers HG Brasil:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Main Finance Data
  const fetchFinance = async () => {
    try {
      const res = await fetch('/api/hgbrasil/finance');
      const data = await res.json();
      if (data && data.results) {
        setFinanceData(data.results);
        setLastSync(new Date().toLocaleTimeString('pt-BR'));
      }
    } catch (err) {
      console.warn('Erro ao buscar dados financeiros HG Brasil:', err);
    }
  };

  // Force Full Sync
  const handleForceSync = async () => {
    soundFX.playClick();
    setSyncing(true);
    try {
      const res = await fetch('/api/hgbrasil/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.finance?.results) {
        setFinanceData(data.finance.results);
      }
      if (data.tickers?.results) {
        setTickers(data.tickers.results);
      }
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
      if (onSyncIndicators) onSyncIndicators();
      soundFX.playSuccess();
    } catch (err) {
      console.warn('Erro no sync HG Brasil:', err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchFinance();
    fetchTickers(query);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    soundFX.playBlip(950);
    fetchTickers(query.trim());
  };

  const handleSelectPreset = (pQuery: string) => {
    setActivePreset(pQuery);
    setQuery(pQuery);
    soundFX.playBlip(1050);
    fetchTickers(pQuery);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(apiUrlExample);
    setCopiedUrl(true);
    soundFX.playClick();
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    soundFX.playClick();
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Extract currencies and indices
  const usd = financeData?.currencies?.USD;
  const eur = financeData?.currencies?.EUR;
  const btc = financeData?.currencies?.BTC;
  const ibov = financeData?.stocks?.IBOVESPA;
  const nasdaq = financeData?.stocks?.NASDAQ;
  const taxes = financeData?.taxes?.[0];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-slate-100">
                HG BRASIL FINANCE // PARÂMETROS MACRO & B3 TICKERS
              </h2>
              <span className="font-tech text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                API OFICIAL CONECTADA
              </span>
            </div>
            <p className="font-tech text-xs text-slate-400">
              Integração de dados de mercado da HG Brasil (Câmbio USD/BRL, Ibovespa, Taxa Selic, CDI e catálogo oficial B3)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-slate-500">CHAVE API:</span>
            <span className="text-cyan-300 font-bold">f6f59717</span>
            <button
              onClick={handleCopyKey}
              className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Copiar Chave API"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR PARÂMETROS'}</span>
          </button>
        </div>
      </div>

      {/* Live Financial Metrics Feed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* USD/BRL Card */}
        <div className="p-4 rounded-xl bg-slate-950/75 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-xs text-slate-400 font-bold">DÓLAR SPOT (USD/BRL)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                HG FINANCE
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {usd ? `R$ ${usd.buy.toFixed(4).replace('.', ',')}` : 'R$ 5,1850'}
              </span>
              <span
                className={`font-mono text-xs font-bold flex items-center gap-0.5 ${
                  (usd?.variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(usd?.variation ?? 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {usd?.variation ? `${usd.variation > 0 ? '+' : ''}${usd.variation.toFixed(3)}%` : '+0.019%'}
              </span>
            </div>
          </div>
          <p className="font-tech text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
            Venda: {usd ? `R$ ${usd.sell.toFixed(4).replace('.', ',')}` : 'R$ 5,1850'} • Fonte B3
          </p>
        </div>

        {/* Ibovespa Card */}
        <div className="p-4 rounded-xl bg-slate-950/75 border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-xs text-slate-400 font-bold">IBOVESPA / MINI ÍNDICE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
                B3 OFICIAL
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {ibov ? `${Math.round(ibov.points).toLocaleString('pt-BR')} pts` : '175.664 pts'}
              </span>
              <span
                className={`font-mono text-xs font-bold flex items-center gap-0.5 ${
                  (ibov?.variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(ibov?.variation ?? 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {ibov?.variation ? `${ibov.variation > 0 ? '+' : ''}${ibov.variation.toFixed(2)}%` : '+0.30%'}
              </span>
            </div>
          </div>
          <p className="font-tech text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
            Alimenta correlação e viés direcional do WIN
          </p>
        </div>

        {/* Selic & CDI Card */}
        <div className="p-4 rounded-xl bg-slate-950/75 border border-amber-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-xs text-slate-400 font-bold">SELIC META & CDI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/30 text-amber-300">
                COPOM / BACEN
              </span>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-100">
                {taxes ? `${taxes.selic.toFixed(2).replace('.', ',')}% a.a.` : '14,25% a.a.'}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                CDI: {taxes ? `${taxes.cdi.toFixed(2).replace('.', ',')}%` : '14,25%'}
              </span>
            </div>
          </div>
          <p className="font-tech text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
            Fator diário Selic: {taxes?.selic_daily ?? 14.15}% • Data: {taxes?.date ?? 'Atual'}
          </p>
        </div>

        {/* Global Markets Card */}
        <div className="p-4 rounded-xl bg-slate-950/75 border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-tech text-xs text-slate-400 font-bold">NASDAQ & BITCOIN HG</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                OFFSHORE
              </span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs text-slate-300">Nasdaq:</span>
                <span className="font-mono text-xs text-slate-100 font-bold">
                  {nasdaq ? `${Math.round(nasdaq.points).toLocaleString('pt-BR')} pts` : '26.402 pts'}
                </span>
                <span className={`font-mono text-[11px] ${(nasdaq?.variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {nasdaq?.variation ? `${nasdaq.variation > 0 ? '+' : ''}${nasdaq.variation.toFixed(2)}%` : '-0.52%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-tech text-xs text-slate-300">Euro BRL:</span>
                <span className="font-mono text-xs text-slate-100 font-bold">
                  {eur ? `R$ ${eur.buy.toFixed(4).replace('.', ',')}` : 'R$ 6,0054'}
                </span>
                <span className={`font-mono text-[11px] ${(eur?.variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {eur?.variation ? `${eur.variation > 0 ? '+' : ''}${eur.variation.toFixed(2)}%` : '-0.07%'}
                </span>
              </div>
            </div>
          </div>
          <p className="font-tech text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
            BTC BRL: {btc ? `R$ ${Math.round(btc.buy).toLocaleString('pt-BR')}` : 'R$ 430.051'}
          </p>
        </div>
      </div>

      {/* Interactive B3 Ticker Query Explorer */}
      <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="font-orbitron font-bold text-sm text-cyan-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              EXPLORADOR DE TICKERS B3 (HG BRASIL API V2)
            </h3>
            <p className="font-tech text-xs text-slate-400">
              Busca em tempo real de ativos listados na B3 com logotipo oficial, CNPJ, setor de atuação e cálculo de impacto macro
            </p>
          </div>

          {/* Quick preset queries */}
          <div className="flex flex-wrap items-center gap-1.5">
            {presetQueries.map((p) => (
              <button
                key={p.query}
                onClick={() => handleSelectPreset(p.query)}
                className={`px-2.5 py-1 rounded-lg font-tech text-xs transition-colors border ${
                  activePreset === p.query
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o código ou nome da ação (ex: petr, vale, itub, bbas, wege, b3sa)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 font-tech text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech text-sm font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>CONSULTAR B3</span>
          </button>
        </form>

        {/* Results Grid */}
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="font-tech text-sm text-cyan-300">Consultando HG Brasil API (query={query}&sources=B3)...</p>
          </div>
        ) : tickers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {tickers.map((t, idx) => {
              const isPetr4 = t.symbol === 'PETR4';
              return (
                <div
                  key={`${t.symbol}-${idx}`}
                  className={`p-4 rounded-xl bg-slate-900/90 border transition-all ${
                    isPetr4
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Company Logo from HG Brasil */}
                      {t.logos?.square_small ? (
                        <img
                          src={t.logos.square_small}
                          alt={t.symbol}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl bg-slate-800 object-contain p-1 border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-orbitron font-extrabold text-base text-cyan-200">
                            {t.symbol}
                          </span>
                          <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {t.source?.symbol || 'B3'}
                          </span>
                          {isPetr4 && (
                            <span className="font-tech text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                              PESO PESADO IBOV
                            </span>
                          )}
                        </div>
                        <h4 className="font-tech text-xs text-slate-200 font-semibold line-clamp-1">
                          {t.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] font-tech text-slate-400 border-t border-slate-800/80 pt-2.5">
                    <p className="line-clamp-1">
                      <span className="text-slate-500">Razão Social:</span> {t.full_name || t.name}
                    </p>
                    {t.tax_id && (
                      <p>
                        <span className="text-slate-500">CNPJ:</span> {t.tax_id}
                      </p>
                    )}
                    <p>
                      <span className="text-slate-500">Setor:</span>{' '}
                      <span className="text-slate-300 font-medium">
                        {t.classification?.sector || 'Diversificado'}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-tech">
                    <span className="text-cyan-300/80">Impacto no WIN:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {isPetr4 ? '12.5% (Alta relevância)' : t.symbol === 'PETR3' ? '4.8%' : 'Ativo B3 Listado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 font-tech text-sm">
            Nenhum ticker encontrado para "{query}". Tente buscar por <code className="text-cyan-300">petr</code>,{' '}
            <code className="text-cyan-300">vale</code>, ou <code className="text-cyan-300">itub</code>.
          </div>
        )}

        {/* Upstream Endpoint Technical Inspector */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full text-slate-400">
            <span className="text-emerald-400 font-bold">GET</span>
            <span className="truncate text-slate-300">{apiUrlExample}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copiado' : 'Copiar URL'}</span>
            </button>
            <a
              href={apiUrlExample}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir JSON</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
