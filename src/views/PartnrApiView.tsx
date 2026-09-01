import React, { useState } from 'react';
import { Cpu, Send, CheckCircle2, Copy, Server, Code } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export const PartnrApiView: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/macro/sentiment',
      description: 'Retorna o score de sentimento global e Brasil (-100 a +100) com decomposição.',
      sampleResponse: '{\n  "status": "success",\n  "globalSentiment": 48,\n  "brazilSentiment": 42,\n  "scenario": "ALTA",\n  "timestamp": "2026-08-28T13:30:00-03:00"\n}',
    },
    {
      method: 'GET',
      path: '/api/macro/confluence',
      description: 'Retorna os 4 pilares normalizados (Força Alta, Força Baixa, Risk Score, Rastro Macro) e veredito.',
      sampleResponse: '{\n  "bullishStrength": 73,\n  "bearishStrength": 27,\n  "riskScore": 66,\n  "macroTrail": 65,\n  "scenario": "ALTA",\n  "confidence": 82\n}',
    },
    {
      method: 'GET',
      path: '/api/macro/timeline',
      description: 'Retorna a série temporal canônica intraday completa em passos de 5 minutos.',
      sampleResponse: '{\n  "session": "REGULAR",\n  "pointsCount": 96,\n  "data": [ ... ]\n}',
    },
  ];

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(window.location.origin + path);
    setCopiedEndpoint(path);
    soundFX.playClick();
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
              PARTNR API // SERVIÇOS DE DADOS QUANTITATIVOS
            </h2>
          </div>
          <p className="font-tech text-xs text-slate-400 mt-1">
            API REST de baixa latência para integração com robôs de execução (MetaTrader, Profit, Python)
          </p>
        </div>

        <span className="font-tech text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 font-bold">
          🟢 API STATUS: ONLINE (200 OK)
        </span>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((ep, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-tech text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold">
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-100">{ep.path}</span>
              </div>

              <button
                onClick={() => handleCopy(ep.path)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-tech flex items-center gap-1.5 border border-slate-700 transition-colors self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedEndpoint === ep.path ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>

            <p className="font-tech text-xs text-slate-400 mb-3">{ep.description}</p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-tech text-[10px] text-slate-500 block mb-1">
                Exemplo de Resposta JSON:
              </span>
              <pre className="font-mono text-xs text-cyan-300 overflow-x-auto">
                {ep.sampleResponse}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
