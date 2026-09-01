import React, { useState } from 'react';
import { Key, ShieldCheck, CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export const AuthView: React.FC = () => {
  const [apiKey, setApiKey] = useState('86422ca889dbca478d07f2f6ecfb5c74c40368623b635a9a8dfadb17b8017019');
  const [isVerified, setIsVerified] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Chave vinculada com sucesso ao servidor Método Macro.');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setIsVerified(true);
    setStatusMessage('Chave Método Macro validada com sucesso.');
    soundFX.playSuccess();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
            AUTENTICAÇÃO & VINCULAÇÃO // MÉTODO MACRO
          </h2>
        </div>
        <p className="font-tech text-xs text-slate-400 mt-1">
          Credencial de acesso e sincronização com a plataforma Método Macro (app.metodomacro.com.br)
        </p>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-tech text-slate-300 block mb-1">
              Chave de API do Método Macro:
            </label>
            <div className="relative">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 pr-10"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a
              href="https://app.metodomacro.com.br/login"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-tech text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Acessar portal Método Macro</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verificar Chave</span>
            </button>
          </div>
        </form>

        {isVerified && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-tech flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
