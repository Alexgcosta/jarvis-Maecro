import React from 'react';
import {
  WinGlobalLeadersState,
} from '../../types/winGlobalLeadersTypes';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Zap,
  Radio,
  Clock,
  Compass,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

interface WinLeadersTopPanelProps {
  state: WinGlobalLeadersState;
  onOpenManualModal?: () => void;
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WinLeadersTopPanel: React.FC<WinLeadersTopPanelProps> = ({
  state,
  onOpenManualModal,
  onForceRefresh,
  isRefreshing,
}) => {
  const isScorePositive = state.winGlobalScore >= 0;
  const isBullishDominant = state.bullishStrength > state.bearishStrength;

  return (
    <div id="win_leaders_top_section" className="space-y-4">
      {/* 1. Header Banner & Subtitle */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded text-cyan-300 font-mono text-xs tracking-wider font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>GLOBAL EYE</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-tech tracking-wider text-white flex items-center gap-2">
                <span># WIN GLOBAL LEADERS</span>
              </h1>
            </div>
            <p className="text-cyan-400/80 font-sans text-xs sm:text-sm mt-1.5 italic font-medium">
              &quot;Confluência global, Brasil, commodities, câmbio e fluxo para leitura do WIN&quot;
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>SP: <strong className="text-cyan-300">{state.formattedTimeSaoPaulo}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">LIVE</span>
            </div>

            {onOpenManualModal && (
              <button
                id="btn_manual_ewz_modal"
                onClick={() => {
                  soundFX.playClick();
                  onOpenManualModal();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg font-tech text-xs font-bold transition-all flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ENTRADA MANUAL</span>
              </button>
            )}

            {onForceRefresh && (
              <button
                id="btn_refresh_win_leaders"
                onClick={() => {
                  soundFX.playClick();
                  onForceRefresh();
                }}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-400 rounded-lg font-tech text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Activity className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'SINCRONIZANDO...' : 'ATUALIZAR'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards: WIN GLOBAL SCORE, BULLISH/BEARISH, CONFLUENCE, CONFIDENCE, RISK, FARÓIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: WIN GLOBAL SCORE */}
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold tracking-wider text-slate-400 uppercase">
              1. WIN GLOBAL SCORE
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              state.winGlobalScore >= 30
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : state.winGlobalScore <= -30
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
            }`}>
              {state.winGlobalScore >= 30 ? 'FORTE ALTA' : state.winGlobalScore <= -30 ? 'FORTE BAIXA' : 'NEUTRO'}
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-black font-tech ${
              isScorePositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isScorePositive ? `+${state.winGlobalScore}` : state.winGlobalScore}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 100</span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">WIN Atual:</span>
              <span className="text-white font-bold">{state.winPriceState.currentPrice.toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Retorno Sessão:</span>
              <span className={state.winPriceState.returnPercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {state.winPriceState.returnPercent >= 0 ? `+${state.winPriceState.returnPercent}%` : `${state.winPriceState.returnPercent}%`}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: BULLISH & BEARISH STRENGTH */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold tracking-wider text-slate-400 uppercase">
              2. FORÇAS RELATIVAS
            </span>
            <span className="text-[10px] font-mono text-cyan-400">0 a 100</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            {/* Bullish */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-tech text-emerald-300 font-bold">
                <TrendingUp className="w-3 h-3" />
                <span>BULLISH</span>
              </div>
              <div className="text-2xl font-black font-tech text-emerald-400 mt-1">
                {state.bullishStrength}
              </div>
            </div>

            {/* Bearish */}
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] font-tech text-rose-300 font-bold">
                <TrendingDown className="w-3 h-3" />
                <span>BEARISH</span>
              </div>
              <div className="text-2xl font-black font-tech text-rose-400 mt-1">
                {state.bearishStrength}
              </div>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${state.bullishStrength}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{ width: `${state.bearishStrength}%` }}
            />
          </div>
        </div>

        {/* CARD 3: CONFLUENCE SCORE & CONFIDENCE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold tracking-wider text-slate-400 uppercase">
              3. CONFLUÊNCIA & CONFIANÇA
            </span>
            <span className="px-1.5 py-0.5 bg-cyan-900/40 border border-cyan-500/40 rounded text-[10px] font-mono text-cyan-300">
              9 Grupos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Confluence:</span>
              <span className="text-2xl font-black font-tech text-cyan-300">
                {state.confluenceScore}%
              </span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block">Confiança:</span>
              <span className="text-2xl font-black font-tech text-indigo-300">
                {state.confidence}%
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1.5 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Risk Score:</span>
              <span className="text-amber-300 font-bold">{state.globalRiskScore}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Macro Trail:</span>
              <span className="text-blue-300 font-bold">{state.macroTrail}/100</span>
            </div>
          </div>
        </div>

        {/* CARD 4: DADOS OPERACIONAIS // FAROL WIN */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold tracking-wider text-slate-400 uppercase">
              4. DADOS OPERACIONAIS // FAROL WIN
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Histerese Ativa</span>
          </div>

          {/* 3 Farol States: 🟢 COMPRA | 🟡 AGUARDAR | 🔴 VENDA */}
          <div className="grid grid-cols-3 gap-1.5 my-2">
            {/* COMPRA */}
            <div className={`p-2 rounded-lg border text-center transition-all ${
              state.farolWin === 'COMPRA'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-40'
            }`}>
              <div className="text-sm">🟢</div>
              <div className="text-[11px] font-tech font-black tracking-wider mt-0.5">COMPRA</div>
              <div className="text-[9px] font-mono mt-0.5">
                {state.farolWin === 'COMPRA' ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>

            {/* AGUARDAR */}
            <div className={`p-2 rounded-lg border text-center transition-all ${
              state.farolWin === 'AGUARDAR'
                ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-40'
            }`}>
              <div className="text-sm">🟡</div>
              <div className="text-[11px] font-tech font-black tracking-wider mt-0.5">AGUARDAR</div>
              <div className="text-[9px] font-mono mt-0.5">
                {state.farolWin === 'AGUARDAR' ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>

            {/* VENDA */}
            <div className={`p-2 rounded-lg border text-center transition-all ${
              state.farolWin === 'VENDA'
                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/50'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-40'
            }`}>
              <div className="text-sm">🔴</div>
              <div className="text-[11px] font-tech font-black tracking-wider mt-0.5">VENDA</div>
              <div className="text-[9px] font-mono mt-0.5">
                {state.farolWin === 'VENDA' ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Gatilho WIN:</span>
              <span className={`font-bold ${
                state.farolWin === 'COMPRA'
                  ? 'text-emerald-400'
                  : state.farolWin === 'VENDA'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}>
                {state.farolWin}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Histerese:</span>
              <span className="text-white font-bold">{state.consecutiveScenarioTicks}x ticks confirmados</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5" title={state.farolWinReason}>
              {state.farolWinReason}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Scenario Banner */}
      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-tech ${
        state.scenario === 'ALTA'
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          : state.scenario === 'BAIXA'
          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">
            {state.scenario === 'ALTA' ? '🟢' : state.scenario === 'BAIXA' ? '🔴' : '🟡'}
          </span>
          <div>
            <span className="font-bold tracking-wider uppercase text-white">
              CENÁRIO ATUAL: {state.scenario === 'ALTA' ? 'ALTA CONFIRMADA' : state.scenario === 'BAIXA' ? 'BAIXA CONFIRMADA' : 'AGUARDAR / CONSOLIDAÇÃO'}
            </span>
            <p className="text-xs font-mono text-slate-300 mt-0.5">
              {state.scenarioReason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono text-slate-400">
          <span>Confiança: <strong className="text-white">{state.confidence}%</strong></span>
          <span>•</span>
          <span>Confluência: <strong className="text-cyan-300">{state.confluenceScore}%</strong></span>
        </div>
      </div>
    </div>
  );
};
