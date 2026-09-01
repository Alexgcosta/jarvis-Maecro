import React from 'react';
import { Terminal, Code, Cpu, ShieldCheck, Box } from 'lucide-react';

export const McpView: React.FC = () => {
  const mcpTools = [
    {
      name: 'get_macro_sentiment',
      description: 'Extrai o score de sentimento global e Brasil (-100 a +100) sem circularidade.',
      params: 'None',
    },
    {
      name: 'get_market_confluence',
      description: 'Calcula a confluência de 4 pilares normalizados (Força Alta, Força Baixa, Risk, Macro) e veredito.',
      params: 'None',
    },
    {
      name: 'analyze_win_wdo_bias',
      description: 'Avalia o viés direcional e farol operacional para Mini Índice (WIN) e Mini Dólar (WDO).',
      params: 'asset: "WIN" | "WDO"',
    },
    {
      name: 'detect_macro_divergences',
      description: 'Detecta conflitos entre preços intradiários e fundamentos macroeconômicos.',
      params: 'None',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
              MCP // MODEL CONTEXT PROTOCOL TOOLS
            </h2>
          </div>
          <p className="font-tech text-xs text-slate-400 mt-1">
            Ferramentas padronizadas para conexão de LLMs e agentes autônomos ao terminal J.A.R.V.I.S.
          </p>
        </div>

        <span className="font-tech text-xs px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold">
          MCP SPEC v1.0
        </span>
      </div>

      {/* Tools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mcpTools.map((tool, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-xs text-cyan-200">{tool.name}</span>
              </div>
              <p className="font-tech text-xs text-slate-300 mb-3">{tool.description}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span>Parâmetros: {tool.params}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
