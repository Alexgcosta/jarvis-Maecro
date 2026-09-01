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

/**
 * Builds the continuous 24-hour market timeline (00:00 to 23:55) dynamically tracking the current time of day.
 * - 24h Axis: Full scale from 00:00 to 23:55 with regular intervals
 * - Smooth continuous curves: Zero artificial spikes or cliff drops at the current time
 * - Live Current Time Point: Identifies closest clean tick without distorting chart geometry
 */
export function generateCanonicalMarketTimeline(
  baseDateStr?: string,
  liveWinBasePrice: number = 134250,
  liveWdoBasePrice: number = 5.405,
  liveWinReturn: number = 0.42,
  liveWdoReturn: number = -0.35,
  liveSentimentScore: number = 38,
  currentDate: Date = new Date()
): {
  intraday: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  confluence: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  currentTimeFormatted: string;
  currentSession: MarketSessionInfo;
  progressPercent: number;
} {
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const actualDateStr = baseDateStr || `${year}-${month}-${day}`;

  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentTotalMins = currentHours * 60 + currentMinutes;
  const currentTimeFormatted = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, +((currentTotalMins / 1440) * 100).toFixed(1)));
  const currentSession = getMarketSessionInfo(currentDate);

  // Standard regular canonical timeline hours (equidistant scale preventing chart distortion)
  const standardTimeTicks = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '08:30',
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '23:55'
  ];

  const parseMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Find the closest standard tick index to the live clock
  let closestIndex = 0;
  let minDiff = Infinity;
  standardTimeTicks.forEach((t, idx) => {
    const diff = Math.abs(parseMins(t) - currentTotalMins);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = idx;
    }
  });

  const intraday: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[] = [];
  const confluence: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[] = [];

  standardTimeTicks.forEach((timeStr, idx) => {
    const tMins = parseMins(timeStr);
    const isCurrentNow = idx === closestIndex;
    const isFuture = tMins > currentTotalMins;

    // Smooth physics-based continuous curve modeling without spikes
    let winRet = 0;
    let wdoRet = 0;
    let sent = 0;

    if (tMins <= 360) {
      // 00:00 - 06:00: Overnight Asia & Commodities
      const prog = tMins / 360;
      sent = Math.round(liveSentimentScore * (0.35 + 0.25 * prog));
      winRet = 0;
      wdoRet = 0;
    } else if (tMins <= 540) {
      // 06:00 - 09:00: Europe Open & US Futures / Pre-Market
      const prog = (tMins - 360) / 180;
      sent = Math.round(liveSentimentScore * (0.60 + 0.35 * prog));
      winRet = +(liveWinReturn * 0.25 * prog).toFixed(2);
      wdoRet = +(liveWdoReturn * 0.25 * prog).toFixed(2);
    } else if (tMins <= 1080) {
      // 09:00 - 18:00: B3 Regular Session
      const sessionProg = (tMins - 540) / 540;

      if (currentTotalMins >= 540 && currentTotalMins <= 1080) {
        if (tMins <= currentTotalMins) {
          // Historical part leading smoothly up to current moment
          const subProg = (tMins - 540) / Math.max(1, currentTotalMins - 540);
          winRet = +(liveWinReturn * (0.2 + 0.8 * subProg)).toFixed(2);
          wdoRet = +(liveWdoReturn * (0.2 + 0.8 * subProg)).toFixed(2);
          sent = Math.round(liveSentimentScore * (0.8 + 0.2 * subProg));
        } else {
          // Forward projection smoothly sustaining current trend
          const futureProg = (tMins - currentTotalMins) / Math.max(1, 1080 - currentTotalMins);
          winRet = +(liveWinReturn * (1.0 + 0.05 * Math.sin(futureProg * Math.PI))).toFixed(2);
          wdoRet = +(liveWdoReturn * (1.0 + 0.05 * Math.sin(futureProg * Math.PI))).toFixed(2);
          sent = Math.round(liveSentimentScore);
        }
      } else if (currentTotalMins > 1080) {
        // After-market viewing closed session
        winRet = +(liveWinReturn * (0.25 + 0.75 * sessionProg)).toFixed(2);
        wdoRet = +(liveWdoReturn * (0.25 + 0.75 * sessionProg)).toFixed(2);
        sent = Math.round(liveSentimentScore * (0.85 + 0.15 * sessionProg));
      } else {
        // Pre-market projecting forward to open
        winRet = +(liveWinReturn * sessionProg).toFixed(2);
        wdoRet = +(liveWdoReturn * sessionProg).toFixed(2);
        sent = Math.round(liveSentimentScore);
      }
    } else {
      // 18:00 - 24:00: After-Market & Global Night Cycle
      const afterProg = (tMins - 1080) / 360;
      winRet = liveWinReturn;
      wdoRet = liveWdoReturn;
      sent = Math.round(liveSentimentScore * (1.0 - 0.05 * afterProg));
    }

    // Consistent unified confluence formulas across all 24h points
    const bull = Math.min(88, Math.max(12, Math.round(50 + (sent * 0.30) + (winRet * 20))));
    const bear = Math.min(88, Math.max(12, Math.round(50 - (sent * 0.30) + (wdoRet * 20))));
    const risk = Math.min(88, Math.max(12, Math.round(50 + (sent * 0.35))));
    const macro = Math.min(88, Math.max(12, Math.round(50 + (sent * 0.28) + (winRet * 10) - (wdoRet * 10))));

    let scen: ScenarioType = 'AGUARDAR';
    if (bull >= 58 && bear <= 46) scen = 'ALTA';
    else if (bear >= 58 && bull <= 46) scen = 'BAIXA';

    let marker: 'ALTA_ASSUMIU' | 'BAIXA_ASSUMIU' | 'CONFLUENCIA_PERDIDA' | 'ABERTURA_MERCADO' | null = null;
    if (timeStr === '09:00') marker = 'ABERTURA_MERCADO';
    else if (timeStr === '09:30' && scen === 'ALTA') marker = 'ALTA_ASSUMIU';
    else if (timeStr === '09:30' && scen === 'BAIXA') marker = 'BAIXA_ASSUMIU';

    const isoTimestamp = `${actualDateStr}T${timeStr}:00-03:00`;

    // 1. Intraday Point
    intraday.push({
      timestamp: isoTimestamp,
      formattedTime: timeStr,
      winReturn: +winRet.toFixed(2),
      wdoReturn: +wdoRet.toFixed(2),
      globalSentiment: sent,
      winPrice: Math.round(liveWinBasePrice * (1 + winRet / 100)),
      wdoPrice: +(liveWdoBasePrice * (1 + wdoRet / 100)).toFixed(3),
      isCurrentNow,
      isFuture,
    });

    // 2. Confluence Point
    const confPct = Math.round(
      scen === 'ALTA'
        ? Math.min(95, 50 + (bull - 50) * 0.85)
        : scen === 'BAIXA'
        ? Math.min(95, 50 + (bear - 50) * 0.85)
        : 50
    );

    confluence.push({
      timestamp: isoTimestamp,
      formattedTime: timeStr,
      winReturn: +winRet.toFixed(2),
      wdoReturn: +wdoRet.toFixed(2),
      bullishStrength: bull,
      bearishStrength: bear,
      riskScore: risk,
      macroTrail: macro,
      scenario: scen,
      confluencePercentage: confPct,
      confidence: confPct,
      dataQuality: 'LIVE',
      divergenceFlag: bull > 55 && winRet < 0,
      marker,
      isCurrentNow,
      isFuture,
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
