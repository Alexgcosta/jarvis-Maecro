import React, { useState } from 'react';
import { WinGlobalLeadersState } from '../../types/winGlobalLeadersTypes';
import { Cpu, Volume2, VolumeX, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { speechEngine } from '../../utils/speech';
import { soundFX } from '../../utils/soundEffects';

interface WinLeadersExecutivePanelProps {
  state: WinGlobalLeadersState;
}

export const WinLeadersExecutivePanel: React.FC<WinLeadersExecutivePanelProps> = ({ state }) => {
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const j = (state as any)?.executiveSynthesis || (state as any)?.mcpInterpretation || state?.jarvisInterpretation || {
    title: 'Análise de Confluência dos Líderes',
    summary: 'Monitorando correlações dos líderes globais com o WIN.',
    whoIsLeading: 'EWZ e ADRs de Petrobras e Vale.',
    whoIsConfirming: 'Setor financeiro e commodities.',
    primaryRisk: 'Volatilidade em Treasuries e DXY.',
    invalidationTrigger: 'Rompimento contra a tendência no EWZ/WIN.',
  };

  const handleSpeak = () => {
    soundFX.playClick();
    if (isPlayingSpeech) {
      speechEngine.stopSpeaking();
      setIsPlayingSpeech(false);
      return;
    }

    const fullText = `${j.title}. ${j.summary}. Liderança: ${j.whoIsLeading}. Confirmações: ${j.whoIsConfirming}. Risco principal: ${j.primaryRisk}. Critério de invalidação: ${j.invalidationTrigger}.`;
    setIsPlayingSpeech(true);
    speechEngine.speak(fullText, 'pt-BR', () => {
      setIsPlayingSpeech(false);
    });
  };

  return (
    <div className="bg-zinc-950/90 border border-violet-900/40 shadow-[0_4px_25px_rgba(139,92,246,0.15)] rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span>SÍNTESE EXECUTIVA & AUDITORIA QUANTITATIVA</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Síntese contextual de liderança, confluência, riscos e invalidações em tempo real
            </p>
          </div>
        </div>

        <button
          onClick={handleSpeak}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 border self-start sm:self-auto ${
            isPlayingSpeech
              ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingSpeech ? 'Parar Áudio' : 'Ouvir Síntese'}</span>
        </button>
      </div>

      <div className="space-y-3 font-sans text-xs">
        {/* Main Summary */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-violet-900/30 text-zinc-200 space-y-1.5">
          <div className="text-violet-400 font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>{j.title}</span>
          </div>
          <p className="leading-relaxed text-zinc-300">
            {j.summary}
          </p>
        </div>

        {/* 4 Pillars of Interpretation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Who is Leading */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <div className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. QUEM ESTÁ LIDERANDO?</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {j.whoIsLeading}
            </p>
          </div>

          {/* Who is Confirming */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <div className="text-violet-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2. QUEM ESTÁ CONFIRMANDO?</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {j.whoIsConfirming}
            </p>
          </div>

          {/* Primary Risk */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <div className="text-amber-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>3. PRINCIPAL RISCO MACRO</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {j.primaryRisk}
            </p>
          </div>

          {/* Invalidation Trigger */}
          <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1">
            <div className="text-rose-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>4. CRITÉRIO DE INVALIDAÇÃO</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {j.invalidationTrigger}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export const WinLeadersMcpPanel = WinLeadersExecutivePanel;
export const WinLeadersJarvisPanel = WinLeadersExecutivePanel;
