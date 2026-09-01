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
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface JarvisGlobalConsoleProps {
  currentScenario: string;
  globalSentimentScore: number;
  winBiasScore: number;
  wdoBiasScore: number;
  macroTrail: number;
  riskScore: number;
  hasDivergence: boolean;
}

export const JarvisGlobalConsole: React.FC<JarvisGlobalConsoleProps> = ({
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
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'jarvis'; text: string }[]>([
    {
      sender: 'jarvis',
      text: `Sistemas online. O sentimento macro global está em +${globalSentimentScore} pontos com viés de ${currentScenario}. Força compradora no WIN e alívio de fluxo no WDO. Como posso auxiliar na análise da sessão?`,
    },
  ]);

  const defaultVoiceSpeechText = `Relatório Quântico J.A.R.V.I.S. Atenção operador: o sentimento macroeconômico global opera em terreno positivo com score de mais ${globalSentimentScore} pontos. O Rastro do Macro atinge ${macroTrail} e o Risk Score marca ${riskScore} de cem. Confluência aponta cenário de ${currentScenario}. Recomenda-se atenção ao farol do WIN em modo comprador e monitoramento da curva de juros DI.`;

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
        responseText = `J.A.R.V.I.S. Informa: Todos os 16 indicadores macro estão sincronizados na grade temporal canônica. Cenário dominante é ${currentScenario} com sentimento global de +${globalSentimentScore} pontos.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'jarvis', text: responseText }]);
      soundFX.playSuccess();
    }, 400);
  };

  return (
    <section
      id="panel-jarvis-console"
      className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-cyan-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-cyan-100 flex items-center gap-2">
              J.A.R.V.I.S. GLOBAL CONSOLE // MACRO COPILOT
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Síntese Executiva Quantitativa & Assistente de Voz Neural
            </span>
          </div>
        </div>

        {/* Voice Trigger Button */}
        <button
          onClick={() => speakJarvisVoice(defaultVoiceSpeechText)}
          className={`px-3.5 py-1.5 rounded-xl font-tech text-xs flex items-center gap-2 border transition-all ${
            isPlayingVoice
              ? 'bg-rose-950/80 border-rose-400 text-rose-200 animate-pulse shadow-[0_0_12px_#f43f5e]'
              : 'bg-cyan-950/80 border-cyan-400/60 text-cyan-200 hover:bg-cyan-900 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
          }`}
        >
          {isPlayingVoice ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>INTERROMPER VOZ</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>OUVIR SÍNTESE J.A.R.V.I.S.</span>
            </>
          )}
        </button>
      </div>

      {/* Synthesis Grid (Sections 52 items) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">1. Panorama</span>
          <span className="font-orbitron font-bold text-xs text-slate-200 block mt-1">
            {currentScenario}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">2. Dólar Global</span>
          <span className="font-orbitron font-bold text-xs text-slate-200 block mt-1">
            DXY Neutro
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">3. Yield US 10Y</span>
          <span className="font-orbitron font-bold text-xs text-slate-200 block mt-1">
            4.22% (-2bps)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">4. Brasil / DI</span>
          <span className="font-orbitron font-bold text-xs text-slate-200 block mt-1">
            Estável
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">5. Confirmação</span>
          <span className="font-orbitron font-bold text-xs text-emerald-400 block mt-1">
            VIX & SPX
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="font-tech text-[10px] text-slate-400 uppercase block">6. Invalidação</span>
          <span className="font-orbitron font-bold text-xs text-rose-400 block mt-1">
            DI F29 {'>'} 12.30%
          </span>
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5">
        <div className="h-36 overflow-y-auto space-y-2 pr-2 no-scrollbar">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs font-tech leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="uppercase font-bold">
                    {msg.sender === 'user' ? 'OPERADOR' : 'J.A.R.V.I.S.'}
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
            placeholder="Consulte o J.A.R.V.I.S. sobre confluência, dólar, índice ou curva de juros..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-tech text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 font-tech text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CONSULTAR</span>
          </button>
        </form>
      </div>
    </section>
  );
};
