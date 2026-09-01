import { MacroIndicator, SentimentClassification } from '../types/macroTypes';

/**
 * MANDATORY PRINCIPLE OF NON-CIRCULARITY (Section 71):
 * Verifies that WIN or WDO price movements are NEVER used as primary inputs
 * for calculating Global Sentiment, Risk Score, or Macro Trail.
 */
export function assertNoCircularity(inputKeys: string[]): void {
  const forbidden = ['WIN', 'WDO', 'IBOV', 'IND', 'DOL', 'WIN_PRICE', 'WDO_PRICE', 'WIN_RETURN', 'WDO_RETURN'];
  for (const key of inputKeys) {
    const upper = key.toUpperCase();
    if (forbidden.includes(upper)) {
      throw new Error(
        `[VIOLATION DETECTED: Principle of Non-Circularity] Attempted to use price instrument "${key}" in Macro / Global Sentiment / Risk Score calculation. WIN/WDO may only validate or diverge from Macro, never originate it.`
      );
    }
  }
}

/**
 * Calculates the Global Sentiment score (-100 to +100) using only external global macro drivers:
 * DXY, VIX, S&P 500, Nasdaq, 10Y Treasury, Brent, Gold, Fed Policy, Geopolitical Risk.
 */
export function calculateGlobalSentiment(
  indicators: MacroIndicator[],
  weights: Record<string, number>,
  newsDelta: number = 0
): {
  score: number;
  classification: SentimentClassification;
  label: string;
  confidence: number;
  timestamp: string;
  formattedTime: string;
  explanation: string;
} {
  // Only extract global macro variables (Strict Non-Circularity)
  const globalIndicators = indicators.filter(
    (ind) => !['WIN', 'IBOV', 'USD_BRL', 'CDS_BRASIL', 'FOREIGN_FLOW', 'SELIC'].includes(ind.id)
  );

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const ind of globalIndicators) {
    const w = weights[ind.id] ?? ind.weight;
    let normalizedComponent = 0;

    // Component score from -100 to +100
    if (ind.globalDirection === 'BULLISH') {
      normalizedComponent = Math.min(100, Math.max(15, Math.abs(ind.changePercent) * 25 + 30));
    } else if (ind.globalDirection === 'BEARISH') {
      normalizedComponent = -Math.min(100, Math.max(15, Math.abs(ind.changePercent) * 25 + 30));
    } else {
      normalizedComponent = 0;
    }

    totalWeightedScore += normalizedComponent * w;
    totalWeight += w;
  }

  const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const scoreWithNews = rawScore + newsDelta;
  const score = Math.round(Math.max(-100, Math.min(100, scoreWithNews)));

  const { classification, label } = classifyGlobalSentiment(score);

  return {
    score,
    classification,
    label,
    confidence: Math.round(Math.min(95, 60 + Math.abs(score) * 0.35)),
    timestamp: new Date().toISOString(),
    formattedTime: '13:30',
    explanation:
      score >= 25
        ? 'Apetite por risco predominante nas bolsas globais com suporte de EWZ em NY, volatilidade VIX contida e juros externos estáveis.'
        : score <= -25
        ? 'Aversão ao risco global com pressão vendedora em índices acionários e demanda por dólar/proteção.'
        : 'Mercado global equilibrado sem catalisadores direcionais extremos no momento.',
  };
}

/**
 * Section 68: Global Sentiment Classification Scale (-100 to +100)
 */
export function classifyGlobalSentiment(score: number): {
  classification: SentimentClassification;
  label: string;
} {
  if (score >= 75) return { classification: 'EXTREMO_RISK_ON', label: 'EXTREMO RISK-ON' };
  if (score >= 50) return { classification: 'RISK_ON', label: 'RISK-ON' };
  if (score >= 25) return { classification: 'OTIMISMO_MODERADO', label: 'OTIMISMO MODERADO' };
  if (score > -25) return { classification: 'NEUTRO', label: 'NEUTRO' };
  if (score > -50) return { classification: 'PESSIMISMO_MODERADO', label: 'PESSIMISMO MODERADO' };
  if (score > -75) return { classification: 'RISK_OFF', label: 'RISK-OFF' };
  return { classification: 'EXTREMO_RISK_OFF', label: 'EXTREMO RISK-OFF' };
}

export function calculateNewsSentimentDelta(news: any[]): number {
  if (!news || !Array.isArray(news) || news.length === 0) return 0;
  let score = 0;
  for (const n of news) {
    const weight = n.urgency === 'HIGH' ? 2.5 : 1.2;
    if (n.impactIndex === 'ALTA' || n.impactDollar === 'BAIXA') {
      score += weight;
    } else if (n.impactIndex === 'BAIXA' || n.impactDollar === 'ALTA') {
      score -= weight;
    }
  }
  return Math.round(Math.max(-25, Math.min(25, score)));
}

/**
 * Calculates Brazil Macro Sentiment (-100 to +100) based on domestic macro drivers:
 * USD/BRL, EWZ (offshore Brazil ETF), CDS Brasil, Selic/DI Curve, Foreign Flow, Commodities (Iron Ore & Soy).
 */
export function calculateBrazilSentiment(
  indicators: MacroIndicator[],
  weights: Record<string, number>,
  newsDelta: number = 0
): {
  score: number;
  label: string;
  timestamp: string;
  formattedTime: string;
  explanation: string;
} {
  const brazilIndicators = indicators.filter((ind) =>
    ['USD_BRL', 'EWZ', 'CDS_BRASIL', 'FOREIGN_FLOW', 'SELIC', 'IRON_ORE', 'SOY', 'BRENT'].includes(ind.id)
  );

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const ind of brazilIndicators) {
    const w = weights[ind.id] ?? ind.weight;
    let component = 0;
    if (ind.brazilDirection === 'BULLISH') {
      component = Math.min(100, Math.max(20, Math.abs(ind.changePercent) * 20 + 35));
    } else if (ind.brazilDirection === 'BEARISH') {
      component = -Math.min(100, Math.max(20, Math.abs(ind.changePercent) * 20 + 35));
    } else {
      component = 0;
    }
    totalWeightedScore += component * w;
    totalWeight += w;
  }

  const rawScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const scoreWithNews = rawScore + newsDelta;
  const score = Math.round(Math.max(-100, Math.min(100, scoreWithNews)));

  let label = 'NEUTRO';
  if (score >= 40) label = 'EXPANSÃO DOMÉSTICA';
  else if (score >= 15) label = 'CONSTRUTIVO LOCAL';
  else if (score > -15) label = 'EQUILÍBRIO FISCAL/CAMBIAL';
  else if (score > -40) label = 'CAUTELA FISCAL';
  else label = 'ESTRESSE FISCAL SEVERO';

  return {
    score,
    label,
    timestamp: new Date().toISOString(),
    formattedTime: '13:30',
    explanation:
      score >= 15
        ? 'Fluxo estrangeiro em EWZ/B3 e alívio na curva de juros DI dão suporte aos ativos brasileiros.'
        : score <= -15
        ? 'Incertezas fiscais e abertura na curva de juros pressionam o prêmio de risco doméstico.'
        : 'Estabilidade nos fundamentos locais com equilíbrio entre fiscal e câmbio.',
  };
}

/**
 * Section 18: Rastro do Macro (0 to 100)
 * Represents the macro environment evolution without being a copy of WIN or WDO.
 * 0 = extremamente negativo, 50 = neutro, 100 = extremamente otimista.
 */
export function calculateMacroTrail(
  indicators: MacroIndicator[],
  weights: Record<string, number>
): number {
  const { score: globalScore } = calculateGlobalSentiment(indicators, weights);
  const { score: brazilScore } = calculateBrazilSentiment(indicators, weights);

  // Normalized to 0 - 100 scale: (Score + 100) / 2
  // Weighted: 60% Global Macro + 40% Brazil Macro Fundamentals (ex-price)
  const combinedMacro = globalScore * 0.6 + brazilScore * 0.4;
  const macroTrail = (combinedMacro + 100) / 2;

  return Math.round(Math.max(0, Math.min(100, macroTrail)));
}

/**
 * Calculates WIN (Mini Índice) directional bias score (-100 to +100) with exact extracted price
 */
export function calculateWinBias(
  indicators: MacroIndicator[],
  globalSentimentScore: number,
  brazilSentimentScore: number,
  weights: Record<string, number>,
  winReturn: number = 0,
  exactPriceOverride?: number
): {
  score: number;
  classification: string;
  label: string;
  winReturn: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  supportLevel: number;
  resistanceLevel: number;
  explanation: string;
  confidence: number;
  timestamp: string;
  formattedTime: string;
} {
  const winInd = indicators.find((i) => i.id === 'WIN');
  const currentPrice = exactPriceOverride ?? (winInd ? winInd.value : 134250);
  const baseScore = globalSentimentScore * 0.55 + brazilSentimentScore * 0.45;
  const score = Math.round(Math.max(-100, Math.min(100, baseScore)));

  const targetPrice = score >= 0 ? Math.round(currentPrice + 650 + score * 5) : Math.round(currentPrice - 650 - Math.abs(score) * 5);
  const stopLoss = score >= 0 ? Math.round(currentPrice - 450) : Math.round(currentPrice + 450);
  const supportLevel = Math.round(currentPrice - 600);
  const resistanceLevel = Math.round(currentPrice + 600);

  let classification = 'NEUTRO';
  let label = 'NEUTRO / AGUARDAR';
  let explanation = 'Forças compradoras e vendedoras equilibradas.';
  if (score >= 40) {
    classification = 'COMPRA_FORTE';
    label = '🟢 COMPRA FORTE (WIN)';
    explanation = 'Ambiente de forte apetite por risco global e fechamento de juros locais.';
  } else if (score >= 20) {
    classification = 'VIES_COMPRADOR';
    label = '🟢 VIÉS COMPRADOR (WIN)';
    explanation = 'Fluxo favorável a repique no índice suportado por Wall Street e EWZ.';
  } else if (score <= -40) {
    classification = 'VENDA_FORTE';
    label = '🔴 VENDA FORTE (WIN)';
    explanation = 'Forte aversão ao risco com estresse nos yields e bolsas em queda.';
  } else if (score <= -20) {
    classification = 'VIES_VENDEDOR';
    label = '🔴 VIÉS VENDEDOR (WIN)';
    explanation = 'Pressão vendedora predominante decorrente de cautela fiscal/externa.';
  }

  return {
    score,
    classification,
    label,
    winReturn,
    currentPrice,
    targetPrice,
    stopLoss,
    supportLevel,
    resistanceLevel,
    explanation,
    confidence: Math.round(Math.min(95, 60 + Math.abs(score) * 0.35)),
    timestamp: new Date().toISOString(),
    formattedTime: '13:30',
  };
}

/**
 * Calculates WDO (Mini Dólar) directional bias score (-100 to +100) with exact extracted price
 */
export function calculateWdoBias(
  indicators: MacroIndicator[],
  globalSentimentScore: number,
  brazilSentimentScore: number,
  weights: Record<string, number>,
  wdoReturn: number = 0,
  exactPriceOverride?: number
): {
  score: number;
  classification: string;
  label: string;
  wdoReturn: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  supportLevel: number;
  resistanceLevel: number;
  explanation: string;
  confidence: number;
  timestamp: string;
  formattedTime: string;
} {
  const wdoInd = indicators.find((i) => i.id === 'USD_BRL');
  const currentPrice = exactPriceOverride ?? (wdoInd ? wdoInd.value : 5.405);
  // Inverted relation with global appetite and fiscal strength
  const baseScore = -(globalSentimentScore * 0.45 + brazilSentimentScore * 0.55);
  const score = Math.round(Math.max(-100, Math.min(100, baseScore)));

  const targetPrice = score >= 0 ? +(currentPrice + 0.035 + (score / 100) * 0.03).toFixed(3) : +(currentPrice - 0.035 - (Math.abs(score) / 100) * 0.03).toFixed(3);
  const stopLoss = score >= 0 ? +(currentPrice - 0.025).toFixed(3) : +(currentPrice + 0.025).toFixed(3);
  const supportLevel = +(currentPrice - 0.030).toFixed(3);
  const resistanceLevel = +(currentPrice + 0.030).toFixed(3);

  let classification = 'NEUTRO';
  let label = 'CONSOLIDAÇÃO / AGUARDAR';
  let explanation = 'Dólar operando em consolidação com forças opostas.';
  if (score >= 40) {
    classification = 'COMPRA_FORTE';
    label = '🟢 COMPRA DE DÓLAR (WDO)';
    explanation = 'Forte demanda por proteção cambial com DXY e prêmio de risco elevados.';
  } else if (score >= 20) {
    classification = 'VIES_COMPRADOR';
    label = '🟢 VIÉS COMPRADOR (WDO)';
    explanation = 'Dólar fortalecido com fluxo defensivo institucional.';
  } else if (score <= -40) {
    classification = 'VENDA_FORTE';
    label = '🔴 VENDA / ALÍVIO DO DÓLAR (WDO)';
    explanation = 'Alívio cambial acentuado com entrada vigorosa de fluxo estrangeiro em EWZ/B3.';
  } else if (score <= -20) {
    classification = 'VIES_VENDEDOR';
    label = '🔴 VIÉS VENDEDOR (WDO)';
    explanation = 'Pressão de desvalorização do dólar ante o Real.';
  }

  return {
    score,
    classification,
    label,
    wdoReturn,
    currentPrice,
    targetPrice,
    stopLoss,
    supportLevel,
    resistanceLevel,
    explanation,
    confidence: Math.round(Math.min(95, 60 + Math.abs(score) * 0.35)),
    timestamp: new Date().toISOString(),
    formattedTime: '13:30',
  };
}

/**
 * Calculates the Confluence Point for the 4 normalized pillars (0 to 100)
 */
export function calculateConfluencePoint(
  globalSentiment: number,
  brazilSentiment: number,
  winBiasScore: number,
  wdoBiasScore: number,
  formattedTime: string = '13:30',
  winReturn: number = 0,
  wdoReturn: number = 0
): any {
  const bullishStrength = Math.round(Math.max(0, Math.min(100, (winBiasScore + 100) / 2)));
  const bearishStrength = Math.round(Math.max(0, Math.min(100, (wdoBiasScore + 100) / 2)));
  const riskScore = Math.round(Math.max(0, Math.min(100, (globalSentiment + 100) / 2)));
  const macroTrail = Math.round(Math.max(0, Math.min(100, ((globalSentiment * 0.6 + brazilSentiment * 0.4) + 100) / 2)));

  let scenario: 'ALTA' | 'BAIXA' | 'AGUARDAR' = 'AGUARDAR';
  if (bullishStrength >= 60 && macroTrail >= 55 && riskScore >= 55) {
    scenario = 'ALTA';
  } else if (bearishStrength >= 60 && macroTrail < 45 && riskScore < 45) {
    scenario = 'BAIXA';
  }

  const confidence = Math.round(
    scenario === 'ALTA'
      ? Math.min(95, 50 + (bullishStrength - 50) * 0.8)
      : scenario === 'BAIXA'
      ? Math.min(95, 50 + (bearishStrength - 50) * 0.8)
      : 50
  );

  const optimisticPct = Math.round(Math.min(95, Math.max(10, bullishStrength * 0.8 + riskScore * 0.2)));
  const pessimisticPct = Math.round(Math.min(95, Math.max(10, bearishStrength * 0.8 + (100 - riskScore) * 0.2)));

  const optimisticConditions = [
    'S&P 500 futuro em alta mantendo apetite global',
    'Volatilidade VIX em níveis moderados (< 18 pts)',
    'Fluxo institucional estrangeiro comprador na B3',
    'Curva de juros DI com alívio em vértices médios/longos',
  ];

  const pessimisticConditions = [
    'Possível repique no índice DXY ou Treasuries 10Y',
    'Realização de lucros em blue chips de commodities',
    'Abertura de prêmio de risco em caso de ruídos fiscais',
  ];

  return {
    timestamp: `2026-08-28T${formattedTime}:00-03:00`,
    formattedTime,
    winReturn,
    wdoReturn,
    bullishStrength,
    bearishStrength,
    riskScore,
    macroTrail,
    scenario,
    confluencePercentage: confidence,
    confidence,
    optimisticPct,
    pessimisticPct,
    optimisticConditions,
    pessimisticConditions,
    alignedCount: bullishStrength >= 55 && macroTrail >= 55 && riskScore >= 55 ? 3 : 2,
    totalComponents: 4,
    explanation:
      scenario === 'ALTA'
        ? 'Confluência positiva entre fatores macroeconômicos e fluxo de risco.'
        : scenario === 'BAIXA'
        ? 'Pressão vendedora confluente com aversão a risco e dólar comprador.'
        : 'Cenário em consolidação com forças divergentes.',
    dataQuality: 'LIVE',
    hasDivergence: bullishStrength > 60 && winReturn < -0.2,
  };
}

/**
 * Detects divergence between macro fundamentals and price action
 */
export function detectDivergences(
  indicators: MacroIndicator[],
  globalSentimentScore: number,
  winBiasScore: number,
  wdoBiasScore: number
): any[] {
  const list: any[] = [];
  if (globalSentimentScore > 40 && winBiasScore < -20) {
    list.push({
      id: 'div-1',
      type: 'DIVERGÊNCIA_WIN_MACRO',
      pair: 'Global Sentiment vs WIN',
      description: 'Sentimento global fortemente positivo, mas WIN em realização pontual por pressão local.',
      severity: 'MODERADA',
      timestamp: new Date().toISOString(),
      formattedTime: '11:15',
      status: 'RESOLVIDA',
    });
  }
  return list;
}
