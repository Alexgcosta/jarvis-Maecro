import React, { useState } from 'react';
import { X, Save, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { MacroIndicator } from '../types/macroTypes';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: MacroIndicator[];
  onSave: (updated: { key: string; value: number; changePercent: number }[]) => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  indicators,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Record<string, { value: number; changePercent: number }>>(
    () => {
      const initial: Record<string, { value: number; changePercent: number }> = {};
      indicators.forEach((ind: any) => {
        const k = ind.id || ind.key;
        initial[k] = { value: ind.value, changePercent: ind.changePercent };
      });
      return initial;
    }
  );

  const handleChange = (key: string, field: 'value' | 'changePercent', val: number) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const handleSave = () => {
    const list = Object.entries(formData).map(([key, data]) => ({
      key,
      value: (data as { value: number; changePercent: number }).value,
      changePercent: (data as { value: number; changePercent: number }).changePercent,
    }));
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-extrabold text-base text-cyan-100">
              ENTRADA MANUAL DE DADOS // MODO OFFLINE / RESYNC
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto my-4 space-y-3 pr-2 max-h-[60vh]">
          <p className="font-tech text-xs text-slate-400">
            Ajuste manualmente os valores de mercado para simulação de cenários de estresse ou uso offline.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {indicators.slice(0, 8).map((ind) => (
              <div key={ind.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-orbitron font-bold text-xs text-slate-200 block mb-1">
                  {ind.name} ({ind.symbol})
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="text-[10px] font-tech text-slate-400 block">Cotação</label>
                    <input
                      type="number"
                      step="any"
                      value={formData[ind.key]?.value ?? ind.value}
                      onChange={(e) => handleChange(ind.key, 'value', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-tech text-slate-400 block">Variação %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData[ind.key]?.changePercent ?? ind.changePercent}
                      onChange={(e) =>
                        handleChange(ind.key, 'changePercent', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-tech text-xs hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-200 font-tech text-xs font-bold hover:bg-cyan-900 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <Save className="w-4 h-4" />
            <span>Aplicar e Recalcular Confluência</span>
          </button>
        </div>
      </div>
    </div>
  );
};
