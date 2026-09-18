import React, { useState } from 'react';
import {
  Terminal,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Shield,
  Clock,
  Play,
  RotateCcw,
  Cpu,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export interface McpGlobalConsoleProps {
  currentScenario: string;
  globalSentimentScore: number;
  winBiasScore: number;
  wdoBiasScore: number;
  macroTrail: number;
  riskScore: number;
  hasDivergence: boolean;
}

export const McpGlobalConsole: React.FC<McpGlobalConsoleProps> = ({
  currentScenario,
  globalSentimentScore,
  winBiasScore,
  wdoBiasScore,
  macroTrail,
  riskScore,
  hasDivergence,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(1);
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'mcp'; text: string }[]>([
    {
      sender: 'mcp',
      text: `Sistemas MCP Macro Hub online. Sentimento macro global em +${globalSentimentScore} pontos com viés de ${currentScenario}. Força no WIN e alívio de fluxo no WDO. Como posso auxiliar na análise da sessão?`,
    },
  ]);

  const defaultVoiceSpeechText = `Relatório MCP Macro Hub: O sentimento macroeconômico global opera em terreno positivo com score de mais ${globalSentimentScore} pontos. O Rastro do Macro atinge ${macroTrail} e o Risk Score marca ${riskScore} de cem. Confluência aponta cenário de ${currentScenario}. Recomenda-se atenção ao farol do WIN em modo comprador e monitoramento da curva de juros DI.`;

  const speakJarvisVoice = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Try finding a Brazilian Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const brVoice = voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    if (brVoice) {
      utterance.voice = brVoice;
    }

    utterance.onstart = () => {
      soundFX.playActivation();
      setIsPlayingVoice(true);
    };

    utterance.onend = () => {
      setIsPlayingVoice(false);
    };

    utterance.onerror = () => {
      setIsPlayingVoice(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const q = userQuery.trim();
    const newMessages = [...chatMessages, { sender: 'user' as const, text: q }];
    setChatMessages(newMessages);
    setUserQuery('');
    soundFX.playClick();

    // Generate intelligent contextual response
    setTimeout(() => {
      let responseText = '';
      const lower = q.toLowerCase();

      if (lower.includes('dolar') || lower.includes('wdo') || lower.includes('cambio')) {
        responseText = `Análise WDO: Viés direcional de ${wdoBiasScore > 0 ? 'ALTA' : 'BAIXA'} (${wdoBiasScore} pts). DXY estável e fluxo institucional apontam ${wdoBiasScore <= 0 ? 'alívio cambial' : 'pressão compradora'}.`;
      } else if (lower.includes('indice') || lower.includes('win') || lower.includes('ibov')) {
        responseText = `Análise WIN: Viés de ${winBiasScore > 0 ? 'COMPRA' : 'VENDA'} (+${winBiasScore} pts). Confluência com bolsas globais e VIX contraído suportam o movimento.`;
      } else if (lower.includes('cenario') || lower.includes('confluencia') || lower.includes('risco')) {
        responseText = `Cenário Atual: ${currentScenario}. Risk Score em ${riskScore}/100 e Rastro Macro em ${macroTrail}/100. ${hasDivergence ? 'Atenção: divergência ativa detectada.' : 'Sem divergências severas.'}`;
      } else {
        responseText = `Síntese do Sistema: Todos os indicadores macro estão sincronizados na grade temporal canônica. Cenário dominante é ${currentScenario} com sentimento global de +${globalSentimentScore} pontos.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'mcp', text: responseText }]);
      soundFX.playSuccess();
    }, 400);
  };

  return (
    <section
      id="panel-executive-console"
      className="p-5 rounded-2xl bg-zinc-950/90 border border-violet-900/40 shadow-[0_4px_25px_rgba(139,92,246,0.15)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-mono font-semibold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
              MCP MACRO HUB // CONSOLE QUANTITATIVO
            </h3>
            <span className="text-xs text-zinc-400">
              Síntese Executiva Macroeconômica & Análise Estatística em Tempo Real
            </span>
          </div>
        </div>

        {/* Voice Trigger Button */}
        <button
          onClick={() => speakJarvisVoice(defaultVoiceSpeechText)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all ${
            isPlayingVoice
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          {isPlayingVoice ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>INTERROMPER VOZ</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-violet-400" />
              <span>OUVIR SÍNTESE EXECUTIVA</span>
            </>
          )}
        </button>
      </div>

      {/* Synthesis Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">1. Panorama</span>
          <span className="font-semibold text-xs text-violet-300 block mt-1">
            {currentScenario}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">2. Dólar Global</span>
          <span className="font-semibold text-xs text-zinc-200 block mt-1">
            DXY Neutro
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">3. Yield US 10Y</span>
          <span className="font-semibold text-xs text-zinc-200 block mt-1">
            4.22% (-2bps)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">4. Brasil / DI</span>
          <span className="font-semibold text-xs text-zinc-200 block mt-1">
            Estável
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">5. Confirmação</span>
          <span className="font-semibold text-xs text-emerald-400 block mt-1">
            VIX & SPX
          </span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase block">6. Invalidação</span>
          <span className="font-semibold text-xs text-rose-400 block mt-1">
            DI F29 {'>'} 12.30%
          </span>
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-3.5">
        <div className="h-36 overflow-y-auto space-y-2 pr-2">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-950 border border-violet-900/30 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-zinc-400">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  <span className="uppercase font-semibold">
                    {msg.sender === 'user' ? 'OPERADOR' : 'MCP MACRO HUB'}
                  </span>
                </div>
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Consulte sobre confluência, dólar, índice ou curva de juros..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CONSULTAR</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export const JarvisGlobalConsole = McpGlobalConsole;
export type JarvisGlobalConsoleProps = McpGlobalConsoleProps;
