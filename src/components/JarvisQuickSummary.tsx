import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

export interface McpQuickSummaryProps {
  currentScenario: string;
  winBiasScore: number;
  wdoBiasScore: number;
  confidence: number;
}

export const McpQuickSummary: React.FC<McpQuickSummaryProps> = ({
  currentScenario,
  winBiasScore,
  wdoBiasScore,
  confidence,
}) => {
  return (
    <div
      id="panel-executive-quick-summary"
      className="p-4 rounded-xl bg-zinc-950/90 border border-violet-900/40 shadow-[0_4px_20px_rgba(139,92,246,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider block font-semibold">
            MCP MACRO HUB — RESUMO EXECUTIVO DA SESSÃO
          </span>
          <p className="text-xs text-zinc-300 mt-0.5">
            Cenário consolidado em <strong className="text-emerald-400 font-semibold">{currentScenario}</strong> com{' '}
            <strong className="text-violet-400 font-semibold">{confidence}% de confluência</strong>. Viés alinhado a operações quantitativas no WIN e cautela calculada no WDO.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs self-end md:self-center shrink-0">
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold">
          WIN: {winBiasScore >= 0 ? `+${winBiasScore}` : winBiasScore} (COMPRA)
        </span>
        <span className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-300 font-semibold">
          WDO: {wdoBiasScore >= 0 ? `+${wdoBiasScore}` : wdoBiasScore} (ALÍVIO)
        </span>
      </div>
    </div>
  );
};

export const JarvisQuickSummary = McpQuickSummary;
export type JarvisQuickSummaryProps = McpQuickSummaryProps;

