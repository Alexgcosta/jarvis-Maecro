import React, { useState, useEffect, useMemo } from 'react';
import { HUDView } from '../types';
import {
  Search,
  X,
  TrendingUp,
  Radio,
  Sparkles,
  Activity,
  Globe,
  Newspaper,
  Calendar,
  Calculator,
  Terminal,
  Cpu,
  Key,
  Zap,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  Shield,
  Layers
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: HUDView;
  onSelectView: (view: HUDView) => void;
  onRefreshData?: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'SUÍTE OPERACIONAL' | 'INTELIGÊNCIA & MACRO' | 'DADOS & CONECTORES' | 'AÇÕES RÁPIDAS';
  icon: React.ReactNode;
  viewId?: HUDView;
  action?: () => void;
  badge?: string;
  keywords: string[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  onRefreshData,
  onToggleSound,
  soundEnabled = true,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape, Open on Ctrl+K / Cmd+K handled globally
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(() => [
    // Operacional
    {
      id: 'mcp_hub',
      title: 'MCP Macro Hub (WIN, WDO, DOL)',
      description: 'Inteligência quantitativa profissional, regimes Risk-On/Off, 24 MCP Tools e Panorama de 14 Etapas',
      category: 'SUÍTE OPERACIONAL',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      viewId: 'mcp_hub',
      badge: 'MCP HUB',
      keywords: ['mcp', 'macro', 'hub', 'win', 'wdo', 'dol', 'regime', 'panorama', 'quant', 'score'],
    },
    {
      id: 'win_leaders',
      title: 'WIN Global Leaders',
      description: 'Líderes globais, termômetro e confluência para o Mini Índice (WIN)',
      category: 'SUÍTE OPERACIONAL',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      viewId: 'win_leaders',
      badge: 'AO VIVO',
      keywords: ['win', 'índice', 'b3', 'global', 'leaders', 'confluencia', 'ibov'],
    },
    {
      id: 'dashboard',
      title: 'Master Dashboard Quantitativo',
      description: 'Painel completo com gráficos intraday, correlações e matriz de risco',
      category: 'SUÍTE OPERACIONAL',
      icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
      viewId: 'dashboard',
      keywords: ['dashboard', 'master', 'quant', 'graficos', 'matriz', 'risco'],
    },
    {
      id: 'signals',
      title: 'Sinais & Confluência Operacional',
      description: 'Sinais quantitativos de entrada e saída estatística para WIN e WDO',
      category: 'SUÍTE OPERACIONAL',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      viewId: 'signals',
      keywords: ['sinais', 'buy', 'sell', 'wdo', 'win', 'chat', 'ia', 'confluencia'],
    },
    {
      id: 'sentiment',
      title: 'Termômetro de Sentimento',
      description: 'Análise de sentimento global e Brasil, correlações DXY e S&P',
      category: 'SUÍTE OPERACIONAL',
      icon: <Activity className="w-4 h-4 text-cyan-300" />,
      viewId: 'sentiment',
      keywords: ['sentimento', 'termometro', 'dxy', 'sp500', 'drivers', 'score'],
    },

    // Macro & Inteligência
    {
      id: 'macro_news',
      title: 'Notícias em Tempo Real',
      description: 'Feed de notícias macroeconômicas com pontuação de impacto cambial e índice',
      category: 'INTELIGÊNCIA & MACRO',
      icon: <Newspaper className="w-4 h-4 text-blue-400" />,
      viewId: 'macro_news',
      keywords: ['noticias', 'news', 'feed', 'reuters', 'bloomberg', 'fed', 'banco central'],
    },
    {
      id: 'calendar',
      title: 'Calendário Econômico',
      description: 'Indicadores econômicos (IPCA, Payroll, CPI, FOMC, Copom)',
      category: 'INTELIGÊNCIA & MACRO',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
      viewId: 'calendar',
      keywords: ['calendario', 'ipca', 'payroll', 'cpi', 'copom', 'fomc', 'taxa de juros'],
    },
    {
      id: 'sources',
      title: 'Fontes Web & Macro Warning',
      description: 'Hub de links e monitor de risco sistêmico global',
      category: 'INTELIGÊNCIA & MACRO',
      icon: <Globe className="w-4 h-4 text-teal-400" />,
      viewId: 'sources',
      keywords: ['fontes', 'macrowarning', 'finviz', 'advfn', 'reuters', 'links'],
    },
    {
      id: 'quant_calculator',
      title: 'Calculadora de Posição Quantitativa',
      description: 'Dimensionamento de lotes, risco/retorno e payoff para WIN e WDO',
      category: 'INTELIGÊNCIA & MACRO',
      icon: <Calculator className="w-4 h-4 text-rose-400" />,
      viewId: 'quant_calculator',
      keywords: ['calculadora', 'lotes', 'risco', 'posicao', 'stop', 'alvo', 'payoff'],
    },
    {
      id: 'diario',
      title: 'Diário de Trades & Performance',
      description: 'Registro de operações, estatísticas de acerto e anotações técnicas',
      category: 'INTELIGÊNCIA & MACRO',
      icon: <Activity className="w-4 h-4 text-indigo-400" />,
      viewId: 'diario',
      keywords: ['diario', 'trades', 'registro', 'performance', 'taxa de acerto', 'lucro'],
    },

    // Dados & Conectores
    {
      id: 'mcp',
      title: 'MCP Tools & Mais Retorno API',
      description: 'Cesta com 25+ ativos e ferramentas de extração direta de dados',
      category: 'DADOS & CONECTORES',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      viewId: 'mcp',
      badge: '25+ ATIVOS',
      keywords: ['mcp', 'mais retorno', 'ferramentas', 'cesta', 'commodities', 'adrs'],
    },
    {
      id: 'api',
      title: 'Chaves API & Conectores',
      description: 'Gerenciamento de chaves HG Brasil, Gemini, OpenAI, Claude e mais',
      category: 'DADOS & CONECTORES',
      icon: <Key className="w-4 h-4 text-amber-300" />,
      viewId: 'api',
      keywords: ['api', 'chaves', 'hg brasil', 'gemini', 'credenciais', 'tokens'],
    },
    {
      id: 'partnr_api',
      title: 'Partnr Market Feed API',
      description: 'Integração de streaming em tempo real com provedores institucionais',
      category: 'DADOS & CONECTORES',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      viewId: 'partnr_api',
      keywords: ['partnr', 'feed', 'streaming', 'cotacoes', 'tempo real'],
    },
    {
      id: 'mqtt_stream',
      title: 'Extrator & Streamer MQTT',
      description: 'Transmissão em broadcast dos sinais quantitativos para robôs e terminais',
      category: 'DADOS & CONECTORES',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      viewId: 'mqtt_stream',
      keywords: ['mqtt', 'stream', 'broadcast', 'robo', 'metatrader', 'profit'],
    },
    {
      id: 'configuracoes',
      title: 'Pesos & Configurações Algorítmicas',
      description: 'Ajuste de pesos quantitativos para cada indicador macro do modelo',
      category: 'DADOS & CONECTORES',
      icon: <Cpu className="w-4 h-4 text-slate-300" />,
      viewId: 'configuracoes',
      keywords: ['configuracoes', 'pesos', 'parametros', 'algoritmo', 'formula'],
    },
    {
      id: 'terminal',
      title: 'Terminal CLI & Comandos',
      description: 'Linha de comando quântica interativa para consultas rápidas',
      category: 'DADOS & CONECTORES',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      viewId: 'terminal',
      keywords: ['terminal', 'cli', 'console', 'bash', 'comandos', 'raw'],
    },
    {
      id: 'auth',
      title: 'Método Macro Autenticação',
      description: 'Credenciais vinculadas do ecossistema Método Macro',
      category: 'DADOS & CONECTORES',
      icon: <Shield className="w-4 h-4 text-cyan-300" />,
      viewId: 'auth',
      keywords: ['metodo macro', 'auth', 'chave', 'token', 'login'],
    },

    // Ações Rápidas
    {
      id: 'action-refresh',
      title: 'Forçar Atualização de Cotações',
      description: 'Requisitar dados frescos de todos os indicadores em tempo real',
      category: 'AÇÕES RÁPIDAS',
      icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
      action: () => {
        if (onRefreshData) onRefreshData();
      },
      keywords: ['atualizar', 'refresh', 'recarregar', 'sincronizar', 'cotacoes'],
    },
    {
      id: 'action-sound',
      title: soundEnabled ? 'Desativar Efeitos Sonoros' : 'Ativar Efeitos Sonoros',
      description: 'Alternar áudio tático do terminal',
      category: 'AÇÕES RÁPIDAS',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      action: () => {
        if (onToggleSound) onToggleSound();
      },
      keywords: ['som', 'audio', 'efeitos', 'mudo', 'silenciar'],
    },
  ], [onRefreshData, onToggleSound, soundEnabled]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [commands, query]);

  const handleSelect = (cmd: CommandItem) => {
    soundFX.playClick();
    if (cmd.viewId) {
      onSelectView(cmd.viewId);
    } else if (cmd.action) {
      cmd.action();
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-950/80 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Navegar para módulo, ação ou ativo... (Ex: WIN, Notícias, API, Atualizar)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-zinc-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">
              Nenhum módulo ou comando encontrado para "{query}".
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              const isCurrent = cmd.viewId === currentView;

              return (
                <div
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm'
                      : 'hover:bg-zinc-850 border border-transparent text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-zinc-700/80 border border-zinc-600' : 'bg-zinc-950 border border-zinc-800'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-medium text-xs sm:text-sm text-zinc-100 truncate">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {cmd.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            ATUAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {cmd.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                      {cmd.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-blue-400' : 'text-zinc-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">↑↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">ENTER</kbd>
              <span>Selecionar</span>
            </span>
          </div>
          <span className="text-blue-400 font-mono">
            {filteredCommands.length} resultados
          </span>
        </div>
      </div>
    </div>
  );
};
