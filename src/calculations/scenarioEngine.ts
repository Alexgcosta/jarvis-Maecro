import { ScenarioType } from '../types/macroTypes';

export interface ScenarioInputParams {
  bullishStrength: number; // 0 to 100
  bearishStrength: number; // 0 to 100
  macroTrail: number; // 0 to 100
  riskScore: number; // 0 to 100
  hasSevereDivergence: boolean;
  isStaleOrUnsynced: boolean;
  bullishThreshold?: number; // default 60
  bearishThreshold?: number; // default 60
  macroNeutralMin?: number; // default 45
  macroNeutralMax?: number; // default 55
  riskNeutralMin?: number; // default 45
  riskNeutralMax?: number; // default 55
}

/**
 * Section 23 & 24: Market Scenario Engine (ALTA / BAIXA / AGUARDAR)
 */
export function calculateMarketScenario(params: ScenarioInputParams): {
  scenario: ScenarioType;
  confidence: number;
  reason: string;
  isConfirmed: boolean;
  conditions: {
    label: string;
    passed: boolean;
  }[];
} {
  const {
    bullishStrength,
    bearishStrength,
    macroTrail,
    riskScore,
    hasSevereDivergence,
    isStaleOrUnsynced,
    bullishThreshold = 60,
    bearishThreshold = 60,
    macroNeutralMin = 45,
    macroNeutralMax = 55,
    riskNeutralMin = 45,
    riskNeutralMax = 55,
  } = params;

  // If data is stale or timestamps unsynced, immediately force AGUARDAR
  if (isStaleOrUnsynced) {
    return {
      scenario: 'AGUARDAR',
      confidence: 30,
      reason: 'Dados defasados ou timestamps dessincronizados. Aguardar sincronização das fontes.',
      isConfirmed: false,
      conditions: [
        { label: 'Sincronização de Timestamps', passed: false },
        { label: 'Integridade dos Dados', passed: false },
      ],
    };
  }

  // Evaluate ALTA conditions
  const cAlta1 = bullishStrength >= bullishThreshold;
  const cAlta2 = bullishStrength > bearishStrength;
  const cAlta3 = macroTrail >= macroNeutralMax;
  const cAlta4 = riskScore >= riskNeutralMax;
  const cAlta5 = !hasSevereDivergence;

  const isAlta = cAlta1 && cAlta2 && cAlta3 && cAlta4 && cAlta5;

  // Evaluate BAIXA conditions
  const cBaixa1 = bearishStrength >= bearishThreshold;
  const cBaixa2 = bearishStrength > bullishStrength;
  const cBaixa3 = macroTrail < macroNeutralMin;
  const cBaixa4 = riskScore < riskNeutralMin;
  const cBaixa5 = !hasSevereDivergence;

  const isBaixa = cBaixa1 && cBaixa2 && cBaixa3 && cBaixa4 && cBaixa5;

  if (isAlta) {
    const confidence = Math.round(
      Math.min(95, 55 + (bullishStrength - 50) * 0.5 + (macroTrail - 50) * 0.3 + (riskScore - 50) * 0.3)
    );
    return {
      scenario: 'ALTA',
      confidence,
      reason: 'Força de alta dominante, Macro e Risk alinhados acima de 55 sem divergências severas.',
      isConfirmed: true,
      conditions: [
        { label: `Força de Alta (${bullishStrength}) ≥ ${bullishThreshold}`, passed: cAlta1 },
        { label: `Força Alta > Força Baixa (${bearishStrength})`, passed: cAlta2 },
        { label: `Rastro Macro (${macroTrail}) ≥ ${macroNeutralMax}`, passed: cAlta3 },
        { label: `Risk Score (${riskScore}) ≥ ${riskNeutralMax}`, passed: cAlta4 },
        { label: 'Ausência de Divergência Severa', passed: cAlta5 },
      ],
    };
  }

  if (isBaixa) {
    const confidence = Math.round(
      Math.min(95, 55 + (bearishStrength - 50) * 0.5 + (50 - macroTrail) * 0.3 + (50 - riskScore) * 0.3)
    );
    return {
      scenario: 'BAIXA',
      confidence,
      reason: 'Força de baixa dominante, Macro e Risk deteriorados abaixo de 45.',
      isConfirmed: true,
      conditions: [
        { label: `Força de Baixa (${bearishStrength}) ≥ ${bearishThreshold}`, passed: cBaixa1 },
        { label: `Força Baixa > Força Alta (${bullishStrength})`, passed: cBaixa2 },
        { label: `Rastro Macro (${macroTrail}) < ${macroNeutralMin}`, passed: cBaixa3 },
        { label: `Risk Score (${riskScore}) < ${riskNeutralMin}`, passed: cBaixa4 },
        { label: 'Ausência de Divergência Severa', passed: cBaixa5 },
      ],
    };
  }

  // Default: AGUARDAR (Section 24)
  let reason = 'Forças de mercado próximas ou ambiente macro neutro. Aguardar confirmação de confluência.';
  if (hasSevereDivergence) {
    reason = 'Divergência severa detectada entre preço e macro. Não confirmar cenário direcional.';
  } else if (Math.abs(bullishStrength - bearishStrength) < 15) {
    reason = 'Equilíbrio entre forças compradora e vendedora (Lateralidade).';
  } else if (macroTrail >= macroNeutralMin && macroTrail <= macroNeutralMax) {
    reason = 'Ambiente macroeconômico em faixa neutra (sem direção dominante).';
  }

  return {
    scenario: 'AGUARDAR',
    confidence: 45,
    reason,
    isConfirmed: false,
    conditions: [
      { label: `Força Alta (${bullishStrength}) / Baixa (${bearishStrength})`, passed: false },
      { label: `Rastro Macro (${macroTrail}) em faixa definida`, passed: macroTrail >= 55 || macroTrail <= 45 },
      { label: `Risk Score (${riskScore}) em faixa definida`, passed: riskScore >= 55 || riskScore <= 45 },
      { label: 'Alinhamento Direcional', passed: !hasSevereDivergence },
    ],
  };
}

/**
 * Sections 21 & 22: Cenário Otimista vs Cenário Pessimista (Probabilidade Relativa)
 * CRITICAL: The two percentages MUST strictly sum to 100%!
 */
export function calculateOptimisticPessimisticProbabilities(
  bullishStrength: number,
  bearishStrength: number,
  macroTrail: number,
  riskScore: number
): {
  optimisticPct: number;
  pessimisticPct: number;
  optimisticConditions: string[];
  pessimisticConditions: string[];
} {
  // Composite optimistic weighting
  const optWeight = bullishStrength * 0.45 + macroTrail * 0.3 + riskScore * 0.25;
  // Composite pessimistic weighting
  const pessWeight = bearishStrength * 0.45 + (100 - macroTrail) * 0.3 + (100 - riskScore) * 0.25;

  const totalWeight = optWeight + pessWeight || 100;
  const optimisticPct = Math.round((optWeight / totalWeight) * 100);
  const pessimisticPct = 100 - optimisticPct;

  const optimisticConditions = [
    `Força Alta (${bullishStrength}) ${bullishStrength > bearishStrength ? 'dominando' : 'em teste'}`,
    `Rastro Macro (${macroTrail}/100) ${macroTrail >= 50 ? 'favorável' : 'cauteloso'}`,
    `Risk Score (${riskScore}/100) ${riskScore >= 50 ? 'em expansão' : 'retraído'}`,
    'Alinhamento com bolsas globais e alívio do Dólar',
  ];

  const pessimisticConditions = [
    `Força Baixa (${bearishStrength}) ${bearishStrength > bullishStrength ? 'dominando' : 'em teste'}`,
    `Rastro Macro (${macroTrail}/100) ${macroTrail < 50 ? 'desfavorável' : 'suportado'}`,
    `Risk Score (${riskScore}/100) ${riskScore < 50 ? 'em aversão' : 'controlado'}`,
    'Pressão de taxas de juros (DI/Treasury) e prêmio fiscal',
  ];

  return {
    optimisticPct,
    pessimisticPct,
    optimisticConditions,
    pessimisticConditions,
  };
}

/**
 * Section 30: Hysteresis and Consecutive Updates Confirmation Filter
 */
export class ScenarioHysteresisFilter {
  private currentScenario: ScenarioType = 'AGUARDAR';
  private consecutiveCount: number = 0;
  private targetScenario: ScenarioType = 'AGUARDAR';
  private requiredCount: number = 3;

  constructor(requiredConfirmationCount: number = 3) {
    this.requiredCount = requiredConfirmationCount;
  }

  public update(rawScenario: ScenarioType, rawScore: number): ScenarioType {
    // Hysteresis logic
    if (this.currentScenario === 'ALTA' && rawScore < 48) {
      this.currentScenario = 'AGUARDAR';
      this.consecutiveCount = 0;
    } else if (this.currentScenario === 'BAIXA' && rawScore > 52) {
      this.currentScenario = 'AGUARDAR';
      this.consecutiveCount = 0;
    }

    if (rawScenario === this.targetScenario) {
      this.consecutiveCount++;
      if (this.consecutiveCount >= this.requiredCount) {
        this.currentScenario = rawScenario;
      }
    } else {
      this.targetScenario = rawScenario;
      this.consecutiveCount = 1;
    }

    return this.currentScenario;
  }

  public getCurrent(): ScenarioType {
    return this.currentScenario;
  }
}
