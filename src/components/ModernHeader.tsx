import React, { useState, useEffect } from 'react';
import { HUDView, AIModelType, MacroMarketQuote } from '../types';
import {
  Menu,
  Search,
  Volume2,
  VolumeX,
  Mic,
  RefreshCw,
  Bot,
  Key,
  TrendingUp,
  TrendingDown,
  Clock,
  Activity,
  Layers,
  BarChart2,
  Radio
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface ModernHeaderProps {
  currentView: HUDView;
  onViewChange: (view: HUDView) => void;
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceAutoSpeak: boolean;
  onToggleVoiceAutoSpeak: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  quotes?: MacroMarketQuote[];
  aiModel?: AIModelType;
  onAIModelChange?: (model: AIModelType) => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  currentView,
  onViewChange,
  onOpenMobileNav,
  onOpenCommandPalette,
  onToggleCopilot,
  isCopilotOpen,
  soundEnabled,
  onToggleSound,
  voiceAutoSpeak,
  onToggleVoiceAutoSpeak,
  onRefreshData,
  isRefreshing,
  quotes = [],
}) => {
  // Live clocks for São Paulo and New York
  const [times, setTimes] = useState({
    sp: '',
    ny: '',
    b3Open: true,
    nyOpen: true,
  });

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      const spStr = now.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const nyStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const spHour = parseInt(
        now.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }),
        10
      );
      const isB3 = spHour >= 9 && spHour < 18;
      const isNY = spHour >= 10 && spHour < 17;

      setTimes({
        sp: spStr,
        ny: nyStr,
        b3Open: isB3,
        nyOpen: isNY,
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const winQuote = quotes.find((q) => q.ticker === 'WIN$') || { price: '186.930', change: '+0.39%', positive: true };
  const wdoQuote = quotes.find((q) => q.ticker === 'USD/BRL') || { price: 'R$ 5,128', change: '-0.37%', positive: false };
  const spQuote = quotes.find((q) => q.ticker === 'S&P 500') || { price: '5.890', change: '+0.35%', positive: true };

  const viewTitles: Record<HUDView, string> = {
    mcp_hub: 'MCP Macro Hub // Inteligência WIN • WDO • DOL',
    win_leaders: 'WIN Global Leaders // Cesta Macro B3',
    dashboard: 'Dashboard Macro // Análise Quantitativa',
    signals: 'Sinais & Confluência Operacional',
    sentiment: 'Sentimento de Mercado // Global & Brasil',
    sources: 'Fontes & Alertas Sistêmicos',
    macro_news: 'Notícias Macroeconômicas em Tempo Real',
    calendar: 'Calendário Econômico Intraday',
    quant_calculator: 'Calculadora de Risco & Payoff',
    terminal: 'Terminal CLI & Comandos',
    configuracoes: 'Parâmetros & Pesos Algorítmicos',
    diario: 'Diário de Trades & Performance',
    api: 'Chaves de API & Conectores',
    partnr_api: 'Partnr Market Feed API',
    mcp: 'Cesta Macro MCP // 25+ Ativos Mais Retorno',
    mqtt_stream: 'Broadcast & Extrator MQTT',
    auth: 'Autenticação & Credenciais',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-zinc-950/95 border-b border-zinc-800 backdrop-blur-xl px-3 sm:px-5 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu + Platform Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 lg:hidden transition-colors border border-zinc-800"
            title="Menu de Navegação"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Platform Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-sm tracking-tight text-zinc-100">
                  MacroDesk
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                {viewTitles[currentView] || 'Terminal Quantitativo'}
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenCommandPalette();
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all text-xs ml-2"
            title="Buscar módulo ou ação (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Buscar módulo, ativo ou comando...</span>
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400 ml-1">
              ⌘K
            </kbd>
          </button>

          {/* Quick Top View Switcher */}
          <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs">
            <button
              onClick={() => {
                soundFX.playClick();
                onViewChange('signals');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                currentView === 'signals'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title="Painel de Sinais WIN e WDO (Volatilidade, Metas e Alvos)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Sinais WIN/WDO</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onViewChange('win_leaders');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                currentView === 'win_leaders'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title="Cesta Macro WIN Global Leaders"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>WIN Leaders</span>
            </button>
            <button
              onClick={() => {
                soundFX.playClick();
                onViewChange('dashboard');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              title="Dashboard Quantitativo Completo"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        {/* Center: Live Financial Markets Hours & Sessions */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800/80">
            <span className="text-zinc-400 font-medium">B3 (SP):</span>
            <span className="font-mono text-zinc-200 tabular-nums">{times.sp || '--:--:--'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                times.b3Open
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {times.b3Open ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800/80">
            <span className="text-zinc-400 font-medium">NYSE/CME:</span>
            <span className="font-mono text-zinc-200 tabular-nums">{times.ny || '--:--:--'}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                times.nyOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {times.nyOpen ? 'ABERTO' : 'FECHADO'}
            </span>
          </div>
        </div>

        {/* Right: Market Chips + Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Real-Time Quotes */}
          <div className="hidden lg:flex items-center gap-1.5">
            <div
              onClick={() => {
                soundFX.playClick();
                onViewChange('signals');
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-mono cursor-pointer transition-all"
              title="Abrir Painel de Sinais WIN"
            >
              <span className="text-blue-400 font-bold">WIN</span>
              <span className="text-zinc-200 tabular-nums">{winQuote.price}</span>
              <span className={`tabular-nums font-semibold ${winQuote.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {winQuote.change}
              </span>
            </div>

            <div
              onClick={() => {
                soundFX.playClick();
                onViewChange('signals');
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-mono cursor-pointer transition-all"
              title="Abrir Painel de Sinais WDO"
            >
              <span className="text-amber-400 font-bold">WDO</span>
              <span className="text-zinc-200 tabular-nums">{wdoQuote.price}</span>
              <span className={`tabular-nums font-semibold ${wdoQuote.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {wdoQuote.change}
              </span>
            </div>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => {
              soundFX.playClick();
              onRefreshData();
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-800 transition-colors disabled:opacity-50"
            title="Atualizar Dados Agora"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Sound Action */}
          <button
            onClick={() => {
              soundFX.playBlip(1000);
              onToggleSound();
            }}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                : 'border-zinc-800 text-zinc-500 bg-zinc-900'
            }`}
            title={soundEnabled ? 'Sons Ativados' : 'Sons Desativados'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Voice Action */}
          <button
            onClick={() => {
              soundFX.playBlip(1000);
              onToggleVoiceAutoSpeak();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              voiceAutoSpeak
                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                : 'border-zinc-800 text-zinc-400 bg-zinc-900'
            }`}
            title="Leitura por Voz de Notícias e Alertas"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voz</span>
          </button>

          {/* API Keys */}
          <button
            onClick={() => {
              soundFX.playClick();
              onViewChange('api');
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
            title="Configurar Conectores & Chaves de API"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Conectores API</span>
          </button>

          {/* AI Copilot Drawer Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              onToggleCopilot();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
              isCopilotOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-zinc-200 hover:border-blue-500/50'
            }`}
            title="Abrir Assistente Quantitativo"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Assistente IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};

