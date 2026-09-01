import React, { useState } from 'react';
import { SentimentAnalysis, ThermometerAlert } from '../types';
import {
  Globe,
  Flag,
  Compass,
  Activity,
  ArrowRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Volume2,
  BellRing,
  History,
  ShieldAlert,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface SentimentGaugePanelProps {
  sentiment: SentimentAnalysis;
  onAskJarvis: (prompt: string) => void;
  onUpdateSentiment?: (updated: Partial<SentimentAnalysis>) => void;
  alerts?: ThermometerAlert[];
}

export const SentimentGaugePanel: React.FC<SentimentGaugePanelProps> = ({
  sentiment,
  onAskJarvis,
  onUpdateSentiment,
  alerts = [],
}) => {
  const [customGlobalScore, setCustomGlobalScore] = useState<number>(sentiment.globalScore);
  const [customBrazilScore, setCustomBrazilScore] = useState<number>(sentiment.brazilScore);
  const [showCustomTuner, setShowCustomTuner] = useState<boolean>(false);

  // Convert -100 to +100 score into a 0% to 100% position for gauge
  const getPercentage = (score: number) => {
    return Math.min(100, Math.max(0, ((score + 100) / 200) * 100));
  };

  const getScoreColor = (score: number) => {
    if (score > 25) return 'text-emerald-400';
    if (score < -25) return 'text-rose-400';
    return 'text-amber-400';
  };

  const getScoreBg = (score: number) => {
    if (score > 25) return 'bg-emerald-500';
    if (score < -25) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  const getGlobalLabelFromScore = (score: number) => {
    if (score >= 60) return 'EXTREMO OTIMISMO' as const;
    if (score >= 15) return 'OTIMISMO MODERADO' as const;
    if (score <= -60) return 'RISK-OFF TOTAL' as const;
    if (score <= -15) return 'PESSIMISMO MODERADO' as const;
    return 'NEUTRO' as const;
  };

  const getBrazilLabelFromScore = (score: number) => {
    if (score >= 45) return 'FORTE OTIMISMO' as const;
    if (score >= 10) return 'OTIMISMO LOCAL' as const;
    if (score <= -50) return 'PESSIMISMO AGUDO' as const;
    if (score <= -10) return 'CAUTELA FISCAL' as const;
    return 'NEUTRO' as const;
  };

  const handleApplyPreset = (
    globalScore: number,
    brazilScore: number,
    presetName: string,
    drivers?: { global?: string[]; brazil?: string[] }
  ) => {
    soundFX.playAlert();
    setCustomGlobalScore(globalScore);
    setCustomBrazilScore(brazilScore);

    if (onUpdateSentiment) {
      onUpdateSentiment({
        globalScore,
        globalLabel: getGlobalLabelFromScore(globalScore),
        brazilScore,
        brazilLabel: getBrazilLabelFromScore(brazilScore),
        globalDrivers: drivers?.global || sentiment.globalDrivers,
        brazilDrivers: drivers?.brazil || sentiment.brazilDrivers,
      });
    }
  };

  const handleApplyCustomTuning = () => {
    soundFX.playAlert();
    if (onUpdateSentiment) {
      onUpdateSentiment({
        globalScore: customGlobalScore,
        globalLabel: getGlobalLabelFromScore(customGlobalScore),
        brazilScore: customBrazilScore,
        brazilLabel: getBrazilLabelFromScore(customBrazilScore),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Live Monitoring Status */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/25 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-orbitron font-bold text-sm text-cyan-100 tracking-wider">
                MATRIZ DE SENTIMENTO MACROECONÔMICO // GLOBAL & BRASIL
              </h2>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-tech text-emerald-300 animate-pulse">
                <BellRing className="w-3 h-3 text-emerald-400" />
                J.A.R.V.I.S. AVISA TODA MUDANÇA
              </span>
            </div>
            <p className="font-tech text-xs text-slate-400">
              Termômetro quântico de apetite a risco (Risk-On / Risk-Off) com alerta sonoro e vocal automático a cada oscilação
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCustomTuner((prev) => !prev)}
            className={`px-3 py-2 rounded-xl border text-xs font-tech flex items-center gap-1.5 transition-all ${
              showCustomTuner
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100'
                : 'bg-slate-900 border-cyan-500/30 text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {showCustomTuner ? 'Ocultar Simulador' : 'Simular Oscilações'}
          </button>

          <button
            onClick={() => {
              soundFX.playBlip(1000);
              onAskJarvis('J.A.R.V.I.S., faça um comparativo detalhado entre o sentimento global e o sentimento brasileiro para os ativos hoje.');
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-200 font-tech text-xs flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Sintetizar Sentimento
          </button>
        </div>
      </div>

      {/* Interactive Simulation / Stress Tester Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-orbitron font-bold text-xs text-cyan-100 uppercase tracking-wider">
              Disparadores de Variação de Termômetro (Teste de Aviso Vocal & Chat)
            </span>
          </div>
          <span className="text-[10px] font-tech text-slate-400 hidden sm:inline">
            Clique para acionar mudança e ouvir o aviso imediato do J.A.R.V.I.S.
          </span>
        </div>

        {/* Quick Simulation Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={() =>
              handleApplyPreset(-65, -40, 'Choque Risk-Off Global', {
                global: [
                  'Escalada de aversão ao risco global após dados fracos de emprego e estresse geopolítico',
                  'S&P 500 em queda acentuada (-1.8%) com fuga massiva para Treasuries e Dólar DXY',
                  'Petróleo e commodities recuando sob temores de desaceleração mundial',
                ],
                brazil: [
                  'Dólar dispara com aversão a risco e saída de fluxo estrangeiro',
                  'Ibovespa pressionado por desvalorização generalizada em emergentes',
                ],
              })
            }
            className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="text-[11px] font-orbitron font-bold text-rose-300 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Choque Risk-Off
            </div>
            <div className="text-[10px] font-tech text-rose-400/80 mt-0.5">Global: -65 | Brasil: -40</div>
          </button>

          <button
            onClick={() =>
              handleApplyPreset(75, 30, 'Apetite a Risco Risk-On', {
                global: [
                  'Discurso ultra-dovish do Federal Reserve sinalizando aceleração de corte de juros',
                  'Wall Street bate nova máxima histórica com liderança de IA e tecnologia',
                  'VIX despenca para 12.5 pontos indicando apetite máximo por risco',
                ],
                brazil: [
                  'Fluxo estrangeiro entra forte na B3 buscando barganhas em bolsa',
                  'Dólar perde força globalmente com carry trade em emergentes',
                ],
              })
            }
            className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="text-[11px] font-orbitron font-bold text-emerald-300 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Apetite Risk-On
            </div>
            <div className="text-[10px] font-tech text-emerald-400/80 mt-0.5">Global: +75 | Brasil: +30</div>
          </button>

          <button
            onClick={() =>
              handleApplyPreset(10, -65, 'Estresse Fiscal Brasil', {
                brazil: [
                  'Rompimento de teto de gastos ou frustração com receitas fiscais',
                  'Curva de juros DI abre 35 bps em todos os vértices',
                  'Dólar testa R$ 5,60 com demanda institucional por hedge cambial',
                ],
              })
            }
            className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="text-[11px] font-orbitron font-bold text-amber-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Estresse Fiscal BR
            </div>
            <div className="text-[10px] font-tech text-amber-400/80 mt-0.5">Global: +10 | Brasil: -65</div>
          </button>

          <button
            onClick={() =>
              handleApplyPreset(40, 55, 'Alívio Fiscal Brasil', {
                brazil: [
                  'Aprovação de corte estrutural de gastos públicos no Congresso',
                  'Taxas de juros DI fecham com queda expressiva de prêmio de risco',
                  'Ibovespa salta com forte fluxo comprador em varejo e bancos',
                ],
              })
            }
            className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] group"
          >
            <div className="text-[11px] font-orbitron font-bold text-cyan-300 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-cyan-400" /> Alívio Fiscal BR
            </div>
            <div className="text-[10px] font-tech text-cyan-400/80 mt-0.5">Global: +40 | Brasil: +55</div>
          </button>

          <button
            onClick={() =>
              handleApplyPreset(38, -15, 'Restaurar Normalidade', {
                global: [
                  'Expectativa de cortes graduais de juros pelo Federal Reserve (Fed) [Reuters]',
                  'S&P 500 sustentado por balanços de Big Techs e resiliência nos EUA [Finviz]',
                  'Petróleo Brent contido em torno de US$ 77/barril aliviando inflação [Reuters]',
                  'Estabilidade nos índices de liquidez dos EUA [MacroWarning]',
                ],
                brazil: [
                  'Preocupações com trajetória da dívida e metas fiscais [ADVFN/Valor]',
                  'Copom mantendo postura hawkish com Selic elevada segurando câmbio [Investing.com]',
                  'Fluxo de estrangeiros oscilante em futuros de Real no CME Group',
                  'Curva DI com leve estresse pontual [ADVFN Monitor]',
                ],
              })
            }
            className="p-2 rounded-xl bg-slate-950/70 border border-slate-700 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] group col-span-2 sm:col-span-1"
          >
            <div className="text-[11px] font-orbitron font-bold text-slate-300 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" /> Restaurar Padrão
            </div>
            <div className="text-[10px] font-tech text-slate-400 mt-0.5">Global: +38 | Brasil: -15</div>
          </button>
        </div>

        {/* Custom Tuning Sliders Drawer */}
        {showCustomTuner && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950/90 border border-cyan-500/20 flex flex-col gap-4 animate-fadeIn">
            <div className="font-orbitron text-xs text-cyan-200 font-semibold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> AJUSTE MANUAL PRECISO DE PONTUAÇÃO DO TERMÔMETRO:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Global Slider */}
              <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-lg border border-cyan-500/15">
                <div className="flex justify-between font-tech text-xs">
                  <span className="text-cyan-300">Termômetro Global (Risk-On / Risk-Off):</span>
                  <span className={`font-bold ${getScoreColor(customGlobalScore)}`}>
                    {customGlobalScore > 0 ? `+${customGlobalScore}` : customGlobalScore} pts ({getGlobalLabelFromScore(customGlobalScore)})
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={customGlobalScore}
                  onChange={(e) => setCustomGlobalScore(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-tech text-slate-500">
                  <span>-100 (Risk-Off Extremo)</span>
                  <span>0 (Neutro)</span>
                  <span>+100 (Risk-On Máximo)</span>
                </div>
              </div>

              {/* Brazil Slider */}
              <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-lg border border-cyan-500/15">
                <div className="flex justify-between font-tech text-xs">
                  <span className="text-amber-300">Termômetro Brasil (Risco Fiscal):</span>
                  <span className={`font-bold ${getScoreColor(customBrazilScore)}`}>
                    {customBrazilScore > 0 ? `+${customBrazilScore}` : customBrazilScore} pts ({getBrazilLabelFromScore(customBrazilScore)})
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={customBrazilScore}
                  onChange={(e) => setCustomBrazilScore(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] font-tech text-slate-500">
                  <span>-100 (Pessimismo Fiscal)</span>
                  <span>0 (Neutro)</span>
                  <span>+100 (Forte Otimismo)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleApplyCustomTuning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-orbitron text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> APLICAR VARIAÇÃO & ACIONAR J.A.R.V.I.S.
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Sentiment Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron font-bold text-xs text-cyan-100 tracking-wider">
                SENTIMENTO GLOBAL (RISK-ON / RISK-OFF)
              </span>
            </div>
            <span
              className={`font-tech text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                sentiment.globalScore > 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {sentiment.globalLabel}
            </span>
          </div>

          {/* Meter Bar */}
          <div className="my-3">
            <div className="flex justify-between font-tech text-[10px] text-slate-400 mb-1.5">
              <span className="text-rose-400 font-bold">PESSIMISMO / RISK-OFF (-100)</span>
              <span className="text-amber-400">NEUTRO (0)</span>
              <span className="text-emerald-400 font-bold">OTIMISMO / RISK-ON (+100)</span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 relative">
              {/* Gradient track */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600/40 via-amber-500/40 to-emerald-500/40 opacity-70" />
              {/* Indicator Pin */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-cyan-100 rounded-full shadow-[0_0_12px_#22d3ee] border border-cyan-400 transform -translate-x-1/2 transition-all duration-700"
                style={{ left: `${getPercentage(sentiment.globalScore)}%` }}
              />
            </div>
            <div className="text-center mt-2 font-orbitron font-bold text-sm">
              Pontuação Global:{' '}
              <span className={getScoreColor(sentiment.globalScore)}>
                {sentiment.globalScore > 0 ? `+${sentiment.globalScore}` : sentiment.globalScore} pts
              </span>
            </div>
          </div>

          {/* Drivers */}
          <div className="mt-4 pt-3 border-t border-cyan-500/15">
            <span className="font-tech text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
              FATORES MACRO GLOBAIS DETERMINANTES:
            </span>
            <ul className="space-y-2 font-body text-xs text-slate-300">
              {sentiment.globalDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-cyan-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Brazil Sentiment Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Flag className="w-5 h-5 text-amber-400" />
              <span className="font-orbitron font-bold text-xs text-cyan-100 tracking-wider">
                SENTIMENTO BRASIL (RISCO FISCAL & LOCAL)
              </span>
            </div>
            <span
              className={`font-tech text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                sentiment.brazilScore > 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {sentiment.brazilLabel}
            </span>
          </div>

          {/* Meter Bar */}
          <div className="my-3">
            <div className="flex justify-between font-tech text-[10px] text-slate-400 mb-1.5">
              <span className="text-rose-400 font-bold">PESSIMISMO / ESTRESSE FISCAL (-100)</span>
              <span className="text-amber-400">NEUTRO (0)</span>
              <span className="text-emerald-400 font-bold">OTIMISMO / FLUXO (+100)</span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 relative">
              {/* Gradient track */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600/40 via-amber-500/40 to-emerald-500/40 opacity-70" />
              {/* Indicator Pin */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-cyan-100 rounded-full shadow-[0_0_12px_#22d3ee] border border-cyan-400 transform -translate-x-1/2 transition-all duration-700"
                style={{ left: `${getPercentage(sentiment.brazilScore)}%` }}
              />
            </div>
            <div className="text-center mt-2 font-orbitron font-bold text-sm">
              Pontuação Brasil:{' '}
              <span className={getScoreColor(sentiment.brazilScore)}>
                {sentiment.brazilScore > 0 ? `+${sentiment.brazilScore}` : sentiment.brazilScore} pts
              </span>
            </div>
          </div>

          {/* Drivers */}
          <div className="mt-4 pt-3 border-t border-cyan-500/15">
            <span className="font-tech text-[11px] text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
              FATORES MACRO DOMÉSTICOS DETERMINANTES:
            </span>
            <ul className="space-y-2 font-body text-xs text-slate-300">
              {sentiment.brazilDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-cyan-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* History of Thermometer Alerts Announced by JARVIS */}
      {alerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron font-bold text-xs text-cyan-100 tracking-wider">
                HISTÓRICO DE MUDANÇAS NO TERMÔMETRO AVISADAS POR J.A.R.V.I.S.
              </h3>
            </div>
            <span className="text-[10px] font-tech text-slate-400">
              {alerts.length} registro(s) de oscilação nesta sessão
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {alerts.slice(-5).reverse().map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {alert.timestamp}
                    </span>
                    <span className="font-orbitron text-xs font-bold text-cyan-100">
                      Global: {alert.globalLabel} ({alert.newGlobalScore > 0 ? `+${alert.newGlobalScore}` : alert.newGlobalScore} pts) | Brasil: {alert.brazilLabel} ({alert.newBrazilScore > 0 ? `+${alert.newBrazilScore}` : alert.newBrazilScore} pts)
                    </span>
                  </div>
                  <p className="text-xs font-body text-slate-300 mt-1">{alert.summary}</p>
                </div>

                <button
                  onClick={() => {
                    soundFX.playBlip(1000);
                    onAskJarvis(`J.A.R.V.I.S., detalhe as consequências da última mudança no termômetro (${alert.globalLabel} / ${alert.brazilLabel}) para o Dólar e Índice.`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] font-tech text-cyan-200 shrink-0 self-start sm:self-center"
                >
                  Consultar Impacto
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlation Quantum Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-orbitron font-bold text-xs text-cyan-100 tracking-wider">
            MATRIZ DE CORRELAÇÃO DE ATIVOS (STARK QUANT ENGINE)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-tech text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <div className="text-slate-400 text-[10px]">DÓLAR x DXY (MOEDA GLOBAL)</div>
            <div className="font-bold text-base text-emerald-400 mt-1">
              +{sentiment.correlationDXY_DOL * 100}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Alta correlação positiva. DXY forte pressiona Dólar para cima no Brasil.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <div className="text-slate-400 text-[10px]">IBOVESPA x S&P 500 (WALL STREET)</div>
            <div className="font-bold text-base text-cyan-300 mt-1">
              +{sentiment.correlationSPX_IBOV * 100}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Correlação moderada. Apetite a risco nos EUA atrai fluxo para ações brasileiras.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <div className="text-slate-400 text-[10px]">DÓLAR x IBOVESPA (INVERSÃO)</div>
            <div className="font-bold text-base text-rose-400 mt-1">
              -72.0%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Correlação inversa clássica. Dias de alta do Dólar costumam ter realização no Índice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
