import React from 'react';
import { Cpu, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface JarvisQuickSummaryProps {
  currentScenario: string;
  winBiasScore: number;
  wdoBiasScore: number;
  confidence: number;
}

export const JarvisQuickSummary: React.FC<JarvisQuickSummaryProps> = ({
  currentScenario,
  winBiasScore,
  wdoBiasScore,
  confidence,
}) => {
  return (
    <div
      id="panel-jarvis-quick-summary"
      className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="font-tech text-xs text-cyan-300 font-bold uppercase tracking-widest block">
            J.A.R.V.I.S. RESUMO EXECUTIVO DA SESSÃO
          </span>
          <p className="font-tech text-xs text-slate-200 mt-0.5">
            Cenário atual consolidado em <strong className="text-emerald-400 font-bold">{currentScenario}</strong> com{' '}
            <strong className="text-cyan-300">{confidence}% de confluência</strong>. Viés favorável a operações compradoras no WIN e cautela no WDO.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-tech text-xs self-end md:self-center shrink-0">
        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
          WIN: {winBiasScore >= 0 ? `+${winBiasScore}` : winBiasScore} (COMPRA)
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
          WDO: {wdoBiasScore >= 0 ? `+${wdoBiasScore}` : wdoBiasScore} (ALÍVIO)
        </span>
      </div>
    </div>
  );
};
