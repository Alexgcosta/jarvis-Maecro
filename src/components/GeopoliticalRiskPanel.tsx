import React from 'react';
import { ShieldAlert, Globe, AlertTriangle } from 'lucide-react';

export const GeopoliticalRiskPanel: React.FC = () => {
  const geoScore = 38; // 0 to 100

  const events = [
    { title: 'Tensão no Oriente Médio & Rotas Marítimas', impact: 'Médio', status: 'Monitorado', asset: 'Brent' },
    { title: 'Eleições e Tarifas Comerciais Globais', impact: 'Baixo', status: 'Estável', asset: 'DXY / Moedas' },
    { title: 'Risco Fiscal Brasileiro / Meta de Déficit Zero', impact: 'Moderado', status: 'Em Debate', asset: 'DI / CDS Brasil' },
  ];

  return (
    <section
      id="panel-geopolitical-risk"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-400/40 text-amber-300">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              RISCO GEOPOLÍTICO & FISCAL GLOBAL
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Score quantitativo de fricção internacional e prêmios de risco
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-tech text-xs text-slate-400">Score de Tensão:</span>
          <span className="font-orbitron font-bold text-sm text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-500/40">
            {geoScore} / 100 (Moderado)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {events.map((ev, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron font-bold text-xs text-slate-200">{ev.title}</span>
              </div>
              <span className="font-tech text-[11px] text-slate-400 block mt-1">
                Ativo Impactado: <strong className="text-cyan-300">{ev.asset}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-tech mt-3 pt-2 border-t border-slate-800">
              <span className="text-amber-300 font-bold">Impacto: {ev.impact}</span>
              <span className="text-slate-400">{ev.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
