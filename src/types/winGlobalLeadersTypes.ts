// WIN GLOBAL LEADERS — QUANTITATIVE CONTEXT & CONFLUENCE ENGINE TYPES

export type GlobalLeaderScenario = 'ALTA' | 'AGUARDAR' | 'BAIXA';
export type FarolWinState = 'COMPRA' | 'AGUARDAR' | 'VENDA';
export type FarolWdoState = 'COMPRA_DOLAR' | 'AGUARDAR' | 'VENDA_DOLAR';
export type GammaRegime = 'GAMMA_POSITIVO' | 'GAMMA_NEGATIVO' | 'TRANSICAO';
export type DataFreshness = 'LIVE' | 'DELAYED' | 'STALE' | 'MANUAL' | 'SIMULATED' | 'UNAVAILABLE';

export interface DataQualityEntry<T = number> {
  symbol: string;
  value: T | null;
  formattedValue: string;
  timestamp: string; // ISO 8601 Canonical UTC
  source: string;
  status: DataFreshness;
  latencyMs: number;
}

export interface WinPriceState {
  currentPrice: number;
  sessionOpen: number;
  sessionHigh: number;
  sessionLow: number;
  sessionClose?: number;
  volume?: number;
  returnPercent: number; // ((WIN_CURRENT - WIN_SESSION_OPEN) / WIN_SESSION_OPEN) * 100
  return5m: number;
  return15m: number;
  return30m: number;
  return60m: number;
  momentumScore: number; // -100 to +100
  acceleration: number;
  slope: number;
  distanceFromOpen: number;
  distanceFromHigh: number;
  distanceFromLow: number;
  dailyRangePosition: number; // 0% (at low) to 100% (at high)
  status: DataFreshness;
  lastUpdated: string;
}

export interface WdoPriceState {
  currentPrice: number;
  sessionOpen: number;
  sessionHigh: number;
  sessionLow: number;
  sessionClose?: number;
  returnPercent: number;
  return5m: number;
  return15m: number;
  return30m: number;
  return60m: number;
  momentumScore: number; // -100 to +100
  relationshipWithWin: 'RISK_ON_BRASIL' | 'RISK_OFF_BRASIL' | 'FLUXO_MISTO_ALTA' | 'FLUXO_MISTO_BAIXA';
  relationshipDescription: string;
  status: DataFreshness;
  lastUpdated: string;
}

export interface Bova11State {
  price: number;
  returnPercent: number;
  changePercent?: number;
  momentumScore: number; // -100 to +100
  correlationWithWin: number; // 0.96 to 0.98
  correlationToWin?: number;
  betaWithWin: number; // ~1.02
  betaToWin?: number;
  volumeBrl: number; // Volume negociado em milhões BRL
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  vwap?: number;
  flowDirection?: 'COMPRADOR' | 'VENDEDOR' | 'NEUTRO';
  contributionPoints?: number;
  supportLevel?: number;
  resistanceLevel?: number;
  status: DataFreshness;
  lastUpdated: string;
}

export interface EwzGexState {
  price: number;
  returnPercent: number;
  momentumScore: number; // -100 to +100
  ma50: number;
  ma100: number;
  ma200: number;
  rsi: number;
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  iv: number; // Implied Volatility % e.g. 26.5%
  hv: number; // Historical Volatility % e.g. 21.8%
  ivHvRatio: number;
  ivHvSpread: number;
  ivPercentile: number; // 0 to 100
  expectedMove: number;
  expectedMoveUp: number;
  expectedMoveDown: number;
  
  // GEX strikes (EWZ Strikes)
  putWallStrike: number;
  gammaFlipStrike: number;
  callWallStrike: number;
  
  // Regime & Score
  gammaRegime: GammaRegime;
  gammaScore: number; // -100 to +100
  
  // EWZ GEX -> WIN PROXY (Statistically projected strike proxy to WIN)
  winPutWallProxy: number;
  winGammaFlipProxy: number;
  winCallWallProxy: number;
  betaEwzWin: number;
  
  // Statistical Volatility Zones for WIN
  winIvPlus05Sigma: number;
  winIvMinus05Sigma: number;
  winIvPlus1Sigma: number;
  winIvMinus1Sigma: number;
  winHvPlus05Sigma: number;
  winHvMinus05Sigma: number;
  winHvPlus1Sigma: number;
  winHvMinus1Sigma: number;
  
  isManual: boolean;
  manualTimestamp?: string;
  status: DataFreshness;
}

export interface AdrItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  momentumScore: number; // -100 to +100
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  relativeStrength: number;
  weight: number; // e.g. VALE=25, PBR=25, ITUB=20, BBD=15, ABEV=5, OUTROS=10
  status: DataFreshness;
}

export interface CommodityItem {
  id: string;
  name: string;
  ticker: string;
  price: number;
  changePercent: number;
  momentumScore: number;
  trend: 'ALTA' | 'BAIXA' | 'LATERAL';
  volatility: number;
  score: number; // -100 to +100
  status: DataFreshness;
}

export interface CommoditiesEngineState {
  ironOreScore: number; // -100 to +100
  netOilScore: number; // -100 to +100
  oilBrazilBenefit: number; // Petrobras/tax benefit
  oilInflationRisk: number; // Inflation/Rates pressure
  goldScore: number; // Hedge/Risk-off proxy
  copperScore: number; // Industrial activity/China proxy
  soyScore: number; // Agro/China/Brazil export proxy
  compositeCommodityScore: number; // -100 to +100
  items: CommodityItem[];
}

export interface CorrelationEngineItem {
  pair: string;
  assetName: string;
  corr5d: number; // 40% weight
  corr10d: number; // 30% weight
  corr20d: number; // 20% weight
  corr60d: number; // 10% weight
  dynamicCorrelation: number; // Weighted average
  stabilityScore: number; // 0 to 100% (High = consistent across windows)
  stabilityClass: 'ALTA' | 'MODERADA' | 'INSTAVEL';
  effectiveWeight: number;
}

export interface BetaEngineItem {
  asset: string;
  betaDynamic: number;
  betaManual: number;
  isDynamic: boolean;
  rSquared: number;
}

export interface LeadLagItem {
  driver: string;
  target: 'WIN';
  bestLagMinutes: 5 | 15 | 30 | 60;
  correlationAtLag: number;
  statisticalPrecedence: boolean;
  stability: number; // 0-100%
  sampleSize: number;
  notes: string;
}

export interface DivergenceItemState {
  id: string;
  type: 'WIN_X_EWZ' | 'WIN_X_ADR' | 'WIN_X_MACRO' | 'WIN_X_RISK' | 'WIN_X_WDO';
  title: string;
  description: string;
  severity: 'LEVE' | 'MODERADA' | 'SEVERA';
  detectedAt: string;
  status: 'ATIVA' | 'RESOLVIDA';
}

export interface ConfluenceGroupAlignment {
  groupId: 'PRICE' | 'EWZ' | 'ADR' | 'COMMODITIES' | 'FX' | 'VOLATILITY' | 'GLOBAL' | 'BRAZIL' | 'FLOW';
  groupName: string;
  status: 'ALINHADO_ALTA' | 'ALINHADO_BAIXA' | 'NEUTRO';
  weight: number;
  score: number;
  summary: string;
}

export interface LeaderRankItem {
  id: string;
  name: string;
  symbol: string;
  changePercent: number;
  contributionToWin: number; // positive or negative points
  alignment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weight: number;
  correlation: number;
}

export interface WinGlobalLeadersState {
  // 1. Core Scores
  winGlobalScore: number; // -100 to +100
  bullishStrength: number; // 0 to 100
  bearishStrength: number; // 0 to 100
  confluenceScore: number; // 0 to 100% (Alignment of 9 independent groups)
  confidence: number; // 0 to 100%
  globalRiskScore: number; // 0 to 100 (0=Risk-Off extremo, 50=Neutro, 100=Risk-On extremo)
  brazilMarketScore: number; // -100 to +100
  ewzScore: number; // -100 to +100
  adrScore: number; // -100 to +100
  commodityScore: number; // -100 to +100
  fxScore: number; // -100 to +100
  volatilityScore: number; // -100 to +100
  macroTrail: number; // 0 to 100 (Purely global, strictly NO circularity from WIN)
  foreignFlowScore: number; // -100 to +100
  brazilRatesScore: number; // -100 to +100
  
  // 2. Market Scenario & Farol
  scenario: GlobalLeaderScenario; // 🟢 ALTA, 🟡 AGUARDAR, 🔴 BAIXA
  scenarioReason: string;
  consecutiveScenarioTicks: number;
  farolWin: FarolWinState;
  farolWinReason: string;
  farolWdo: FarolWdoState;
  farolWdoReason: string;
  
  // 3. Components
  winPriceState: WinPriceState;
  wdoPriceState: WdoPriceState;
  bova11State: Bova11State;
  ewzGexState: EwzGexState;
  adrs: AdrItem[];
  commodities: CommoditiesEngineState;
  confluenceGroups: ConfluenceGroupAlignment[];
  leaderRanking: LeaderRankItem[];
  correlations: CorrelationEngineItem[];
  betas: BetaEngineItem[];
  leadLags: LeadLagItem[];
  divergences: DivergenceItemState[];
  
  // 4. Executive Quantitative Synthesis
  executiveSynthesis: {
    title: string;
    summary: string;
    whoIsLeading: string;
    whoIsConfirming: string;
    whoIsDiverging: string;
    primaryRisk: string;
    invalidationTrigger: string;
    timestamp: string;
  };
  jarvisInterpretation: {
    title: string;
    summary: string;
    whoIsLeading: string;
    whoIsConfirming: string;
    whoIsDiverging: string;
    primaryRisk: string;
    invalidationTrigger: string;
    timestamp: string;
  };
  
  // 5. Data Quality & Timestamps
  timestamp: string; // Canonical UTC ISO
  formattedTimeSaoPaulo: string; // "HH:MM:SS"
  dataQualityOverall: DataFreshness;
  activeFactorCoveragePercent: number; // Must be >= 60% to avoid forced AGUARDAR
}

export interface IntradayConfluenceTimelinePoint {
  timestamp: string; // ISO
  formattedTime: string; // HH:MM
  winPrice: number;
  winReturn: number;
  wdoReturn: number;
  bullishStrength: number; // 0 to 100
  bearishStrength: number; // 0 to 100
  netScorePercent: number; // Confluência Líquida -100.0% a +100.0% (degraus de 0.5%)
  globalRiskScore: number; // 0 to 100
  macroTrail: number; // 0 to 100
  confluenceScore: number; // %
  scenario: GlobalLeaderScenario;
  marker?: 'ALTA_ASSUMIU' | 'BAIXA_ASSUMIU' | 'CONFLUENCIA_PERDIDA' | 'DIVERGENCIA' | null;
  markerReason?: string;
  isCurrentNow?: boolean;
}

export interface BacktestTradeResult {
  id: string;
  entryTimestamp: string;
  entryFormattedTime: string;
  signalScenario: GlobalLeaderScenario;
  entryWinPrice: number;
  return5m: number;
  return15m: number;
  return30m: number;
  return60m: number;
  points5m: number;
  points15m: number;
  points30m: number;
  points60m: number;
  mae: number; // Maximum Adverse Excursion (Points against)
  mfe: number; // Maximum Favorable Excursion (Points in favor)
  outcome: 'GAIN' | 'LOSS' | 'NEUTRO';
  confluenceAtEntry: number;
  confidenceAtEntry: number;
  wasConfirmed: boolean;
  timeToConfirmationMin: number;
  timeToInvalidationMin?: number;
}

export interface BacktestSummary {
  totalSignals: number;
  bullishSignals: number;
  bearishSignals: number;
  neutralAguardarCount: number;
  winRatePercent: number;
  profitFactor: number;
  avgGainPoints: number;
  avgLossPoints: number;
  maxDrawdownPoints: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  avgMaePoints: number;
  avgMfePoints: number;
  trades: BacktestTradeResult[];
}
