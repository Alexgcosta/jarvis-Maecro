import React from 'react';
import { Globe, Flag, TrendingUp, TrendingDown, Clock, ShieldCheck, Zap } from 'lucide-react';
import { BiasClassification, SentimentClassification } from '../types/macroTypes';

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
  const getScoreColor = (score: number, isSentiment: boolean = true) => {
    if (score >= 25) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score > -25) return 'text-amber-300 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const getWdoScoreColor = (score: number) => {
    // For WDO: positive score = USD buying (amber/green for dollar strength), but let's clearly use cyan/amber
    if (score >= 25) return 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40';
    if (score > -25) return 'text-slate-300 border-slate-600/40 bg-slate-900/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. GLOBAL SENTIMENT */}
      <div
        id="card-global-sentiment"
        className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300">
                GLOBAL SENTIMENT
              </span>
            </div>
            <span className="font-tech text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {globalSentiment.formattedTime}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <span
              className={`font-orbitron font-extrabold text-3xl sm:text-4xl tracking-tight ${
                globalSentiment.score >= 0 ? 'text-cyan-300' : 'text-rose-400'
              }`}
            >
              {globalSentiment.score >= 0 ? `+${globalSentiment.score}` : globalSentiment.score}
            </span>
            <span className="font-tech text-xs text-slate-400">Escala: -100 / +100</span>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-tech font-bold border ${getScoreColor(
                globalSentiment.score
              )}`}
            >
              {globalSentiment.label}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/15">
          <p className="font-tech text-xs text-slate-300 line-clamp-2">
            {globalSentiment.explanation}
          </p>
          <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 mt-2">
            <span>Confiança: {globalSentiment.confidence}%</span>
            <span className="text-cyan-400">Macro Puro (Ex-Preço)</span>
          </div>
        </div>
      </div>

      {/* 2. BRAZIL SENTIMENT */}
      <div
        id="card-brazil-sentiment"
        className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-400/40 text-emerald-300">
                <Flag className="w-4 h-4" />
              </div>
              <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300">
                BRAZIL SENTIMENT
              </span>
            </div>
            <span className="font-tech text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {brazilSentiment.formattedTime}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <span
              className={`font-orbitron font-extrabold text-3xl sm:text-4xl tracking-tight ${
                brazilSentiment.score >= 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {brazilSentiment.score >= 0 ? `+${brazilSentiment.score}` : brazilSentiment.score}
            </span>
            <span className="font-tech text-xs text-slate-400">Escala: -100 / +100</span>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-tech font-bold border ${getScoreColor(
                brazilSentiment.score
              )}`}
            >
              {brazilSentiment.label}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/15">
          <p className="font-tech text-xs text-slate-300 line-clamp-2">
            {brazilSentiment.explanation}
          </p>
          <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 mt-2">
            <span>Drivers: CDS, DI & Câmbio</span>
            <span className="text-emerald-400">Método Macro Vinculado</span>
          </div>
        </div>
      </div>

      {/* 3. WIN BIAS */}
      <div
        id="card-win-bias"
        className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-950 border border-blue-400/40 text-blue-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300">
                WIN BIAS (MINI ÍNDICE)
              </span>
            </div>
            <span className="font-tech text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {winBias.formattedTime}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <span
              className={`font-orbitron font-extrabold text-3xl sm:text-4xl tracking-tight ${
                winBias.score >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {winBias.score >= 0 ? `+${winBias.score}` : winBias.score}
            </span>
            <div className="text-right">
              <span className="font-tech text-[10px] text-slate-400 block">Retorno Intraday</span>
              <span
                className={`font-mono font-bold text-xs ${
                  winBias.winReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {winBias.winReturn >= 0 ? `+${winBias.winReturn.toFixed(2)}%` : `${winBias.winReturn.toFixed(2)}%`}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-tech font-bold border ${getScoreColor(
                winBias.score
              )}`}
            >
              {winBias.label}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/15">
          <p className="font-tech text-xs text-slate-300 line-clamp-2">{winBias.explanation}</p>
          <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 mt-2">
            <span>Confiança: {winBias.confidence}%</span>
            <span className="text-blue-300">Cruzamento Macro × Preço</span>
          </div>
        </div>
      </div>

      {/* 4. WDO BIAS */}
      <div
        id="card-wdo-bias"
        className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/25 backdrop-blur-md flex flex-col justify-between hover:border-cyan-400/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-950 border border-amber-400/40 text-amber-300">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="font-orbitron font-bold text-xs tracking-wider text-slate-300">
                WDO BIAS (MINI DÓLAR)
              </span>
            </div>
            <span className="font-tech text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {wdoBias.formattedTime}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-1">
            <span
              className={`font-orbitron font-extrabold text-3xl sm:text-4xl tracking-tight ${
                wdoBias.score >= 0 ? 'text-amber-300' : 'text-cyan-300'
              }`}
            >
              {wdoBias.score >= 0 ? `+${wdoBias.score}` : wdoBias.score}
            </span>
            <div className="text-right">
              <span className="font-tech text-[10px] text-slate-400 block">Retorno Intraday</span>
              <span
                className={`font-mono font-bold text-xs ${
                  wdoBias.wdoReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {wdoBias.wdoReturn >= 0 ? `+${wdoBias.wdoReturn.toFixed(2)}%` : `${wdoBias.wdoReturn.toFixed(2)}%`}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-tech font-bold border ${getWdoScoreColor(
                wdoBias.score
              )}`}
            >
              {wdoBias.label}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-cyan-500/15">
          <p className="font-tech text-xs text-slate-300 line-clamp-2">{wdoBias.explanation}</p>
          <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 mt-2">
            <span>Confiança: {wdoBias.confidence}%</span>
            <span className="text-amber-300 font-bold">Viés Direcional USD</span>
          </div>
        </div>
      </div>
    </section>
  );
};
