import React from 'react';
import { Newspaper, Clock, ExternalLink, Flame } from 'lucide-react';

export const NewsPanel: React.FC = () => {
  const news = [
    {
      time: '11:42',
      source: 'Bloomberg / Reuters',
      title: 'Bolsas em NY aceleram ganhos impulsionadas por techs e recuo dos yields dos Treasuries',
      sentiment: 'POSITIVO',
      impact: 'WIN (+)',
    },
    {
      time: '11:15',
      source: 'Broadcast B3',
      title: 'Dólar perde força ante o real com fluxo estrangeiro e exterior favorável a emergentes',
      sentiment: 'POSITIVO',
      impact: 'WDO (-)',
    },
    {
      time: '10:30',
      source: 'Valor Econômico',
      title: 'IPCA-15 de agosto desacelera para 0,30% e reforça alívio no comitê de política monetária',
      sentiment: 'POSITIVO',
      impact: 'DI (-)',
    },
  ];

  return (
    <section
      id="panel-macro-news"
      className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Newspaper className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
              NOTÍCIAS MACRO & RADAR INSTITUCIONAL
            </h3>
            <span className="font-tech text-xs text-slate-400">
              Fluxo de notícias em tempo real impactando índices e moedas
            </span>
          </div>
        </div>

        <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
          FEED LIVE
        </span>
      </div>

      <div className="space-y-3">
        {news.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-cyan-300 font-bold">{item.time}</span>
                <span className="font-tech text-[10px] text-slate-400">• {item.source}</span>
                <span className="font-tech text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  {item.sentiment}
                </span>
              </div>
              <p className="font-tech text-xs text-slate-200">{item.title}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-tech text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                {item.impact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
