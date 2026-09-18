import React, { useState } from 'react';
import {
  Sliders,
  X,
  Flame,
  Activity,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { VolatilityDetectorHookResult } from '../hooks/useVolatilitySpikeDetector';
import { soundFX } from '../utils/soundEffects';

interface VolatilityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  detector: VolatilityDetectorHookResult;
}

export const VolatilityConfigModal: React.FC<VolatilityConfigModalProps> = ({
  isOpen,
  onClose,
  detector,
}) => {
  if (!isOpen) return null;

  const {
    config,
    dollarVolatility,
    indexVolatility,
    updateThreshold,
    updateWindowSize,
    updateCooldown,
    toggleSoundAlert,
    triggerTestSpike,
    resetSpikes,
  } = detector;

  const [localDolThreshold, setLocalDolThreshold] = useState<number>(config.dollarThresholdPercent);
  const [localIndThreshold, setLocalIndThreshold] = useState<number>(config.indexThresholdPercent);
  const [localWindow, setLocalWindow] = useState<number>(config.windowSize);

  const handleApply = () => {
    soundFX.playSuccess();
    updateThreshold('DOL', localDolThreshold);
    updateThreshold('IND', localIndThreshold);
    updateWindowSize(localWindow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="volatility-config-modal"
        className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm text-cyan-50 tracking-wider flex items-center gap-2">
                <span>CONFIGURAÇÃO DE VOLATILIDADE EXTREMA</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-tech text-cyan-300">
                  BACKGROUND ENGINE
                </span>
              </h3>
              <p className="font-tech text-xs text-slate-400">
                Calibre o limiar de desvio padrão das variações de preço para disparo do badge 'Extreme Volatility'
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-tech">
          {/* Status Geral Atual */}
          <div className="grid grid-cols-2 gap-3">
            {/* DOL Status */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                dollarVolatility.isExtremeVolatility
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 font-bold uppercase">Dólar (DOL / WDO)</span>
                {dollarVolatility.isExtremeVolatility ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-bold animate-pulse">
                    <Flame className="w-3 h-3 text-rose-400" /> Extreme Volatility
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                    Normal
                  </span>
                )}
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Desvio Padrão Atual (σ):</span>
                  <strong className={dollarVolatility?.isExtremeVolatility ? 'text-rose-300' : 'text-cyan-300'}>
                    {(dollarVolatility?.stdDevPriceChangePercent ?? 0).toFixed(3)}%
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Limiar Configurado:</span>
                  <span className="text-slate-200">{(config?.dollarThresholdPercent ?? 0.3).toFixed(3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Razão Pico (σ/Limiar):</span>
                  <span className={(dollarVolatility?.spikeRatio ?? 0) > 1 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {(dollarVolatility?.spikeRatio ?? 0).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            {/* IND Status */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                indexVolatility?.isExtremeVolatility
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 font-bold uppercase">Índice (IND / WIN)</span>
                {indexVolatility?.isExtremeVolatility ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-bold animate-pulse">
                    <Flame className="w-3 h-3 text-rose-400" /> Extreme Volatility
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                    Normal
                  </span>
                )}
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Desvio Padrão Atual (σ):</span>
                  <strong className={indexVolatility?.isExtremeVolatility ? 'text-rose-300' : 'text-cyan-300'}>
                    {(indexVolatility?.stdDevPriceChangePercent ?? 0).toFixed(3)}%
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Limiar Configurado:</span>
                  <span className="text-slate-200">{(config?.indexThresholdPercent ?? 0.35).toFixed(3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Razão Pico (σ/Limiar):</span>
                  <span className={(indexVolatility?.spikeRatio ?? 0) > 1 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {(indexVolatility?.spikeRatio ?? 0).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sliders de Configuração */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 space-y-4">
            <h4 className="font-orbitron font-bold text-xs text-cyan-300 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>AJUSTE DE LIMIARES DE DETECÇÃO (DESVIO PADRÃO MÍNIMO)</span>
            </h4>

            {/* Slider Dólar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300">Limiar Dólar (WDO / USD):</span>
                <span className="font-mono text-cyan-300 font-bold">{(localDolThreshold ?? 0.3).toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.50"
                step="0.05"
                value={localDolThreshold ?? 0.3}
                onChange={(e) => setLocalDolThreshold(parseFloat(e.target.value) || 0.3)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.05% (Ultra-sensível)</span>
                <span>0.30% (Padrão)</span>
                <span>1.50% (Apenas Choques Severos)</span>
              </div>
            </div>

            {/* Slider Índice */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300">Limiar Índice (WIN / IBOV):</span>
                <span className="font-mono text-cyan-300 font-bold">{(localIndThreshold ?? 0.35).toFixed(2)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.00"
                step="0.05"
                value={localIndThreshold ?? 0.35}
                onChange={(e) => setLocalIndThreshold(parseFloat(e.target.value) || 0.35)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.05% (Alta Sensibilidade)</span>
                <span>0.35% (Padrão)</span>
                <span>2.00% (Choques Extremos)</span>
              </div>
            </div>

            {/* Slider Janela de Amostras */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300">Janela Deslizante de Amostras (Rolling Ticks):</span>
                <span className="font-mono text-cyan-300 font-bold">{localWindow} amostras</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={localWindow}
                onChange={(e) => setLocalWindow(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5 ticks (Reação Instantânea)</span>
                <span>15 ticks (Equilibrado)</span>
                <span>40 ticks (Tendência Suave)</span>
              </div>
            </div>
          </div>

          {/* Teste Imediato & Simulação */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>SIMULAÇÃO DE TESTE IMEDIATO (SPIKE INJECTION)</span>
              </span>
              <span className="text-[10px] text-slate-500">Validação do Badge</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Injete um choque artificial de cotações para validar a aparição imediata do badge <strong>'Extreme Volatility'</strong> no TradeSignalsPanel.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.playBlip(1200);
                  triggerTestSpike('DOL');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Simular Spike no Dólar
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playBlip(1200);
                  triggerTestSpike('IND');
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Simular Spike no Índice
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playBlip(800);
                  resetSpikes();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetar Volatilidade
              </button>
            </div>
          </div>

          {/* Toggle de Som */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-2">
              {config.soundAlertEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-slate-300 block font-semibold">Alerta Sonoro de Spike</span>
                <span className="text-[10px] text-slate-500">Emitir bip de aviso quando o limiar for rompido</span>
              </div>
            </div>
            <button
              onClick={toggleSoundAlert}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                config.soundAlertEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {config.soundAlertEnabled ? 'Ativado' : 'Silenciado'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950/90 flex items-center justify-between">
          <button
            onClick={() => {
              setLocalDolThreshold(0.30);
              setLocalIndThreshold(0.35);
              setLocalWindow(15);
            }}
            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Restaurar Valores Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
