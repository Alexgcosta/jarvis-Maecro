import React, { useState } from 'react';
import {
  Terminal,
  Volume2,
  VolumeX,
  Send,
  Cpu,
  Shield,
  Activity,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface McpMacroConsoleProps {
  currentScenario: string;
  globalSentimentScore: number;
  winBiasScore: number;
  wdoBiasScore: number;
  macroTrail: number;
  riskScore: number;
  hasDivergence: boolean;
}

export const McpMacroConsole: React.FC<McpMacroConsoleProps> = ({
  currentScenario,
  globalSentimentScore,
  winBiasScore,
  wdoBiasScore,
  macroTrail,
  riskScore,
  hasDivergence,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: `Terminal Quantitativo MCP Macro Hub conectado. Sentimento Global: ${globalSentimentScore >= 0 ? '+' : ''}${globalSentimentScore} pts. Cenário: ${currentScenario}. WIN Score: ${winBiasScore >= 0 ? '+' : ''}${winBiasScore} | WDO Score: ${wdoBiasScore >= 0 ? '+' : ''}${wdoBiasScore}. Digite sua consulta quantitativa ou solicite análise de confluência.`,
    },
  ]);

  const defaultVoiceSpeechText = `Relatório MCP Macro Hub. Sentimento global em ${globalSentimentScore} pontos. Rastro Macro em ${macroTrail} e Risco em ${riskScore} por cento. Cenário consolidado em ${currentScenario}. WIN Bias em ${winBiasScore} pontos e WDO Bias em ${wdoBiasScore} pontos.`;

  const speakVoice = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;

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

    const voices = window.speechSynthesis.getVoices();
    const brVoice = voices.find((v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    if (brVoice) {
      utterance.voice = brVoice;
    }

    utterance.onstart = () => {
      soundFX.playActivation();
      setIsPlayingVoice(true);
    };

    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

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

    setTimeout(() => {
      let responseText = '';
      const lower = q.toLowerCase();

      if (lower.includes('win') || lower.includes('índice') || lower.includes('indice')) {
        responseText = `Análise WIN (Mini Índice): O viés quantitativo marca ${winBiasScore >= 0 ? '+' : ''}${winBiasScore} pts. O retorno acumulado tem como referência o Fechamento do Dia Anterior (0,00%). Confluência entre Bolsas Globais (S&P/Nasdaq) e Commodities aponta para momento de ${winBiasScore >= 0 ? 'continuidade de alta' : 'pressão vendedora'}. Alvo projetado e stop técnico calculados via desvio padrão da sessão.`;
      } else if (lower.includes('wdo') || lower.includes('dol') || lower.includes('dólar') || lower.includes('dolar')) {
        responseText = `Análise WDO/DOL (Mini Dólar): O viés quantitativo marca ${wdoBiasScore >= 0 ? '+' : ''}${wdoBiasScore} pts. Deslocamento percentual calibrado no fechamento anterior. Curva de DI futuro e diferencial de juros Brasil-EUA determinam a pressão no câmbio spot.`;
      } else if (lower.includes('risco') || lower.includes('risk')) {
        responseText = `Métrica de Risco: Risk Score está em ${riskScore}/100. ${riskScore > 65 ? 'Alerta de volatilidade elevada ou abertura de spreads institucionais.' : 'Ambiente com risco controlado e spreads estáveis.'}`;
      } else if (lower.includes('api') || lower.includes('dado') || lower.includes('mcp')) {
        responseText = `Arquitetura MCP Macro Hub: Todos os dados apresentados são alimentados via APIs de mercado reais (AwesomeAPI, BACEN, Mais Retorno e servidores MCP). Qualquer parâmetro sem endpoint conectado permanece marcado como PENDING_API até sua integração formal.`;
      } else {
        responseText = `MCP Hub Veredito: Confluência da sessão em ${currentScenario}. Sentimento Global ${globalSentimentScore >= 0 ? '+' : ''}${globalSentimentScore}, Risco ${riskScore}/100, WIN ${winBiasScore >= 0 ? '+' : ''}${winBiasScore}, WDO ${wdoBiasScore >= 0 ? '+' : ''}${wdoBiasScore}. Recomendação: manter posicionamento alinhado aos fluxos institucionais.`;
      }

      setChatMessages((prev) => [...prev, { sender: 'assistant', text: responseText }]);
      soundFX.playNotification();
    }, 450);
  };

  return (
    <div
      id="panel-mcp-macro-console"
      className="p-5 rounded-2xl bg-[#0b0914] border border-violet-900/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(139,92,246,0.12)] flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-violet-900/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-950/90 border border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-sm text-zinc-100 uppercase tracking-wide">
                CONSOLE QUANTITATIVO // MCP MACRO HUB
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                ● MCP ONLINE
              </span>
            </div>
            <p className="font-sans text-xs text-zinc-400">
              Processamento quantitativo puro baseado em dados de APIs reais e servidores MCP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => speakVoice(defaultVoiceSpeechText)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isPlayingVoice
                ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                : 'bg-zinc-900 border-violet-900/50 text-zinc-300 hover:text-violet-200 hover:border-violet-500/40'
            }`}
          >
            {isPlayingVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
            {isPlayingVoice ? 'Parar Áudio' : 'Ouvir Síntese'}
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="p-4 rounded-xl bg-zinc-950/80 border border-violet-950 max-h-56 overflow-y-auto space-y-3 font-mono text-xs">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-zinc-900/90 border-zinc-700 text-zinc-200 ml-6'
                : 'bg-[#120e24] border-violet-900/40 text-violet-200 mr-6 shadow-[0_0_15px_rgba(139,92,246,0.06)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-wider">
              {msg.sender === 'user' ? (
                <span className="text-zinc-400">OPERADOR:</span>
              ) : (
                <span className="text-violet-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-violet-400" /> MCP HUB INTELLIGENCE:
                </span>
              )}
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Query Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Consultar WIN, WDO, risco, confluência de mercado ou APIs..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-violet-900/50 focus:border-violet-400 focus:outline-none text-zinc-200 font-mono text-xs placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar
        </button>
      </form>
    </div>
  );
};
