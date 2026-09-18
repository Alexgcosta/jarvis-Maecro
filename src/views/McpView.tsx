import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Code,
  Cpu,
  ShieldCheck,
  Box,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Activity,
  BarChart2,
  Layers,
  Sparkles,
  Copy,
  Check,
  Database,
  Globe,
  Zap,
  ExternalLink,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { MaisRetornoMacroBasket } from '../components/MaisRetornoMacroBasket';
import { McpMacroHubDashboard } from '../components/McpMacroHubDashboard';

interface McpToolSchema {
  name: string;
  title?: string;
  description: string;
  inputSchema?: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

interface McpStatusResponse {
  authenticated: boolean;
  serviceName: string;
  mcpUrl: string;
  keyMasked: string;
  status: string;
  latencyMs?: number;
  lastSync?: string;
  totalTools?: number;
  tools?: McpToolSchema[];
  error?: string;
}

export const McpView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hub' | 'basket' | 'maisretorno' | 'macrodesk_internal'>('hub');
  const [statusData, setStatusData] = useState<McpStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Playground execution state
  const [selectedTool, setSelectedTool] = useState<string>('search_assets');
  const [inputArgsJson, setInputArgsJson] = useState<string>('{\n  "query": "PETR4"\n}');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Fetch Mais Retorno MCP Status and Tool definitions
  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/maisretorno/status');
      const data: McpStatusResponse = await res.json();
      setStatusData(data);
    } catch (err: any) {
      console.warn('Falha ao obter status Mais Retorno MCP:', err);
    } finally {
      setLoadingStatus(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Quick preset queries for user convenience
  const presets = [
    {
      label: 'Buscar PETR4',
      tool: 'search_assets',
      args: { query: 'PETR4' },
    },
    {
      label: 'Buscar VALE3',
      tool: 'search_assets',
      args: { query: 'VALE3' },
    },
    {
      label: 'Cotações VALE3',
      tool: 'get_quotes',
      args: { identifier: 'vale3:b3', start_date: '2026-08-25', end_date: '2026-09-02' },
    },
    {
      label: 'Estatísticas PETR4',
      tool: 'get_asset_stats',
      args: { identifier: 'petr4:b3' },
    },
    {
      label: 'Drawdown IBOV',
      tool: 'get_drawdown',
      args: { identifier: 'ibov:idx' },
    },
    {
      label: 'Comparar PETR4 x VALE3',
      tool: 'compare_assets',
      args: { identifier_a: 'petr4:b3', identifier_b: 'vale3:b3' },
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    soundFX.playClick();
    setSelectedTool(preset.tool);
    setInputArgsJson(JSON.stringify(preset.args, null, 2));
    setExecutionError(null);
  };

  const handleSelectTool = (toolName: string) => {
    soundFX.playClick();
    setSelectedTool(toolName);
    setExecutionError(null);

    // Provide default template based on tool
    if (toolName === 'search_assets') {
      setInputArgsJson(JSON.stringify({ query: 'PETR4' }, null, 2));
    } else if (toolName === 'get_asset_info') {
      setInputArgsJson(JSON.stringify({ identifier: 'petr4:b3' }, null, 2));
    } else if (toolName === 'get_quotes') {
      setInputArgsJson(JSON.stringify({ identifier: 'petr4:b3', start_date: '2026-08-20', end_date: '2026-09-02' }, null, 2));
    } else if (toolName === 'get_asset_stats') {
      setInputArgsJson(JSON.stringify({ identifier: 'petr4:b3' }, null, 2));
    } else if (toolName === 'get_drawdown') {
      setInputArgsJson(JSON.stringify({ identifier: 'vale3:b3' }, null, 2));
    } else if (toolName === 'compare_assets') {
      setInputArgsJson(JSON.stringify({ identifier_a: 'petr4:b3', identifier_b: 'vale3:b3' }, null, 2));
    } else if (toolName === 'get_rolling_windows') {
      setInputArgsJson(JSON.stringify({ identifier: 'petr4:b3', window_years: 1, benchmark: 'cdi:idx' }, null, 2));
    } else if (toolName === 'backtest_portfolio') {
      setInputArgsJson(JSON.stringify({
        allocations: [
          { identifier: 'petr4:b3', weight: 0.5 },
          { identifier: 'vale3:b3', weight: 0.5 }
        ],
        rebalance: { mode: 'none' }
      }, null, 2));
    } else {
      setInputArgsJson('{}');
    }
  };

  const handleExecuteTool = async () => {
    soundFX.playClick();
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);
    const startMs = Date.now();

    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(inputArgsJson);
      } catch (e: any) {
        throw new Error(`JSON de argumentos inválido: ${e.message}`);
      }

      const res = await fetch('/api/maisretorno/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTool,
          arguments: parsedArgs,
        }),
      });

      const data = await res.json();
      setExecutionLatency(Date.now() - startMs);

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Erro HTTP ${res.status}`);
      }

      soundFX.playSuccess();
      setExecutionResult(data.data || data.raw || data);
    } catch (err: any) {
      soundFX.playAlert();
      setExecutionError(err.message);
      setExecutionLatency(Date.now() - startMs);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyResult = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopiedResult(true);
    soundFX.playSuccess();
    setTimeout(() => setCopiedResult(false), 2000);
  };

  // Internal MacroDesk tools
  const macrodeskInternalTools = [
    {
      name: 'get_macro_sentiment',
      title: 'Termômetro Global & Brasil',
      description: 'Extrai o score de sentimento global e Brasil (-100 a +100) sem circularidade com cotações B3.',
      params: 'None',
      category: 'MACRO_CORE',
    },
    {
      name: 'get_market_confluence',
      title: 'Confluência de 4 Pilares',
      description: 'Calcula a confluência de 4 pilares normalizados (Força Alta, Força Baixa, Risk Score, Macro) e veredito.',
      params: 'None',
      category: 'QUANT_SIGNALS',
    },
    {
      name: 'analyze_win_wdo_bias',
      title: 'Viés Direcional WIN & WDO',
      description: 'Avalia o viés direcional, farol operacional e níveis de rompimento para Mini Índice (WIN) e Mini Dólar (WDO).',
      params: 'asset: "WIN" | "WDO"',
      category: 'FUTURES',
    },
    {
      name: 'detect_macro_divergences',
      title: 'Rastreador de Divergências Macro',
      description: 'Detecta conflitos estatísticos entre preços intradiários e fundamentos macroeconômicos (Curva de Juros DI vs WIN, Dólar vs DXY).',
      params: 'None',
      category: 'ANOMALY_DETECTION',
    },
  ];

  const maisRetornoTools = statusData?.tools || [
    { name: 'search_assets', title: 'Search assets', description: 'Search assets across all asset classes (Ações, BDRs, FIIs, Fundos, Índices).' },
    { name: 'get_asset_info', title: 'Asset master info', description: 'Get master/cadastral info for a specific asset.' },
    { name: 'get_quotes', title: 'Historical quotes', description: 'Historical closing price series and date timestamps.' },
    { name: 'get_asset_stats', title: 'Performance statistics', description: 'Trailing returns, Sharpe, Volatility and Sortino ratios.' },
    { name: 'compare_assets', title: 'Compare assets', description: 'Compare 2 to 10 assets over the same date window in a single call.' },
    { name: 'get_drawdown', title: 'Drawdown (underwater) series', description: 'Underwater series and max drawdown relative to selected window.' },
    { name: 'get_rolling_windows', title: 'Rolling window returns', description: 'Annualized returns for every rolling window of N years vs CDI.' },
    { name: 'backtest_portfolio', title: 'Portfolio backtest', description: 'Simulate a static-weight portfolio: CAGR, volatility, max drawdown.' },
  ];

  const filteredTools = (activeTab === 'maisretorno' ? maisRetornoTools : macrodeskInternalTools).filter(
    (t) =>
      t.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (t.title && t.title.toLowerCase().includes(filterSearch.toLowerCase())) ||
      t.description.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div id="mcp-view-container" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Connection Status Banner */}
      <div id="mcp-header-card" className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-inner">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-orbitron font-extrabold text-lg sm:text-xl text-cyan-100 tracking-wide">
                    MCP // MODEL CONTEXT PROTOCOL CONSOLE
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-bold">
                    SPEC v4.0
                  </span>
                </div>
                <p className="font-tech text-xs sm:text-sm text-slate-300 mt-1">
                  Ponto de integração oficial de ferramentas analíticas para agentes LLM e inteligência de mercado J.A.R.V.I.S.
                </p>
              </div>
            </div>
          </div>

          {/* Live Status Indicators */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Servidor MCP</span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {statusData?.authenticated ? 'CONEXÃO ATIVA // AUTENTICADO' : 'CONECTANDO...'}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Chave Registrada</span>
              <span className="text-xs font-mono text-cyan-300">
                {statusData?.keyMasked || 'mr_5G...hzzc'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <button
              id="mcp-refresh-btn"
              onClick={fetchStatus}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-tech flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Testar Conexão MCP"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{refreshing ? 'Sincronizando...' : 'Testar Ping'}</span>
            </button>
          </div>
        </div>

        {/* Server Endpoint URL bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Endpoint:</span>
            <code className="text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-800 truncate">
              {statusData?.mcpUrl || 'https://data.maisretorno.com/mr-data/v4/mcp'}
            </code>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-slate-400">Latência: <strong className="text-emerald-400">{statusData?.latencyMs ? `${statusData.latencyMs}ms` : '98ms'}</strong></span>
            <span className="text-slate-400">Ferramentas: <strong className="text-cyan-300">{statusData?.totalTools || maisRetornoTools.length} ativas</strong></span>
          </div>
        </div>
      </div>

      {/* Main Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="tab-mcp-hub-dashboard"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('hub');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold flex items-center gap-2 transition-all ${
              activeTab === 'hub'
                ? 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 border border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>MCP MACRO HUB (WIN / WDO / DOL)</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button
            id="tab-macro-basket"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('basket');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold flex items-center gap-2 transition-all ${
              activeTab === 'basket'
                ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 border border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>CESTA MACRO // 5 GRUPOS (25+ ATIVOS)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            id="tab-maisretorno-mcp"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('maisretorno');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold flex items-center gap-2 transition-all ${
              activeTab === 'maisretorno'
                ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>FERRAMENTAS MCP ({maisRetornoTools.length})</span>
          </button>

          <button
            id="tab-macrodesk-internal-mcp"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('macrodesk_internal');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'macrodesk_internal'
                ? 'bg-blue-600/20 border border-blue-500 text-blue-100'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>FERRAMENTAS NATIVAS ({macrodeskInternalTools.length})</span>
          </button>
        </div>

        {activeTab !== 'basket' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar ferramentas..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-tech"
            />
          </div>
        )}
      </div>

      {/* Main Content by Active Tab */}
      {activeTab === 'hub' ? (
        <McpMacroHubDashboard />
      ) : activeTab === 'basket' ? (
        <MaisRetornoMacroBasket />
      ) : (
        /* Two-Column Layout: Tools Directory on Left, Live Execution Playground on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tools Grid */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Ferramentas Disponíveis no Servidor MCP
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {filteredTools.length} {filteredTools.length === 1 ? 'ferramenta' : 'ferramentas'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredTools.map((tool: any) => {
              const isSelected = selectedTool === tool.name;
              return (
                <div
                  key={tool.name}
                  onClick={() => handleSelectTool(tool.name)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                      : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Box className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="font-mono font-bold text-xs text-cyan-200">
                          {tool.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        {tool.title || 'tool'}
                      </span>
                    </div>
                    <p className="font-tech text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      {tool.inputSchema?.properties
                        ? `Parâmetros: ${Object.keys(tool.inputSchema.properties).join(', ')}`
                        : tool.params
                        ? `Parâmetros: ${tool.params}`
                        : 'JSON-RPC 2.0'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTool(tool.name);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase flex items-center gap-1 transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-cyan-300 hover:bg-cyan-900/60'
                      }`}
                    >
                      <span>Usar</span>
                      <Play className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTools.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 font-tech text-xs">
                Nenhuma ferramenta encontrada para o termo "{filterSearch}".
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Execution Console / Playground */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-sm text-slate-100">
                  PLAYGROUND // EXECUÇÃO MCP AO VIVO
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                Ferramenta: <strong>{selectedTool}</strong>
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                Exemplos de 1-Clique:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-tech transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arguments Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Argumentos (JSON):
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedTool}
                </span>
              </div>
              <textarea
                id="mcp-args-input"
                rows={5}
                value={inputArgsJson}
                onChange={(e) => setInputArgsJson(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 leading-relaxed custom-scrollbar"
                placeholder='{"query": "PETR4"}'
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-400">
                {executionLatency !== null && (
                  <span className="text-emerald-400">
                    Resposta em {executionLatency}ms
                  </span>
                )}
              </span>

              <button
                id="btn-exec-mcp"
                onClick={handleExecuteTool}
                disabled={isExecuting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>EXECUTANDO MCP...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>CHAMAR FERRAMENTA</span>
                  </>
                )}
              </button>
            </div>

            {/* Execution Error Banner */}
            {executionError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-tech flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-mono">Erro ao Executar MCP:</strong>
                  <span>{executionError}</span>
                </div>
              </div>
            )}

            {/* Execution Result Box */}
            {executionResult && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                      Resultado Retornado com Sucesso
                    </span>
                  </div>

                  <button
                    onClick={handleCopyResult}
                    className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[10px] font-mono px-2"
                  >
                    {copiedResult ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Formatted quick view if search or quotes */}
                {Array.isArray(executionResult) && (
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    <span className="text-[10px] uppercase text-slate-400 block font-bold mb-1">
                      {executionResult.length} Itens Encontrados:
                    </span>
                    {executionResult.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-cyan-300 font-bold">{item.identifier || item.shortname || `Item ${idx + 1}`}</span>
                        <span className="text-slate-300 text-[11px]">{item.nicename || item.type || ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw JSON View */}
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-64 custom-scrollbar leading-relaxed">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
