/**
 * VOLATILITY SPIKE DETECTOR // MOTOR QUANTITATIVO DE DETECÇÃO DE VOLATILIDADE EXTREMA
 * 
 * Monitora em background o fluxo contínuo de cotações dos ativos monitorados (DOL / WDO e IND / WIN),
 * armazena o histórico recente de variações de preço em janela deslizante (rolling window),
 * calcula o desvio padrão das variações (returns std dev) e avalia contra um limiar configurável.
 * 
 * Se o desvio padrão exceder o limiar configurado, dispara o estado de 'Extreme Volatility'.
 */

export interface PriceSample {
  timestamp: number;
  price: number;
}

export interface AssetVolatilityState {
  asset: 'DOL' | 'IND' | string;
  ticker: string;
  currentPrice: number;
  sampleCount: number;
  recentReturns: number[]; // Variações percentuais amostradas (%)
  meanPriceChangePercent: number; // Média das variações
  stdDevPriceChangePercent: number; // Desvio padrão das variações (%)
  thresholdPercent: number; // Limiar configurável (%)
  isExtremeVolatility: boolean; // Flag indicando se stdDev > threshold
  spikeRatio: number; // stdDev / threshold (ex: 1.45x)
  lastSpikeTimestamp: number | null;
  spikeActiveSince: number | null;
  history: Array<{
    timestamp: number;
    formattedTime: string;
    stdDev: number;
    price: number;
    isSpike: boolean;
  }>;
}

export interface VolatilityDetectorConfig {
  dollarThresholdPercent: number; // Default: 0.30%
  indexThresholdPercent: number; // Default: 0.35%
  windowSize: number; // Quantidade de amostras (ex: 15 ticks)
  cooldownSeconds: number; // Tempo mínimo de permanência do badge após pico (ex: 20s)
  soundAlertEnabled: boolean; // Alerta sonoro ao cruzar limiar
}

export const DEFAULT_VOLATILITY_CONFIG: VolatilityDetectorConfig = {
  dollarThresholdPercent: 0.30,
  indexThresholdPercent: 0.35,
  windowSize: 15,
  cooldownSeconds: 25,
  soundAlertEnabled: true,
};

const STORAGE_KEY = 'mcp_volatility_config_v1';
const LEGACY_STORAGE_KEY = 'jarvis_volatility_config_v1';

/**
 * Carrega a configuração do limiar persistida no localStorage ou retorna o default.
 */
export function loadVolatilityConfig(): VolatilityDetectorConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        dollarThresholdPercent:
          typeof parsed?.dollarThresholdPercent === 'number' &&
          !isNaN(parsed.dollarThresholdPercent) &&
          parsed.dollarThresholdPercent > 0
            ? parsed.dollarThresholdPercent
            : DEFAULT_VOLATILITY_CONFIG.dollarThresholdPercent,
        indexThresholdPercent:
          typeof parsed?.indexThresholdPercent === 'number' &&
          !isNaN(parsed.indexThresholdPercent) &&
          parsed.indexThresholdPercent > 0
            ? parsed.indexThresholdPercent
            : DEFAULT_VOLATILITY_CONFIG.indexThresholdPercent,
        windowSize:
          typeof parsed?.windowSize === 'number' &&
          !isNaN(parsed.windowSize) &&
          parsed.windowSize > 0
            ? parsed.windowSize
            : DEFAULT_VOLATILITY_CONFIG.windowSize,
        cooldownSeconds:
          typeof parsed?.cooldownSeconds === 'number' &&
          !isNaN(parsed.cooldownSeconds) &&
          parsed.cooldownSeconds > 0
            ? parsed.cooldownSeconds
            : DEFAULT_VOLATILITY_CONFIG.cooldownSeconds,
        soundAlertEnabled:
          typeof parsed?.soundAlertEnabled === 'boolean'
            ? parsed.soundAlertEnabled
            : DEFAULT_VOLATILITY_CONFIG.soundAlertEnabled,
      };
    }
  } catch (e) {
    console.warn('Falha ao carregar configuração de volatilidade do localStorage:', e);
  }
  return { ...DEFAULT_VOLATILITY_CONFIG };
}

/**
 * Persiste a configuração do limiar no localStorage.
 */
export function saveVolatilityConfig(config: Partial<VolatilityDetectorConfig>): VolatilityDetectorConfig {
  try {
    const current = loadVolatilityConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Falha ao salvar configuração de volatilidade no localStorage:', e);
    return { ...DEFAULT_VOLATILITY_CONFIG, ...config };
  }
}

/**
 * Calcula a média aritmética de uma série numérica.
 */
export function calculateMean(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Calcula o desvio padrão (amostral se N > 1) de uma série numérica.
 * σ = sqrt( sum( (x_i - mean)^2 ) / (N - 1) )
 */
export function calculateStandardDeviation(values: number[]): number {
  if (!values || values.length < 2) return 0;
  const mean = calculateMean(values);
  const sumSquaredDiff = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = sumSquaredDiff / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Converte uma série cronológica de preços em variações percentuais sucessivas (returns %):
 * r_i = ((P_i - P_{i-1}) / P_{i-1}) * 100
 */
export function calculatePriceReturns(prices: number[]): number[] {
  if (!prices || prices.length < 2) return [];
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev > 0) {
      const returnPct = ((curr - prev) / prev) * 100;
      returns.push(returnPct);
    }
  }
  return returns;
}

/**
 * Avalia se o desvio padrão das variações de preço ultrapassa o limiar configurado.
 */
export function evaluatePriceVolatility(
  prices: number[],
  thresholdPercent: number,
  windowSize: number = 15
): {
  returns: number[];
  mean: number;
  stdDev: number;
  isExtremeVolatility: boolean;
  spikeRatio: number;
} {
  // Limita à janela recente
  const windowPrices = prices.slice(-Math.max(windowSize + 1, 3));
  const returns = calculatePriceReturns(windowPrices);

  if (returns.length < 2) {
    return {
      returns,
      mean: 0,
      stdDev: 0,
      isExtremeVolatility: false,
      spikeRatio: 0,
    };
  }

  const mean = calculateMean(returns);
  const stdDev = calculateStandardDeviation(returns);
  const isExtremeVolatility = typeof thresholdPercent === 'number' && thresholdPercent > 0 && stdDev > thresholdPercent;
  const spikeRatio = typeof thresholdPercent === 'number' && thresholdPercent > 0 ? stdDev / thresholdPercent : 0;

  return {
    returns,
    mean: Number.isFinite(mean) ? Number(mean.toFixed(4)) : 0,
    stdDev: Number.isFinite(stdDev) ? Number(stdDev.toFixed(4)) : 0,
    isExtremeVolatility,
    spikeRatio: Number.isFinite(spikeRatio) ? Number(spikeRatio.toFixed(2)) : 0,
  };
}

/**
 * Gera uma série sintética simulada com salto de volatilidade para fins de calibração e teste.
 */
export function generateSyntheticSpikePrices(basePrice: number, asset: 'DOL' | 'IND'): number[] {
  const isDollar = asset === 'DOL';
  const points = 15;
  const prices: number[] = [];
  let current = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : (isDollar ? 5.405 : 134250);

  // Primeiro gera variações suaves
  for (let i = 0; i < 8; i++) {
    const jitter = isDollar ? (Math.random() - 0.5) * 0.004 : (Math.random() - 0.5) * 40;
    current += jitter;
    prices.push(Number(current.toFixed(isDollar ? 3 : 0)));
  }

  // Depois injeta oscilações severas que provocam desvio padrão elevado
  for (let i = 0; i < 7; i++) {
    const jumpMagnitude = isDollar ? 0.035 : 550; // oscilação abrupta
    const sign = i % 2 === 0 ? 1 : -1;
    current += sign * jumpMagnitude;
    prices.push(Number(current.toFixed(isDollar ? 3 : 0)));
  }

  return prices;
}
