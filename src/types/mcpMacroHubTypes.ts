/**
 * MCP Macro Hub Types & Canonical Schemas
 * Standardized data models for professional quantitative macro intelligence
 * targeting WIN, WDO, and DOL contracts.
 */

export type MacroCategory = 'GLOBAL' | 'BRASIL' | 'COMMODITIES' | 'POLÍTICA MONETÁRIA';

export type MacroTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type MacroImpact = 'POSITIVE_USD' | 'NEGATIVE_USD' | 'POSITIVE_WIN' | 'NEGATIVE_WIN' | 'NEUTRAL';

export type MarketRegimeType = 'RISK ON' | 'RISK OFF' | 'NEUTRO' | 'TRANSIÇÃO';

export type TrafficLightSignal = 'COMPRA FORTE' | 'COMPRA' | 'NEUTRO' | 'VENDA' | 'VENDA FORTE';

export type DataQualityStatus = 'ONLINE' | 'DELAYED' | 'UNAVAILABLE';

/**
 * Standardized canonical asset model adhering to Section 3:
 * 20 required analytical and quantitative properties.
 */
export interface StandardizedMacroAsset {
  ticker: string;
  nome: string;
  categoria: MacroCategory;
  precoAtual: number;
  precoAnterior: number;
  variacaoAbsoluta: number;
  variacaoPercentual: number;
  timestamp: string;
  fonte: string;
  frequencia: string;
  tendencia: MacroTrend;
  volatilidade: number; // Volatilidade anualizada ou intraday em %
  momentum: number; // Score de momento ponderado (-100 a +100)
  zScore: number; // Desvio da média móvel em sigma (-3.0 a +3.0)
  correlacaoComWin: number; // Correlação de Pearson com o WIN (-1.0 a +1.0)
  correlacaoComWdo: number; // Correlação de Pearson com o WDO (-1.0 a +1.0)
  beta: number; // Sensibilidade estatística
  impactoMacro: MacroImpact;
  peso: number; // Peso ponderado no Macro Hub (0 a 100%)
  score: number; // Pontuação unitária do ativo (0 a 100)
  confianca: number; // Nível de precisão e frescor (0.0 a 1.0)
  qualidadeStatus: DataQualityStatus;
  latenciaMs: number;
}

/**
 * Correlation pair model across multiple time horizons
 */
export interface DynamicCorrelationPair {
  pair: string; // Ex: "EWZ × WIN", "DXY × WDO"
  assetA: string;
  assetB: string;
  currentCorrelation: number;
  corr20: number; // Correlação de 20 períodos
  corr50: number; // Correlação de 50 períodos
  corr100: number; // Correlação de 100 períodos
  corrIntraday: number; // Correlação das últimas barras de 5 min
  historicalMean: number;
  variation: number; // Desvio da média histórica
  status: 'CORRELAÇÃO FORTE' | 'CORRELAÇÃO MODERADA' | 'CORRELAÇÃO FRACA' | 'INVERSÃO RELEVANTE';
  confidence: number; // 0 a 100%
  isDivergent: boolean;
}

/**
 * Market Regime Detection Model
 */
export interface MacroRegimeState {
  regime: MarketRegimeType;
  strengthPercent: number; // Força do regime (0 a 100%)
  confidencePercent: number; // Nível de confiança (0 a 100%)
  summary: string;
  justifyingFactors: string[];
  lastTransitionTimestamp: string;
}

/**
 * Audit score block breakdown (0 to 100)
 */
export interface MacroScoreBlocks {
  dolarGlobal: number;
  riscoGlobal: number;
  jurosEua: number;
  riscoBrasil: number;
  commodities: number;
  bolsaGlobal: number;
}

/**
 * Individual factor contribution for complete score auditability (Section 25)
 */
export interface ScoreFactorContribution {
  indicator: string;
  ticker: string;
  points: number; // Contribuição em pontos (+ ou -)
  weightPercent: number;
  direction: MacroTrend;
  description: string;
}

/**
 * Specific Analysis Model for WIN, WDO and DOL
 */
export interface ContractMacroContext {
  contract: 'WIN' | 'WDO' | 'DOL';
  bias: 'COMPRA' | 'VENDA' | 'NEUTRO';
  signal: TrafficLightSignal;
  macroScore: number; // Ex: -72
  strength: number; // 0 a 100
  confidence: number; // 0 a 100%
  confirmationsCount: number; // Ex: 8
  confirmationsTotal: number; // Ex: 10
  divergencesCount: number;
  regime: MarketRegimeType;
  topFactors: ScoreFactorContribution[];
  confirmations: string[];
  divergences: string[];
  risks: string[];
  favorableFactors: string[];
  contraryFactors: string[];
  updatedAt: string;
}

/**
 * Divergence Alert Model
 */
export interface MacroDivergenceAlert {
  id: string;
  timestamp: string;
  asset: string;
  direction: 'ALTA' | 'BAIXA';
  type: 'ALERTA DE DIVERGÊNCIA MACRO' | 'POSSÍVEL DIVERGÊNCIA DE ALTA' | 'POSSÍVEL DIVERGÊNCIA DE BAIXA';
  description: string;
  divergentIndicators: string[];
  intensity: 'ALTA' | 'MÉDIA' | 'CRÍTICA';
  confidence: number;
  active: boolean;
}

/**
 * Step in the 14-stage automated Panorama Macro pipeline
 */
export interface PanoramaPipelineStep {
  step: number;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs: number;
  detail: string;
}

/**
 * Automated Macro Panorama outcome (Section 11)
 */
export interface GeneratedMacroPanorama {
  timestamp: string;
  regime: MarketRegimeType;
  dollarStatus: 'MUITO FORTE' | 'FORTE' | 'NEUTRO' | 'FRACO' | 'MUITO FRACO';
  winBias: 'VIÉS DE COMPRA' | 'VIÉS DE VENDA' | 'VIÉS NEUTRO';
  wdoBias: 'VIÉS DE COMPRA' | 'VIÉS DE VENDA' | 'VIÉS NEUTRO';
  confidencePercent: number;
  executiveSummary: string;
  stepsExecution: PanoramaPipelineStep[];
}

/**
 * Macro Backtest Query & Outcome (Section 12)
 */
export interface MacroBacktestFilter {
  asset: 'WIN' | 'WDO' | 'DOL';
  periodDays: number;
  regimeFilter?: MarketRegimeType | 'ALL';
  minScore?: number;
  conditionVixHigh?: boolean; // VIX > 25
  conditionDxyAboveMa20?: boolean; // DXY > MA20
  conditionEwzBelowMa20?: boolean; // EWZ < MA20
  conditionCdsRising?: boolean; // CDS Brasil subindo
}

export interface MacroBacktestResult {
  asset: 'WIN' | 'WDO' | 'DOL';
  sampleOccurrences: number;
  winBullishPercent: number;
  winBearishPercent: number;
  winNeutralPercent: number;
  avgReturnPoints: number;
  profitFactor: number;
  maxDrawdownPoints: number;
  notes: string;
}

/**
 * MCP Tool Definition & Response
 */
export interface McpMacroToolDefinition {
  name: string;
  description: string;
  category: 'ASSET_QUERY' | 'QUANT_CALCULATION' | 'REGIME_DIVERGENCE' | 'PANORAMA_ANALYSIS';
  parameters: Record<string, any>;
}

export interface McpToolStructuredResponse<T = any> {
  tool: string;
  status: 'SUCCESS' | 'ERROR';
  data?: T;
  error?: string;
  sourceTimestamp: string;
  confidence: number;
}
