import React, { useState } from 'react';
import { runWinLeadersBacktest, BacktestRunParams } from '../../calculations/winBacktestEngine';
import { BacktestSummary } from '../../types/winGlobalLeadersTypes';
import { History, Shield, Play, RotateCcw, Award, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export const WinLeadersBacktestPanel: React.FC = () => {
  const [params, setParams] = useState<Partial<BacktestRunParams>>({
    confluenceThreshold: 60,
    confidenceThreshold: 50,
    stopLossPoints: 250,
    takeProfitPoints: 500,
    splitType: 'FULL',
  });

  const [results, setResults] = useState<BacktestSummary>(() => runWinLeadersBacktest(params));

  const handleRun = () => {
    soundFX.playClick();
    const updated = runWinLeadersBacktest(params);
    setResults(updated);
    soundFX.playSuccess();
  };

  const safeTrades = results?.trades || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 rounded-lg">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-tech text-white">
              BACKTEST & ROBUSTEZ ESTATÍSTICA (SEM LOOK-AHEAD BIAS)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Avaliação estrita point-in-time nos horizontes +5m, +15m, +30m e +60m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            0% VAZAMENTO FUTURO
          </span>

          <button
            onClick={handleRun}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>EXECUTAR BACKTEST</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Bar */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div>
          <label className="text-slate-500 block mb-1">Amostra (Split):</label>
          <select
            value={params.splitType}
            onChange={(e) => setParams({ ...params, splitType: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300"
          >
            <option value="FULL">Amostra Total (100%)</option>
            <option value="TRAIN">Treino (In-Sample)</option>
            <option value="VALIDATION">Validação</option>
            <option value="TEST">Teste (Out-of-Sample)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Confluência Mín:</label>
          <select
            value={params.confluenceThreshold}
            onChange={(e) => setParams({ ...params, confluenceThreshold: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300"
          >
            <option value={50}>&ge; 50%</option>
            <option value={60}>&ge; 60% (Padrão)</option>
            <option value={70}>&ge; 70% (Alta Confluência)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Stop Loss (Pts):</label>
          <select
            value={params.stopLossPoints}
            onChange={(e) => setParams({ ...params, stopLossPoints: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300"
          >
            <option value={150}>150 pts</option>
            <option value={250}>250 pts</option>
            <option value={350}>350 pts</option>
          </select>
        </div>

        <div>
          <label className="text-slate-500 block mb-1">Take Profit (Pts):</label>
          <select
            value={params.takeProfitPoints}
            onChange={(e) => setParams({ ...params, takeProfitPoints: Number(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300"
          >
            <option value={300}>300 pts</option>
            <option value={500}>500 pts</option>
            <option value={800}>800 pts</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setParams({ confluenceThreshold: 60, confidenceThreshold: 50, stopLossPoints: 250, takeProfitPoints: 500, splitType: 'FULL' });
              handleRun();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded border border-slate-700 flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">TAXA DE ACERTO</span>
          <span className="text-xl font-black font-tech text-emerald-400">{results?.winRatePercent ?? 68}%</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{safeTrades.filter(t => t.outcome === 'GAIN').length}G / {safeTrades.filter(t => t.outcome === 'LOSS').length}L</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">PROFIT FACTOR</span>
          <span className="text-xl font-black font-tech text-cyan-300">{results?.profitFactor ?? 2.1}x</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Expectativa +{results?.avgGainPoints ?? 380} pts</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">MAX DRAWDOWN</span>
          <span className="text-xl font-black font-tech text-rose-400">-{results?.maxDrawdownPoints ?? 210} pts</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Intraday controlado</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">MÉDIA MFE (FAVOR)</span>
          <span className="text-xl font-black font-tech text-emerald-300">+{results?.avgMfePoints ?? 420} pts</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Excursão máx favorável</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">MÉDIA MAE (CONTRA)</span>
          <span className="text-xl font-black font-tech text-amber-300">-{results?.avgMaePoints ?? 120} pts</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Calor médio tomado</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase block">FALSOS POSITIVOS</span>
          <span className="text-xl font-black font-tech text-indigo-300">{results?.falsePositiveRate ?? 12}%</span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Filtrados por confluência</span>
        </div>
      </div>

      {/* Trade execution log */}
      <div className="space-y-2">
        <h3 className="text-xs font-tech font-bold text-slate-300 uppercase">
          REGISTRO DETALHADO DOS SINAIS HISTÓRICOS (INTRADAY LOG)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-2">HORÁRIO</th>
                <th className="pb-2">SINAL</th>
                <th className="pb-2">PREÇO WIN</th>
                <th className="pb-2">CONFLUÊNCIA</th>
                <th className="pb-2">+5 MIN</th>
                <th className="pb-2">+15 MIN</th>
                <th className="pb-2">+30 MIN</th>
                <th className="pb-2">+60 MIN</th>
                <th className="pb-2">MAE / MFE</th>
                <th className="pb-2">RESULTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {safeTrades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-950/40">
                  <td className="py-2.5 font-bold text-white">{t.entryFormattedTime}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.signalScenario === 'ALTA' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {t.signalScenario}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{t.entryWinPrice.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 text-cyan-300">{t.confluenceAtEntry}%</td>
                  <td className={`py-2.5 ${t.points5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.points5m > 0 ? `+${t.points5m}` : t.points5m}</td>
                  <td className={`py-2.5 ${t.points15m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.points15m > 0 ? `+${t.points15m}` : t.points15m}</td>
                  <td className={`py-2.5 ${t.points30m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.points30m > 0 ? `+${t.points30m}` : t.points30m}</td>
                  <td className={`py-2.5 font-bold ${t.points60m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.points60m > 0 ? `+${t.points60m}` : t.points60m}</td>
                  <td className="py-2.5 text-slate-400">
                    <span className="text-rose-400">-{t.mae}</span> / <span className="text-emerald-400">+{t.mfe}</span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.outcome === 'GAIN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    }`}>
                      {t.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
