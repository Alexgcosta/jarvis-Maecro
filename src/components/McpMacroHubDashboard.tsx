import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Compass,
  AlertTriangle,
  Play,
  RotateCw,
  Shield,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  Filter,
  Sliders,
  Database,
  BarChart3,
  Search,
  Lock,
} from 'lucide-react';
import {
  StandardizedMacroAsset,
  DynamicCorrelationPair,
  MacroRegimeState,
  MacroScoreBlocks,
  ContractMacroContext,
  TrafficLightSignal,
  MacroDivergenceAlert,
  GeneratedMacroPanorama,
  PanoramaPipelineStep,
} from '../types/mcpMacroHubTypes';
import { soundFX } from '../utils/soundEffects';

export const McpMacroHubDashboard: React.FC = () => {
  const [hubState, setHubState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPanorama, setGeneratingPanorama] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WIN' | 'WDO' | 'CORRELATIONS' | 'DIVERGENCES' | 'PANORAMA' | 'TOOLS' | 'BACKTEST' | 'WEIGHTS'>('OVERVIEW');
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<StandardizedMacroAsset | null>(null);
  const [latestPanorama, setLatestPanorama] = useState<GeneratedMacroPanorama | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PanoramaPipelineStep[]>([]);
  const [weights, setWeights] = useState<any>({
    DXY: 20,
    VIX: 15,
    EWZ: 15,
    SP500: 10,
    US10Y: 10,
    CDS_BRAZIL: 10,
    USDBRL: 10,
    COMMODITIES: 10,
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsSuccessMsg, setWeightsSuccessMsg] = useState('');

  // Backtest state
  const [backtestAsset, setBacktestAsset] = useState<'WIN' | 'WDO' | 'DOL'>('WIN');
  const [backtestPeriod, setBacktestPeriod] = useState(90);
  const [backtestVix, setBacktestVix] = useState(true);
  const [backtestDxy, setBacktestDxy] = useState(true);
  const [backtestEwz, setBacktestEwz] = useState(true);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [runningBacktest, setRunningBacktest] = useState(false);

  // MCP Tools execution test state
  const [selectedTool, setSelectedTool] = useState('get_usdbrl');
  const [toolExecutionOutput, setToolExecutionOutput] = useState<any>(null);
  const [executingTool, setExecutingTool] = useState(false);

  const fetchHubState = async () => {
    try {
      const res = await fetch('/api/mcp/hub-state');
      const data = await res.json();
      if (data.success) {
        setHubState(data);
        if (data.weights) setWeights(data.weights);
      }
    } catch (err) {
      console.error('Falha ao carregar estado do MCP Macro Hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubState();
    const interval = setInterval(fetchHubState, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleGeneratePanorama = async () => {
    soundFX.playClick();
    setGeneratingPanorama(true);
    setPipelineSteps([
      { step: 1, name: 'Atualizar os dados', status: 'RUNNING', durationMs: 15, detail: 'Consultando APIs e feeds em tempo real' },
      { step: 2, name: 'Validar dados', status: 'RUNNING', durationMs: 12, detail: 'Checando latência e qualidade das cotações' },
      { step: 3, name: 'Normalizar os dados', status: 'RUNNING', durationMs: 18, detail: 'Padronizando modelo canônico de 20 atributos' },
      { step: 4, name: 'Calcular variações', status: 'RUNNING', durationMs: 14, detail: 'Apurando deltas absolutos e percentuais' },
      { step: 5, name: 'Calcular correlações', status: 'RUNNING', durationMs: 22, detail: 'Matriz multitemporal (20, 50, 100 períodos)' },
      { step: 6, name: 'Calcular volatilidade', status: 'RUNNING', durationMs: 16, detail: 'Desvio padrão anualizado e amplitudes' },
      { step: 7, name: 'Calcular momentum', status: 'RUNNING', durationMs: 15, detail: 'Taxas de aceleração de fluxo institucional' },
      { step: 8, name: 'Calcular z-score', status: 'RUNNING', durationMs: 13, detail: 'Desvios extremos em relação às médias' },
      { step: 9, name: 'Detectar regime', status: 'RUNNING', durationMs: 19, detail: 'Risk-On, Risk-Off, Neutro ou Transição' },
      { step: 10, name: 'Calcular Macro Score', status: 'RUNNING', durationMs: 20, detail: 'Ponderação auditável por blocos temáticos' },
      { step: 11, name: 'Detectar divergências', status: 'RUNNING', durationMs: 17, detail: 'Filtro de assimetrias estruturais de book' },
      { step: 12, name: 'Avaliar WIN', status: 'RUNNING', durationMs: 18, detail: 'Contexto de Mini-Índice B3' },
      { step: 13, name: 'Avaliar WDO', status: 'RUNNING', durationMs: 16, detail: 'Contexto de Mini-Dólar B3' },
      { step: 14, name: 'Gerar resumo final', status: 'RUNNING', durationMs: 25, detail: 'Consolidação e veredito executivo' },
    ]);

    try {
      const res = await fetch('/api/mcp/panorama/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setLatestPanorama(data.panorama);
        setPipelineSteps(data.panorama.stepsExecution || []);
        fetchHubState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPanorama(false);
    }
  };

  const handleSaveWeights = async () => {
    soundFX.playClick();
    setSavingWeights(true);
    setWeightsSuccessMsg('');
    try {
      const res = await fetch('/api/mcp/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights),
      });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setWeightsSuccessMsg('Pesos atualizados e scores recalculados instantaneamente!');
        fetchHubState();
        setTimeout(() => setWeightsSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(`Erro ao salvar pesos: ${err.message}`);
    } finally {
      setSavingWeights(false);
    }
  };

  const handleRunBacktest = async () => {
    soundFX.playClick();
    setRunningBacktest(true);
    try {
      const res = await fetch('/api/mcp/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset: backtestAsset,
          periodDays: backtestPeriod,
          conditionVixHigh: backtestVix,
          conditionDxyAboveMa20: backtestDxy,
          conditionEwzBelowMa20: backtestEwz,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setBacktestResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningBacktest(false);
    }
  };

  const handleExecuteTool = async (toolName: string) => {
    soundFX.playClick();
    setExecutingTool(true);
    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName }),
      });
      const data = await res.json();
      setToolExecutionOutput(data);
    } catch (err: any) {
      setToolExecutionOutput({ error: err.message });
    } finally {
      setExecutingTool(false);
    }
  };

  if (loading && !hubState) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <RotateCw className="w-8 h-8 animate-spin" />
        <span className="text-sm font-mono tracking-wider">CARREGANDO MCP MACRO HUB & MOTORES QUANTITATIVOS...</span>
      </div>
    );
  }

  const assets: Record<string, StandardizedMacroAsset> = hubState?.assets || {};
  const correlations: DynamicCorrelationPair[] = hubState?.correlations || [];
  const regime: MacroRegimeState = hubState?.regime || {
    regime: 'NEUTRO',
    strengthPercent: 50,
    confidencePercent: 75,
    summary: '',
    justifyingFactors: [],
    lastTransitionTimestamp: '',
  };
  const scoreBlocks: MacroScoreBlocks = hubState?.scoreBlocks || {
    dolarGlobal: 50,
    riscoGlobal: 50,
    jurosEua: 50,
    riscoBrasil: 50,
    commodities: 50,
    bolsaGlobal: 50,
  };
  const winCtx: ContractMacroContext = hubState?.contracts?.win;
  const wdoCtx: ContractMacroContext = hubState?.contracts?.wdo;
  const divergences: MacroDivergenceAlert[] = hubState?.divergences || [];

  const getSignalBadge = (sig: TrafficLightSignal) => {
    switch (sig) {
      case 'COMPRA FORTE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">🟢 COMPRA FORTE</span>;
      case 'COMPRA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">🟢 COMPRA</span>;
      case 'NEUTRO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">🟡 NEUTRO</span>;
      case 'VENDA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">🟠 VENDA</span>;
      case 'VENDA FORTE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">🔴 VENDA FORTE</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400">NEUTRO</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-200">
      {/* HEADER SECTION (Section 13) */}
      <div className="bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Cpu className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                MCP MACRO HUB <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">WIN • WDO • DOL</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Central de Inteligência Quantitativa & Regime de Mercado • 24 Ferramentas MCP • Última Sincronização:{' '}
              <span className="text-cyan-300 font-semibold">{new Date(hubState?.timestamp || Date.now()).toLocaleTimeString()}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Regime Badge */}
            <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${
              regime.regime === 'RISK ON'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : regime.regime === 'RISK OFF'
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                : regime.regime === 'TRANSIÇÃO'
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <Compass className="w-4 h-4 animate-spin-slow" />
              REGIME: {regime.regime} ({regime.strengthPercent}%)
            </div>

            {/* Generate Panorama Button (Section 11) */}
            <button
              onClick={handleGeneratePanorama}
              disabled={generatingPanorama}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {generatingPanorama ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  EXECUTANDO 14 ETAPAS...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  GERAR PANORAMA
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Traffic Lights Summary (Section 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Mini-Índice (WIN)</div>
              <div className="text-sm font-bold text-white mt-0.5">{winCtx?.bias || 'NEUTRO'}</div>
            </div>
            <div>{winCtx ? getSignalBadge(winCtx.signal) : null}</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Mini-Dólar (WDO)</div>
              <div className="text-sm font-bold text-white mt-0.5">{wdoCtx?.bias || 'NEUTRO'}</div>
            </div>
            <div>{wdoCtx ? getSignalBadge(wdoCtx.signal) : null}</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Dólar Comercial (DOL)</div>
              <div className="text-sm font-bold text-white mt-0.5">R$ {assets['USDBRL']?.precoAtual.toFixed(4) || '5.0867'}</div>
            </div>
            <div>{wdoCtx ? getSignalBadge(wdoCtx.signal) : null}</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">EWZ ETF (Proxy)</div>
              <div className="text-sm font-bold text-white mt-0.5">${assets['EWZ']?.precoAtual.toFixed(2) || '29.45'}</div>
            </div>
            <div>{getSignalBadge((assets['EWZ']?.variacaoPercentual ?? 0) >= 0.5 ? 'COMPRA' : (assets['EWZ']?.variacaoPercentual ?? 0) <= -0.5 ? 'VENDA' : 'NEUTRO')}</div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'OVERVIEW', label: 'Dashboard Geral', icon: BarChart3 },
          { id: 'WIN', label: 'WIN — Contexto Macro', icon: TrendingUp },
          { id: 'WDO', label: 'WDO — Contexto Macro', icon: Activity },
          { id: 'CORRELATIONS', label: 'Motor de Correlação', icon: Sliders },
          { id: 'DIVERGENCES', label: `Divergências (${divergences.length})`, icon: AlertTriangle },
          { id: 'PANORAMA', label: 'Panorama 14 Etapas', icon: Layers },
          { id: 'TOOLS', label: 'MCP Tools Catalog (24)', icon: Cpu },
          { id: 'BACKTEST', label: 'Macro Backtest', icon: Database },
          { id: 'WEIGHTS', label: 'Configuração de Pesos', icon: Filter },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW (PANELS 1 to 9 from Section 13) */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top Score Blocks (Section 6) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'DÓLAR GLOBAL', val: scoreBlocks.dolarGlobal, desc: 'DXY / FX Currencies' },
              { label: 'RISCO GLOBAL', val: scoreBlocks.riscoGlobal, desc: 'VIX / Aversão' },
              { label: 'JUROS EUA', val: scoreBlocks.jurosEua, desc: 'US10Y / Yields' },
              { label: 'RISCO BRASIL', val: scoreBlocks.riscoBrasil, desc: 'CDS Brasil / Câmbio' },
              { label: 'COMMODITIES', val: scoreBlocks.commodities, desc: 'Brent / Minério' },
              { label: 'BOLSA GLOBAL', val: scoreBlocks.bolsaGlobal, desc: 'S&P 500 / Nasdaq' },
            ].map((blk, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{blk.label}</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-white font-mono">{blk.val}</span>
                  <span className="text-xs text-slate-500 font-mono">/ 100</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      blk.val >= 70 ? 'bg-cyan-400' : blk.val >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${blk.val}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{blk.desc}</div>
              </div>
            ))}
          </div>

          {/* Quick Dual Cards: WIN vs WDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WIN Quick Card */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">WIN — Mini-Índice B3</span>
                  <h3 className="text-xl font-black text-white mt-0.5">VIÉS: {winCtx?.bias}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">MACRO SCORE</div>
                  <div className={`text-2xl font-black font-mono ${winCtx?.macroScore > 0 ? 'text-emerald-400' : winCtx?.macroScore < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {winCtx?.macroScore > 0 ? '+' : ''}{winCtx?.macroScore}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono text-xs">
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">FORÇA</div>
                  <div className="text-white font-bold">{winCtx?.strength}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">CONFIANÇA</div>
                  <div className="text-cyan-300 font-bold">{winCtx?.confidence}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">CONFIRMAÇÕES</div>
                  <div className="text-emerald-400 font-bold">{winCtx?.confirmationsCount}/{winCtx?.confirmationsTotal}</div>
                </div>
              </div>

              {/* Top Factors Snippet (Section 25 auditability) */}
              <div className="mt-4 space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400">Decomposição dos Fatores Principais:</div>
                {winCtx?.topFactors?.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-950/40 px-2.5 py-1.5 rounded">
                    <span className="text-slate-300 font-medium">{f.indicator} ({f.ticker})</span>
                    <span className={`font-mono font-bold ${f.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {f.points > 0 ? '+' : ''}{f.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WDO Quick Card */}
            <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold uppercase">WDO — Mini-Dólar B3</span>
                  <h3 className="text-xl font-black text-white mt-0.5">VIÉS: {wdoCtx?.bias}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">USD SCORE</div>
                  <div className={`text-2xl font-black font-mono ${wdoCtx?.macroScore > 0 ? 'text-emerald-400' : wdoCtx?.macroScore < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {wdoCtx?.macroScore > 0 ? '+' : ''}{wdoCtx?.macroScore}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono text-xs">
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">FORÇA</div>
                  <div className="text-white font-bold">{wdoCtx?.strength}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">CONFIANÇA</div>
                  <div className="text-cyan-300 font-bold">{wdoCtx?.confidence}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded">
                  <div className="text-[10px] text-slate-500">CONFIRMAÇÕES</div>
                  <div className="text-emerald-400 font-bold">{wdoCtx?.confirmationsCount}/{wdoCtx?.confirmationsTotal}</div>
                </div>
              </div>

              {/* Top Factors Snippet */}
              <div className="mt-4 space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400">Decomposição dos Fatores Principais:</div>
                {wdoCtx?.topFactors?.slice(0, 4).map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-950/40 px-2.5 py-1.5 rounded">
                    <span className="text-slate-300 font-medium">{f.indicator} ({f.ticker})</span>
                    <span className={`font-mono font-bold ${f.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {f.points > 0 ? '+' : ''}{f.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standardized Canonical Assets Table (Section 3: 20 Attributes) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Database className="w-4 h-4 text-cyan-400" />
                Matriz Padronizada de Ativos Macroeconômicos ({Object.keys(assets).length} Ativos Canônicos)
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">20 propriedades computadas por ativo</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ativo</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-right">Preço Atual</th>
                    <th className="p-3 text-right">Var %</th>
                    <th className="p-3 text-center">Tendência</th>
                    <th className="p-3 text-right">Volatilidade</th>
                    <th className="p-3 text-right">Z-Score</th>
                    <th className="p-3 text-right">Corr WIN</th>
                    <th className="p-3 text-right">Score</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.values(assets).map((a) => (
                    <tr key={a.ticker} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>{a.ticker}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({a.nome})</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {a.categoria}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-100 font-semibold">{a.precoAtual.toFixed(2)}</td>
                      <td className={`p-3 text-right font-bold ${a.variacaoPercentual >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {a.variacaoPercentual >= 0 ? '+' : ''}{a.variacaoPercentual.toFixed(2)}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold ${a.tendencia === 'BULLISH' ? 'text-emerald-400' : a.tendencia === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}`}>
                          {a.tendencia}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-300">{a.volatilidade.toFixed(1)}%</td>
                      <td className="p-3 text-right text-slate-300">{a.zScore.toFixed(2)}σ</td>
                      <td className="p-3 text-right text-cyan-300 font-semibold">{a.correlacaoComWin.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-white">{a.score}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedAssetDetail(a)}
                          className="px-2 py-1 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Ver 20 Atributos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WIN — CONTEXTO MACRO (Section 9) */}
      {activeTab === 'WIN' && winCtx && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">Mini-Índice B3 Futuro</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                  WIN — CONTEXTO MACRO
                  {getSignalBadge(winCtx.signal)}
                </h2>
              </div>
              <div className="flex items-center gap-6 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">MACRO SCORE</div>
                  <div className={`text-3xl font-black ${winCtx.macroScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {winCtx.macroScore > 0 ? '+' : ''}{winCtx.macroScore}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">REGIME</div>
                  <div className="text-xl font-bold text-white">{winCtx.regime}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">CONFIANÇA</div>
                  <div className="text-xl font-bold text-cyan-400">{winCtx.confidence}%</div>
                </div>
              </div>
            </div>

            {/* Auditability: Exact Points Breakdown (Section 25) */}
            <div className="mt-5">
              <h3 className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider mb-3">
                Explicação Auditável do Score (Contribuição Ponderada por Ativo):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {winCtx.topFactors.map((f, i) => (
                  <div key={i} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {f.points > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                        {f.indicator} ({f.ticker})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${f.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {f.points > 0 ? '+' : ''}{f.points} pts
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono">Peso: {f.weightPercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmations, Divergences, Risks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-lg">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2 uppercase text-[11px]">
                  <CheckCircle2 className="w-4 h-4" /> Confirmações ({winCtx.confirmationsCount})
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {winCtx.confirmations.map((c, i) => (
                    <li key={i} className="text-[11px]">• {c}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-lg">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-2 uppercase text-[11px]">
                  <AlertTriangle className="w-4 h-4" /> Divergências ({winCtx.divergencesCount})
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {winCtx.divergences.length > 0 ? (
                    winCtx.divergences.map((d, i) => <li key={i} className="text-[11px]">• {d}</li>)
                  ) : (
                    <li className="text-[11px] text-slate-500">Nenhuma divergência estrutural.</li>
                  )}
                </ul>
              </div>

              <div className="bg-rose-950/20 border border-rose-900/40 p-3.5 rounded-lg">
                <h4 className="font-bold text-rose-400 flex items-center gap-1.5 mb-2 uppercase text-[11px]">
                  <Shield className="w-4 h-4" /> Riscos Mapeados
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {winCtx.risks.map((r, i) => (
                    <li key={i} className="text-[11px]">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WDO — CONTEXTO MACRO (Section 10) */}
      {activeTab === 'WDO' && wdoCtx && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">Mini-Dólar B3 Futuro</span>
                <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-3">
                  WDO — CONTEXTO MACRO
                  {getSignalBadge(wdoCtx.signal)}
                </h2>
              </div>
              <div className="flex items-center gap-6 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">USD SCORE</div>
                  <div className={`text-3xl font-black ${wdoCtx.macroScore > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {wdoCtx.macroScore > 0 ? '+' : ''}{wdoCtx.macroScore}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">REGIME</div>
                  <div className="text-xl font-bold text-white">{wdoCtx.regime}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">CONFIANÇA</div>
                  <div className="text-xl font-bold text-cyan-400">{wdoCtx.confidence}%</div>
                </div>
              </div>
            </div>

            {/* Drivers Listed in Section 10 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">DXY (GLOBAL)</div>
                <div className="text-sm font-bold text-white mt-0.5">{assets['DXY']?.precoAtual.toFixed(2)} ({assets['DXY']?.variacaoPercentual.toFixed(2)}%)</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">USD/BRL & PTAX</div>
                <div className="text-sm font-bold text-white mt-0.5">R$ {assets['USDBRL']?.precoAtual.toFixed(4)}</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">VIX CBOE</div>
                <div className="text-sm font-bold text-white mt-0.5">{assets['VIX']?.precoAtual.toFixed(2)} pts</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-mono">US 10Y TREASURY</div>
                <div className="text-sm font-bold text-white mt-0.5">{assets['US10Y']?.precoAtual.toFixed(3)}%</div>
              </div>
            </div>

            {/* Auditability: Exact Points Breakdown */}
            <div className="mt-5">
              <h3 className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider mb-3">
                Explicação Auditável do Score (Contribuição Ponderada por Ativo):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {wdoCtx.topFactors.map((f, i) => (
                  <div key={i} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {f.points > 0 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                        {f.indicator} ({f.ticker})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.description}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black font-mono ${f.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {f.points > 0 ? '+' : ''}{f.points} pts
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono">Peso: {f.weightPercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MOTOR DE CORRELAÇÃO (Section 4) */}
      {activeTab === 'CORRELATIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Matriz de Correlação Dinâmica Multitemporal (20, 50, 100 Períodos e Intraday)
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">11 Principais Relações Macroeconômicas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Par / Relação</th>
                  <th className="p-3 text-right">20 Períodos</th>
                  <th className="p-3 text-right">50 Períodos</th>
                  <th className="p-3 text-right">100 Períodos</th>
                  <th className="p-3 text-right">Intraday</th>
                  <th className="p-3 text-right">Média Histórica</th>
                  <th className="p-3 text-right">Variação</th>
                  <th className="p-3 text-center">Status / Força</th>
                  <th className="p-3 text-right">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {correlations.map((c) => (
                  <tr key={c.pair} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{c.pair}</td>
                    <td className="p-3 text-right font-bold text-cyan-400">{c.corr20 > 0 ? `+${c.corr20.toFixed(2)}` : c.corr20.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-300">{c.corr50 > 0 ? `+${c.corr50.toFixed(2)}` : c.corr50.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">{c.corr100 > 0 ? `+${c.corr100.toFixed(2)}` : c.corr100.toFixed(2)}</td>
                    <td className="p-3 text-right text-indigo-300">{c.corrIntraday > 0 ? `+${c.corrIntraday.toFixed(2)}` : c.corrIntraday.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-400">{c.historicalMean.toFixed(2)}</td>
                    <td className={`p-3 text-right font-semibold ${c.variation > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.variation > 0 ? `+${c.variation.toFixed(2)}` : c.variation.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'CORRELAÇÃO FORTE'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : c.status === 'INVERSÃO RELEVANTE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-white">{c.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DIVERGÊNCIAS (Section 8) */}
      {activeTab === 'DIVERGENCES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Detector Automático de Divergências Macroeconômicas ({divergences.length} Alertas Ativos)
            </h2>
          </div>

          {divergences.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-xl text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm">Nenhuma divergência estrutural detectada no momento.</p>
              <p className="text-xs text-slate-500 mt-1">O fluxo do WIN e WDO encontra-se simétrico com o exterior e a cesta de risco.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {divergences.map((d) => (
                <div key={d.id} className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {d.type} • {d.asset}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{new Date(d.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-2">{d.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="text-slate-400">Indicadores Divergentes:</span>
                    {d.divergentIndicators.map((ind) => (
                      <span key={ind} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                        {ind}
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] font-mono text-cyan-400">Confiança: {d.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PANORAMA 14 ETAPAS (Section 11) */}
      {activeTab === 'PANORAMA' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Esteira Quantitativa de 14 Etapas do Panorama Macro
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline analítico e execução sequencial rigorosa</p>
              </div>
              <button
                onClick={handleGeneratePanorama}
                disabled={generatingPanorama}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {generatingPanorama ? 'PROCESSANDO...' : 'EXECUTAR AGORA'}
              </button>
            </div>

            {/* Step execution timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 mt-4">
              {(pipelineSteps.length > 0 ? pipelineSteps : [
                { step: 1, name: '1. Atualizar dados' },
                { step: 2, name: '2. Validar dados' },
                { step: 3, name: '3. Normalizar dados' },
                { step: 4, name: '4. Calcular variações' },
                { step: 5, name: '5. Calcular correlações' },
                { step: 6, name: '6. Volatilidade' },
                { step: 7, name: '7. Momentum' },
                { step: 8, name: '8. Z-Score' },
                { step: 9, name: '9. Regime' },
                { step: 10, name: '10. Macro Score' },
                { step: 11, name: '11. Divergências' },
                { step: 12, name: '12. Avaliar WIN' },
                { step: 13, name: '13. Avaliar WDO' },
                { step: 14, name: '14. Resumo Final' },
              ]).map((st: any, idx: number) => (
                <div key={idx} className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-[11px] font-mono">
                  <div className="text-slate-500 text-[9px]">FASE {idx + 1}</div>
                  <div className="font-semibold text-white truncate mt-0.5">{st.name}</div>
                  <div className="mt-1 flex items-center gap-1 text-[9px] text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> CONCLUÍDO
                  </div>
                </div>
              ))}
            </div>

            {/* Latest Result */}
            {latestPanorama && (
              <div className="mt-6 p-4 bg-slate-950/90 rounded-xl border border-cyan-500/40">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase">Resultado Consolidado do Panorama</span>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(latestPanorama.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3 text-center font-mono">
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-500">REGIME</div>
                    <div className="text-sm font-bold text-white">{latestPanorama.regime}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-500">DÓLAR</div>
                    <div className="text-sm font-bold text-cyan-300">{latestPanorama.dollarStatus}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-500">WIN</div>
                    <div className="text-sm font-bold text-emerald-400">{latestPanorama.winBias}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-500">WDO</div>
                    <div className="text-sm font-bold text-amber-400">{latestPanorama.wdoBias}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-900/60 p-3 rounded">
                  {latestPanorama.executiveSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: MCP TOOLS CATALOG (Section 2) */}
      {activeTab === 'TOOLS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">
              24 Ferramentas MCP Disponíveis
            </h3>
            <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
              {[
                'get_usdbrl', 'get_dxy', 'get_vix', 'get_treasury10y', 'get_sp500', 'get_nasdaq',
                'get_ewz', 'get_brent', 'get_iron_ore', 'get_soybean', 'get_cds_brazil', 'get_selic', 'get_fed_rate',
                'calculate_correlation', 'calculate_beta', 'calculate_volatility', 'calculate_zscore',
                'calculate_momentum', 'calculate_macro_score', 'detect_macro_regime', 'detect_divergence',
                'generate_macro_panorama', 'generate_win_analysis', 'generate_wdo_analysis'
              ].map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    setSelectedTool(tool);
                    handleExecuteTool(tool);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    selectedTool === tool
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{tool}()</span>
                  <ArrowRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white font-mono">{selectedTool}()</h3>
                <span className="text-xs text-slate-400">Execução e Resposta Estruturada em JSON</span>
              </div>
              <button
                onClick={() => handleExecuteTool(selectedTool)}
                disabled={executingTool}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${executingTool ? 'animate-spin' : ''}`} />
                Executar Ferramenta
              </button>
            </div>

            <div className="mt-4">
              {executingTool ? (
                <div className="flex items-center justify-center h-64 text-cyan-400 text-xs font-mono">
                  <RotateCw className="w-5 h-5 animate-spin mr-2" />
                  Consultando barramento MCP...
                </div>
              ) : toolExecutionOutput ? (
                <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 border border-slate-800">
                  {JSON.stringify(toolExecutionOutput, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs font-mono">
                  Selecione uma ferramenta para testar o retorno em JSON da camada MCP.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BACKTEST (Section 12) */}
      {activeTab === 'BACKTEST' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
              <Database className="w-4 h-4 text-cyan-400" />
              Módulo de Macro Backtest Histórico
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simule cenários passados com base na combinação de indicadores (ex: VIX &gt; 25, DXY &gt; média 20, EWZ &lt; média 20 e CDS Brasil subindo).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Contrato</label>
              <select
                value={backtestAsset}
                onChange={(e) => setBacktestAsset(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white"
              >
                <option value="WIN">WIN (Mini-Índice)</option>
                <option value="WDO">WDO (Mini-Dólar)</option>
                <option value="DOL">DOL (Dólar Futuro Cheio)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Período Histórico</label>
              <select
                value={backtestPeriod}
                onChange={(e) => setBacktestPeriod(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white"
              >
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
                <option value={180}>Últimos 180 dias</option>
                <option value={365}>Último ano</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs text-slate-400 font-mono block">Condições de Filtro Macroeconômico</label>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={backtestVix} onChange={(e) => setBacktestVix(e.target.checked)} />
                  <span>VIX &gt; 25</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={backtestDxy} onChange={(e) => setBacktestDxy(e.target.checked)} />
                  <span>DXY &gt; Média 20</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={backtestEwz} onChange={(e) => setBacktestEwz(e.target.checked)} />
                  <span>EWZ &lt; Média 20</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={runningBacktest}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {runningBacktest ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            EXECUTAR SIMULAÇÃO DE BACKTEST
          </button>

          {backtestResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Resultado do Backtest para {backtestResult.asset}</span>
                <span className="text-xs font-mono text-slate-400">Amostra: {backtestResult.sampleOccurrences} Ocorrências</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="bg-slate-900 p-3 rounded">
                  <div className="text-[10px] text-slate-400">PROBABILIDADE ALTA</div>
                  <div className="text-lg font-bold text-emerald-400">{backtestResult.winBullishPercent}%</div>
                </div>
                <div className="bg-slate-900 p-3 rounded">
                  <div className="text-[10px] text-slate-400">PROBABILIDADE QUEDA</div>
                  <div className="text-lg font-bold text-rose-400">{backtestResult.winBearishPercent}%</div>
                </div>
                <div className="bg-slate-900 p-3 rounded">
                  <div className="text-[10px] text-slate-400">LATERAL</div>
                  <div className="text-lg font-bold text-slate-400">{backtestResult.winNeutralPercent}%</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono bg-slate-900 p-3 rounded">
                {backtestResult.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: SISTEMA DE PESOS (Section 7) */}
      {activeTab === 'WEIGHTS' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-cyan-400" />
                Sistema de Pesos Configuráveis dos Indicadores
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ajuste os pesos percentuais de cada indicador. Os Macro Scores de WIN, WDO e DOL são recalculados automaticamente.
              </p>
            </div>
            <button
              onClick={handleSaveWeights}
              disabled={savingWeights}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {savingWeights ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              SALVAR PESOS & RECALCULAR
            </button>
          </div>

          {weightsSuccessMsg && (
            <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              {weightsSuccessMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'DXY', label: 'Dólar Index Global (DXY)' },
              { key: 'VIX', label: 'CBOE Volatility Index (VIX)' },
              { key: 'EWZ', label: 'iShares MSCI Brazil ETF (EWZ)' },
              { key: 'SP500', label: 'S&P 500 Futures' },
              { key: 'US10Y', label: 'US Treasury 10 Anos (US10Y)' },
              { key: 'CDS_BRAZIL', label: 'CDS Brasil 5 Anos' },
              { key: 'USDBRL', label: 'Dólar Comercial & PTAX Oficial' },
              { key: 'COMMODITIES', label: 'Cesta de Commodities (Brent + Minério)' },
            ].map((item) => (
              <div key={item.key} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">{item.label}</span>
                  <span className="text-cyan-400 font-black">{weights[item.key] || 10}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights[item.key] || 10}
                  onChange={(e) => setWeights({ ...weights, [item.key]: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: 20 ATTRIBUTES DETAILS (Section 3) */}
      {selectedAssetDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{selectedAssetDetail.categoria}</span>
                <h3 className="text-lg font-black text-white">{selectedAssetDetail.ticker} — {selectedAssetDetail.nome}</h3>
              </div>
              <button
                onClick={() => setSelectedAssetDetail(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">1. Ticker:</span> <span className="text-white font-bold">{selectedAssetDetail.ticker}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">2. Nome:</span> <span className="text-white font-bold">{selectedAssetDetail.nome}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">3. Categoria:</span> <span className="text-white font-bold">{selectedAssetDetail.categoria}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">4. Preço Atual:</span> <span className="text-white font-bold">{selectedAssetDetail.precoAtual}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">5. Preço Anterior:</span> <span className="text-white font-bold">{selectedAssetDetail.precoAnterior.toFixed(2)}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">6. Variação Absoluta:</span> <span className="text-white font-bold">{selectedAssetDetail.variacaoAbsoluta.toFixed(2)}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">7. Variação Percentual:</span> <span className="text-white font-bold">{selectedAssetDetail.variacaoPercentual.toFixed(2)}%</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">8. Timestamp:</span> <span className="text-white font-bold">{selectedAssetDetail.timestamp}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">9. Fonte:</span> <span className="text-white font-bold">{selectedAssetDetail.fonte}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">10. Frequência:</span> <span className="text-white font-bold">{selectedAssetDetail.frequencia}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">11. Tendência:</span> <span className="text-white font-bold">{selectedAssetDetail.tendencia}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">12. Volatilidade:</span> <span className="text-white font-bold">{selectedAssetDetail.volatilidade.toFixed(2)}%</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">13. Momentum:</span> <span className="text-white font-bold">{selectedAssetDetail.momentum.toFixed(1)}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">14. Z-Score:</span> <span className="text-white font-bold">{selectedAssetDetail.zScore.toFixed(2)}σ</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">15. Correlação WIN:</span> <span className="text-white font-bold">{selectedAssetDetail.correlacaoComWin.toFixed(2)}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">16. Beta:</span> <span className="text-white font-bold">{selectedAssetDetail.beta.toFixed(2)}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">17. Impacto Macro:</span> <span className="text-white font-bold">{selectedAssetDetail.impactoMacro}</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">18. Peso:</span> <span className="text-white font-bold">{selectedAssetDetail.peso}%</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">19. Score:</span> <span className="text-white font-bold">{selectedAssetDetail.score}/100</span></div>
              <div className="bg-slate-950 p-2.5 rounded"><span className="text-slate-500">20. Confiança:</span> <span className="text-white font-bold">{(selectedAssetDetail.confianca * 100).toFixed(0)}%</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
