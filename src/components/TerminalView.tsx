import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Cpu, Activity, DollarSign, BarChart3, Globe } from 'lucide-react';
import { MarketStateResponse } from '../types';
import { soundFX } from '../utils/soundEffects';

interface TerminalViewProps {
  marketState: MarketStateResponse | null;
  onExecuteCommand: (cmd: string) => Promise<string>;
}

interface LogEntry {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
  timestamp: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  marketState,
  onExecuteCommand,
}) => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      type: 'system',
      text: 'J.A.R.V.I.S. QUANTITATIVE FINANCIAL TERMINAL v8.4.2 // STARK MACRO ENGINE ONLINE.\nDigite "help" para ver a lista de comandos quantitativos e operacionais.',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    },
    {
      id: '2',
      type: 'output',
      text: 'Uplink quântico conectado aos feeds da B3, Chicago Mercantile Exchange (CME), Federal Reserve e Banco Central do Brasil.',
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    soundFX.playBlip(1200);

    const now = new Date().toLocaleTimeString('pt-BR');
    const newLogs: LogEntry[] = [
      ...logs,
      { id: Date.now().toString(), type: 'input', text: `$ ${cmd}`, timestamp: now },
    ];

    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
    setLogs(newLogs);

    const lower = cmd.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setLogs([]);
      return;
    }

    if (lower === 'help') {
      const helpText = `COMANDOS DO TERMINAL QUANT J.A.R.V.I.S.:
  • dollar / dol     - Diagnóstico completo, níveis técnicos e viés do Dólar (USD/BRL)
  • index / ibov     - Diagnóstico completo, níveis técnicos e viés do Índice Bovespa (IBOV)
  • sentiment        - Termômetro e drivers do Sentimento Global vs Brasil
  • news             - Resumo das notícias macroeconômicas com vetores de impacto
  • quotes           - Cotações em tempo real de moedas, índices, commodities e juros
  • clear            - Limpa a tela do terminal
  • <pergunta livre> - Análise avançada processada pela rede neural Gemini 3.7 Flash`;
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: helpText, timestamp: now },
      ]);
      return;
    }

    if (lower === 'dollar' || lower === 'dol') {
      const dol = marketState?.dollarSignal;
      const dolText = `ANÁLISE QUANTITATIVA - DÓLAR COMERCIAL / MINI DÓLAR (USD/BRL):
  • Ação Recomendada: ${dol?.action} (Confiança: ${dol?.confidence}%)
  • Preço Atual: R$ ${dol?.currentPrice.toFixed(3)} (${dol?.changePercent}%)
  • Alvo (Take Profit): R$ ${dol?.targetPrice.toFixed(3)} | Stop Loss: R$ ${dol?.stopLoss.toFixed(3)}
  • Suporte: R$ ${dol?.supportLevel.toFixed(2)} | Resistência: R$ ${dol?.resistanceLevel.toFixed(2)}
  • Racional: ${dol?.macroRationale}`;
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: dolText, timestamp: now },
      ]);
      return;
    }

    if (lower === 'index' || lower === 'ibov') {
      const ind = marketState?.indexSignal;
      const indText = `ANÁLISE QUANTITATIVA - ÍNDICE BOVESPA / MINI ÍNDICE (IBOV):
  • Ação Recomendada: ${ind?.action} (Confiança: ${ind?.confidence}%)
  • Preço Atual: ${ind?.currentPrice.toLocaleString('pt-BR')} pts (${ind?.changePercent}%)
  • Alvo (Take Profit): ${ind?.targetPrice.toLocaleString('pt-BR')} pts | Stop Loss: ${ind?.stopLoss.toLocaleString('pt-BR')} pts
  • Suporte: ${ind?.supportLevel.toLocaleString('pt-BR')} pts | Resistência: ${ind?.resistanceLevel.toLocaleString('pt-BR')} pts
  • Racional: ${ind?.macroRationale}`;
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: indText, timestamp: now },
      ]);
      return;
    }

    if (lower === 'sentiment') {
      const sent = marketState?.sentiment;
      const sentText = `MATRIZ DE SENTIMENTO DE MERCADO:
  • Global (Risk-On/Off): ${sent?.globalLabel} (${sent?.globalScore > 0 ? '+' : ''}${sent?.globalScore} pts)
  • Brasil (Fiscal/Local): ${sent?.brazilLabel} (${sent?.brazilScore > 0 ? '+' : ''}${sent?.brazilScore} pts)
  • Correlação Dólar x DXY: +${(sent?.correlationDXY_DOL || 0.84) * 100}%
  • Correlação Ibov x S&P500: +${(sent?.correlationSPX_IBOV || 0.68) * 100}%`;
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: sentText, timestamp: now },
      ]);
      return;
    }

    if (lower === 'quotes') {
      const quotesList = (marketState?.quotes || [])
        .map((q) => `  • ${q.ticker.padEnd(8)}: ${q.price.padEnd(14)} (${q.change})`)
        .join('\n');
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: `COTAÇÕES EM TEMPO REAL:\n${quotesList}`, timestamp: now },
      ]);
      return;
    }

    // Forward to JARVIS AI
    try {
      const response = await onExecuteCommand(cmd);
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'output', text: response, timestamp: new Date().toLocaleTimeString('pt-BR') },
      ]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: 'error', text: `Erro de execução: ${err.message}`, timestamp: new Date().toLocaleTimeString('pt-BR') },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  return (
    <div id="terminal-screen" className="flex flex-col h-[560px] rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-tech text-xs tracking-wider text-cyan-300 font-semibold">
            J.A.R.V.I.S. FINANCIAL TERMINAL CLI // MACRO QUANT TRADING ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-clear-terminal"
            onClick={() => setLogs([])}
            className="text-slate-400 hover:text-cyan-300 p-1 transition-colors"
            title="Limpar Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto font-tech text-xs flex flex-col gap-2 space-y-1 select-text">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`leading-relaxed whitespace-pre-wrap ${
              log.type === 'input'
                ? 'text-cyan-300 font-semibold'
                : log.type === 'error'
                ? 'text-red-400'
                : log.type === 'system'
                ? 'text-amber-300/90'
                : 'text-slate-300'
            }`}
          >
            <span className="text-slate-500 mr-2 text-[10px]">[{log.timestamp}]</span>
            {log.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 bg-slate-900/90 border-t border-cyan-500/20"
      >
        <span className="font-tech text-sm text-cyan-400 font-bold">$</span>
        <input
          id="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando (help, dollar, index, sentiment, quotes) ou faça uma pergunta a JARVIS..."
          className="flex-1 bg-transparent border-none outline-none font-tech text-xs text-cyan-100 placeholder-slate-500"
          autoFocus
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
