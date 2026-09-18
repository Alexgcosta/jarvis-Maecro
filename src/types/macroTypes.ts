// GLOBAL EYE - RASTREADOR MACRO // TypeScript Type Definitions

export type IndicatorWeightConfig = Record<string, number>;

export type MarketSessionStatus = 'REGULAR' | 'AFTER_MARKET' | 'CLOSED';

export type DataFreshnessStatus = 'LIVE' | 'DELAYED' | 'STALE' | 'SIMULATED';

export type ScenarioType = 'ALTA' | 'BAIXA' | 'AGUARDAR';

export type TrafficLightState = 'VERDE' | 'AMARELO' | 'VERMELHO';

export type BiasClassification =
  | 'COMPRA_FORTE'
  | 'VIES_COMPRADOR'
  | 'NEUTRO'
  | 'VIES_VENDEDOR'
  | 'VENDA_FORTE';

export type SentimentClassification =
  | 'EXTREMO_RISK_ON'
  | 'RISK_ON'
  | 'OTIMISMO_MODERADO'
  | 'NEUTRO'
  | 'PESSIMISMO_MODERADO'
  | 'RISK_OFF'
  | 'EXTREMO_RISK_OFF';

export type IndicatorCategory =
  | 'CURRENCY'
  | 'INDEX'
  | 'VOLATILITY'
  | 'RATES'
  | 'COMMODITY'
  | 'RISK'
  | 'MACRO_POLICY'
  | 'STOCKS_B3'
  | 'ADRS'
  | 'SPREAD';

export type MacroBasketGroup =
  | 'GLOBAL_RISK'       // 🌎 Exterior / risco global
  | 'BRAZIL_WIN_IMPACT' // 🇧🇷 Brasil / ativos que impactam o WIN
  | 'COMMODITIES'       // 🏭 Commodities importantes para o Brasil
  | 'BRAZILIAN_ADRS'    // 🇺🇸 ADRs brasileiras
  | 'FX_RISK_BRAZIL';   // 💵 Câmbio e risco Brasil

export interface MacroIndicator {
  id: string;
  key?: string;
  symbol?: string;
  polarity?: 'DIRECT' | 'INVERSE' | 'NEUTRAL';
  name: string;
  ticker: string;
  category: IndicatorCategory;
  basketGroup?: MacroBasketGroup;
  maisRetornoIdentifier?: string;
  value: number;
  formattedValue: string;
  changePercent: number;
  change5d?: number;
  weight: number;
  globalDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  brazilDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  winDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  wdoDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  interpretation: string;
  timestamp: string; // Canonical ISO timestamp
  formattedTime: string; // e.g. "10:45"
  source: string;
  delayMinutes: number;
  status: DataFreshnessStatus;
}

export interface ConfluencePoint {
  timestamp: string; // Canonical ISO e.g. "2026-08-28T10:45:00-03:00"
  formattedTime: string; // "10:45"
  winReturn: number | null; // e.g. +0.42 (%)
  wdoReturn: number | null; // e.g. -0.18 (%)
  bullishStrength: number | null; // 0 to 100 or null for future points
  bearishStrength: number | null; // 0 to 100 (non-negative) or null for future points
  riskScore: number | null; // 0 to 100 or null for future points
  macroTrail: number | null; // 0 to 100 or null for future points
  scenario: ScenarioType;
  confluencePercentage: number | null;
  confidence: number | null;
  dataQuality: DataFreshnessStatus;
  divergenceFlag?: boolean;
  marker?: 'ALTA_ASSUMIU' | 'BAIXA_ASSUMIU' | 'CONFLUENCIA_PERDIDA' | 'ABERTURA_MERCADO' | 'ABERTURA_ACOES' | 'ABERTURA_NY' | 'AJUSTE_DIARIO' | 'FECHAMENTO_B3' | null;
  isCurrentNow?: boolean;
  isFuture?: boolean;
  projectedBullishStrength?: number;
  projectedBearishStrength?: number;
  projectedRiskScore?: number;
  projectedScenario?: ScenarioType;
}

export interface IntradayTimelinePoint {
  timestamp: string;
  formattedTime: string;
  winReturn: number | null;
  wdoReturn: number | null;
  globalSentiment: number | null; // -100 to +100 or null for future points
  winPrice?: number | null;
  wdoPrice?: number | null;
  riskScore?: number | null; // 0 to 100
  winBias?: number | null; // -100 to +100
  wdoBias?: number | null; // -100 to +100
  scenario?: ScenarioType;
  isCurrentNow?: boolean;
  isFuture?: boolean;
  projectedWinReturn?: number;
  projectedWdoReturn?: number;
}

export interface ScenarioEvolutionPoint {
  timestamp: string;
  formattedTime: string;
  scenario: ScenarioType;
  confidence: number;
  reason: string;
}

export interface DivergenceItem {
  id: string;
  type: string;
  pair: string;
  description: string;
  severity: 'ALTA' | 'MODERADA' | 'BAIXA';
  timestamp: string;
  formattedTime: string;
  status: 'ATIVA' | 'RESOLVIDA';
}

export interface MarketCrossing {
  id: string;
  pairName: string;
  status: 'CONFIRMADO' | 'DIVERGENTE' | 'MISTO' | 'NEUTRO';
  color: 'VERDE' | 'VERMELHO' | 'AMARELO' | 'AZUL';
  text: string;
}

export interface MacroChainNode {
  id: string;
  chainName: string;
  flow: string[];
  observedCorrelation: string;
  currentStatus: 'ALINHADO' | 'PRESSIONANDO' | 'DESCONECTADO';
  summary: string;
}

export interface MacroGeopoliticsRisk {
  overallScore: number; // 0 to 100
  classification: 'BAIXO' | 'MODERADO' | 'ELEVADO' | 'CRÍTICO';
  categories: {
    name: string;
    score: number;
    trend: 'ALTA' | 'ESTAVEL' | 'BAIXA';
    summary: string;
  }[];
  lastUpdated: string;
}

export interface EconomicCalendarEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  country: 'BR' | 'US' | 'EU' | 'CN' | 'GB' | 'GLOBAL';
  importance: 1 | 2 | 3; // 3 = Tier 1 (Payroll, IPCA, Fed, Copom)
  result?: string;
  consensus?: string;
  previous?: string;
  impact?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface MacroNewsItem {
  id: string;
  title?: string;
  headline?: string;
  source: string;
  sourceUrl?: string;
  timestamp: string;
  formattedTime?: string;
  category?: string;
  impact?: 'ALTO' | 'MEDIO' | 'BAIXO';
  impactDollar?: 'ALTA' | 'BAIXA' | 'NEUTRO';
  impactIndex?: 'ALTA' | 'BAIXA' | 'NEUTRO';
  urgency?: string;
  summary?: string;
  tags?: string[];
  relevance?: number; // 0-100
  relatedAsset?: 'WIN' | 'WDO' | 'GLOBAL' | 'RATES' | 'COMMODITIES';
  url?: string;
}

export interface LagCorrelationItem {
  asset: 'WIN' | 'WDO';
  lagMinutes: number; // 5, 15, 30
  pearsonR: number; // -1 to +1
  observedCorrelation: string;
  interpretation: string;
}

export interface TradeJournalEntry {
  id: string;
  timestamp: string;
  formattedDate: string;
  formattedTime: string;
  asset: 'WIN' | 'WDO';
  direction: 'COMPRA' | 'VENDA';
  entryPrice: number;
  exitPrice: number;
  contracts: number;
  resultPoints: number;
  resultCurrency: number;
  macroScenario: ScenarioType;
  confluenceScore: number;
  confluenceMatch: boolean;
  notes: string;
  tags: string[];
}

export interface MacroSettings {
  weights: Record<string, number>;
  bullishThreshold: number; // default 60
  bearishThreshold: number; // default 60
  macroNeutralMin: number; // default 45
  macroNeutralMax: number; // default 55
  riskNeutralMin: number; // default 45
  riskNeutralMax: number; // default 55
  scenarioConfirmationCount: number; // default 3
  hysteresisExitDelta: number; // default 12
  updateIntervalSec: number;
  autoPolling: boolean;
  alertsEnabled: boolean;
  sentimentJumpThreshold: number;
  brentThreshold: number;
  maxSyncLagMinutes: number;
}

export interface MacroAlert {
  id: string;
  type:
    | 'SCENARIO_CHANGE'
    | 'DIVERGENCE_DETECTED'
    | 'FAROL_CHANGE'
    | 'RISK_SPIKE'
    | 'SYNC_WARNING'
    | 'METODO_MACRO_ALERT';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  formattedTime: string;
  acknowledged?: boolean;
}

export interface GlobalMarketQuote {
  ticker: string;
  symbol: string;
  name: string;
  category: 'INDEX' | 'VOLATILITY' | 'CURRENCY' | 'COMMODITY' | 'RATES';
  role: string;
  price: number;
  formattedPrice: string;
  changePercent: number;
  change5d: number;
  status: DataFreshnessStatus;
  source: string;
  timestamp: string;
  delayMinutes: number;
}

export type MacroMarketQuote = GlobalMarketQuote | any;
export type AssetSignal = any;
