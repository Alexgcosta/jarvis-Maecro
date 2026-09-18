import React from 'react';
import { X, Sparkles, Cpu, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { ChatConsole } from './ChatConsole';
import { McpAssistantMessage, JarvisMessage, AIModelType } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: (McpAssistantMessage | JarvisMessage)[];
  onSendMessage: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  language: string;
  onSpeakMessage: (text: string) => void;
  aiModel: AIModelType;
  onAIModelChange: (model: AIModelType) => void;
  voiceAutoSpeak: boolean;
  onToggleVoiceAutoSpeak: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isListening,
  onToggleListening,
  isProcessing,
  isSpeaking,
  language,
  onSpeakMessage,
  aiModel,
  onAIModelChange,
  voiceAutoSpeak,
  onToggleVoiceAutoSpeak,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
      {/* Semi-transparent Backdrop click to close */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-50 w-full max-w-lg h-full bg-zinc-950 border-l border-violet-900/40 shadow-[0_0_40px_rgba(139,92,246,0.15)] pointer-events-auto flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-sm text-zinc-100">
                  MCP Macro Hub // Inteligência Quantitativa
                </h3>
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Análise Macroeconômica, Confluência & Cenários WIN / WDO / DOL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Fechar Assistente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Console container */}
        <div className="flex-1 overflow-hidden p-3 flex flex-col">
          <ChatConsole
            messages={messages}
            onSendMessage={onSendMessage}
            isListening={isListening}
            onToggleListening={onToggleListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            language={language}
            onSpeakMessage={onSpeakMessage}
            aiModel={aiModel}
            onAIModelChange={onAIModelChange}
            voiceAutoSpeak={voiceAutoSpeak}
            onToggleVoiceAutoSpeak={onToggleVoiceAutoSpeak}
          />
        </div>
      </div>
    </div>
  );
};
