/**
 * Confluence Calculations for the new WIN x WDO x SENTIMENT x RISK panel
 * Sections 14, 15, 16, 17:
 * - 🟢 Bullish Strength: 0 to 100 (0 = no bullish force, 100 = extreme bullish force)
 * - 🔴 Bearish Strength: 0 to 100 (0 = no bearish force, 100 = extreme bearish force) - NON-NEGATIVE!
 * - 🟡 Risk Score: 0 to 100
 * - 🔵 Macro Trail: 0 to 100
 */

export interface ConfluenceInputParams {
  winReturn: number; // e.g. +0.42 (%)
  winMomentum?: number; // e.g. +0.15 (%)
  wdoReturn: number; // e.g. -0.18 (%)
  wdoMomentum?: number; // e.g. -0.05 (%)
  globalSentimentScore: number; // -100 to +100
  riskScore: number; // 0 to 100
  macroTrail: number; // 0 to 100
  dxyChangePercent?: number; // e.g. +0.18 (%)
  vixChangePercent?: number; // e.g. -2.5 (%)
  spxChangePercent?: number; // e.g. +0.35 (%)
  hasDivergence?: boolean;
}

/**
 * Section 16: Força de Alta (0 to 100)
 */
export function calculateBullishStrength(params: ConfluenceInputParams): number {
  const {
    winReturn,
    winMomentum = 0,
    wdoReturn,
    wdoMomentum = 0,
    riskScore,
    macroTrail,
    spxChangePercent = 0,
    vixChangePercent = 0,
    dxyChangePercent = 0,
    hasDivergence = false,
  } = params;

  let score = 50; // Neutral starting base

  // 1. WIN contribution (+ positive WIN increases bullish strength)
  const winContrib = winReturn * 25 + winMomentum * 15;

  // 2. WDO contribution (- falling WDO increases bullish strength for equities)
  const wdoContrib = -wdoReturn * 20 - wdoMomentum * 10;

  // 3. Macro Trail contribution (0-100 scale: above 50 boosts, below 50 dampens)
  const macroContrib = (macroTrail - 50) * 0.45;

  // 4. Risk Score contribution (0-100 scale: above 50 boosts, below 50 dampens)
  const riskContrib = (riskScore - 50) * 0.45;

  // 5. Global Market Cross-assets (S&P, VIX, DXY)
  const globalContrib = spxChangePercent * 10 - vixChangePercent * 3 - dxyChangePercent * 10;

  score += winContrib + wdoContrib + macroContrib + riskContrib + globalContrib;

  // If severe divergence exists, dampen the extreme
  if (hasDivergence) {
    score = score * 0.85;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Section 17: Força de Baixa (0 to 100)
 * CRITICAL: Must be strictly non-negative! (0 = no bearish force, 100 = extreme bearish force)
 */
export function calculateBearishStrength(params: ConfluenceInputParams): number {
  const {
    winReturn,
    winMomentum = 0,
    wdoReturn,
    wdoMomentum = 0,
    riskScore,
    macroTrail,
    spxChangePercent = 0,
    vixChangePercent = 0,
    dxyChangePercent = 0,
    hasDivergence = false,
  } = params;

  let score = 50; // Neutral starting base

  // 1. WIN falling increases bearish strength
  const winContrib = -winReturn * 25 - winMomentum * 15;

  // 2. WDO rising increases bearish strength for domestic equities
  const wdoContrib = wdoReturn * 20 + wdoMomentum * 10;

  // 3. Macro worsening (macroTrail < 50) increases bearish strength
  const macroContrib = (50 - macroTrail) * 0.45;

  // 4. Risk worsening (riskScore < 50) increases bearish strength
  const riskContrib = (50 - riskScore) * 0.45;

  // 5. Global assets (falling S&P, rising VIX, rising DXY)
  const globalContrib = -spxChangePercent * 10 + vixChangePercent * 3 + dxyChangePercent * 10;

  score += winContrib + wdoContrib + macroContrib + riskContrib + globalContrib;

  if (hasDivergence) {
    score = score * 0.85;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculates normalized Confluence percentage and alignment ratio
 */
export function calculateConfluenceScore(
  bullish: number,
  bearish: number,
  macroTrail: number,
  riskScore: number
): {
  confluencePercentage: number;
  alignedComponents: number;
  totalComponents: number;
  dominantForce: 'ALTA' | 'BAIXA' | 'EQUILIBRADO';
} {
  const isBullishDominant = bullish > bearish + 10;
  const isBearishDominant = bearish > bullish + 10;

  let aligned = 0;
  const total = 4; // WIN/WDO dynamic, Macro, Risk, Dominance

  if (isBullishDominant) {
    if (bullish >= 60) aligned++;
    if (macroTrail >= 50) aligned++;
    if (riskScore >= 50) aligned++;
    if (bearish <= 40) aligned++;
  } else if (isBearishDominant) {
    if (bearish >= 60) aligned++;
    if (macroTrail < 50) aligned++;
    if (riskScore < 50) aligned++;
    if (bullish <= 40) aligned++;
  } else {
    // Balanced
    aligned = 2;
  }

  const confluencePercentage = Math.round((aligned / total) * 100);

  return {
    confluencePercentage,
    alignedComponents: aligned,
    totalComponents: total,
    dominantForce: isBullishDominant ? 'ALTA' : isBearishDominant ? 'BAIXA' : 'EQUILIBRADO',
  };
}
