import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Zap,
  Sparkles,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface QuantPositionCalculatorProps {
  initialAsset?: 'DOL' | 'IND';
  currentDollarPrice?: number;
  currentIndexPrice?: number;
  onAskJarvis: (prompt: string) => void;
}

export const QuantPositionCalculator: React.FC<QuantPositionCalculatorProps> = ({
  initialAsset = 'DOL',
  currentDollarPrice = 5.405,
  currentIndexPrice = 134250,
  onAskJarvis,
}) => {
  const safeDolPrice = typeof currentDollarPrice === 'number' && !isNaN(currentDollarPrice) && currentDollarPrice > 0 ? currentDollarPrice : 5.405;
  const safeIndPrice = typeof currentIndexPrice === 'number' && !isNaN(currentIndexPrice) && currentIndexPrice > 0 ? currentIndexPrice : 134250;

  const [asset, setAsset] = useState<'DOL' | 'IND'>(initialAsset);
  const [operationType, setOperationType] = useState<'BUY' | 'SELL'>('BUY');
  const [contracts, setContracts] = useState<number>(2);

  // Prices
  const [entryPrice, setEntryPrice] = useState<number>(
    asset === 'DOL' ? safeDolPrice : safeIndPrice
  );
  const [targetPrice, setTargetPrice] = useState<number>(
    asset === 'DOL' ? +(safeDolPrice + 0.05).toFixed(3) : safeIndPrice + 800
  );
  const [stopLoss, setStopLoss] = useState<number>(
    asset === 'DOL' ? +(safeDolPrice - 0.025).toFixed(3) : safeIndPrice - 400
  );

  // Switch asset handler
  const handleSwitchAsset = (newAsset: 'DOL' | 'IND') => {
    soundFX.playBlip(1000);
    setAsset(newAsset);
    if (newAsset === 'DOL') {
      setEntryPrice(safeDolPrice);
      setTargetPrice(+(safeDolPrice + 0.05).toFixed(3));
      setStopLoss(+(safeDolPrice - 0.025).toFixed(3));
    } else {
      setEntryPrice(safeIndPrice);
      setTargetPrice(safeIndPrice + 800);
      setStopLoss(safeIndPrice - 400);
    }
  };

  // Calculations:
  // WDO: 1 ponto = R$ 10,00 por contrato (0.5 ponto = R$ 5,00)
  // No Dólar: R$ 5,420 para R$ 5,430 = 10 pontos. 10 pontos * R$ 10 * contratos = R$ 100 * contratos.
  // WIN: 1 ponto = R$ 0,20 por contrato (ex: 500 pontos = R$ 100 por contrato).
  const isDollar = asset === 'DOL';
  const isBuy = operationType === 'BUY';

  // Difference in points
  const gainPoints = isBuy ? targetPrice - entryPrice : entryPrice - targetPrice;
  const lossPoints = isBuy ? entryPrice - stopLoss : stopLoss - entryPrice;

  // Real financial values
  const financialGain = isDollar
    ? Math.max(0, gainPoints * 1000 * 10 * contracts) // Diferença em centavos/pontos
    : Math.max(0, gainPoints * 0.2 * contracts);

  const financialLoss = isDollar
    ? Math.max(0, lossPoints * 1000 * 10 * contracts)
    : Math.max(0, lossPoints * 0.2 * contracts);

  const riskRewardRatio =
    financialLoss > 0 ? (financialGain / financialLoss).toFixed(2) : '0';

  const marginRequired = isDollar ? contracts * 150 : contracts * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-sm text-cyan-100 tracking-wider">
              SIMULADOR QUANTITATIVO DE GESTÃO DE RISCO & POSIÇÃO
            </h2>
            <p className="font-tech text-xs text-slate-400">
              Dimensionamento de lotes para Mini Dólar (WDO) e Mini Índice (WIN)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Box */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md flex flex-col gap-4">
          <div className="font-orbitron font-bold text-xs text-cyan-100 border-b border-cyan-500/15 pb-2.5">
            PARÂMETROS DA OPERAÇÃO
          </div>

          {/* Asset Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSwitchAsset('DOL')}
              className={`p-3 rounded-xl border font-orbitron text-xs flex items-center justify-center gap-2 transition-all ${
                asset === 'DOL'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-950/60 border-cyan-500/20 text-slate-400 hover:text-cyan-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              MINI DÓLAR (WDO)
            </button>

            <button
              onClick={() => handleSwitchAsset('IND')}
              className={`p-3 rounded-xl border font-orbitron text-xs flex items-center justify-center gap-2 transition-all ${
                asset === 'IND'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 border-cyan-500/20 text-slate-400 hover:text-cyan-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              MINI ÍNDICE (WIN)
            </button>
          </div>

          {/* Direction Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundFX.playBlip(1100);
                setOperationType('BUY');
              }}
              className={`p-2.5 rounded-xl border font-tech text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                operationType === 'BUY'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950/60 border-cyan-500/20 text-slate-400'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> COMPRA (LONG)
            </button>

            <button
              onClick={() => {
                soundFX.playBlip(900);
                setOperationType('SELL');
              }}
              className={`p-2.5 rounded-xl border font-tech text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                operationType === 'SELL'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-950/60 border-cyan-500/20 text-slate-400'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> VENDA (SHORT)
            </button>
          </div>

          {/* Number of contracts */}
          <div>
            <div className="flex justify-between text-xs font-tech text-slate-300 mb-1">
              <span>Quantidade de Contratos (Lote):</span>
              <span className="text-cyan-300 font-bold">{contracts} contrato(s)</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={contracts}
              onChange={(e) => setContracts(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Inputs for Entry, Target, Stop */}
          <div className="space-y-3 font-tech text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Preço de Entrada:</label>
              <input
                type="number"
                step={isDollar ? 0.005 : 5}
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-100 font-bold focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-emerald-400 block mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Preço Alvo (Take Profit / Gain):
              </label>
              <input
                type="number"
                step={isDollar ? 0.005 : 5}
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-bold focus:border-emerald-400 outline-none"
              />
            </div>

            <div>
              <label className="text-rose-400 block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Stop Loss (Proteção):
              </label>
              <input
                type="number"
                step={isDollar ? 0.005 : 5}
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/40 text-rose-300 font-bold focus:border-rose-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results & Risk/Reward Box */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md flex flex-col justify-between gap-4">
          <div className="font-orbitron font-bold text-xs text-cyan-100 border-b border-cyan-500/15 pb-2.5 flex items-center justify-between">
            <span>RELATÓRIO DE RISCO & RETORNO</span>
            <span className="font-tech text-xs text-cyan-400">STARK RISK ENGINE</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-tech">
            {/* Potential Gain */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 uppercase block">GANHO POTENCIAL (GAIN):</span>
              <div className="font-orbitron font-bold text-lg text-emerald-400 mt-1">
                R$ {financialGain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-300/80">
                {isDollar ? `${((gainPoints || 0) * 1000).toFixed(1)} pts de Dólar` : `${(gainPoints || 0).toFixed(0)} pts de Índice`}
              </span>
            </div>

            {/* Potential Loss */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30">
              <span className="text-[10px] text-slate-400 uppercase block">PERDA MÁXIMA (STOP LOSS):</span>
              <div className="font-orbitron font-bold text-lg text-rose-400 mt-1">
                R$ {(financialLoss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-rose-300/80">
                {isDollar ? `${((lossPoints || 0) * 1000).toFixed(1)} pts de Dólar` : `${(lossPoints || 0).toFixed(0)} pts de Índice`}
              </span>
            </div>

            {/* Risk Reward Ratio */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">RELAÇÃO RISCO x RETORNO:</span>
              <div className="font-orbitron font-bold text-base text-cyan-200 mt-1">
                1 : {riskRewardRatio}
              </div>
              <span className="text-[11px] text-slate-400">
                {Number(riskRewardRatio) >= 2 ? '✅ Relação Saudável (> 1:2)' : '⚠️ Relação Risco Elevado'}
              </span>
            </div>

            {/* Margin Required */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/20">
              <span className="text-[10px] text-slate-400 uppercase block">MARGEM DAY-TRADE (B3):</span>
              <div className="font-orbitron font-bold text-base text-cyan-200 mt-1">
                R$ {marginRequired.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-slate-400">Garantia mínima estimada</span>
            </div>
          </div>

          {/* MCP Macro Hub Recommendation */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-violet-900/40 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-violet-300 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              VEREDITO DE GESTÃO DE RISCO MCP MACRO HUB:
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              {Number(riskRewardRatio) >= 2
                ? `Operação quantitativamente aprovada com ${contracts} contrato(s). A assimetria de retorno de 1:${riskRewardRatio} cumpre os critérios técnicos de confluência.`
                : 'Aviso: Esta configuração oferece uma relação risco/retorno inferior ao ideal de 1:2. Considere estender o alvo técnico ou ajustar o stop loss.'}
            </p>
          </div>

          <button
            onClick={() => {
              soundFX.playBlip(1100);
              onAskJarvis(
                `MCP Macro Hub, avalie a simulação técnica de ${operationType === 'BUY' ? 'COMPRA' : 'VENDA'} de ${contracts} contrato(s) no ${asset === 'DOL' ? 'Mini Dólar' : 'Mini Índice'} com Entrada em ${entryPrice}, Alvo em ${targetPrice} e Stop em ${stopLoss}. Qual o veredito macro e quantitativo?`
              );
            }}
            className="w-full py-3 rounded-xl bg-violet-600/25 border border-violet-500/40 hover:bg-violet-600/35 text-violet-100 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            Validar Estratégia de Risco no MCP Macro Hub
          </button>
        </div>
      </div>
    </div>
  );
};
