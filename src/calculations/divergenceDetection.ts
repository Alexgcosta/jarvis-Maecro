import { DivergenceItem, MarketCrossing } from '../types/macroTypes';

export function detectDivergences(params: {
  winReturn: number;
  wdoReturn: number;
  macroTrail: number; // 0 to 100
  riskScore: number; // 0 to 100
  timestamp: string;
  formattedTime: string;
}): {
  hasSevereDivergence: boolean;
  divergences: DivergenceItem[];
  crossings: MarketCrossing[];
} {
  const { winReturn, wdoReturn, macroTrail, riskScore, timestamp, formattedTime } = params;
  const divergences: DivergenceItem[] = [];

  const isWinUp = winReturn > 0.15;
  const isWinDown = winReturn < -0.15;
  const isWdoUp = wdoReturn > 0.15;
  const isWdoDown = wdoReturn < -0.15;
  const isMacroPositive = macroTrail >= 55;
  const isMacroNegative = macroTrail <= 45;
  const isRiskOn = riskScore >= 55;
  const isRiskOff = riskScore <= 45;

  // 1. WIN vs Macro
  if (isWinUp && isMacroNegative) {
    divergences.push({
      id: 'div-win-macro-neg',
      type: 'PREÇO vs MACRO',
      pair: 'WIN ↑ / MACRO ↓',
      description: 'WIN em alta sustentada enquanto o ambiente macro global está deteriorando. Risco de repique técnico sem fundamento macro.',
      severity: 'ALTA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  } else if (isWinDown && isMacroPositive) {
    divergences.push({
      id: 'div-win-macro-pos',
      type: 'PREÇO vs MACRO',
      pair: 'WIN ↓ / MACRO ↑',
      description: 'Ambiente macro favorável, porém o WIN está recuando. Possível pressão pontual de fluxo doméstico ou realização.',
      severity: 'MODERADA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  }

  // 2. WDO vs Macro
  if (isWdoUp && isMacroPositive) {
    divergences.push({
      id: 'div-wdo-macro-pos',
      type: 'CÂMBIO vs MACRO',
      pair: 'WDO ↑ / MACRO ↑',
      description: 'Dólar subindo em meio a macro global favorável. Indica pressão específica de prêmio de risco Brasil ou saída pontual de capital.',
      severity: 'MODERADA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  } else if (isWdoDown && isMacroNegative) {
    divergences.push({
      id: 'div-wdo-macro-neg',
      type: 'CÂMBIO vs MACRO',
      pair: 'WDO ↓ / MACRO ↓',
      description: 'Dólar em queda apesar de aversão global. Pode indicar intervenção cambial ou forte diferencial de juros (Selic).',
      severity: 'BAIXA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  }

  // 3. WIN vs WDO (Correlated direction)
  if (isWinUp && isWdoUp) {
    divergences.push({
      id: 'div-win-wdo-both-up',
      type: 'FLUXO CRUZADO',
      pair: 'WIN ↑ / WDO ↑',
      description: 'Fluxo misto atípico: tanto WIN quanto WDO estão subindo simultaneamente. Mercado sem consenso direcional único.',
      severity: 'MODERADA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  } else if (isWinDown && isWdoDown) {
    divergences.push({
      id: 'div-win-wdo-both-down',
      type: 'FLUXO CRUZADO',
      pair: 'WIN ↓ / WDO ↓',
      description: 'Ambos os ativos recuando simultaneamente. Típico de ajuste amplo de posições ou realização sem fluxo direcionado.',
      severity: 'BAIXA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  }

  // 4. Risk vs Price
  if (isRiskOn && isWinDown) {
    divergences.push({
      id: 'div-risk-win-down',
      type: 'RISK vs WIN',
      pair: 'RISK ↑ / WIN ↓',
      description: 'Apetite a risco global elevado (Risk-On), mas Bolsa brasileira atrasada ou sob ruído político local.',
      severity: 'MODERADA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  } else if (isRiskOff && isWinUp) {
    divergences.push({
      id: 'div-risk-win-up',
      type: 'RISK vs WIN',
      pair: 'RISK ↓ / WIN ↑',
      description: 'Aversão externa ao risco (Risk-Off), porém Bolsa brasileira subindo. Exige cautela com falsos rompimentos.',
      severity: 'ALTA',
      timestamp,
      formattedTime,
      status: 'ATIVA',
    });
  }

  // Evaluate Crossings (Sections 25, 26, 27)
  const crossings: MarketCrossing[] = [];

  // WIN x WDO Crossing
  if (isWinUp && isWdoDown) {
    crossings.push({
      id: 'cross-win-wdo',
      pairName: 'WIN × WDO',
      status: 'CONFIRMADO',
      color: 'VERDE',
      text: 'WIN ↑ + WDO ↓ (Confirmação clássica de ALTA / Risk-On)',
    });
  } else if (isWinDown && isWdoUp) {
    crossings.push({
      id: 'cross-win-wdo',
      pairName: 'WIN × WDO',
      status: 'CONFIRMADO',
      color: 'VERMELHO',
      text: 'WIN ↓ + WDO ↑ (Confirmação clássica de BAIXA / Defensivo)',
    });
  } else {
    crossings.push({
      id: 'cross-win-wdo',
      pairName: 'WIN × WDO',
      status: 'MISTO',
      color: 'AMARELO',
      text: 'Fluxo misto ou lateralidade entre WIN e WDO',
    });
  }

  // MACRO x PREÇO Crossing
  if ((isMacroPositive && isWinUp) || (isMacroNegative && isWinDown)) {
    crossings.push({
      id: 'cross-macro-price',
      pairName: 'MACRO × PREÇO',
      status: 'CONFIRMADO',
      color: isMacroPositive ? 'VERDE' : 'VERMELHO',
      text: isMacroPositive
        ? 'Macro ↑ + WIN ↑ (Confluência Macro Confirmada)'
        : 'Macro ↓ + WIN ↓ (Pressão Macro Confirmada)',
    });
  } else {
    crossings.push({
      id: 'cross-macro-price',
      pairName: 'MACRO × PREÇO',
      status: 'DIVERGENTE',
      color: 'AMARELO',
      text: 'Divergência detectada entre direção Macro e variação de Preço',
    });
  }

  // RISK x PREÇO Crossing
  if ((isRiskOn && isWinUp) || (isRiskOff && isWinDown)) {
    crossings.push({
      id: 'cross-risk-price',
      pairName: 'RISK × PREÇO',
      status: 'CONFIRMADO',
      color: isRiskOn ? 'VERDE' : 'VERMELHO',
      text: isRiskOn ? 'Risk-On ↑ + WIN ↑ (Alinhamento Total)' : 'Risk-Off ↓ + WIN ↓ (Alinhamento Defensivo)',
    });
  } else {
    crossings.push({
      id: 'cross-risk-price',
      pairName: 'RISK × PREÇO',
      status: 'DIVERGENTE',
      color: 'AMARELO',
      text: 'Descompasso entre apetite global de risco e comportamento do ativo',
    });
  }

  const hasSevereDivergence = divergences.some((d) => d.severity === 'ALTA');

  return {
    hasSevereDivergence,
    divergences,
    crossings,
  };
}
