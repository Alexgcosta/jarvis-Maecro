import { assertNoCircularity, calculateGlobalSentiment, calculateMacroTrail } from '../macroCalculations';
import { calculateRiskScore } from '../riskScore';
import { calculateWinBias, calculateWdoBias, getTrafficLight } from '../biasCalculations';
import { calculateBullishStrength, calculateBearishStrength } from '../confluenceCalculations';
import { calculateMarketScenario, calculateOptimisticPessimisticProbabilities } from '../scenarioEngine';
import { detectDivergences } from '../divergenceDetection';
import {
  calculateStandardDeviation,
  calculatePriceReturns,
  evaluatePriceVolatility,
} from '../volatilitySpikeDetector';
import { INITIAL_MACRO_INDICATORS, DEFAULT_WEIGHTS } from '../../data/indicatorsRegistry';

/**
 * In-memory test assertions suite for verification of all quantitative constraints (Sections 71, 72, 73)
 */
export function runMacroCalculationsTestSuite(): { passed: boolean; logs: string[] } {
  const logs: string[] = [];
  let passed = true;

  const logTest = (name: string, success: boolean, detail?: string) => {
    if (success) {
      logs.push(`✓ [PASS] ${name}`);
    } else {
      passed = false;
      logs.push(`✗ [FAIL] ${name} ${detail ? `(${detail})` : ''}`);
    }
  };

  // 1. Test Principle of Non-Circularity (Section 71)
  try {
    assertNoCircularity(['DXY', 'VIX', 'SP500', 'TREASURY10Y']);
    logTest('assertNoCircularity accepts valid macro keys', true);
  } catch (err: any) {
    logTest('assertNoCircularity accepts valid macro keys', false, err.message);
  }

  try {
    assertNoCircularity(['DXY', 'WIN', 'SP500']);
    logTest('assertNoCircularity blocks WIN instrument in macro calculation', false, 'Expected throw');
  } catch {
    logTest('assertNoCircularity blocks WIN instrument in macro calculation', true);
  }

  // 2. Test Bullish & Bearish Strengths (Sections 14, 16, 17)
  const bull = calculateBullishStrength({
    winReturn: 0.42,
    winMomentum: 0.15,
    wdoReturn: -0.18,
    wdoMomentum: -0.05,
    globalSentimentScore: 48,
    riskScore: 66,
    macroTrail: 65,
    spxChangePercent: 0.35,
    vixChangePercent: -2.15,
    dxyChangePercent: -0.12,
  });

  const bear = calculateBearishStrength({
    winReturn: 0.42,
    winMomentum: 0.15,
    wdoReturn: -0.18,
    wdoMomentum: -0.05,
    globalSentimentScore: 48,
    riskScore: 66,
    macroTrail: 65,
    spxChangePercent: 0.35,
    vixChangePercent: -2.15,
    dxyChangePercent: -0.12,
  });

  logTest('Bullish Strength is higher than Bearish Strength in positive setup', bull > bear);
  logTest('Bearish Strength is strictly non-negative (>= 0)', bear >= 0);
  logTest('Bullish Strength is bounded (0-100)', bull >= 0 && bull <= 100);

  // 3. Test Scenario Engine (Sections 21, 22, 23, 24)
  const altaScen = calculateMarketScenario({
    bullishStrength: 72,
    bearishStrength: 24,
    macroTrail: 65,
    riskScore: 66,
    hasSevereDivergence: false,
    isStaleOrUnsynced: false,
  });
  logTest('Scenario resolves to ALTA when Bullish >= 60, Macro >= 55, Risk >= 55', altaScen.scenario === 'ALTA');

  const baixaScen = calculateMarketScenario({
    bullishStrength: 22,
    bearishStrength: 78,
    macroTrail: 34,
    riskScore: 32,
    hasSevereDivergence: false,
    isStaleOrUnsynced: false,
  });
  logTest('Scenario resolves to BAIXA when Bearish >= 60, Macro < 45, Risk < 45', baixaScen.scenario === 'BAIXA');

  const aguardarDivergence = calculateMarketScenario({
    bullishStrength: 65,
    bearishStrength: 35,
    macroTrail: 70,
    riskScore: 68,
    hasSevereDivergence: true,
    isStaleOrUnsynced: false,
  });
  logTest('Scenario resolves to AGUARDAR when severe divergence is present', aguardarDivergence.scenario === 'AGUARDAR');

  const aguardarStale = calculateMarketScenario({
    bullishStrength: 75,
    bearishStrength: 25,
    macroTrail: 70,
    riskScore: 68,
    hasSevereDivergence: false,
    isStaleOrUnsynced: true,
  });
  logTest('Scenario resolves to AGUARDAR when data is stale or unsynced', aguardarStale.scenario === 'AGUARDAR');

  // 4. Test Optimistic vs Pessimistic Probabilities sum to 100% (Sections 21, 22)
  const probs = calculateOptimisticPessimisticProbabilities(bull, bear, 65, 66);
  logTest('Optimistic % + Pessimistic % exactly equals 100%', probs.optimisticPct + probs.pessimisticPct === 100);

  // 5. Test Divergence Detection (Section 29)
  const divRes = detectDivergences({
    winReturn: -0.40,
    wdoReturn: -0.15,
    macroTrail: 72,
    riskScore: 68,
    timestamp: '2026-08-28T10:45:00-03:00',
    formattedTime: '10:45',
  });
  logTest('Divergence detected when WIN recua (-0.40%) but Macro is positive (72)', divRes.divergences.length > 0);

  // 6. Test Volatility Spike Detector (Standard Deviation of Price Changes > Configurable Threshold)
  const sampleReturns = [0.1, -0.1, 0.15, -0.2, 0.05];
  const stdDev = calculateStandardDeviation(sampleReturns);
  logTest('calculateStandardDeviation computes positive variance for variable returns', stdDev > 0);

  // Volatility normal: steady prices
  const calmPrices = [5.400, 5.401, 5.402, 5.401, 5.402, 5.403, 5.402];
  const calmVol = evaluatePriceVolatility(calmPrices, 0.30, 15);
  logTest('evaluatePriceVolatility evaluates calm series below threshold (isExtremeVolatility = false)', !calmVol.isExtremeVolatility);

  // Volatility spike: high fluctuations exceeding 0.30% threshold
  const volatilePrices = [5.400, 5.440, 5.370, 5.450, 5.360, 5.460, 5.350];
  const volatileVol = evaluatePriceVolatility(volatilePrices, 0.30, 15);
  logTest('evaluatePriceVolatility detects spike when stdDev exceeds threshold (isExtremeVolatility = true)', volatileVol.isExtremeVolatility);
  logTest('evaluatePriceVolatility calculates correct spike ratio > 1.0', volatileVol.spikeRatio > 1.0);

  return { passed, logs };
}
