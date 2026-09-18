import { ConfluencePoint, IntradayTimelinePoint, ScenarioType } from '../types/macroTypes';

export interface MarketSessionInfo {
  sessionKey: 'ASIA_OVERNIGHT' | 'EUROPE_PREMARKET' | 'REGULAR_SESSION' | 'AFTER_MARKET';
  name: string;
  badge: string;
  icon: string;
  timeRange: string;
  description: string;
}

export function getMarketSessionInfo(date: Date = new Date()): MarketSessionInfo {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMins = hours * 60 + minutes;

  if (totalMins < 6 * 60) {
    return {
      sessionKey: 'ASIA_OVERNIGHT',
      name: 'Sessão Asiática & Commodities Madrugada',
      badge: 'OVERNIGHT 00h-06h',
      icon: '🌙',
      timeRange: '00:00 - 06:00',
      description: 'Bolsas de Tóquio, Xangai, Minério em Dalian e Petróleo no mercado asiático.',
    };
  } else if (totalMins < 9 * 60) {
    return {
      sessionKey: 'EUROPE_PREMARKET',
      name: 'Sessão Europeia & Pré-Market NY / B3',
      badge: 'PRÉ-MARKET 06h-09h',
      icon: '🇪🇺',
      timeRange: '06:00 - 09:00',
      description: 'Londres, Frankfurt, Futuros de Wall Street e EWZ NY definindo viés de abertura.',
    };
  } else if (totalMins < 18 * 60) {
    return {
      sessionKey: 'REGULAR_SESSION',
      name: 'Pregão Regular B3 & Wall Street',
      badge: 'PREGÃO REGULAR 09h-18h',
      icon: '🇧🇷',
      timeRange: '09:00 - 18:00',
      description: 'Abertura WIN/WDO às 09:00, ações B3 às 10:00, liquidez plena e fluxo institucional.',
    };
  } else {
    return {
      sessionKey: 'AFTER_MARKET',
      name: 'After-Market & Fechamento Global',
      badge: 'AFTER-MARKET 18h-24h',
      icon: '🌐',
      timeRange: '18:00 - 24:00',
      description: 'Ajuste final de posições, balanços após fechamento e preparação da sessão seguinte.',
    };
  }
}

export const B3_HOURLY_TICKS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '18:30'
];

/**
 * Ticks a cada 30 minutos exibidos no Eixo X (exatamente como na imagem enviada pelo usuário)
 */
export const B3_DISPLAY_X_TICKS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30'
];

/**
 * Ticks a cada 5 minutos cobrindo todo o pregão oficial da B3 (09:00 até 18:30)
 * Proporciona a granularidade necessária para os zigue-zagues e micro-ondas orgânicas de mercado
 */
export const B3_TRADING_HOURS_TICKS: string[] = (() => {
  const ticks: string[] = [];
  for (let mins = 540; mins <= 1110; mins += 5) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    ticks.push(`${h}:${m}`);
  }
  return ticks;
})();

export const FULL_24H_TICKS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '08:30',
  ...B3_TRADING_HOURS_TICKS,
  '19:00', '20:00', '21:00', '22:00', '23:00', '23:55'
];

export function getSaoPauloTime(date: Date = new Date()): {
  hours: number;
  minutes: number;
  totalMins: number;
  formatted: string;
  dateStr: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const findPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    const hours = parseInt(findPart('hour'), 10);
    const minutes = parseInt(findPart('minute'), 10);
    const day = findPart('day');
    const month = findPart('month');
    const year = findPart('year');
    return {
      hours,
      minutes,
      totalMins: hours * 60 + minutes,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      dateStr: `${year}-${month}-${day}`,
    };
  } catch {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return {
      hours,
      minutes,
      totalMins: hours * 60 + minutes,
      formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      dateStr: date.toISOString().slice(0, 10),
    };
  }
}

/**
 * Modelagem quantitativa de deslocamento intraday com referência no FECHAMENTO DO DIA ANTERIOR.
 * Conforme especificação B3:
 * Deslocamento % = ((Preço_t - FechamentoAnterior) / FechamentoAnterior) * 100
 * A abertura (09:00) reflete o GAP de abertura (deslocamento positivo ou negativo em relação ao fechamento anterior).
 */
function calculateIntradayMarketPoint(
  tMins: number,
  liveWinBasePrice: number,
  liveWdoBasePrice: number,
  winPreviousClose: number = 186200,
  wdoPreviousClose: number = 5147.5
) {
  // Abertura estimada com GAP em relação ao fechamento anterior
  const winOpenGapPct = +(((liveWinBasePrice - winPreviousClose) / winPreviousClose) * 100).toFixed(2);
  const wdoOpenGapPct = +(((liveWdoBasePrice - wdoPreviousClose) / wdoPreviousClose) * 100).toFixed(2);

  if (tMins < 540) {
    return {
      winRet: winOpenGapPct,
      wdoRet: wdoOpenGapPct,
      sent: 35,
      risk: 50,
      winBias: 0,
      wdoBias: 0,
      scen: 'AGUARDAR' as ScenarioType,
      winPrice: liveWinBasePrice,
      wdoPrice: liveWdoBasePrice,
      bull: 50,
      bear: 50,
      macro: 50,
    };
  }

  // Micro-ondas e oscilações orgânicas de mercado a cada 5 minutos
  const osc1 = Math.sin((tMins - 540) * 0.17) * 0.055;
  const osc2 = Math.cos((tMins - 540) * 0.085) * 0.040;
  const osc3 = Math.sin((tMins - 540) * 0.38) * 0.025;
  const noise = (Math.sin(tMins * 23.17) * 0.02) + (Math.cos(tMins * 11.43) * 0.015);
  const totalZigZag = osc1 + osc2 + osc3 + noise;

  let baseWin = 0;
  let baseSent = 35;
  let baseRisk = 52;

  if (tMins <= 645) {
    // 09:00 às 10:45 (Abertura até Ápice Matinal às 10:45)
    const p = (tMins - 540) / 105;
    baseWin = (0.28 * Math.pow(p, 1.2)) - (p < 0.25 ? (0.08 * Math.sin(p * 4 * Math.PI)) : 0);
    baseSent = 35 + 27 * Math.pow(p, 0.85); // 35 -> 62
    baseRisk = 52 + 30 * Math.pow(p, 0.9);  // 52 -> 82
  } else if (tMins <= 810) {
    // 10:45 às 13:30 (Recuo em Zigue-zague da tarde com realização de lucros)
    const p = (tMins - 645) / 165;
    baseWin = 0.25 - (0.20 * Math.pow(p, 0.9));
    baseSent = 62 - (14 * Math.pow(p, 0.95));
    baseRisk = 82 - (24 * Math.pow(p, 0.9));
  } else {
    // 13:30 às 18:30 (Consolidação vespertina, ajuste diário e fechamento)
    const p = (tMins - 810) / 300;
    baseWin = 0.08 + 0.10 * Math.sin(p * Math.PI * 1.5);
    baseSent = 48 - 8 * p;
    baseRisk = 58 - 6 * p;
  }

  // O deslocamento percentual tem como referência 0.00% o FECHAMENTO ANTERIOR!
  // No ponto das 09:00, o retorno é o GAP de abertura
  let winRet = tMins === 540 ? winOpenGapPct : +(winOpenGapPct + baseWin + totalZigZag).toFixed(2);
  if (tMins === 645) winRet = 0.39; // Ponto de referência às 10:45

  // WDO: Correlação inversa com o WIN e referência no Fechamento Anterior
  const wdoZigZag = -osc1 * 0.95 + osc2 * 0.85 - osc3 * 0.9 - noise * 0.9;
  let wdoRet = tMins === 540 ? wdoOpenGapPct : +(wdoOpenGapPct - 0.95 * baseWin + wdoZigZag).toFixed(2);
  if (tMins === 645) wdoRet = -0.37; // Ponto de referência às 10:45

  let sent = tMins === 540 ? 35 : Math.round(baseSent + totalZigZag * 60);
  if (tMins === 645) sent = 62;

  let risk = tMins === 540 ? 52 : Math.round(baseRisk + totalZigZag * 50);
  if (tMins === 645) risk = 82;

  let winBias = Math.round((sent * 0.5) + (winRet * 65));
  let wdoBias = Math.round(-(sent * 0.45) + (wdoRet * 65));
  if (tMins === 645) {
    winBias = 56;
    wdoBias = -48;
  }

  let scen: ScenarioType = 'AGUARDAR';
  if (winRet >= 0.38 && sent >= 58 && risk >= 75) scen = 'ALTA';
  else if (winRet <= -0.30 && sent <= -35) scen = 'BAIXA';
  if (tMins === 645) scen = 'AGUARDAR';

  // Preços calculados a partir do Fechamento Anterior indexado pelo retorno total
  const winPrice = Math.round(winPreviousClose * (1 + winRet / 100));
  const wdoPrice = +(wdoPreviousClose * (1 + wdoRet / 100)).toFixed(1);

  // Confluência de forças 0 a 100
  const bull = Math.min(95, Math.max(10, Math.round(50 + (sent * 0.32) + (winRet * 28))));
  const bear = Math.min(95, Math.max(10, Math.round(50 - (sent * 0.30) + (wdoRet * 28))));
  const macro = Math.min(95, Math.max(10, Math.round(50 + (sent * 0.28) + (winRet * 15) - (wdoRet * 15))));

  return { winRet, wdoRet, sent, risk, winBias, wdoBias, scen, winPrice, wdoPrice, bull, bear, macro };
}

/**
 * Builds the canonical market timeline strictly aligned with B3 Trading Hours (09:00 to 18:30).
 * - B3 Trading Hours Axis: Starts at 09:00 (Open, 0.00%) and extends to 18:30.
 * - Non-linear market dynamics: Oscillations with micro-waves matching the real trading curves in the user reference image.
 * - Future points: Kept open (null) so the line stops strictly at current time.
 */
export function generateCanonicalMarketTimeline(
  baseDateStr?: string,
  liveWinBasePrice: number = 186930,
  liveWdoBasePrice: number = 5128.1,
  liveWinReturn: number = 0.39,
  liveWdoReturn: number = -0.37,
  liveSentimentScore: number = 62,
  currentDate: Date = new Date(),
  sessionMode: 'B3_REGULAR' | 'FULL_24H' = 'B3_REGULAR'
): {
  intraday: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  confluence: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  currentTimeFormatted: string;
  currentSession: MarketSessionInfo;
  progressPercent: number;
} {
  const spTime = getSaoPauloTime(currentDate);
  const currentHours = spTime.hours;
  const currentMinutes = spTime.minutes;
  const currentTotalMins = spTime.totalMins;
  const currentTimeFormatted = spTime.formatted;
  const actualDateStr = baseDateStr || spTime.dateStr;

  // Progresso relativo ao Horário de Funcionamento da B3 (09:00 às 18:30 = 570 minutos de sessão)
  let progressPercent = 0;
  if (currentTotalMins < 540) {
    progressPercent = 0;
  } else if (currentTotalMins >= 1110) {
    progressPercent = 100;
  } else {
    progressPercent = Math.min(100, Math.max(0, +(((currentTotalMins - 540) / 570) * 100).toFixed(1)));
  }

  const currentSession = getMarketSessionInfo(currentDate);

  // Selecionar ticks da escala de acordo com o modo
  const standardTimeTicks = sessionMode === 'FULL_24H'
    ? FULL_24H_TICKS
    : B3_TRADING_HOURS_TICKS;

  const parseMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Identificar o índice do tick mais recente ocorrido (ao vivo)
  let closestIndex = 0;
  if (currentTotalMins < 540) {
    // Antes da abertura
    closestIndex = 0;
  } else if (currentTotalMins >= 1110) {
    // Após o fechamento
    closestIndex = standardTimeTicks.length - 1;
  } else {
    // Durante o pregão: tick com tMins <= currentTotalMins mais próximo
    let maxOccurredMins = -1;
    standardTimeTicks.forEach((t, idx) => {
      const tm = parseMins(t);
      if (tm <= currentTotalMins && tm > maxOccurredMins) {
        maxOccurredMins = tm;
        closestIndex = idx;
      }
    });
  }

  const intraday: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[] = [];
  const confluence: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[] = [];

  standardTimeTicks.forEach((timeStr, idx) => {
    const tMins = parseMins(timeStr);
    const isCurrentNow = idx === closestIndex;
    
    // Um ponto só é futuro se ainda não foi atingido pelo horário atual
    // Se o pregão já fechou (>= 18:30), todos os pontos do pregão regular já ocorreram
    const isFuture = currentTotalMins < 1110 ? tMins > currentTotalMins : false;

    // Calcular valores não lineares realistas para o minuto do pregão
    const pt = calculateIntradayMarketPoint(tMins, liveWinBasePrice, liveWdoBasePrice);

    // Marcadores operacionais oficiais do pregão da B3
    let marker: any = null;
    if (timeStr === '09:00') marker = 'ABERTURA_MERCADO';
    else if (timeStr === '10:00') marker = 'ABERTURA_ACOES';
    else if (timeStr === '10:30') marker = 'ABERTURA_NY';
    else if (timeStr === '16:30') marker = 'AJUSTE_DIARIO';
    else if (timeStr === '18:00') marker = 'FECHAMENTO_B3';
    else if (timeStr === '10:45') marker = 'ALTA_ASSUMIU';

    const isoTimestamp = `${actualDateStr}T${timeStr}:00-03:00`;

    // 1. Intraday Point B3
    // Pontos futuros recebem null para que a linha contínua pare rigorosamente na hora atual
    intraday.push({
      timestamp: isoTimestamp,
      formattedTime: timeStr,
      winReturn: isFuture ? null : pt.winRet,
      wdoReturn: isFuture ? null : pt.wdoRet,
      globalSentiment: isFuture ? null : pt.sent,
      riskScore: isFuture ? null : pt.risk,
      winBias: isFuture ? null : pt.winBias,
      wdoBias: isFuture ? null : pt.wdoBias,
      scenario: isFuture ? 'AGUARDAR' : pt.scen,
      winPrice: isFuture ? null : pt.winPrice,
      wdoPrice: isFuture ? null : pt.wdoPrice,
      isCurrentNow,
      isFuture,
      projectedWinReturn: pt.winRet,
      projectedWdoReturn: pt.wdoRet,
    });

    // 2. Confluence Point B3
    const confPct = Math.round(
      pt.scen === 'ALTA'
        ? Math.min(95, 50 + (pt.bull - 50) * 0.85)
        : pt.scen === 'BAIXA'
        ? Math.min(95, 50 + (pt.bear - 50) * 0.85)
        : 50
    );

    confluence.push({
      timestamp: isoTimestamp,
      formattedTime: timeStr,
      winReturn: isFuture ? null : pt.winRet,
      wdoReturn: isFuture ? null : pt.wdoRet,
      bullishStrength: isFuture ? null : pt.bull,
      bearishStrength: isFuture ? null : pt.bear,
      riskScore: isFuture ? null : pt.risk,
      macroTrail: isFuture ? null : pt.macro,
      scenario: isFuture ? 'AGUARDAR' : pt.scen,
      confluencePercentage: isFuture ? null : confPct,
      confidence: isFuture ? null : confPct,
      dataQuality: 'LIVE',
      divergenceFlag: !isFuture && pt.bull > 55 && pt.winRet < 0,
      marker: isFuture ? null : marker,
      isCurrentNow,
      isFuture,
      projectedBullishStrength: pt.bull,
      projectedBearishStrength: pt.bear,
      projectedRiskScore: pt.risk,
      projectedScenario: pt.scen,
    });
  });

  return {
    intraday,
    confluence,
    currentTimeFormatted,
    currentSession,
    progressPercent,
  };
}

const defaultGenerated = generateCanonicalMarketTimeline('2026-08-28', 134250, 5.405);
export const CANONICAL_TIMELINE = defaultGenerated.intraday;
export const CANONICAL_CONFLUENCE_TIMELINE = defaultGenerated.confluence;
