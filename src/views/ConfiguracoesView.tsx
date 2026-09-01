import React, { useState } from 'react';
import { SlidersHorizontal, Save, RotateCcw, Volume2, Clock, ShieldCheck, Key } from 'lucide-react';
import { IndicatorWeightConfig, MacroIndicator } from '../types/macroTypes';
import { DEFAULT_WEIGHTS } from '../data/indicatorsRegistry';
import { soundFX } from '../utils/soundEffects';

interface ConfiguracoesViewProps {
  indicators: MacroIndicator[];
  weights: IndicatorWeightConfig;
  onSaveWeights: (newWeights: IndicatorWeightConfig) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  indicators,
  weights,
  onSaveWeights,
}) => {
  const [localWeights, setLocalWeights] = useState<IndicatorWeightConfig>({ ...weights });
  const [pollingInterval, setPollingInterval] = useState<number>(10);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  const handleWeightChange = (key: string, val: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleResetDefaults = () => {
    setLocalWeights({ ...DEFAULT_WEIGHTS });
    soundFX.playClick();
  };

  const handleSave = () => {
    onSaveWeights(localWeights);
    soundFX.playSuccess();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100">
              CONFIGURAÇÕES DO MOTOR MACRO & PESOS
            </h2>
          </div>
          <p className="font-tech text-xs text-slate-400 mt-1">
            Personalize os pesos dos indicadores macroeconômicos e parâmetros do sistema J.A.R.V.I.S.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Ajustes</span>
          </button>
        </div>
      </div>

      {showSavedToast && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-tech font-bold flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Configurações salvas e modelo quantitativo recalculado com sucesso!</span>
        </div>
      )}

      {/* System Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Polling */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-orbitron font-bold text-xs text-slate-200">
              INTERVALO DE POLLING / SINCRONIZAÇÃO
            </span>
          </div>
          <p className="font-tech text-xs text-slate-400 mb-3">
            Frequência de atualização em segundo plano das séries temporais
          </p>
          <div className="flex gap-2">
            {[5, 10, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setPollingInterval(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold border transition-all ${
                  pollingInterval === sec
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Audio Effects */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span className="font-orbitron font-bold text-xs text-slate-200">
              EFEITOS SONOROS HOLOGRÁFICOS & VOZ
            </span>
          </div>
          <p className="font-tech text-xs text-slate-400 mb-3">
            Sintetizador Web Audio API e avisos sonoros de virada de termômetro
          </p>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              soundFX.playActivation();
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-tech font-bold border transition-all ${
              soundEnabled
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? '🟢 ÁUDIO ATIVADO' : '🔴 ÁUDIO MUTADO'}
          </button>
        </div>
      </div>

      {/* Weights Sliders */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25">
        <div className="flex items-center justify-between mb-4">
          <span className="font-orbitron font-bold text-xs text-slate-200">
            PESOS DOS INDICADORES MACRO (0.0 A 3.0)
          </span>
          <span className="font-tech text-xs text-slate-400">16 Indicadores Registrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.map((ind) => {
            const currentVal = localWeights[ind.key] ?? ind.weight;
            return (
              <div
                key={ind.key}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-orbitron font-bold text-xs text-slate-200 block">
                      {ind.name} ({ind.symbol})
                    </span>
                    <span className="font-tech text-[10px] text-slate-400">{ind.category}</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {currentVal.toFixed(2)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.05"
                  value={currentVal}
                  onChange={(e) => handleWeightChange(ind.key, parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] font-tech text-slate-500 mt-1">
                  <span>0.0 (Desativado)</span>
                  <span>1.0 (Padrão)</span>
                  <span>3.0 (Peso Máximo)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
