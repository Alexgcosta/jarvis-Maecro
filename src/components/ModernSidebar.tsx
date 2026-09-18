import React from 'react';
import { HUDView } from '../types';
import {
  Radio,
  TrendingUp,
  Activity,
  Newspaper,
  Calendar,
  Globe,
  Calculator,
  Layers,
  Key,
  Zap,
  Sliders,
  Terminal,
  Shield,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart2,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface ModernSidebarProps {
  currentView: HUDView;
  onViewChange: (view: HUDView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  indicatorsCount?: number;
}

interface NavItem {
  id: HUDView;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  indicatorsCount = 25,
}) => {
  const navGroups: NavGroup[] = [
    {
      groupTitle: 'MERCADO & OPERAÇÃO',
      items: [
        {
          id: 'mcp_hub',
          label: 'MCP Macro Hub (WIN/WDO)',
          shortLabel: 'MCP Macro Hub',
          description: 'Inteligência quantitativa, regimes, scores e 24 ferramentas',
          icon: <Cpu className="w-4 h-4 text-cyan-400" />,
          badge: 'OFICIAL MCP',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        },
        {
          id: 'win_leaders',
          label: 'WIN Global Leaders',
          shortLabel: 'WIN Leaders',
          description: 'Líderes globais e confluência do Mini Índice',
          icon: <Radio className="w-4 h-4 text-blue-400" />,
          badge: 'AO VIVO',
          badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        },
        {
          id: 'dashboard',
          label: 'Dashboard Quantitativo',
          shortLabel: 'Dashboard',
          description: 'Matriz de risco e gráficos intraday',
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        },
        {
          id: 'signals',
          label: 'Sinais & Confluência',
          shortLabel: 'Sinais WIN/WDO',
          description: 'Pontos estatísticos de entrada e alvos',
          icon: <BarChart2 className="w-4 h-4 text-amber-400" />,
          badge: 'WIN / WDO',
          badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        },
        {
          id: 'sentiment',
          label: 'Sentimento de Mercado',
          shortLabel: 'Sentimento',
          description: 'Termômetro Global e Brasil',
          icon: <Activity className="w-4 h-4 text-purple-400" />,
        },
      ],
    },
    {
      groupTitle: 'MACRO & ANÁLISE',
      items: [
        {
          id: 'macro_news',
          label: 'Notícias em Tempo Real',
          shortLabel: 'Notícias',
          description: 'Impacto macro cambial e de índice',
          icon: <Newspaper className="w-4 h-4 text-sky-400" />,
        },
        {
          id: 'calendar',
          label: 'Calendário Econômico',
          shortLabel: 'Calendário',
          description: 'IPCA, Payroll, Copom e Fed',
          icon: <Calendar className="w-4 h-4 text-indigo-400" />,
        },
        {
          id: 'sources',
          label: 'Fontes & Alertas Macro',
          shortLabel: 'Fontes Web',
          description: 'Hub de links e monitor de risco sistêmico',
          icon: <Globe className="w-4 h-4 text-teal-400" />,
        },
        {
          id: 'quant_calculator',
          label: 'Calculadora de Posição',
          shortLabel: 'Calculadora',
          description: 'Dimensionamento de lotes, risco e payoff',
          icon: <Calculator className="w-4 h-4 text-rose-400" />,
        },
        {
          id: 'diario',
          label: 'Diário de Trades',
          shortLabel: 'Diário',
          description: 'Registro de operações e acurácia',
          icon: <FileText className="w-4 h-4 text-zinc-300" />,
        },
      ],
    },
    {
      groupTitle: 'DADOS & CONECTORES',
      items: [
        {
          id: 'mcp',
          label: 'Mais Retorno API (25+ Ativos)',
          shortLabel: 'Mais Retorno MCP',
          description: 'Cesta com 25+ ativos em 5 grupos',
          icon: <Layers className="w-4 h-4 text-blue-400" />,
          badge: '25+ ATIVOS',
          badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        },
        {
          id: 'api',
          label: 'Chaves de API & Conectores',
          shortLabel: 'Chaves API',
          description: 'HG Brasil, Gemini, OpenAI, Claude',
          icon: <Key className="w-4 h-4 text-amber-400" />,
        },
        {
          id: 'partnr_api',
          label: 'Partnr Market Feed API',
          shortLabel: 'Partnr Feed',
          description: 'Streaming institucional de cotações',
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
        },
        {
          id: 'mqtt_stream',
          label: 'Extrator & Broadcast MQTT',
          shortLabel: 'Stream MQTT',
          description: 'Transmissão em tempo real para robôs',
          icon: <Radio className="w-4 h-4 text-emerald-400" />,
        },
        {
          id: 'configuracoes',
          label: 'Pesos & Parâmetros',
          shortLabel: 'Pesos do Modelo',
          description: 'Ajuste de pesos para cada indicador',
          icon: <Sliders className="w-4 h-4 text-zinc-400" />,
        },
        {
          id: 'terminal',
          label: 'Terminal de Comandos CLI',
          shortLabel: 'Terminal CLI',
          description: 'Linha de comando quântica direta',
          icon: <Terminal className="w-4 h-4 text-zinc-300" />,
        },
        {
          id: 'auth',
          label: 'Autenticação Método Macro',
          shortLabel: 'Autenticação',
          description: 'Credenciais e tokens de acesso',
          icon: <Shield className="w-4 h-4 text-zinc-400" />,
        },
      ],
    },
  ];

  const handleSelect = (id: HUDView) => {
    soundFX.playClick();
    onViewChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-300 lg:static ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80 bg-zinc-950">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-sm tracking-tight text-zinc-100">
                    MacroDesk
                  </span>
                  <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    v4.2
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  TERMINAL QUANTITATIVO
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              title="Recolher Barra Lateral"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand button on rail */}
        {collapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-zinc-800/60">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
              title="Expandir Barra Lateral"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold text-zinc-400 tracking-wider">
                  {group.groupTitle}
                </div>
              )}

              {group.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-item-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    title={collapsed ? `${item.label} — ${item.description}` : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all relative ${
                      isActive
                        ? 'bg-zinc-900 border border-zinc-700 text-zinc-100 font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-blue-500" />
                    )}

                    <div
                      className={`p-1.5 rounded-md shrink-0 transition-colors ${
                        isActive
                          ? 'bg-blue-600/15 border border-blue-500/30'
                          : 'bg-zinc-900/80 border border-zinc-800/80'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {!collapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
                        <div className="truncate">
                          <span className="text-xs font-heading font-medium truncate block">
                            {item.shortLabel}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {item.description}
                          </span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border shrink-0 ${
                              item.badgeColor || 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom System Status Widget */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950">
          {!collapsed ? (
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Feed Conectado
                </span>
                <span className="font-mono text-[10px] text-zinc-400">18ms</span>
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                <span>Ativos Monitorados:</span>
                <strong className="text-zinc-200 font-mono">{indicatorsCount}</strong>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Feed Quantitativo: Conectado • 18ms">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

