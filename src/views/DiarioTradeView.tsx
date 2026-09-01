import React, { useState } from 'react';
import { BookOpen, Plus, TrendingUp, TrendingDown, CheckCircle, Clock, Trash2, Sparkles } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface TradeLogItem {
  id: string;
  timestamp: string;
  asset: 'WIN' | 'WDO';
  direction: 'COMPRA' | 'VENDA';
  entryPrice: number;
  exitPrice?: number;
  contracts: number;
  confluenceAtEntry: number; // 0 to 100
  scenarioAtEntry: string;
  pnlPoints: number;
  pnlBrl: number;
  notes: string;
  status: 'ABERTO' | 'FECHADO';
}

export const DiarioTradeView: React.FC = () => {
  const [trades, setTrades] = useState<TradeLogItem[]>([
    {
      id: 't1',
      timestamp: '2026-08-28 10:30',
      asset: 'WIN',
      direction: 'COMPRA',
      entryPrice: 133400,
      exitPrice: 133850,
      contracts: 5,
      confluenceAtEntry: 82,
      scenarioAtEntry: 'ALTA',
      pnlPoints: 450,
      pnlBrl: 450,
      notes: 'Entrada na virada de confluência com VIX em mínima do dia e bolsas americanas acelerando.',
      status: 'FECHADO',
    },
    {
      id: 't2',
      timestamp: '2026-08-28 11:20',
      asset: 'WDO',
      direction: 'VENDA',
      entryPrice: 5.425,
      exitPrice: 5.405,
      contracts: 3,
      confluenceAtEntry: 75,
      scenarioAtEntry: 'ALTA (Alívio Dólar)',
      pnlPoints: 20,
      pnlBrl: 600,
      notes: 'Operação alinhada com fluxo gringo comprador de ações e DXY em queda.',
      status: 'FECHADO',
    },
  ]);

  const [newAsset, setNewAsset] = useState<'WIN' | 'WDO'>('WIN');
  const [newDirection, setNewDirection] = useState<'COMPRA' | 'VENDA'>('COMPRA');
  const [newEntryPrice, setNewEntryPrice] = useState<string>('');
  const [newContracts, setNewContracts] = useState<number>(1);
  const [newNotes, setNewNotes] = useState<string>('');

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryPrice) return;

    const price = parseFloat(newEntryPrice);
    const newTrade: TradeLogItem = {
      id: `t-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      asset: newAsset,
      direction: newDirection,
      entryPrice: price,
      contracts: newContracts,
      confluenceAtEntry: 80,
      scenarioAtEntry: 'ALTA',
      pnlPoints: 0,
      pnlBrl: 0,
      notes: newNotes || 'Entrada registrada durante a sessão.',
      status: 'ABERTO',
    };

    setTrades([newTrade, ...trades]);
    setNewEntryPrice('');
    setNewNotes('');
    soundFX.playSuccess();
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter((t) => t.id !== id));
    soundFX.playClick();
  };

  const totalBrl = trades.reduce((acc, t) => acc + t.pnlBrl, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
              DIÁRIO DE TRADE QUANTITATIVO // J.A.R.V.I.S.
            </h2>
          </div>
          <p className="font-tech text-xs text-slate-400 mt-1">
            Registro de operações intradiárias cruzadas com os níveis de confluência macro
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-tech text-xs text-slate-400">Resultado Consolidado:</span>
          <span
            className={`font-orbitron font-extrabold text-lg sm:text-xl ${
              totalBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalBrl >= 0 ? `+R$ ${totalBrl.toFixed(2)}` : `R$ ${totalBrl.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Add New Trade Form */}
      <form
        onSubmit={handleAddTrade}
        className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="text-[10px] font-tech text-slate-400 block mb-1">Ativo</label>
          <select
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value as 'WIN' | 'WDO')}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-cyan-400"
          >
            <option value="WIN">WIN (Mini Índice)</option>
            <option value="WDO">WDO (Mini Dólar)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-tech text-slate-400 block mb-1">Direção</label>
          <select
            value={newDirection}
            onChange={(e) => setNewDirection(e.target.value as 'COMPRA' | 'VENDA')}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-tech text-slate-100 focus:outline-none focus:border-cyan-400"
          >
            <option value="COMPRA">🟢 COMPRA</option>
            <option value="VENDA">🔴 VENDA</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-tech text-slate-400 block mb-1">Preço Entrada</label>
          <input
            type="number"
            step="any"
            placeholder={newAsset === 'WIN' ? '133500' : '5.410'}
            value={newEntryPrice}
            onChange={(e) => setNewEntryPrice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-[10px] font-tech text-slate-400 block mb-1">Contratos</label>
          <input
            type="number"
            min="1"
            value={newContracts}
            onChange={(e) => setNewContracts(parseInt(e.target.value) || 1)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Trade</span>
        </button>
      </form>

      {/* Trades History Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <span className="font-orbitron font-bold text-xs text-slate-200 block mb-3">
          HISTÓRICO DE TRADES DA SESSÃO
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-tech text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Hora</th>
                <th className="py-2">Ativo</th>
                <th className="py-2">Direção</th>
                <th className="py-2">Entrada</th>
                <th className="py-2">Saída</th>
                <th className="py-2">Contratos</th>
                <th className="py-2">Confluência</th>
                <th className="py-2">PnL (R$)</th>
                <th className="py-2">Status</th>
                <th className="py-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-mono text-cyan-300">{t.timestamp}</td>
                  <td className="py-2.5 font-bold">{t.asset}</td>
                  <td className="py-2.5">
                    <span
                      className={`font-bold ${
                        t.direction === 'COMPRA' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono">{t.entryPrice}</td>
                  <td className="py-2.5 font-mono text-slate-400">{t.exitPrice ?? '--'}</td>
                  <td className="py-2.5 font-mono">{t.contracts}</td>
                  <td className="py-2.5 font-mono text-cyan-300">{t.confluenceAtEntry}%</td>
                  <td
                    className={`py-2.5 font-mono font-bold ${
                      t.pnlBrl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.pnlBrl >= 0 ? `+R$ ${t.pnlBrl.toFixed(2)}` : `R$ ${t.pnlBrl.toFixed(2)}`}
                  </td>
                  <td className="py-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => handleDeleteTrade(t.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
