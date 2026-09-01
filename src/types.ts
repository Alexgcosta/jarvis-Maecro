export * from './types/macroTypes';

export type HUDView =
  | 'dashboard'
  | 'signals'
  | 'sentiment'
  | 'sources'
  | 'macro_news'
  | 'calendar'
  | 'quant_calculator'
  | 'terminal'
  | 'configuracoes'
  | 'diario'
  | 'api'
  | 'partnr_api'
  | 'mcp'
  | 'mqtt_stream'
  | 'auth';

export interface ApiKeyItem {
  id: string;
  name: string;
  provider: string;
  category: 'MARKET_DATA' | 'MACRO_INDEX' | 'AI_MODEL' | 'EXECUTION' | 'CUSTOM';
  key: string;
  maskedKey: string;
  status: 'ACTIVE' | 'TESTING' | 'INVALID' | 'UNCONFIGURED';
  lastTested?: string;
  latencyMs?: number;
  description: string;
  endpoints?: string[];
  docUrl?: string;
  endpointUrl?: string;
  required?: boolean;
  notes?: string;
  createdAt?: string;
}

export type HUDTheme = 'cyan' | 'gold' | 'emerald' | 'crimson' | 'amethyst';

export type AIModelType = 'gemini-3.7-flash' | 'gemini-3.1-flash-lite' | 'gemini-2.5-pro' | 'chatgpt-4o';

export interface ThermometerAlert {
  id: string;
  timestamp: string;
  scope: 'GLOBAL' | 'BRAZIL' | 'BOTH';
  previousGlobalScore: number;
  newGlobalScore: number;
  previousBrazilScore: number;
  newBrazilScore: number;
  globalLabel: string;
  brazilLabel: string;
  summary: string;
  impactDollar: 'ALTA' | 'BAIXA' | 'NEUTRO';
  impactIndex: 'ALTA' | 'BAIXA' | 'NEUTRO';
}

export interface SentimentAnalysis {
  globalScore: number;
  globalLabel: string;
  globalDrivers: string[];
  brazilScore: number;
  brazilLabel: string;
  brazilDrivers: string[];
  correlationDXY_DOL: number;
  correlationSPX_IBOV: number;
  lastUpdated: string;
}

export interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  tradeSignal?: {
    asset: 'DOL' | 'IND' | 'BOTH';
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
  };
  citations?: GroundingCitation[];
}

export interface GroundingCitation {
  title?: string;
  url?: string;
  sourceText?: string;
}

export interface MacroSourceItem {
  id: string;
  name: string;
  url: string;
  category: 'GLOBAL_MACRO' | 'HEATMAP_WALLST' | 'ECONOMIC_CALENDAR' | 'CME_FUTURES' | 'NEWS_WIRE' | 'B3_MONITOR' | 'METODO_MACRO' | 'HGBRASIL_API';
  description: string;
  status: 'ONLINE' | 'SCANNING' | 'UPDATED' | 'AUTHENTICATED';
  lastSync: string;
  keyMetrics: { label: string; value: string; bias?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[];
  summary: string;
  authKey?: string;
  isAuthenticated?: boolean;
  directLoginUrl?: string;
}

export interface HGBrasilTickerItem {
  ticker: string;
  kind: string;
  symbol: string;
  name: string;
  full_name: string;
  tax_id: string | null;
  classification?: {
    sector?: string;
  };
  logos?: {
    square_small?: string;
    square_large?: string;
  } | null;
  source?: {
    symbol?: string;
  };
}

export interface HGBrasilFinanceResponse {
  currencies?: {
    source?: string;
    USD?: { name: string; buy: number; sell: number; variation: number };
    EUR?: { name: string; buy: number; sell: number; variation: number };
    GBP?: { name: string; buy: number; variation: number };
    CAD?: { name: string; buy: number; variation: number };
    JPY?: { name: string; buy: number; variation: number };
    CNY?: { name: string; buy: number; variation: number };
    BTC?: { name: string; buy: number; variation: number };
  };
  stocks?: {
    IBOVESPA?: { name: string; points: number; variation: number };
    NASDAQ?: { name: string; points: number; variation: number };
    DOWJONES?: { name: string; points: number; variation: number };
    CAC?: { name: string; points: number; variation: number };
    NIKKEI?: { name: string; points: number; variation: number };
    IFIX?: { name: string; points: number; variation: number };
  };
  taxes?: Array<{
    date: string;
    cdi: number;
    selic: number;
    daily_factor: number;
    selic_daily: number;
    cdi_daily: number;
  }>;
}


export interface MarketStateResponse {
  sentiment: {
    globalScore: number;
    globalLabel: string;
    globalDrivers: string[];
    brazilScore: number;
    brazilLabel: string;
    brazilDrivers: string[];
    correlationDXY_DOL: number;
    correlationSPX_IBOV: number;
    lastUpdated: string;
  };
  dollarSignal: {
    asset: string;
    name: string;
    ticker: string;
    currentPrice: number;
    changePercent: number;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timeframe: string;
    targetPrice: number;
    stopLoss: number;
    supportLevel: number;
    resistanceLevel: number;
    bias: string;
    macroRationale: string;
    keyDrivers: string[];
    riskRewardRatio: string;
  };
  indexSignal: {
    asset: string;
    name: string;
    ticker: string;
    currentPrice: number;
    changePercent: number;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    timeframe: string;
    targetPrice: number;
    stopLoss: number;
    supportLevel: number;
    resistanceLevel: number;
    bias: string;
    macroRationale: string;
    keyDrivers: string[];
    riskRewardRatio: string;
  };
  quotes: {
    ticker: string;
    name: string;
    price: string;
    change: string;
    positive: boolean;
    category?: string;
  }[];
  sources: MacroSourceItem[];
  timestamp: string;
}
