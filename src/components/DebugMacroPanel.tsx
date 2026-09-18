import React, { useState } from 'react';
import { MacroIndicator, IndicatorWeightConfig } from '../types/macroTypes';
import { Code, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { runMacroCalculationsTestSuite } from '../calculations/__tests__/calculations.test';

interface DebugMacroPanelProps {
  indicators: MacroIndicator[];
  weights: IndicatorWeightConfig;
}

export const DebugMacroPanel: React.FC<DebugMacroPanelProps> = ({ indicators, weights }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; logs: string[] } | null>(null);

  const handleRunTests = () => {
    const res = runMacroCalculationsTestSuite();
    setTestResults(res);
  };

  return (
    <section
      id="panel-debug-macro"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              DEBUG MACRO // AUDITORIA QUANTITATIVA & PESOS
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Verificação do Princípio de Não-Circularidade (Seção 71) e decomposição de fatores
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTests}
            className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 text-xs font-tech font-bold transition-colors"
          >
            Executar Testes Quânticos
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Non-Circularity Certified Badge */}
      <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-tech text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>Princípio de Não-Circularidade:</strong> Nenhum preço de WIN ou WDO é utilizado no cálculo do Sentimento Global, Risk Score ou Rastro Macro.
          </span>
        </div>
        <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-400">
          100% BLINDADO
        </span>
      </div>

      {testResults && (
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-xs text-slate-300 space-y-1">
          <div className="font-bold text-cyan-300 pb-1 border-b border-slate-800">
            Resultado da Suíte de Testes Matemáticos: {testResults.passed ? '🟢 TODOS OS TESTES PASSARAM' : '🔴 FALHA'}
          </div>
          {testResults.logs.map((log, idx) => (
            <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}>
              {log}
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="font-orbitron font-bold text-xs text-slate-300 block mb-2">
            TABELA DE COMPONENTES MACRO & PESOS ATIVOS
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-tech text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Chave</th>
                  <th className="py-2">Ativo</th>
                  <th className="py-2">Categoria</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Variação</th>
                  <th className="py-2">Polaridade</th>
                  <th className="py-2">Peso</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {indicators.map((ind) => (
                  <tr key={ind.key} className="hover:bg-slate-800/30">
                    <td className="py-1.5 font-mono text-cyan-300">{ind.key}</td>
                    <td className="py-1.5 font-bold">{ind.name}</td>
                    <td className="py-1.5 text-slate-400">{ind.category}</td>
                    <td className="py-1.5 font-mono">{ind.value}</td>
                    <td
                      className={`py-1.5 font-mono font-bold ${
                        ind.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ind.changePercent >= 0 ? `+${ind.changePercent}%` : `${ind.changePercent}%`}
                    </td>
                    <td className="py-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {ind.polarity === 'DIRECT' || (ind.polarity as string) === 'POSITIVE_RISK_ON' ? 'Pro-Risco (+)' : 'Pro-Aversão (-)'}
                      </span>
                    </td>
                    <td className="py-1.5 font-mono text-amber-300">
                      {weights[ind.key] ?? ind.weight}
                    </td>
                    <td className="py-1.5 font-mono text-[10px] text-slate-400">
                      {ind.formattedTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
