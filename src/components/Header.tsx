import React, { useState, useEffect } from 'react';
import {
  Activity,
  Radio,
  Clock,
  Settings,
  BookOpen,
  Cpu,
  Shield,
  RefreshCw,
  Key,
  Flame,
  Terminal,
  SlidersHorizontal,
} from 'lucide-react';
import { MarketSessionStatus, DataFreshnessStatus } from '../types/macroTypes';
import { getMarketSessionStatus, toCanonicalTimestamp } from '../calculations/timeSynchronization';
import { soundFX } from '../utils/soundEffects';

interface HeaderProps {
  currentView: 'dashboard' | 'configuracoes' | 'diario' | 'partnr' | 'mcp' | 'auth' | 'api';
  onNavigate: (view: 'dashboard' | 'configuracoes' | 'diario' | 'partnr' | 'mcp' | 'auth' | 'api') => void;
  dataStatus: DataFreshnessStatus;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenManualEntry: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  dataStatus,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onOpenManualEntry,
}) => {
  const [timeSP, setTimeSP] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<{
    session: MarketSessionStatus;
    label: string;
    isTradingHours: boolean;
  }>(getMarketSessionStatus());

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setTimeSP(
        now.toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setSessionInfo(getMarketSessionStatus(now));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (dataStatus) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300',
          dot: 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]',
          label: '🟢 LIVE // SESSÃO EM TEMPO REAL',
        };
      case 'DELAYED':
        return {
          bg: 'bg-amber-950/80 border-amber-400/50 text-amber-300',
          dot: 'bg-amber-400 animate-ping',
          label: '🟡 DELAYED // DADOS COM DEFASAGEM',
        };
      case 'STALE':
        return {
          bg: 'bg-red-950/80 border-red-400/50 text-red-300',
          dot: 'bg-red-500',
          label: '🔴 STALE // DADOS DEFASADOS',
        };
      case 'SIMULATED':
      default:
        return {
          bg: 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300',
          dot: 'bg-cyan-400',
          label: '⚪ SIMULATED // MODO SIMULAÇÃO CANÔNICA',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div
              onClick={() => onNavigate('dashboard')}
              className="cursor-pointer relative group p-2 rounded-xl bg-gradient-to-br from-cyan-950/90 to-blue-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform"
            >
              <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin-slow flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-extrabold text-base sm:text-lg tracking-wider text-cyan-100">
                  GLOBAL EYE
                </h1>
                <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold tracking-widest uppercase">
                  RASTREADOR MACRO
                </span>
                <span className="hidden sm:inline font-tech text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-400/30 text-blue-300">
                  QUANT PRO
                </span>
              </div>
              <p className="font-tech text-xs text-slate-400 hidden sm:block">
                Intraday Confluence & Macro Intelligence Engine // WIN (Mini Índice) × WDO (Mini Dólar)
              </p>
            </div>
          </div>

          {/* Quick Refresh mobile button */}
          <button
            onClick={() => {
              soundFX.playActivation();
              onRefresh();
            }}
            disabled={isRefreshing}
            className="md:hidden p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Center: Live Status & Market Clock */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {/* Market Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-tech text-xs ${statusBadge.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span className="font-bold tracking-wider">{statusBadge.label}</span>
          </div>

          {/* Session Clock (America/Sao_Paulo) */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-slate-300 font-mono text-xs shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-200 font-bold tracking-wider">{timeSP || '--:--:--'}</span>
            <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">(SP)</span>
          </div>

          {/* Market Session Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/50 text-[11px] font-tech text-slate-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>{sessionInfo.label}</span>
          </div>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto justify-end">
          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('dashboard');
            }}
            className={`px-3 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1.5 transition-all ${
              currentView === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('diario');
            }}
            className={`px-3 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1.5 transition-all ${
              currentView === 'diario'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DIÁRIO DE TRADE</span>
            <span className="sm:hidden">DIÁRIO</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('partnr');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1.5 transition-all ${
              currentView === 'partnr'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
            title="Partnr API Data Services"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>PARTNR</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('configuracoes');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1.5 transition-all ${
              currentView === 'configuracoes'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
            title="Configurações de Pesos e Polling"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AJUSTES</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('mcp');
            }}
            className={`px-2 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1 transition-all ${
              currentView === 'mcp'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
            title="Ferramentas MCP (Model Context Protocol)"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>MCP</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('api');
            }}
            className={`px-2.5 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1.5 transition-all ${
              currentView === 'api'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
            title="Gestão de Chaves de API e Provedores de Dados"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold">API</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onNavigate('auth');
            }}
            className={`px-2 py-1.5 rounded-lg font-tech text-xs flex items-center gap-1 transition-all ${
              currentView === 'auth'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-cyan-300 border border-slate-800'
            }`}
            title="Autenticação e Método Macro Key"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">AUTH</span>
          </button>

          {/* Quick Manual Entry Trigger */}
          <button
            onClick={() => {
              soundFX.playActivation();
              onOpenManualEntry();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-xs font-tech flex items-center gap-1 transition-colors"
            title="Entrada Manual de Cotações / Offline Mode"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">MANUAL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
