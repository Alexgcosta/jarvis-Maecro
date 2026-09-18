/**
 * Profit / Nelogica Integration Bridge
 * Decoupled layer prepared to exchange payloads, quotes, and signals
 * with Profit Pro (RTD, DLL, Nelogica strategy runner, or external broker socket).
 * (Section 23: Non-order execution, strictly analysis, context, score and alerts).
 */

export interface ProfitContractQuote {
  ticker: 'WIN' | 'WDO' | 'DOL';
  currentPrice: number;
  openPrice: number;
  vwap: number;
  high: number;
  low: number;
  volume: number;
  tradeCount: number;
  timestamp: string;
}

export interface ProfitMacroContextExport {
  contract: 'WIN' | 'WDO' | 'DOL';
  timestamp: string;
  regime: string;
  macroScore: number;
  signal: 'COMPRA FORTE' | 'COMPRA' | 'NEUTRO' | 'VENDA' | 'VENDA FORTE';
  confidence: number;
  topDrivers: Array<{ indicator: string; points: number }>;
  activeDivergences: string[];
}

export class ProfitNelogicaBridge {
  private static instance: ProfitNelogicaBridge;
  private connected: boolean = false;
  private lastQuoteMap: Map<string, ProfitContractQuote> = new Map();

  private constructor() {}

  public static getInstance(): ProfitNelogicaBridge {
    if (!ProfitNelogicaBridge.instance) {
      ProfitNelogicaBridge.instance = new ProfitNelogicaBridge();
    }
    return ProfitNelogicaBridge.instance;
  }

  /**
   * Ingests real-time tick from external Profit RTD / Nelogica feed
   */
  public ingestQuote(quote: ProfitContractQuote): void {
    this.lastQuoteMap.set(quote.ticker, quote);
    this.connected = true;
  }

  /**
   * Exports standardized context for Nelogica strategy script (NTSL / 2CS / DLL)
   */
  public formatForNelogicaStrategy(context: ProfitMacroContextExport): string {
    return JSON.stringify({
      version: '1.0-PROFIT-BRIDGE',
      timestamp: context.timestamp,
      ativo: context.contract,
      regime: context.regime,
      score: context.macroScore,
      sinal: context.signal,
      confianca: context.confidence,
      fatores: context.topDrivers,
      divergencias: context.activeDivergences,
    });
  }

  public getStatus(): { isConnected: boolean; trackedContracts: string[]; lastSync: string } {
    return {
      isConnected: this.connected,
      trackedContracts: Array.from(this.lastQuoteMap.keys()),
      lastSync: new Date().toISOString(),
    };
  }
}

export const profitBridge = ProfitNelogicaBridge.getInstance();
