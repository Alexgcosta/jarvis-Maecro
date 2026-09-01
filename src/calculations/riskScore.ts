import { MacroIndicator } from '../types/macroTypes';
import { assertNoCircularity } from './macroCalculations';

/**
 * Section 19: Risk Score (0 to 100)
 * 0: Risk-Off Extremo
 * 25: Risk-Off
 * 50: Neutro
 * 75: Risk-On
 * 100: Risk-On Extremo
 * Inputs: VIX, DXY, S&P 500, Nasdaq, 10Y Yield, Credit/CDS, Commodities, Geopolitics.
 * STRICTLY INDEPENDENT OF WIN / WDO.
 */
export function calculateRiskScore(
  indicators: MacroIndicator[],
  weights: Record<string, number>
): {
  score: number;
  label: 'RISK-OFF EXTREMO' | 'RISK-OFF' | 'NEUTRO' | 'RISK-ON' | 'RISK-ON EXTREMO';
  breakdown: Record<string, number>;
} {
  const riskEligible = indicators.filter((ind) =>
    ['VIX', 'DXY', 'SP500', 'NASDAQ', 'TREASURY10Y', 'CDS_BRASIL', 'BRENT', 'GOLD', 'GEOPOLITICS'].includes(
      ind.id
    )
  );

  assertNoCircularity(riskEligible.map((r) => r.id));

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const breakdown: Record<string, number> = {};

  for (const ind of riskEligible) {
    const w = weights[ind.id] ?? ind.weight;
    let component0to100 = 50; // default neutral

    if (ind.id === 'VIX') {
      // VIX: 12 (extreme risk-on = 95), 15 (risk-on = 75), 20 (neutral = 50), 28 (risk-off = 25), 40 (extreme risk-off = 5)
      const vixVal = ind.value;
      if (vixVal <= 13) component0to100 = 90;
      else if (vixVal <= 16) component0to100 = 75;
      else if (vixVal <= 21) component0to100 = 50;
      else if (vixVal <= 28) component0to100 = 25;
      else component0to100 = 10;
    } else if (ind.id === 'DXY') {
      // DXY: higher = risk-off for global markets
      component0to100 = ind.changePercent < 0 ? 65 + Math.min(25, Math.abs(ind.changePercent) * 25) : 35 - Math.min(25, ind.changePercent * 25);
    } else if (ind.id === 'SP500' || ind.id === 'NASDAQ') {
      component0to100 = ind.changePercent >= 0 ? 55 + Math.min(35, ind.changePercent * 30) : 45 - Math.min(35, Math.abs(ind.changePercent) * 30);
    } else if (ind.id === 'CDS_BRASIL') {
      component0to100 = ind.changePercent < 0 ? 60 : 40;
    } else if (ind.id === 'GEOPOLITICS') {
      const gpr = ind.value; // 0 to 100
      component0to100 = Math.max(10, Math.min(90, 100 - gpr));
    } else {
      // Generic risk-on when global direction is bullish
      if (ind.globalDirection === 'BULLISH') component0to100 = 65;
      else if (ind.globalDirection === 'BEARISH') component0to100 = 35;
      else component0to100 = 50;
    }

    breakdown[ind.id] = Math.round(component0to100);
    totalWeightedScore += component0to100 * w;
    totalWeight += w;
  }

  const score = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 50;
  const clampedScore = Math.max(0, Math.min(100, score));

  let label: 'RISK-OFF EXTREMO' | 'RISK-OFF' | 'NEUTRO' | 'RISK-ON' | 'RISK-ON EXTREMO' = 'NEUTRO';
  if (clampedScore >= 80) label = 'RISK-ON EXTREMO';
  else if (clampedScore >= 60) label = 'RISK-ON';
  else if (clampedScore >= 40) label = 'NEUTRO';
  else if (clampedScore >= 20) label = 'RISK-OFF';
  else label = 'RISK-OFF EXTREMO';

  return {
    score: clampedScore,
    label,
    breakdown,
  };
}
