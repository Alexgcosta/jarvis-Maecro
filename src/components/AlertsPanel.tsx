import React from 'react';
import { Bell, ShieldCheck, AlertTriangle, Radio } from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const alerts = [
    {
      time: '13:05',
      type: 'CONFLUÊNCIA',
      title: 'Transição de Cenário: 🟢 ALTA ASSUMIU',
      description: 'Força de Alta atingiu 62/100, Macro em 58 e Risk em 57 com WIN rompendo máxima intradiária.',
      severity: 'INFO',
    },
    {
      time: '11:00',
      type: 'DESACELERAÇÃO',
      title: 'Transição de Cenário: 🟡 CONFLUÊNCIA PERDIDA',
      description: 'Retração pontual no S&P 500 reduziu score de confluência abaixo do limiar de 60 pontos.',
      severity: 'WARNING',
    },
    {
      time: '09:30',
      type: 'ALINHAMENTO',
      title: 'Abertura das Bolsas EUA',
      description: 'Abertura positiva em Wall Street confirmou viés altista no Mini Índice.',
      severity: 'SUCCESS',
    },
  ];

  return (
    <section
      id="panel-macro-alerts"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              LOG DE ALERTAS & DISPAROS J.A.R.V.I.S.
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Notificações de mudança de termômetro, quebra de suporte e viradas de confluência
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          EVENT LOG
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((a, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-cyan-300 font-bold">{a.time}</span>
                <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                  {a.type}
                </span>
                <span className="font-orbitron font-bold text-xs text-slate-200">{a.title}</span>
              </div>
              <p className="font-tech text-xs text-slate-400">{a.description}</p>
            </div>

            <span
              className={`font-tech text-[10px] px-2 py-0.5 rounded font-bold self-start sm:self-center ${
                a.severity === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              DISPARADO
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
