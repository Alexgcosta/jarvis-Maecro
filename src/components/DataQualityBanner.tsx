import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, RefreshCw, CheckCircle2, Server } from 'lucide-react';
import { DataFreshnessStatus } from '../types/macroTypes';

interface DataQualityBannerProps {
  status: DataFreshnessStatus;
  lastUpdated: string;
  formattedTime: string;
  sourceCount: number;
  activeSourceCount: number;
  syncLagSeconds: number;
  isDesynchronized: boolean;
  onForceResync: () => void;
}

export const DataQualityBanner: React.FC<DataQualityBannerProps> = ({
  status,
  lastUpdated,
  formattedTime,
  sourceCount,
  activeSourceCount,
  syncLagSeconds,
  isDesynchronized,
  onForceResync,
}) => {
  return (
    <div
      id="panel-data-quality"
      className={`p-3.5 rounded-xl border backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
        isDesynchronized
          ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
          : status === 'LIVE'
          ? 'bg-slate-900/60 border-cyan-500/25 text-slate-300'
          : 'bg-slate-900/60 border-slate-700/40 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isDesynchronized
              ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40'
              : status === 'LIVE'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
          }`}
        >
          {isDesynchronized ? (
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-orbitron font-bold text-xs tracking-wider text-slate-200">
              QUALIDADE E SINCRONIZAÇÃO DOS DADOS
            </span>
            <span
              className={`font-tech text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                status === 'LIVE'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : status === 'DELAYED'
                  ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {status === 'LIVE'
                ? '🟢 LIVE // TEMPO REAL'
                : status === 'DELAYED'
                ? '🟡 DELAYED'
                : status === 'STALE'
                ? '🔴 STALE'
                : '⚪ SIMULATED'}
            </span>

            {isDesynchronized && (
              <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-400 font-bold animate-pulse">
                ⚠️ DADOS DESINCRONIZADOS ({syncLagSeconds}s lag)
              </span>
            )}
          </div>

          <p className="font-tech text-[11px] text-slate-400 mt-0.5">
            Grade temporal canônica unificada (09:00 - 18:00). Nenhuma série de preço substitui ou sintetiza sentimento macro.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-tech self-end md:self-center shrink-0">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Fontes: <strong className="text-cyan-200">{activeSourceCount}/{sourceCount}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Último Tick: <strong className="text-cyan-200">{formattedTime}</strong></span>
        </div>

        <button
          onClick={onForceResync}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 text-[11px] font-tech flex items-center gap-1 transition-colors"
          title="Forçar Re-sincronização de Timestamps"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Re-sincronizar</span>
        </button>
      </div>
    </div>
  );
};
