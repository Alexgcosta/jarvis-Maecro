import React from 'react';
import {
  HUDView,
  HUDTheme,
  AIModelType,
} from '../types';
import {
  TrendingUp,
  Activity,
  Globe,
  Newspaper,
  Calendar,
  Calculator,
  Terminal,
  Volume2,
  VolumeX,
  Mic,
  Cpu,
  ShieldAlert,
  Zap,
  Sparkles,
  Radio,
  Key,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface TopBarProps {
  currentView: HUDView;
  onViewChange: (view: HUDView) => void;
  theme: HUDTheme;
  onThemeChange: (theme: HUDTheme) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  voiceAutoSpeak: boolean;
  onToggleVoiceAutoSpeak: () => void;
  aiModel?: AIModelType;
  onAIModelChange?: (model: AIModelType) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onViewChange,
  theme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  language,
  onLanguageChange,
  voiceAutoSpeak,
  onToggleVoiceAutoSpeak,
  aiModel = 'gemini-3.7-flash',
  onAIModelChange,
}) => {
  const views: { id: HUDView; label: string; icon: React.ReactNode }[] = [
    { id: 'win_leaders', label: '👑 WIN Global Leaders', icon: <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> },
    { id: 'dashboard', label: '📊 Master Dashboard', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'signals', label: '🎯 Sinais & HUD', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'sources', label: '🌐 Fontes Web', icon: <Globe className="w-4 h-4" /> },
    { id: 'sentiment', label: '🌡️ Sentimento', icon: <Activity className="w-4 h-4" /> },
    { id: 'macro_news', label: '📰 Notícias', icon: <Newspaper className="w-4 h-4" /> },
    { id: 'calendar', label: '📅 Calendário', icon: <Calendar className="w-4 h-4" /> },
    { id: 'quant_calculator', label: '🧮 Calculadora', icon: <Calculator className="w-4 h-4" /> },
    { id: 'terminal', label: '💻 CLI', icon: <Terminal className="w-4 h-4" /> },
    { id: 'configuracoes', label: '⚙️ Pesos & Setup', icon: <Cpu className="w-4 h-4" /> },
    { id: 'api', label: '🔑 Chaves API', icon: <Key className="w-4 h-4 text-cyan-300" /> },
    { id: 'diario', label: '📔 Diário Trade', icon: <Activity className="w-4 h-4" /> },
    { id: 'partnr_api', label: '⚡ Partnr API', icon: <Zap className="w-4 h-4" /> },
    { id: 'mqtt_stream', label: '📡 Extrator MQTT', icon: <Radio className="w-4 h-4" /> },
    { id: 'mcp', label: '🤖 MCP Tools', icon: <Cpu className="w-4 h-4" /> },
    { id: 'auth', label: '🔑 Método Macro', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/25 px-3 sm:px-6 py-2.5 shadow-[0_4px_20px_rgba(6,182,212,0.15)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            {/* Animated glowing Arc Reactor icon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
              <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-ping opacity-30" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-widest text-cyan-100">
                  J.A.R.V.I.S.
                </span>
                <span className="text-[10px] font-tech px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold uppercase tracking-wider">
                  MACRO QUANT AGENT
                </span>
                <button
                  onClick={() => onViewChange('sources')}
                  className="hidden sm:flex items-center gap-1 text-[9px] font-tech px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-400/50 text-cyan-300 transition-colors"
                  title="Método Macro Autenticado: app.metodomacro.com.br (Chave vinculada: 86422ca8...17019)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>MÉTODO MACRO: [86422ca8...]</span>
                </button>
                <span className="hidden lg:inline text-[9px] font-tech px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  {aiModel === 'gemini-3.7-flash'
                    ? '⚡ GEMINI 3.7 FLASH'
                    : aiModel === 'gemini-2.5-pro'
                    ? '🧠 GEMINI 2.5 PRO'
                    : '🟢 CHATGPT 4O'}
                </span>
              </div>
              <p className="text-[10px] font-tech text-slate-400">
                STARK CAPITAL QUANTITATIVE INTELLIGENCE // B3 & GLOBAL
              </p>
            </div>
          </div>

          {/* Quick status mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50'
                  : 'border-slate-700 text-slate-500 bg-slate-900'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
          {views.map((v) => {
            const isActive = currentView === v.id;
            return (
              <button
                key={v.id}
                id={`nav-tab-${v.id}`}
                onClick={() => {
                  soundFX.playBlip(1000);
                  onViewChange(v.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-tech text-xs whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                    : 'bg-slate-900/60 border-cyan-500/15 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30'
                }`}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Settings (Sound, Theme, Auto-voice, AI Engine) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Sound FX Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => {
              soundFX.playBlip(1100);
              onToggleSound();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                : 'border-slate-800 text-slate-500 bg-slate-900/40'
            }`}
            title={soundEnabled ? 'Efeitos Sonoros Ativados' : 'Silenciar Sons'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Voice Output Toggle */}
          <button
            id="btn-toggle-voice"
            onClick={() => {
              soundFX.playBlip(1100);
              onToggleVoiceAutoSpeak();
            }}
            className={`px-2.5 py-1.5 rounded-xl border font-tech text-xs flex items-center gap-1.5 transition-colors ${
              voiceAutoSpeak
                ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40'
                : 'border-slate-800 text-slate-500 bg-slate-900/40'
            }`}
            title="Leitura de Voz por J.A.R.V.I.S."
          >
            <Mic className="w-3.5 h-3.5" />
            <span>VOZ: {voiceAutoSpeak ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

