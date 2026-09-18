import React from 'react';
import { Cpu, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface McpMacroSummaryProps {
  currentScenario: string;
  winBiasScore: number;
  wdoBiasScore: number;
  confidence: number;
}

export const McpMacroSummary: React.FC<McpMacroSummaryProps> = ({
  currentScenario,
  winBiasScore,
  wdoBiasScore,
  confidence,
}) => {
  return (
    <div
      id="panel-mcp-macro-summary"
      className="p-4 rounded-xl bg-[#0b0914] border border-violet-900/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-950 border border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider block font-bold">
            MCP MACRO HUB // SÍNTESE QUANTITATIVA DA SESSÃO
          </span>
          <p className="text-xs text-zinc-300 mt-0.5">
            Cenário consolidado: <strong className="text-emerald-400 font-semibold">{currentScenario}</strong> com{' '}
            <strong className="text-violet-300 font-semibold">{confidence}% de confluência estatística</strong>. Parâmetros calculados via feed oficial e modelos MCP sem estimativas artificiais.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs self-end md:self-center shrink-0">
        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          WIN: {winBiasScore >= 0 ? `+${winBiasScore}` : winBiasScore} pts
        </span>
        <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          WDO: {wdoBiasScore >= 0 ? `+${wdoBiasScore}` : wdoBiasScore} pts
        </span>
      </div>
    </div>
  );
};
