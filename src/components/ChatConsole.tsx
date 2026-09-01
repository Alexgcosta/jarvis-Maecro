import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Globe,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { JarvisMessage, AIModelType } from '../types';
import { soundFX } from '../utils/soundEffects';

interface ChatConsoleProps {
  messages: JarvisMessage[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  language: string;
  onSpeakMessage: (text: string) => void;
  aiModel?: AIModelType;
  onAIModelChange?: (model: AIModelType) => void;
  voiceAutoSpeak?: boolean;
  onToggleVoiceAutoSpeak?: () => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({
  messages,
  onSendMessage,
  isListening,
  onToggleListening,
  isProcessing,
  isSpeaking,
  language,
  onSpeakMessage,
  aiModel = 'gemini-3.7-flash',
  onAIModelChange,
  voiceAutoSpeak = true,
  onToggleVoiceAutoSpeak,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const voiceCommands = [
    { label: '🎙️ "Status do Dólar"', prompt: 'Qual o sinal e viés para o Dólar USD/BRL hoje?' },
    { label: '🎙️ "Alvos do Ibovespa"', prompt: 'Qual a recomendação e suportes para o Índice Bovespa?' },
    { label: '🎙️ "Varredura das 6 Fontes"', prompt: 'Execute a varredura completa cruzando Finviz, CME, Reuters, Investing, ADVFN e MacroWarning.' },
    { label: '🎙️ "Sentimento de Risco"', prompt: 'Qual o sentimento global e o risco fiscal do Brasil no momento?' },
    { label: '🎙️ "Calculadora de Risco"', prompt: 'Abra a calculadora de dimensionamento de lote e gestão de risco.' },
    { label: '🎙️ "Notícias de Alto Impacto"', prompt: 'Quais as principais notícias de alto impacto macroeconômico agora?' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText.trim();
    setInputText('');
    soundFX.playBlip(1100);
    onSendMessage(text);
  };

  const handleCopy = (id: string, text: string) => {
    soundFX.playBlip(800);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="chat-console-module" className="flex flex-col h-[590px] rounded-2xl bg-slate-900/70 border border-cyan-500/25 backdrop-blur-md overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-cyan-500/20 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-orbitron font-semibold text-xs text-cyan-100 flex items-center gap-2">
              <span>CANAL DE COMANDOS MACRO J.A.R.V.I.S.</span>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-tech animate-pulse">
                  <Volume2 className="w-3 h-3" /> TRANSMITINDO VOZ...
                </span>
              )}
            </div>
            <span className="font-tech text-[10px] text-slate-400">
              INTEGRAÇÃO NEURAL: GOOGLE GEMINI & CHATGPT • 6 FONTES MACRO AO VIVO
            </span>
          </div>
        </div>

        {/* AI Model Selector & Voice Wave */}
        <div className="flex items-center gap-2">
          {/* AI Model Selector */}
          {onAIModelChange && (
            <div className="flex items-center gap-1 bg-slate-900 border border-cyan-500/30 rounded-lg p-0.5">
              <span className="font-tech text-[10px] text-slate-400 px-1.5 hidden sm:inline flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-cyan-400" /> IA:
              </span>
              <button
                onClick={() => {
                  soundFX.playBlip(1000);
                  onAIModelChange('gemini-3.7-flash');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-tech transition-all ${
                  aiModel === 'gemini-3.7-flash'
                    ? 'bg-cyan-500/30 text-cyan-100 font-bold border border-cyan-400/50'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Google Gemini 3.7 Flash + Live Search Grounding"
              >
                Gemini 3.7
              </button>
              <button
                onClick={() => {
                  soundFX.playBlip(1000);
                  onAIModelChange('gemini-3.1-flash-lite');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-tech transition-all ${
                  aiModel === 'gemini-3.1-flash-lite'
                    ? 'bg-cyan-500/30 text-cyan-100 font-bold border border-cyan-400/50'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Google Gemini 3.1 Flash Lite (Rápido e Baixo Consumo de Cota)"
              >
                Flash Lite
              </button>
              <button
                onClick={() => {
                  soundFX.playBlip(1000);
                  onAIModelChange('chatgpt-4o');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-tech transition-all ${
                  aiModel === 'chatgpt-4o'
                    ? 'bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/50'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="ChatGPT / GPT-4o Quant Engine"
              >
                ChatGPT 4o
              </button>
            </div>
          )}

          {/* Audio Visualizer Wave */}
          <div className="flex items-center gap-1 h-4 px-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 rounded-full bg-cyan-400 transition-all duration-150 ${
                  isSpeaking || isListening ? 'animate-pulse' : 'h-1 opacity-30'
                }`}
                style={{
                  height: isSpeaking || isListening ? `${Math.sin(i + Date.now() / 200) * 8 + 12}px` : '4px',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 select-text">
        {messages.map((msg) => {
          const isJarvis = msg.sender === 'jarvis';
          return (
            <div
              key={msg.id}
              id={`msg-${msg.id}`}
              className={`flex flex-col max-w-[90%] ${
                isJarvis ? 'self-start' : 'self-end'
              }`}
            >
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isJarvis
                    ? 'bg-slate-950/95 border-cyan-500/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
                    : 'bg-cyan-950/70 border-cyan-400/40 text-cyan-50 self-end shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                }`}
              >
                {/* Sender Tag */}
                <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-cyan-500/15">
                  <div className="flex items-center gap-1.5 font-tech text-[11px]">
                    {isJarvis ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                        <span className="font-bold text-cyan-300">J.A.R.V.I.S. MACRO AGENT</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                        <span className="font-bold text-amber-300">SR. STARK // TRADER PRINCIPAL</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-tech text-[10px] text-slate-500">
                      {msg.timestamp}
                    </span>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors"
                      title="Copiar"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>

                    {/* Voice Readout for JARVIS responses */}
                    {isJarvis && (
                      <button
                        onClick={() => {
                          soundFX.playBlip(950);
                          onSpeakMessage(msg.text);
                        }}
                        className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors"
                        title="Ouvir Resposta de JARVIS"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="font-body text-xs leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Citations if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-cyan-500/15">
                    <span className="font-tech text-[10px] text-slate-400 flex items-center gap-1 mb-1.5">
                      <Globe className="w-3 h-3 text-cyan-400" /> FONTES CONSULTADAS VIA LIVE GROUNDING:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/25 text-[10px] font-tech text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 transition-colors"
                        >
                          <span className="truncate max-w-[140px]">{c.title || 'Link Oficial'}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing / Processing indicator */}
        {isProcessing && (
          <div className="flex flex-col self-start max-w-[85%]">
            <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-tech text-xs tracking-wider animate-pulse">
                J.A.R.V.I.S. PROCESSANDO MATRIZ MACROECONÔMICA COM BUSCA WEB...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Commands Bar */}
      <div className="px-3 py-1.5 bg-slate-950/90 border-t border-cyan-500/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="font-tech text-[10px] text-cyan-400 uppercase shrink-0 mr-1 flex items-center gap-1">
          <Mic className="w-3 h-3 text-cyan-300" /> COMANDOS:
        </span>
        {voiceCommands.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundFX.playBlip(1000);
              onSendMessage(item.prompt);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-900 border border-cyan-500/25 hover:border-cyan-400 text-[11px] font-tech text-slate-300 hover:text-cyan-200 whitespace-nowrap transition-all flex items-center gap-1 shadow-[0_0_8px_rgba(6,182,212,0.05)]"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Input / Microphone Area */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950/90 border-t border-cyan-500/20 flex items-center gap-2"
      >
        {/* Voice Dictation Button */}
        <button
          type="button"
          id="btn-mic-dictate"
          onClick={() => {
            soundFX.playActivation();
            onToggleListening();
          }}
          className={`relative p-2.5 rounded-xl border transition-all flex items-center gap-1.5 font-tech text-xs ${
            isListening
              ? 'bg-red-500/30 border-red-400 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse font-bold'
              : 'bg-slate-900 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/60 hover:text-cyan-200'
          }`}
          title={isListening ? 'Parar Microfone' : 'Falar comando de voz com J.A.R.V.I.S.'}
        >
          {isListening ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
          <span className="hidden sm:inline">
            {isListening ? 'GRAVANDO...' : 'FALAR'}
          </span>
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </button>

        {/* Voice Output Toggle */}
        {onToggleVoiceAutoSpeak && (
          <button
            type="button"
            onClick={() => {
              soundFX.playBlip(900);
              onToggleVoiceAutoSpeak();
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              voiceAutoSpeak
                ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50'
                : 'border-slate-800 text-slate-500 bg-slate-900/50'
            }`}
            title={voiceAutoSpeak ? 'Voz de J.A.R.V.I.S. Ativada (falará as respostas)' : 'Voz Desativada'}
          >
            {voiceAutoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}

        {/* Text Input */}
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? '🎙️ Ouvindo comando de voz... fale sobre Dólar, Índice, notícias ou cálculos...'
              : 'Digite um comando ou pergunte (ex: "Jarvis, status do dólar", "verificar payroll")...'
          }
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-cyan-100 placeholder-slate-500 text-xs font-body focus:outline-none focus:border-cyan-400 transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          id="btn-send-message"
          disabled={!inputText.trim() || isProcessing}
          className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

