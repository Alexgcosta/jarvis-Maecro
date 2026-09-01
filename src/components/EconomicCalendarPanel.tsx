import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface EconomicCalendarPanelProps {
  events?: any[];
  onAskJarvis?: (prompt: string) => void;
}

export const EconomicCalendarPanel: React.FC<EconomicCalendarPanelProps> = ({
  events: propEvents,
  onAskJarvis,
}) => {
  const defaultEvents = [
    {
      time: '09:00',
      country: '🇧🇷 BR',
      event: 'IPCA-15 / Inflação Prévia',
      actual: '0.30%',
      forecast: '0.32%',
      previous: '0.39%',
      impact: 'ALTO',
      status: 'Concluído',
    },
    {
      time: '09:30',
      country: '🇺🇸 EUA',
      event: 'Pedidos de Auxílio Desemprego',
      actual: '232k',
      forecast: '230k',
      previous: '228k',
      impact: 'ALTO',
      status: 'Concluído',
    },
    {
      time: '11:00',
      country: '🇺🇸 EUA',
      event: 'Vendas de Casas Novas',
      actual: '739k',
      forecast: '640k',
      previous: '617k',
      impact: 'MÉDIO',
      status: 'Concluído',
    },
    {
      time: '14:30',
      country: '🇧🇷 BR',
      event: 'Fluxo Cambial Semanal BCB',
      actual: '+$1.4B',
      forecast: '--',
      previous: '+$850M',
      impact: 'MÉDIO',
      status: 'Concluído',
    },
  ];

  const events = propEvents && propEvents.length > 0 ? propEvents : defaultEvents;

  return (
    <section
      id="panel-economic-calendar"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              CALENDÁRIO ECONÔMICO // DRIVERS DA SESSÃO
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Divulgações de dados macroeconômicos e impacto de volatilidade
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          AGENDA DO DIA
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-tech text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2">Horário</th>
              <th className="py-2">País</th>
              <th className="py-2">Evento</th>
              <th className="py-2">Impacto</th>
              <th className="py-2">Atual</th>
              <th className="py-2">Projeção</th>
              <th className="py-2">Anterior</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {events.map((ev, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-2 font-mono text-cyan-300 font-bold">{ev.time}</td>
                <td className="py-2">{ev.country}</td>
                <td className="py-2 font-bold text-slate-100">{ev.event}</td>
                <td className="py-2">
                  <span
                    className={`font-tech text-[10px] px-2 py-0.5 rounded font-bold ${
                      ev.impact === 'ALTO'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {ev.impact}
                  </span>
                </td>
                <td className="py-2 font-mono font-bold text-emerald-400">{ev.actual}</td>
                <td className="py-2 font-mono text-slate-400">{ev.forecast}</td>
                <td className="py-2 font-mono text-slate-500">{ev.previous}</td>
                <td className="py-2 text-slate-400">{ev.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
