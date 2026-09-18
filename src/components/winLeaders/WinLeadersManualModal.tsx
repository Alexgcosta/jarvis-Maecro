import React, { useState } from 'react';
import { X, Save, RotateCcw, Check, Sparkles, Layers } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { RawMarketInputs } from '../../calculations/winGlobalLeadersEngine';

interface WinLeadersManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyManualInputs: (inputs: RawMarketInputs) => void;
}

export const WinLeadersManualModal: React.FC<WinLeadersManualModalProps> = ({
  isOpen,
  onClose,
  onApplyManualInputs,
}) => {
  const [ewzPrice, setEwzPrice] = useState<number>(29.40);
  const [ewzPutWall, setEwzPutWall] = useState<number>(28.00);
  const [ewzGammaFlip, setEwzGammaFlip] = useState<number>(29.00);
  const [ewzCallWall, setEwzCallWall] = useState<number>(31.00);
  const [ewzIv, setEwzIv] = useState<number>(24.5);
  const [ewzHv, setEwzHv] = useState<number>(21.2);
  const [ewzIvPercentile, setEwzIvPercentile] = useState<number>(42);
  const [ewzChangePercent, setEwzChangePercent] = useState<number>(1.15);

  const [winPrice, setWinPrice] = useState<number>(134450);
  const [wdoPrice, setWdoPrice] = useState<number>(5.412);
  const [ironOreChange, setIronOreChange] = useState<number>(0.75);
  const [brentChange, setBrentChange] = useState<number>(0.45);
  const [vixChange, setVixChange] = useState<number>(-4.5);
  const [dxyChange, setDxyChange] = useState<number>(-0.22);
  const [sp500Change, setSp500Change] = useState<number>(0.42);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playSuccess();
    onApplyManualInputs({
      winPrice,
      wdoPrice,
      ewzPrice,
      ewzPutWall,
      ewzGammaFlip,
      ewzCallWall,
      ewzIv,
      ewzHv,
      ewzIvPercentile,
      ewzChangePercent,
      commodities: {
        ironOre: ironOreChange,
        brent: brentChange,
      },
      global: {
        vixChange,
        dxyChange,
        sp500: sp500Change,
      },
      manualOverrides: {
        ewzPrice: true,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      },
    });
    onClose();
  };

  const handlePresetBullish = () => {
    soundFX.playClick();
    setEwzPrice(29.80);
    setEwzChangePercent(1.45);
    setEwzGammaFlip(29.00);
    setEwzPutWall(28.50);
    setEwzCallWall(31.50);
    setIronOreChange(1.20);
    setBrentChange(0.60);
    setVixChange(-6.5);
    setDxyChange(-0.40);
    setSp500Change(0.65);
    setWinPrice(134850);
    setWdoPrice(5.395);
  };

  const handlePresetBearish = () => {
    soundFX.playClick();
    setEwzPrice(28.70);
    setEwzChangePercent(-1.60);
    setEwzGammaFlip(29.20);
    setEwzPutWall(27.50);
    setEwzCallWall(30.00);
    setIronOreChange(-1.40);
    setBrentChange(-1.10);
    setVixChange(8.5);
    setDxyChange(0.55);
    setSp500Change(-0.85);
    setWinPrice(133400);
    setWdoPrice(5.465);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-tech text-white">
                ENTRADA MANUAL — EWZ GEX & LÍDERES GLOBAIS
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                Permite inserir dados manuais quando a fonte estiver offline (Seção 14 & 81)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Cenários Rápidos:</span>
          <button
            type="button"
            onClick={handlePresetBullish}
            className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono font-bold hover:bg-emerald-500/30"
          >
            🟢 Forte Alta Global
          </button>
          <button
            type="button"
            onClick={handlePresetBearish}
            className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs font-mono font-bold hover:bg-rose-500/30"
          >
            🔴 Forte Baixa Global
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4 font-mono text-xs">
          {/* Section 1: EWZ & GEX Strikes */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h3 className="font-tech text-xs font-bold text-cyan-300 uppercase">
              1. EWZ & ESTRUTURA GEX (STRIKES EM US$)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">EWZ Preço (US$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ewzPrice}
                  onChange={(e) => setEwzPrice(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">EWZ Variação (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ewzChangePercent}
                  onChange={(e) => setEwzChangePercent(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="text-emerald-400 block mb-1">Call Wall Strike:</label>
                <input
                  type="number"
                  step="0.1"
                  value={ewzCallWall}
                  onChange={(e) => setEwzCallWall(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1">Gamma Flip Strike:</label>
                <input
                  type="number"
                  step="0.1"
                  value={ewzGammaFlip}
                  onChange={(e) => setEwzGammaFlip(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-rose-400 block mb-1">Put Wall Strike:</label>
                <input
                  type="number"
                  step="0.1"
                  value={ewzPutWall}
                  onChange={(e) => setEwzPutWall(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Implied Vol (IV %):</label>
                <input
                  type="number"
                  step="0.1"
                  value={ewzIv}
                  onChange={(e) => setEwzIv(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Historical Vol (HV %):</label>
                <input
                  type="number"
                  step="0.1"
                  value={ewzHv}
                  onChange={(e) => setEwzHv(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">IV Percentile (0-100):</label>
                <input
                  type="number"
                  value={ewzIvPercentile}
                  onChange={(e) => setEwzIvPercentile(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-indigo-300 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: WIN & WDO Reference */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <h3 className="font-tech text-xs font-bold text-cyan-300 uppercase">
              2. WIN & WDO (PREÇOS BASE DE REFERÊNCIA)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">WIN Preço (pts):</label>
                <input
                  type="number"
                  value={winPrice}
                  onChange={(e) => setWinPrice(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">WDO Preço (R$):</label>
                <input
                  type="number"
                  step="0.001"
                  value={wdoPrice}
                  onChange={(e) => setWdoPrice(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Minério Variação (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={ironOreChange}
                  onChange={(e) => setIronOreChange(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">VIX Variação (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vixChange}
                  onChange={(e) => setVixChange(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-rose-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech text-xs rounded-lg transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <Save className="w-4 h-4" />
              <span>APLICAR E RECALCULAR MODELO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
