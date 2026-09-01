import { BiasClassification, TrafficLightState } from '../types/macroTypes';

/**
 * Section 46: WIN Bias (-100 to +100)
 * Evaluates directional bias for Mini Índice (WIN / IBOV).
 */
export function calculateWinBias(params: {
  winReturn: number;
  winMomentum: number;
  globalSentiment: number; // -100 to +100
  spxChange: number;
  vixChange: number;
  dxyChange: number;
  treasuryChange: number;
  foreignFlow: number;
}): {
  score: number;
  classification: BiasClassification;
  label: string;
  confidence: number;
  drivers: string[];
} {
  const {
    winReturn,
    winMomentum,
    globalSentiment,
    spxChange,
    vixChange,
    dxyChange,
    treasuryChange,
    foreignFlow,
  } = params;

  // Price component (30%)
  const priceComponent = Math.min(100, Math.max(-100, (winReturn * 40 + winMomentum * 30)));

  // Macro alignment component (40%)
  const macroComponent = globalSentiment;

  // Global cross-asset component (20%)
  // S&P positive (+), VIX inverted (-), DXY inverted (-), Treasury inverted (-)
  const crossAssetComponent = Math.min(
    100,
    Math.max(
      -100,
      spxChange * 30 - vixChange * 10 - dxyChange * 30 - treasuryChange * 20
    )
  );

  // Institutional flow component (10%)
  const flowComponent = Math.min(100, Math.max(-100, foreignFlow * 0.15));

  const totalScore = Math.round(
    priceComponent * 0.3 +
      macroComponent * 0.4 +
      crossAssetComponent * 0.2 +
      flowComponent * 0.1
  );

  const clampedScore = Math.max(-100, Math.min(100, totalScore));

  let classification: BiasClassification = 'NEUTRO';
  let label = 'NEUTRO (SEM VIÉS FORTE)';
  if (clampedScore >= 60) {
    classification = 'COMPRA_FORTE';
    label = 'COMPRA FORTE (BULLISH CONFLUENCE)';
  } else if (clampedScore >= 20) {
    classification = 'VIES_COMPRADOR';
    label = 'VIÉS COMPRADOR (ALTA)';
  } else if (clampedScore > -20) {
    classification = 'NEUTRO';
    label = 'NEUTRO (LATERALIDADE / CONFLITO)';
  } else if (clampedScore > -60) {
    classification = 'VIES_VENDEDOR';
    label = 'VIÉS VENDEDOR (BAIXA)';
  } else {
    classification = 'VENDA_FORTE';
    label = 'VENDA FORTE (BEARISH CONFLUENCE)';
  }

  const drivers: string[] = [];
  if (globalSentiment >= 25) drivers.push(`Sentimento Global favorável (+${globalSentiment})`);
  else if (globalSentiment <= -25) drivers.push(`Sentimento Global adverso (${globalSentiment})`);

  if (spxChange > 0.2) drivers.push('Wall Street (S&P 500) operando em alta');
  if (dxyChange > 0.15) drivers.push('Dólar global (DXY) pressionando emergentes');
  if (winReturn > 0.2) drivers.push('Variação intradiária do WIN positiva');
  else if (winReturn < -0.2) drivers.push('Variação intradiária do WIN negativa');

  const confidence = Math.round(Math.min(95, 55 + Math.abs(clampedScore) * 0.38));

  return {
    score: clampedScore,
    classification,
    label,
    confidence,
    drivers,
  };
}

/**
 * Section 47: WDO Bias (-100 to +100)
 * Evaluates directional bias for Mini Dólar (WDO / USD/BRL).
 * CRITICAL: Positive score means BUYING BIAS FOR USD (VIÉS DE COMPRA DO DÓLAR), NOT Risk-On!
 */
export function calculateWdoBias(params: {
  wdoReturn: number;
  wdoMomentum: number;
  dxyChange: number;
  globalSentiment: number; // -100 to +100 (inverted for WDO)
  vixChange: number;
  treasuryChange: number;
  geopoliticsRisk: number; // 0 to 100
  foreignFlow: number; // foreign flow in B3 (negative flow = dollar demand)
}): {
  score: number;
  classification: BiasClassification;
  label: string;
  confidence: number;
  drivers: string[];
} {
  const {
    wdoReturn,
    wdoMomentum,
    dxyChange,
    globalSentiment,
    vixChange,
    treasuryChange,
    geopoliticsRisk,
    foreignFlow,
  } = params;

  // Price component (30%)
  const priceComponent = Math.min(100, Math.max(-100, (wdoReturn * 40 + wdoMomentum * 30)));

  // Global Dollar DXY + Treasury component (35%)
  const dxyComponent = Math.min(100, Math.max(-100, dxyChange * 45 + treasuryChange * 25));

  // Risk aversion component (20%) - High VIX / Geopolitics / Negative Global Sentiment boosts USD
  const riskOffAversionComponent = Math.min(
    100,
    Math.max(
      -100,
      -globalSentiment * 0.4 + vixChange * 15 + (geopoliticsRisk - 50) * 0.8
    )
  );

  // Capital outflow component (15%)
  const outflowComponent = Math.min(100, Math.max(-100, -foreignFlow * 0.2));

  const totalScore = Math.round(
    priceComponent * 0.3 +
      dxyComponent * 0.35 +
      riskOffAversionComponent * 0.2 +
      outflowComponent * 0.15
  );

  const clampedScore = Math.max(-100, Math.min(100, totalScore));

  let classification: BiasClassification = 'NEUTRO';
  let label = 'NEUTRO (EQUILÍBRIO CAMBIAL)';
  if (clampedScore >= 60) {
    classification = 'COMPRA_FORTE';
    label = 'COMPRA FORTE DÓLAR (PRESSÃO COMPRADORA)';
  } else if (clampedScore >= 20) {
    classification = 'VIES_COMPRADOR';
    label = 'VIÉS DE ALTA / COMPRA DÓLAR';
  } else if (clampedScore > -20) {
    classification = 'NEUTRO';
    label = 'NEUTRO / RANGE INDEFINIDO';
  } else if (clampedScore > -60) {
    classification = 'VIES_VENDEDOR';
    label = 'VIÉS DE BAIXA / VENDA DÓLAR';
  } else {
    classification = 'VENDA_FORTE';
    label = 'VENDA FORTE DÓLAR (ALÍVIO CAMBIAL)';
  }

  const drivers: string[] = [];
  if (dxyChange > 0.1) drivers.push(`DXY em alta global (+${dxyChange.toFixed(2)}%)`);
  if (globalSentiment < -20) drivers.push('Aversão a risco externa gerando busca por USD');
  if (wdoReturn > 0.2) drivers.push('Movimentação positiva do spot USD/BRL');
  if (foreignFlow < -100) drivers.push('Saída de fluxo estrangeiro doméstico');

  const confidence = Math.round(Math.min(95, 55 + Math.abs(clampedScore) * 0.38));

  return {
    score: clampedScore,
    classification,
    label,
    confidence,
    drivers,
  };
}

/**
 * Sections 48 & 49: Farol WIN e Farol WDO (Traffic Light)
 * Returns VERDE, AMARELO, or VERMELHO with clear operational context.
 */
export function getTrafficLight(
  biasScore: number,
  hasSevereConflict: boolean = false,
  confidence: number = 70
): { state: TrafficLightState; label: string; description: string } {
  if (hasSevereConflict || confidence < 50 || Math.abs(biasScore) < 25) {
    return {
      state: 'AMARELO',
      label: 'AMARELO // AGUARDAR',
      description: 'Sinais mistos ou confluência insuficiente. Aguardar definição de fluxo.',
    };
  }

  if (biasScore >= 25) {
    return {
      state: 'VERDE',
      label: 'VERDE // COMPRADOR',
      description: 'Condições técnicas e macroeconômicas alinhadas para viés de alta.',
    };
  }

  return {
    state: 'VERMELHO',
    label: 'VERMELHO // VENDEDOR',
    description: 'Condições técnicas e macroeconômicas alinhadas para viés de baixa.',
  };
}
