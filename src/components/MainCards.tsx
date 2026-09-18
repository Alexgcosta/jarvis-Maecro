import React from 'react';
import { Globe, Flag, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { BiasClassification, SentimentClassification } from '../types/macroTypes';
import { SpeedometerGauge } from './SpeedometerGauge';

interface MainCardsProps {
  globalSentiment: {
    score: number;
    classification: SentimentClassification;
    label: string;
    confidence: number;
    timestamp: string;
    formattedTime: string;
    explanation: string;
  };
  brazilSentiment: {
    score: number;
    label: string;
    timestamp: string;
    formattedTime: string;
    explanation: string;
  };
  winBias: {
    score: number;
    classification: BiasClassification;
    label: string;
    confidence: number;
    timestamp: string;
    formattedTime: string;
    explanation: string;
    winReturn: number;
  };
  wdoBias: {
    score: number;
    classification: BiasClassification;
    label: string;
    confidence: number;
    timestamp: string;
    formattedTime: string;
    explanation: string;
    wdoReturn: number;
  };
}

export const MainCards: React.FC<MainCardsProps> = ({
  globalSentiment,
  brazilSentiment,
  winBias,
  wdoBias,
}) => {
  const getBadgeStyle = (score: number) => {
    if (score >= 25) return 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
    if (score > -25) return 'text-violet-300 border-violet-500/40 bg-violet-950/40';
    return 'text-rose-300 border-rose-500/40 bg-rose-950/40';
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. GLOBAL SENTIMENT */}
      <div
        id="card-global-sentiment"
        className="p-5 rounded-2xl bg-[#0b0914]/90 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between hover:border-violet-500/50 transition-all shadow-[0_4px_25px_rgba(139,92,246,0.1)] group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-xs tracking-wider text-zinc-200">
                SENTIMENTO GLOBAL
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-violet-400" />
              {globalSentiment.formattedTime}
            </span>
          </div>

          {/* Velocímetro */}
          <div className="flex justify-center my-2">
            <SpeedometerGauge
              id="gauge-global-sentiment"
              value={globalSentiment.score}
              min={-100}
              max={100}
              size="sm"
              colorScheme="bidirectional"
            />
          </div>

          <div className="text-center mt-1">
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getBadgeStyle(
                globalSentiment.score
              )}`}
            >
              {globalSentiment.label}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-violet-900/30">
          <p className="font-sans text-xs text-zinc-400 line-clamp-2">
            {globalSentiment.explanation}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
            <span>Confiança: {globalSentiment.confidence}%</span>
            <span className="text-violet-400">Macro Puro (Ex-Preço)</span>
          </div>
        </div>
      </div>

      {/* 2. BRAZIL SENTIMENT */}
      <div
        id="card-brazil-sentiment"
        className="p-5 rounded-2xl bg-[#0b0914]/90 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between hover:border-violet-500/50 transition-all shadow-[0_4px_25px_rgba(139,92,246,0.1)] group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <Flag className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-xs tracking-wider text-zinc-200">
                SENTIMENTO BRASIL
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-violet-400" />
              {brazilSentiment.formattedTime}
            </span>
          </div>

          {/* Velocímetro */}
          <div className="flex justify-center my-2">
            <SpeedometerGauge
              id="gauge-brazil-sentiment"
              value={brazilSentiment.score}
              min={-100}
              max={100}
              size="sm"
              colorScheme="bidirectional"
            />
          </div>

          <div className="text-center mt-1">
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getBadgeStyle(
                brazilSentiment.score
              )}`}
            >
              {brazilSentiment.label}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-violet-900/30">
          <p className="font-sans text-xs text-zinc-400 line-clamp-2">
            {brazilSentiment.explanation}
          </p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
            <span>Drivers: CDS, DI & Câmbio</span>
            <span className="text-emerald-400">Método Macro Vinculado</span>
          </div>
        </div>
      </div>

      {/* 3. WIN BIAS */}
      <div
        id="card-win-bias"
        className="p-5 rounded-2xl bg-[#0b0914]/90 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-[0_4px_25px_rgba(139,92,246,0.1)] group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-xs tracking-wider text-zinc-200">
                VIÉS WIN (MINI ÍNDICE)
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              {winBias.formattedTime}
            </span>
          </div>

          {/* Velocímetro */}
          <div className="flex justify-center my-2">
            <SpeedometerGauge
              id="gauge-win-bias"
              value={winBias.score}
              min={-100}
              max={100}
              size="sm"
              colorScheme="bidirectional"
            />
          </div>

          <div className="flex items-center justify-between mt-1 px-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getBadgeStyle(
                winBias.score
              )}`}
            >
              {winBias.label}
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                winBias.winReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Deslocamento: {winBias.winReturn >= 0 ? `+${winBias.winReturn.toFixed(2)}%` : `${winBias.winReturn.toFixed(2)}%`}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-violet-900/30">
          <p className="font-sans text-xs text-zinc-400 line-clamp-2">{winBias.explanation}</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
            <span>Confiança: {winBias.confidence}%</span>
            <span className="text-emerald-400">Macro × Preço B3</span>
          </div>
        </div>
      </div>

      {/* 4. WDO BIAS */}
      <div
        id="card-wdo-bias"
        className="p-5 rounded-2xl bg-[#0b0914]/90 border border-violet-900/40 backdrop-blur-md flex flex-col justify-between hover:border-rose-500/50 transition-all shadow-[0_4px_25px_rgba(139,92,246,0.1)] group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-xs tracking-wider text-zinc-200">
                VIÉS WDO / DOL (DÓLAR)
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-400" />
              {wdoBias.formattedTime}
            </span>
          </div>

          {/* Velocímetro */}
          <div className="flex justify-center my-2">
            <SpeedometerGauge
              id="gauge-wdo-bias"
              value={wdoBias.score}
              min={-100}
              max={100}
              size="sm"
              colorScheme="bidirectional"
            />
          </div>

          <div className="flex items-center justify-between mt-1 px-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getBadgeStyle(
                wdoBias.score
              )}`}
            >
              {wdoBias.label}
            </span>
            <span
              className={`font-mono font-bold text-xs ${
                wdoBias.wdoReturn >= 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              Deslocamento: {wdoBias.wdoReturn >= 0 ? `+${wdoBias.wdoReturn.toFixed(2)}%` : `${wdoBias.wdoReturn.toFixed(2)}%`}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-violet-900/30">
          <p className="font-sans text-xs text-zinc-400 line-clamp-2">{wdoBias.explanation}</p>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2">
            <span>Confiança: {wdoBias.confidence}%</span>
            <span className="text-rose-400">DXY + Yields + DI B3</span>
          </div>
        </div>
      </div>
    </section>
  );
};
