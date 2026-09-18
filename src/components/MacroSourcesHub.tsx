import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Zap,
  Sparkles,
  Link as LinkIcon,
  Flame,
  Clock,
  Layers,
  Key,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { MacroSourceItem, GroundingCitation } from '../types';
import { soundFX } from '../utils/soundEffects';

interface MacroSourcesHubProps {
  sources: MacroSourceItem[];
  onAskJarvis: (prompt: string) => void;
}

export const MacroSourcesHub: React.FC<MacroSourcesHubProps> = ({
  sources,
  onAskJarvis,
}) => {
  const [isScanningAll, setIsScanningAll] = useState<boolean>(false);
  const [scanningSourceId, setScanningSourceId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [citations, setCitations] = useState<GroundingCitation[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const metodoMacroKey = '86422ca889dbca478d07f2f6ecfb5c74c40368623b635a9a8dfadb17b8017019';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(metodoMacroKey);
    setCopiedKey(true);
    soundFX.playActivation();
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Trigger master cross-source scan
  const handleScanAllSources = async () => {
    setIsScanningAll(true);
    setScanResult(null);
    setCitations([]);
    soundFX.playActivation();

    try {
      let res = await fetch('/api/mcp/scan-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok && res.status === 404) {
        res = await fetch('/api/jarvis/scan-sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }

      const data = await res.json();
      setScanResult(data.text || 'Varredura das fontes e Método Macro concluída.');
      setCitations(data.citations || []);
      soundFX.playActivation();
    } catch (err) {
      console.error('Error scanning sources:', err);
      setScanResult(
        'Falha momentânea na conexão com as fontes externas. Modo quantitativo de contingência ativado.'
      );
    } finally {
      setIsScanningAll(false);
    }
  };

  // Trigger individual source scan
  const handleScanSingleSource = async (source: MacroSourceItem) => {
    setScanningSourceId(source.id);
    soundFX.playBlip(1050);

    try {
      let res = await fetch('/api/mcp/scan-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceFilter: `${source.name} (${source.url})` }),
      });

      if (!res.ok && res.status === 404) {
        res = await fetch('/api/jarvis/scan-sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceFilter: `${source.name} (${source.url})` }),
        });
      }

      const data = await res.json();
      setScanResult(data.text);
      setCitations(data.citations || []);
      soundFX.playActivation();
    } catch (err) {
      console.error(`Error scanning ${source.name}:`, err);
    } finally {
      setScanningSourceId(null);
    }
  };

  const categories = [
    { id: 'ALL', label: 'Todas as Fontes' },
    { id: 'METODO_MACRO', label: 'Método Macro (App)' },
    { id: 'GLOBAL_MACRO', label: 'Macro Global' },
    { id: 'HEATMAP_WALLST', label: 'Wall Street' },
    { id: 'ECONOMIC_CALENDAR', label: 'Calendário' },
    { id: 'CME_FUTURES', label: 'CME Chicago' },
    { id: 'NEWS_WIRE', label: 'Noticiário' },
    { id: 'B3_MONITOR', label: 'B3 Brasil' },
  ];

  const filteredSources =
    activeCategory === 'ALL'
      ? sources
      : sources.filter((s) => s.category === activeCategory);

  return (
    <div id="macro-sources-hub" className="flex flex-col gap-6">
      {/* Header Banner & Master Scanner Control */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </div>
              <h2 className="font-orbitron font-extrabold text-lg sm:text-xl text-cyan-100 tracking-wide">
                CENTRAL DE FONTES & LIVE SCANNERS MACRO
              </h2>
              <span className="font-tech text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {sources.length} CONEXÕES ATIVAS
              </span>
              <span className="font-tech text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/60 text-cyan-200 font-bold flex items-center gap-1">
                <Key className="w-3 h-3 text-cyan-400" />
                MÉTODO MACRO AUTENTICADO
              </span>
            </div>

            <p className="font-tech text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              J.A.R.V.I.S. monitora e cruza dados em tempo real da plataforma oficial
              <strong className="text-cyan-300"> Método Macro (app.metodomacro.com.br)</strong> e das 6 principais fontes globais:
              <strong className="text-cyan-300"> MacroWarning</strong>,
              <strong className="text-cyan-300"> Finviz</strong>,
              <strong className="text-cyan-300"> Investing.com Calendário</strong>,
              <strong className="text-cyan-300"> CME Group (BRL Futures 6L)</strong>,
              <strong className="text-cyan-300"> Reuters</strong> e
              <strong className="text-cyan-300"> ADVFN Monitor B3</strong>.
            </p>
          </div>

          {/* Master Scan Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="btn-master-scan-sources"
              onClick={handleScanAllSources}
              disabled={isScanningAll}
              className={`px-5 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-300 ${
                isScanningAll
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanningAll ? 'animate-spin' : ''}`} />
              <span>
                {isScanningAll
                  ? 'ESCANEANDO FONTES & MÉTODO MACRO...'
                  : 'EXECUTAR VARREDURA GERAL DAS FONTES'}
              </span>
            </button>
          </div>
        </div>

        {/* Método Macro Access Key Quick Info Strip */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron text-xs font-bold text-cyan-200">
                  CHAVE VINCULADA MÉTODO MACRO:
                </span>
                <code className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300">
                  86422ca8...17019
                </code>
              </div>
              <span className="font-tech text-[11px] text-slate-400">
                Portal Oficial: <a href="https://app.metodomacro.com.br/login" target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-cyan-400 hover:underline">https://app.metodomacro.com.br/login</a>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyKey}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-xs font-tech text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave Completa'}</span>
            </button>

            <a
              href="https://app.metodomacro.com.br/login"
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-xs font-tech text-cyan-200 flex items-center gap-1.5 transition-colors"
            >
              <span>Abrir Login Método Macro</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cyan-500/20 overflow-x-auto no-scrollbar">
          <span className="font-tech text-xs text-slate-400 shrink-0">FILTRAR:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playBlip(900);
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1 rounded-lg font-tech text-xs transition-all whitespace-nowrap border ${
                activeCategory === cat.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-semibold'
                  : 'bg-slate-950/60 border-cyan-500/15 text-slate-400 hover:text-cyan-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Output if Scanned */}
      {scanResult && (
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span className="font-orbitron font-semibold text-xs sm:text-sm text-cyan-100">
                SÍNTESE QUANTITATIVA MACRO DAS FONTES (J.A.R.V.I.S.)
              </span>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="font-tech text-xs text-slate-400 hover:text-cyan-300"
            >
              FECHAR PAINEL ✕
            </button>
          </div>

          <div className="font-body text-xs sm:text-sm text-cyan-50 leading-relaxed whitespace-pre-wrap">
            {scanResult}
          </div>

          {/* Web Grounding Citations */}
          {citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-cyan-500/20">
              <span className="font-tech text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                FONTES WEB CITADAS & CONFIRMADAS PELO MODELO:
              </span>
              <div className="flex flex-wrap gap-2">
                {citations.map((cit, idx) => (
                  <a
                    key={idx}
                    href={cit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-[11px] font-tech text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 transition-colors"
                  >
                    <span>{cit.title || 'Link Oficial'}</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSources.map((source) => {
          const isScanningThis = scanningSourceId === source.id;
          const isMetodoMacro = source.category === 'METODO_MACRO' || source.id === 'source-metodo-macro';

          return (
            <div
              key={source.id}
              id={`source-card-${source.id}`}
              className={`p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
                isMetodoMacro
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/40 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border border-cyan-500/25 hover:border-cyan-400/50 hover:bg-slate-900/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isMetodoMacro
                            ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse'
                            : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        }`}
                      />
                      <h3 className="font-orbitron font-bold text-sm text-cyan-100 flex items-center gap-1.5">
                        {source.name}
                        {isMetodoMacro && (
                          <span className="font-tech text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300">
                            CORE
                          </span>
                        )}
                      </h3>
                    </div>
                    <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                      {source.category.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`font-tech text-[10px] px-2 py-0.5 rounded border ${
                      isMetodoMacro
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-cyan-950 border-cyan-500/30 text-cyan-300'
                    }`}
                  >
                    {source.status}
                  </span>
                </div>

                {/* Description */}
                <p className="font-tech text-xs text-slate-300 mb-4 leading-relaxed">
                  {source.description}
                </p>

                {/* Key Metrics Strip */}
                <div className="space-y-2 mb-4 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/15">
                  <div className="text-[10px] font-tech text-cyan-400 uppercase font-semibold flex items-center justify-between">
                    <span>Métricas Chave</span>
                    <span className="text-slate-500">{source.lastSync}</span>
                  </div>
                  {source.keyMetrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-tech"
                    >
                      <span className="text-slate-400">{m.label}:</span>
                      <span
                        className={`font-semibold ${
                          m.bias === 'POSITIVE'
                            ? 'text-emerald-400'
                            : m.bias === 'NEGATIVE'
                            ? 'text-rose-400'
                            : 'text-cyan-200'
                        }`}
                      >
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Insight Summary */}
                <div className="text-[11px] font-body text-slate-300 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20 mb-4">
                  <strong className="text-cyan-300 font-tech">Diagnóstico: </strong>
                  {source.summary}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-cyan-500/15">
                {/* Direct Site Link */}
                <a
                  href={source.directLoginUrl || source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-xs font-tech text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
                  title={`Abrir ${source.name} no navegador`}
                >
                  <span>{isMetodoMacro ? 'Login Método Macro' : 'Acessar Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Scan with JARVIS button */}
                <button
                  onClick={() => handleScanSingleSource(source)}
                  disabled={isScanningThis}
                  className={`py-2 px-3 rounded-xl border text-xs font-tech flex items-center justify-center gap-1.5 transition-all ${
                    isScanningThis
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                      : 'bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-200'
                  }`}
                  title="Fazer análise neural focada nesta fonte"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{isScanningThis ? 'Escaneando...' : 'Escanear'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Prompt Suggestions */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-tech text-xs text-slate-300">
            Deseja sincronizar os indicadores proprietários do Método Macro com o Termômetro Global?
          </span>
        </div>
        <button
          onClick={() =>
            onAskJarvis(
              'Processe os dados do Método Macro (chave 86422ca889dbca478d07f2f6ecfb5c74c40368623b635a9a8dfadb17b8017019) e cruze com a Matriz de Sentimento Global para Dólar e Ibovespa.'
            )
          }
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-tech hover:bg-cyan-500/30 whitespace-nowrap transition-colors"
        >
          Sincronizar Método Macro →
        </button>
      </div>
    </div>
  );
};

