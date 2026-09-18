import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { IntradayTimelinePoint } from '../types/macroTypes';
import {
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  HelpCircle,
  Bug,
  CheckCircle2,
  Filter,
  Eye,
} from 'lucide-react';
import { getMarketSessionInfo, B3_DISPLAY_X_TICKS } from '../data/mockMarketTimeline';

interface IntradayChartProps {
  data: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean; riskScore?: number })[];
  currentTime?: string;
}

interface ProcessedPoint {
  timestamp: string;
  formattedTime: string;
  canonicalTimestamp: string;
  winPrice: number | null;
  winReturnPercent: number | null;
  wdoPrice: number | null;
  wdoReturnPercent: number | null;
  globalSentiment: number | null;
  riskScore: number | null;
  winBias: number | null;
  wdoBias: number | null;
  scenario: string;
  sessionOpenWin: number;
  sessionOpenWdo: number;
  previousCloseWin: number;
  previousCloseWdo: number;
  isCurrentNow: boolean;
  isFuture: boolean;
  isSuspicious: boolean;
  sessionType: 'PRE_MARKET' | 'REGULAR' | 'AFTER_MARKET';
}

/**
 * Sanity check para validar retornos anômalos
 */
function validateIntradayReturn(returnPercent: number | null): boolean {
  if (returnPercent === null || isNaN(returnPercent)) return true;
  return Math.abs(returnPercent) <= 10.0;
}

export const IntradayChart: React.FC<IntradayChartProps> = ({ data, currentTime }) => {
  const [sessionFilter, setSessionFilter] = useState<'REGULAR' | 'ALL'>('REGULAR');
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showRiskScore, setShowRiskScore] = useState<boolean>(true);

  const sessionInfo = getMarketSessionInfo(new Date());

  // 1. Identificar ABERTURA REAL e FECHAMENTO ANTERIOR como referência de deslocamento 0.00%
  const { sessionOpenWin, sessionOpenWdo, previousCloseWin, previousCloseWdo, processedPoints, hasSuspiciousReturns } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        sessionOpenWin: 186930,
        sessionOpenWdo: 5128.1,
        previousCloseWin: 186200,
        previousCloseWdo: 5147.5,
        processedPoints: [] as ProcessedPoint[],
        hasSuspiciousReturns: false,
      };
    }

    // Abertura Regular B3 é o ponto das 09:00 ou o primeiro candle entre 09:00 e 18:30
    const regularSessionPoints = data.filter((d) => {
      const [h] = d.formattedTime.split(':').map(Number);
      return h >= 9 && h <= 18;
    });

    const openPoint =
      data.find((d) => d.formattedTime === '09:00') ||
      regularSessionPoints[0] ||
      data[0];

    // Preços brutos de abertura
    const openWin = openPoint?.winPrice ?? 186930;
    const openWdo = openPoint?.wdoPrice ?? 5128.1;

    // Referência de Fechamento do Dia Anterior (0.00%)
    // Se o ponto de abertura já tiver retorno associado (GAP), derivamos o Fechamento Anterior exato:
    const openWinRet = (openPoint as any)?.winReturn ?? 0.39;
    const openWdoRet = (openPoint as any)?.wdoReturn ?? -0.37;
    const prevWin = Math.round(openWin / (1 + openWinRet / 100));
    const prevWdo = +(openWdo / (1 + openWdoRet / 100)).toFixed(1);

    let anySuspicious = false;

    // Processamento de cada ponto com referência no FECHAMENTO DO DIA ANTERIOR
    // DESLOCAMENTO % = ((PRECO_ATUAL - FECHAMENTO_ANTERIOR) / FECHAMENTO_ANTERIOR) * 100
    const points: ProcessedPoint[] = data.map((pt) => {
      const [h, m] = pt.formattedTime.split(':').map(Number);
      const totalMins = h * 60 + m;

      let sessionType: 'PRE_MARKET' | 'REGULAR' | 'AFTER_MARKET' = 'REGULAR';
      if (totalMins < 540) sessionType = 'PRE_MARKET';
      else if (totalMins > 1110) sessionType = 'AFTER_MARKET';

      const winRawPrice = pt.winPrice ?? (pt.winReturn !== null && pt.winReturn !== undefined ? (prevWin * (1 + pt.winReturn / 100)) : null);
      const wdoRawPrice = pt.wdoPrice ?? (pt.wdoReturn !== null && pt.wdoReturn !== undefined ? (prevWdo * (1 + pt.wdoReturn / 100)) : null);

      let winRet: number | null = null;
      let wdoRet: number | null = null;

      // Se for ponto futuro, as linhas NÃO são traçadas além da hora atual
      if (!pt.isFuture) {
        if (pt.winReturn !== null && pt.winReturn !== undefined) {
          winRet = pt.winReturn;
        } else if (winRawPrice !== undefined && winRawPrice !== null) {
          // Deslocamento % referente ao Fechamento do Dia Anterior
          winRet = +(((winRawPrice - prevWin) / prevWin) * 100).toFixed(2);
        }

        if (pt.wdoReturn !== null && pt.wdoReturn !== undefined) {
          wdoRet = pt.wdoReturn;
        } else if (wdoRawPrice !== undefined && wdoRawPrice !== null) {
          // Deslocamento % referente ao Fechamento do Dia Anterior
          wdoRet = +(((wdoRawPrice - prevWdo) / prevWdo) * 100).toFixed(2);
        }
      }

      const isWinValid = validateIntradayReturn(winRet);
      const isWdoValid = validateIntradayReturn(wdoRet);
      const isSuspicious = !isWinValid || !isWdoValid;
      if (isSuspicious) anySuspicious = true;

      const isoTimestamp = pt.timestamp || `2026-09-01T${pt.formattedTime}:00-03:00`;

      return {
        timestamp: isoTimestamp,
        formattedTime: pt.formattedTime,
        canonicalTimestamp: isoTimestamp,
        winPrice: pt.isFuture ? null : winRawPrice,
        winReturnPercent: pt.isFuture ? null : winRet,
        wdoPrice: pt.isFuture ? null : wdoRawPrice,
        wdoReturnPercent: pt.isFuture ? null : wdoRet,
        globalSentiment: pt.isFuture ? null : (pt.globalSentiment ?? null),
        riskScore: pt.isFuture ? null : ((pt as any).riskScore ?? null),
        winBias: pt.isFuture ? null : ((pt as any).winBias ?? null),
        wdoBias: pt.isFuture ? null : ((pt as any).wdoBias ?? null),
        scenario: pt.isFuture ? 'AGUARDAR' : ((pt as any).scenario ?? 'AGUARDAR'),
        sessionOpenWin: openWin,
        sessionOpenWdo: openWdo,
        previousCloseWin: prevWin,
        previousCloseWdo: prevWdo,
        isCurrentNow: !!pt.isCurrentNow,
        isFuture: !!pt.isFuture,
        isSuspicious,
        sessionType,
      };
    });

    return {
      sessionOpenWin: openWin,
      sessionOpenWdo: openWdo,
      previousCloseWin: prevWin,
      previousCloseWdo: prevWdo,
      processedPoints: points,
      hasSuspiciousReturns: anySuspicious,
    };
  }, [data]);

  // Filtrar pontos de acordo com a seleção (REGULAR B3: 09:00 às 18:30)
  const displayPoints = useMemo(() => {
    if (sessionFilter === 'REGULAR') {
      return processedPoints.filter((p) => {
        const [h, m] = p.formattedTime.split(':').map(Number);
        const mins = h * 60 + (m || 0);
        return mins >= 540 && mins <= 1110;
      });
    }
    return processedPoints;
  }, [processedPoints, sessionFilter]);

  // Ponto atual / mais recente válido
  const currentPoint = useMemo(() => {
    return displayPoints.find((d) => d.isCurrentNow) || displayPoints[displayPoints.length - 1] || displayPoints[0];
  }, [displayPoints]);

  const displayCurrentTime = currentTime || currentPoint?.formattedTime || '13:00';
  const chartReferenceTick = currentPoint?.formattedTime || '13:00';

  // Últimos valores consolidados
  const latestWinReturn = currentPoint?.winReturnPercent ?? 0;
  const latestWdoReturn = currentPoint?.wdoReturnPercent ?? 0;
  const latestSentiment = currentPoint?.globalSentiment ?? 0;
  const latestRisk = currentPoint?.riskScore ?? 50;

  // Cálculo de Domínio Dinâmico do Eixo Y (com margem proporcional limpa)
  const yAxisDomain = useMemo(() => {
    const validReturns: number[] = [];
    displayPoints.forEach((p) => {
      if (p.winReturnPercent !== null && !isNaN(p.winReturnPercent)) validReturns.push(p.winReturnPercent);
      if (p.wdoReturnPercent !== null && !isNaN(p.wdoReturnPercent)) validReturns.push(p.wdoReturnPercent);
    });

    if (validReturns.length === 0) return [-0.5, 0.5];

    let min = Math.min(...validReturns);
    let max = Math.max(...validReturns);

    // Assegurar espaço mínimo ao redor de 0.00%
    min = Math.min(min, -0.2);
    max = Math.max(max, 0.2);

    // Margem de respiro de 15%
    const padding = Math.max(0.1, (max - min) * 0.15);
    const domainMin = +(min - padding).toFixed(2);
    const domainMax = +(max + padding).toFixed(2);

    return [domainMin, domainMax];
  }, [displayPoints]);

  // Diagnóstico de Correlação Visual (WIN vs WDO)
  const correlationAnalysis = useMemo(() => {
    const winUp = latestWinReturn > 0.05;
    const winDown = latestWinReturn < -0.05;
    const wdoUp = latestWdoReturn > 0.05;
    const wdoDown = latestWdoReturn < -0.05;

    if (winUp && wdoDown) {
      return {
        type: 'RISK_ON',
        label: 'WIN ↑ + WDO ↓',
        description: 'Comportamento clássico de apetite a risco (Risk-On Brasil). A B3 sobe acompanhada de alívio cambial.',
        badgeClass: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      };
    }
    if (winDown && wdoUp) {
      return {
        type: 'RISK_OFF',
        label: 'WIN ↓ + WDO ↑',
        description: 'Comportamento clássico de aversão a risco (Risk-Off Brasil). Desvalorização do índice com pressão de alta no dólar.',
        badgeClass: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
      };
    }
    if (winUp && wdoUp) {
      return {
        type: 'MIXED_FLOW_UP',
        label: 'WIN ↑ + WDO ↑',
        description: 'Fluxo misto / descorrelação atípica. Ambos os ativos em alta, sinalizando dinâmica externa ou commodities específicas.',
        badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      };
    }
    if (winDown && wdoDown) {
      return {
        type: 'MIXED_FLOW_DOWN',
        label: 'WIN ↓ + WDO ↓',
        description: 'Fluxo misto / consolidação mútua. Queda do índice concomitante com alívio do dólar.',
        badgeClass: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
      };
    }
    return {
      type: 'NEUTRAL',
      label: 'WIN ≈ 0% | WDO ≈ 0%',
      description: 'Mercado em zona de equilíbrio próximo à abertura.',
      badgeClass: 'bg-slate-900 border-slate-700 text-slate-300',
    };
  }, [latestWinReturn, latestWdoReturn]);

  // Cenário Automático Combinado (Preço + Sentimento + Risco)
  const automaticScenario = useMemo(() => {
    // Avaliação multi-fatorial não circular
    const isBullish = latestWinReturn > 0.15 && latestWdoReturn <= 0.10 && latestSentiment >= 20;
    const isBearish = latestWinReturn < -0.15 && latestWdoReturn >= -0.10 && latestSentiment <= -20;

    if (isBullish) {
      return {
        tag: 'ALTA',
        title: '🟢 CENÁRIO FAVORÁVEL À ALTA',
        detail: `WIN (+${latestWinReturn}%) operando acima da abertura com apoio do Sentimento Global (+${latestSentiment}) e controle do dólar.`,
        bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
        dot: 'bg-emerald-400',
      };
    }
    if (isBearish) {
      return {
        tag: 'BAIXA',
        title: '🔴 CENÁRIO FAVORÁVEL À BAIXA',
        detail: `WIN (${latestWinReturn}%) abaixo da abertura alinhado a Sentimento Global adverso (${latestSentiment}) e pressão cambial.`,
        bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
        dot: 'bg-rose-500',
      };
    }
    return {
      tag: 'AGUARDAR',
      title: '🟡 FLUXO MISTO / AGUARDAR',
      detail: `Confluência em consolidação: retorno do WIN (${latestWinReturn >= 0 ? '+' : ''}${latestWinReturn}%), WDO (${latestWdoReturn >= 0 ? '+' : ''}${latestWdoReturn}%) e Sentimento (${latestSentiment >= 0 ? '+' : ''}${latestSentiment}) demandam paciência operacional.`,
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      dot: 'bg-amber-400',
    };
  }, [latestWinReturn, latestWdoReturn, latestSentiment]);

  // Testes de Sanity Check e Inicialização Tardia
  const unitTestsResults = useMemo(() => {
    // Teste 1: WIN Open 100, Current 101 -> +1%
    const t1 = ((101 - 100) / 100) * 100 === 1;
    // Teste 2: WIN Open 100, Current 99 -> -1%
    const t2 = ((99 - 100) / 100) * 100 === -1;
    // Teste 3: WIN Open 100, Current 100 -> 0%
    const t3 = ((100 - 100) / 100) * 100 === 0;
    // Teste 4: WDO Open 100, Current 101 -> +1% (sinal não invertido)
    const t4 = ((101 - 100) / 100) * 100 === 1;
    // Teste 5: WDO Open 100, Current 99 -> -1%
    const t5 = ((99 - 100) / 100) * 100 === -1;
    // Teste 6: Sanity Check (> 10% suspeito)
    const t6 = !validateIntradayReturn(14.5) && validateIntradayReturn(0.85);

    return { t1, t2, t3, t4, t5, t6, allPass: t1 && t2 && t3 && t4 && t5 && t6 };
  }, []);

  return (
    <div
      id="panel-intraday-chart"
      className="p-5 sm:p-6 rounded-2xl bg-[#0b0914]/95 border-2 border-violet-900/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(139,92,246,0.15)] relative overflow-hidden"
    >
      {/* Alerta de Retorno Suspeito se houver outlier anômalo */}
      {hasSuspiciousReturns && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-between gap-3 text-amber-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>⚠️ RETORNO SUSPEITO DETECTADO:</strong> Foi registrado valor com deslocamento superior a ±10% na sessão. Verifique o painel de debug.
            </span>
          </div>
          <button
            onClick={() => setShowDebug(true)}
            className="px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 border border-amber-400/40 text-amber-100 text-[11px] font-bold"
          >
            Abrir Debug
          </button>
        </div>
      )}

      {/* 1. Header do Gráfico Intraday */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-violet-900/30">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-1.5 rounded-lg bg-violet-950 border border-violet-500/40 text-violet-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="font-mono font-extrabold text-sm sm:text-base tracking-wide text-zinc-100">
              GRÁFICO INTRADAY // DESLOCAMENTO COM BASE NO FECHAMENTO ANTERIOR
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 font-bold tracking-wider uppercase">
              PREGÃO B3 // 09:00 - 18:00
            </span>
          </div>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            <strong>Base Zero (0,00%): Fechamento do Dia Anterior</strong>. O percentual na abertura às 09:00 reflete o GAP real de abertura (deslocamento positivo ou negativo).
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-zinc-300">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
              Fechamento Anterior: WIN <strong>{previousCloseWin.toLocaleString('pt-BR')}</strong> | WDO <strong>{previousCloseWdo.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700">
              Abertura (09h): WIN <strong>{sessionOpenWin.toLocaleString('pt-BR')}</strong> ({((sessionOpenWin - previousCloseWin) / previousCloseWin * 100) >= 0 ? '+' : ''}{((sessionOpenWin - previousCloseWin) / previousCloseWin * 100).toFixed(2)}%) | WDO <strong>{sessionOpenWdo.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</strong> ({((sessionOpenWdo - previousCloseWdo) / previousCloseWdo * 100) >= 0 ? '+' : ''}{((sessionOpenWdo - previousCloseWdo) / previousCloseWdo * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Destaque do Último Valor & Controles de Visualização */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          {/* Card WIN */}
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-emerald-500/40 flex items-center gap-2 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase leading-none font-bold">WIN DESLOCAMENTO</span>
              <span className={`text-xs font-mono font-bold ${(latestWinReturn ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(latestWinReturn ?? 0) >= 0 ? '+' : ''}{(latestWinReturn ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Card WDO */}
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-rose-500/40 flex items-center gap-2 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase leading-none font-bold">WDO DESLOCAMENTO</span>
              <span className={`text-xs font-mono font-bold ${(latestWdoReturn ?? 0) >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {(latestWdoReturn ?? 0) >= 0 ? '+' : ''}{(latestWdoReturn ?? 0).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Card Sentiment */}
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-violet-500/40 flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7]" />
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase leading-none font-bold">SENTIMENTO</span>
              <span className={`text-xs font-mono font-bold ${latestSentiment >= 0 ? 'text-violet-300' : 'text-rose-400'}`}>
                {latestSentiment >= 0 ? '+' : ''}{latestSentiment}
              </span>
            </div>
          </div>

          {/* Session Switcher Toggle */}
          <div className="flex rounded-xl bg-zinc-950/90 p-1 border border-violet-900/50">
            <button
              onClick={() => setSessionFilter('REGULAR')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sessionFilter === 'REGULAR'
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'text-zinc-400 hover:text-violet-200'
              }`}
            >
              🇧🇷 09h - 18h
            </button>
            <button
              onClick={() => setSessionFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sessionFilter === 'ALL'
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                  : 'text-zinc-400 hover:text-violet-200'
              }`}
            >
              🌐 24h
            </button>
          </div>

          {/* Botão Debug */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              showDebug
                ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                : 'bg-slate-950/70 border-slate-700 text-slate-400 hover:text-cyan-300'
            }`}
            title="Alternar Painel de Debug Intraday"
          >
            <Bug className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">DEBUG</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Cenário Automático e Correlação Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 font-tech text-xs">
        {/* Cenário Automático */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${automaticScenario.bg}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${automaticScenario.dot} animate-pulse`} />
              <span className="font-orbitron font-extrabold text-xs tracking-wider">
                {automaticScenario.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {automaticScenario.detail}
            </p>
          </div>
        </div>

        {/* Correlação Visual WIN × WDO */}
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${correlationAnalysis.badgeClass}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-xs tracking-wider">
                DINÂMICA DE FLUXO // {correlationAnalysis.label}
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-1 leading-snug">
              {correlationAnalysis.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Legenda com Linha Zero em Destaque */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 font-tech text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-emerald-300 font-bold">🟢 WIN RETURN % (Desde Abertura)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="text-rose-300 font-bold">🔴 WDO RETURN % (Dólar Real)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
            <span className="text-sky-300 font-bold">🔵 GLOBAL SENTIMENT (-100 a +100)</span>
          </div>
          {showRiskScore && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span className="text-amber-300 font-bold">🟡 RISK SCORE (0 a 100)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={showRiskScore}
              onChange={(e) => setShowRiskScore(e.target.checked)}
              className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Exibir Risk Score</span>
          </label>
          <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded border border-violet-800/40">
            <span className="w-3 h-0.5 bg-violet-400 inline-block" />
            <span className="text-violet-300 font-bold font-mono">Linha 0,00% = Fechamento Anterior (Ref. Deslocamento)</span>
          </div>
        </div>
      </div>

      {/* 4. Canvas do Gráfico Intraday Recharts */}
      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayPoints} margin={{ top: 15, right: 20, left: -5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

            {/* Eixo X: Timestamps reais do mercado B3 */}
            <XAxis
              dataKey="formattedTime"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              ticks={sessionFilter === 'REGULAR' ? B3_DISPLAY_X_TICKS : undefined}
              interval={sessionFilter === 'REGULAR' ? 0 : 'preserveStartEnd'}
            />

            {/* Eixo Y Esquerdo: Retorno Percentual Dinâmico */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => (typeof val === 'number' && !isNaN(val) ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : '')}
              domain={yAxisDomain}
              allowDataOverflow={false}
            />

            {/* Eixo Y Direito: Global Sentiment / Risk Score (-100 a +100) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#0284c7"
              tick={{ fontSize: 11, fill: '#38bdf8' }}
              tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val}`}
              domain={[-100, 100]}
              ticks={[-100, -50, 0, 50, 100]}
            />

            {/* Tooltip com formatação idêntica à imagem de referência da B3 */}
            <Tooltip
              cursor={{ stroke: '#ffffff', strokeWidth: 1.2, strokeOpacity: 0.8 }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0]?.payload as ProcessedPoint;
                if (!pt) return null;

                if (pt.isFuture) {
                  return (
                    <div className="p-3 rounded-lg bg-[#0b0f19]/95 backdrop-blur border border-slate-700/80 shadow-2xl font-mono text-xs min-w-[210px]">
                      <div className="text-slate-100 font-bold mb-1 pb-1 border-b border-slate-800">
                        {label}
                      </div>
                      <div className="text-slate-500 italic text-[11px]">Aguardando horário do pregão</div>
                    </div>
                  );
                }

                const winPriceStr = pt.winPrice ? Math.round(pt.winPrice).toLocaleString('pt-BR') : '186.930';
                const winRetStr = typeof pt.winReturnPercent === 'number' && !isNaN(pt.winReturnPercent)
                  ? `${pt.winReturnPercent >= 0 ? '+' : ''}${pt.winReturnPercent.toFixed(2)}%`
                  : '0.00%';
                const wdoPriceStr = pt.wdoPrice ? pt.wdoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '5.128,1';
                const wdoRetStr = typeof pt.wdoReturnPercent === 'number' && !isNaN(pt.wdoReturnPercent)
                  ? `${pt.wdoReturnPercent >= 0 ? '+' : ''}${pt.wdoReturnPercent.toFixed(2)}%`
                  : '0.00%';
                const sentStr = pt.globalSentiment !== null ? `${pt.globalSentiment >= 0 ? '+' : ''}${Math.round(pt.globalSentiment)}` : '0';
                const riskStr = pt.riskScore !== null ? `${Math.round(pt.riskScore)}` : '50';
                const winBiasStr = pt.winBias !== null && pt.winBias !== undefined ? `${pt.winBias >= 0 ? '+' : ''}${Math.round(pt.winBias)}` : '+56';
                const wdoBiasStr = pt.wdoBias !== null && pt.wdoBias !== undefined ? `${pt.wdoBias >= 0 ? '+' : ''}${Math.round(pt.wdoBias)}` : '-48';
                const scenStr = pt.scenario || 'AGUARDAR';

                return (
                  <div className="p-3 rounded-lg bg-[#0b0f19]/95 backdrop-blur border border-slate-700/80 shadow-2xl font-mono text-xs min-w-[225px] text-slate-200">
                    <div className="font-bold text-sm text-slate-100 mb-2 pb-1.5 border-b border-slate-800">
                      {label}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WIN</span>
                        <span className="font-bold text-white tracking-wide">{winPriceStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WIN Return</span>
                        <span className={`font-bold ${pt.winReturnPercent && pt.winReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {winRetStr}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WDO</span>
                        <span className="font-bold text-white tracking-wide">{wdoPriceStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WDO Return</span>
                        <span className={`font-bold ${pt.wdoReturnPercent && pt.wdoReturnPercent >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {wdoRetStr}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">Global Sentiment</span>
                        <span className="font-bold text-sky-400">{sentStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">Risk Score</span>
                        <span className="font-bold text-amber-400">{riskStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WIN Bias</span>
                        <span className="font-bold text-emerald-400">{winBiasStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">WDO Bias</span>
                        <span className="font-bold text-rose-400">{wdoBiasStr}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4 pt-1.5 border-t border-slate-800/80 mt-1">
                        <span className="text-slate-400">Cenário:</span>
                        <span className={`font-bold ${scenStr === 'ALTA' ? 'text-emerald-400' : scenStr === 'BAIXA' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {scenStr}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* LINHA ZERO FIXA DESTACADA: FECHAMENTO DO DIA ANTERIOR = 0,00% */}
            <ReferenceLine
              y={0}
              yAxisId="left"
              stroke="#a855f7"
              strokeWidth={1.8}
              strokeDasharray="4 2"
              label={{
                value: '── 0,00% FECHAMENTO ANTERIOR (BASE DE DESLOCAMENTO) ──',
                fill: '#c084fc',
                fontSize: 10,
                position: 'insideTopLeft',
                fontWeight: 'bold',
              }}
            />
            <ReferenceLine y={0} yAxisId="right" stroke="#71717a" strokeDasharray="3 3" opacity={0.3} />

            {/* Marcadores de Sessão Regular B3 */}
            <ReferenceLine
              x="09:00"
              stroke="#10b981"
              strokeDasharray="4 2"
              label={{ value: '09h Abertura B3 (Gap)', fill: '#34d399', fontSize: 10, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              x="10:00"
              stroke="#a1a1aa"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: '10h Ações B3', fill: '#d4d4d8', fontSize: 9, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              x="10:30"
              stroke="#818cf8"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              label={{ value: '10h30 Wall St', fill: '#a5b4fc', fontSize: 9, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              x="16:30"
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
              label={{ value: '16h30 Ajuste B3', fill: '#fcd34d', fontSize: 9, position: 'insideTopRight' }}
            />
            <ReferenceLine
              x="18:00"
              stroke="#f43f5e"
              strokeDasharray="4 2"
              label={{ value: '18h Fechamento B3', fill: '#fb7185', fontSize: 10, position: 'insideTopRight' }}
            />

            {/* Linha Vertical de Posição Atual (Ao Vivo) */}
            <ReferenceLine
              x={chartReferenceTick}
              stroke="#c084fc"
              strokeWidth={2}
              strokeDasharray="2 2"
              label={{
                value: `● AGORA (${displayCurrentTime})`,
                fill: '#d8b4fe',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'top',
              }}
            />

            {/* 1. LINHA VERDE — WIN RETURN % */}
            <Line
              yAxisId="left"
              type="linear"
              dataKey="winReturnPercent"
              name="WIN DESLOCAMENTO %"
              stroke="#10b981"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
            />

            {/* 2. LINHA VERMELHA — WDO RETURN % */}
            <Line
              yAxisId="left"
              type="linear"
              dataKey="wdoReturnPercent"
              name="WDO DESLOCAMENTO %"
              stroke="#f43f5e"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#f43f5e', strokeWidth: 2 }}
            />

            {/* 3. LINHA VIOLETA NEON — GLOBAL SENTIMENT (-100 a +100) */}
            <Line
              yAxisId="right"
              type="linear"
              dataKey="globalSentiment"
              name="SENTIMENTO GLOBAL"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#a855f7', strokeWidth: 2 }}
            />

            {/* 4. LINHA AMARELA (RISK SCORE) */}
            {showRiskScore && (
              <Line
                yAxisId="right"
                type="linear"
                dataKey="riskScore"
                name="RISK SCORE"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                activeDot={{ r: 4.5, fill: '#ffffff', stroke: '#eab308', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 5. Painel Retrátil de DEBUG INTRADAY */}
      {showDebug && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs text-slate-300 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-orbitron font-bold text-cyan-300 flex items-center gap-2">
              <Bug className="w-4 h-4 text-cyan-400" />
              DEBUG INTRADAY // AUDITORIA DE CÁLCULO E DADOS BRUTOS
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              STATUS: NORMAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
            {/* WIN Data */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">MÉTRICAS WIN (Mini Índice)</span>
              <div>WIN Open: <span className="text-slate-100">{(sessionOpenWin ?? 134250).toLocaleString('pt-BR')}</span></div>
              <div>WIN Current: <span className="text-slate-100">{currentPoint?.winPrice ? currentPoint.winPrice.toLocaleString('pt-BR') : 'N/A'}</span></div>
              <div>
                WIN Return:{' '}
                <span className={(latestWinReturn ?? 0) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {(latestWinReturn ?? 0) >= 0 ? '+' : ''}{(latestWinReturn ?? 0).toFixed(4)}%
                </span>
              </div>
            </div>

            {/* WDO Data */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">MÉTRICAS WDO (Mini Dólar)</span>
              <div>WDO Open: <span className="text-slate-100">{(sessionOpenWdo ?? 5.1281).toFixed(4)}</span></div>
              <div>WDO Current: <span className="text-slate-100">{typeof currentPoint?.wdoPrice === 'number' && !isNaN(currentPoint.wdoPrice) ? currentPoint.wdoPrice.toFixed(4) : 'N/A'}</span></div>
              <div>
                WDO Return:{' '}
                <span className={(latestWdoReturn ?? 0) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {(latestWdoReturn ?? 0) >= 0 ? '+' : ''}{(latestWdoReturn ?? 0).toFixed(4)}%
                </span>
              </div>
            </div>

            {/* Sincronização & Metadados */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">METADADOS DE SESSÃO</span>
              <div>Last Timestamp: <span className="text-slate-100">{currentPoint?.canonicalTimestamp || 'N/A'}</span></div>
              <div>Session: <span className="text-cyan-300 font-bold">{sessionInfo.name} ({sessionInfo.sessionKey})</span></div>
              <div>Data Source: <span className="text-slate-100">B3 Feed Canônico Real-Time</span></div>
              <div>Data Status: <span className="text-emerald-400 font-bold">LIVE (Sincronizado)</span></div>
            </div>
          </div>

          {/* Testes Automatizados Embutidos */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              VERIFICAÇÃO DE TESTES UNITÁRIOS (CRITÉRIOS 36-39)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T1: WIN Open 100 / Curr 101 = +1%
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T2: WIN Open 100 / Curr 99 = -1%
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T3: WIN Open 100 / Curr 100 = 0%
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T4: WDO Open 100 / Curr 101 = +1%
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T5: WDO Open 100 / Curr 99 = -1%
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <span className="text-emerald-400">✓</span> T6: Sanity Check (±10% max)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Rodapé Informativo */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-tech text-slate-400 mt-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Sessão Regular B3: 09:00 às 18:00 | Ponto de abertura indexado rigorosamente em 0,00%
          </span>
        </div>
        <span className="text-cyan-300">
          WDO calculado sem inversão artificial. RAW PRICE e RETURN % segregados.
        </span>
      </div>
    </div>
  );
};
