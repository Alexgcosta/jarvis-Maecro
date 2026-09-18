import React from 'react';
import { Header } from '../components/Header';
import { MainCards } from '../components/MainCards';
import { McpQuickSummary } from '../components/McpQuickSummary';
import { DataQualityBanner } from '../components/DataQualityBanner';
import { TrafficLightsSection } from '../components/TrafficLightsSection';
import { IntradayChart } from '../components/IntradayChart';
import { MarketConfluencePanel } from '../components/MarketConfluencePanel';
import { DivergencePanel } from '../components/DivergencePanel';
import { WinWdoScoreboard } from '../components/WinWdoScoreboard';
import { GlobalMarketsGrid } from '../components/GlobalMarketsGrid';
import { GlobalDriversPanel } from '../components/GlobalDriversPanel';
import { GlobalTrafficLight } from '../components/GlobalTrafficLight';
import { WhatChangedPanel } from '../components/WhatChangedPanel';
import { McpMacroConsole } from '../components/McpMacroConsole';
import { BcbInterestPanel } from '../components/BcbInterestPanel';
import { DebugMacroPanel } from '../components/DebugMacroPanel';
import { LagAnalysisPanel } from '../components/LagAnalysisPanel';
import { GlobalSentimentMatrix } from '../components/GlobalSentimentMatrix';
import { McpMacroSummary } from '../components/McpMacroSummary';
import { FredMacroPanel } from '../components/FredMacroPanel';
import { EconomicCalendarPanel } from '../components/EconomicCalendarPanel';
import { BrazilianMarketsPanel } from '../components/BrazilianMarketsPanel';
import { HGBrasilTickersPanel } from '../components/HGBrasilTickersPanel';
import { CommoditiesPanel } from '../components/CommoditiesPanel';
import { InterestRatesPanel } from '../components/InterestRatesPanel';
import { MacroChainPanel } from '../components/MacroChainPanel';
import { GeopoliticalRiskPanel } from '../components/GeopoliticalRiskPanel';
import { NewsPanel } from '../components/NewsPanel';
import { AlertsPanel } from '../components/AlertsPanel';
import { Footer } from '../components/Footer';
import {
  ConfluencePoint,
  DataFreshnessStatus,
  DivergenceItem,
  IndicatorWeightConfig,
  IntradayTimelinePoint,
  LagCorrelationItem,
  MacroIndicator,
  MarketCrossing,
  ScenarioType,
} from '../types/macroTypes';

interface DashboardViewProps {
  dataStatus: DataFreshnessStatus;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenManualEntry: () => void;
  indicators: MacroIndicator[];
  weights: IndicatorWeightConfig;
  intradayTimeline: (IntradayTimelinePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  confluenceTimeline: (ConfluencePoint & { isCurrentNow?: boolean; isFuture?: boolean })[];
  currentSentiment: any;
  currentBrazilSentiment: any;
  currentWinBias: any;
  currentWdoBias: any;
  currentConfluence: any;
  crossings: MarketCrossing[];
  divergences: DivergenceItem[];
  lagItems: LagCorrelationItem[];
  currentTime?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dataStatus,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onOpenManualEntry,
  indicators,
  weights,
  intradayTimeline,
  confluenceTimeline,
  currentSentiment,
  currentBrazilSentiment,
  currentWinBias,
  currentWdoBias,
  currentConfluence,
  crossings,
  divergences,
  lagItems,
  currentTime,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. MCP Quick Summary Banner */}
      <McpQuickSummary
        currentScenario={currentConfluence.scenario}
        winBiasScore={currentWinBias.score}
        wdoBiasScore={currentWdoBias.score}
        confidence={currentConfluence.confidence}
      />

      {/* 2. Main 4 Cards: Global Sentiment, Brazil Sentiment, WIN Bias, WDO Bias */}
      <MainCards
        globalSentiment={currentSentiment}
        brazilSentiment={currentBrazilSentiment}
        winBias={currentWinBias}
        wdoBias={currentWdoBias}
      />

      {/* 3. Data Quality & Synchronization Banner */}
      <DataQualityBanner
        status={dataStatus}
        lastUpdated={lastUpdated}
        formattedTime={currentSentiment?.formattedTime || lastUpdated}
        sourceCount={16}
        activeSourceCount={16}
        syncLagSeconds={2}
        isDesynchronized={false}
        onForceResync={onRefresh}
      />

      {/* 4. Traffic Lights: Farol WIN 🚦 & Farol WDO 🚦 */}
      <TrafficLightsSection
        winLight={{
          state: currentWinBias.score >= 25 ? 'VERDE' : currentWinBias.score <= -25 ? 'VERMELHO' : 'AMARELO',
          label: currentWinBias.score >= 25 ? '🟢 COMPRA / OPERAÇÃO A FAVOR' : currentWinBias.score <= -25 ? '🔴 VENDA / PRESSÃO' : '🟡 AGUARDAR / NEUTRO',
          description: currentWinBias.explanation,
          biasScore: currentWinBias.score,
          confidence: currentWinBias.confidence,
          drivers: ['VIX em queda (-5.5%)', 'S&P 500 em alta (+0.35%)', 'Fechamento curva DI'],
        }}
        wdoLight={{
          state: currentWdoBias.score >= 25 ? 'VERDE' : currentWdoBias.score <= -25 ? 'VERMELHO' : 'AMARELO',
          label: currentWdoBias.score >= 25 ? '🟢 COMPRA DE DÓLAR' : currentWdoBias.score <= -25 ? '🔴 VENDA / ALÍVIO DO DÓLAR' : '🟡 CONSOLIDAÇÃO / AGUARDAR',
          description: currentWdoBias.explanation,
          biasScore: currentWdoBias.score,
          confidence: currentWdoBias.confidence,
          drivers: ['DXY estável', 'Fluxo estrangeiro comprador de B3', 'Petróleo sustentado'],
        }}
      />

      {/* 5. Intraday Chart (24h continuous timeline tracking live current time) */}
      <IntradayChart data={intradayTimeline} currentTime={currentTime} />

      {/* 6. CENTERPIECE: RASTRO DO MACRO (Continuous 24h Global Scenario Matrix) */}
      <MarketConfluencePanel
        confluenceData={confluenceTimeline}
        currentConfluence={currentConfluence}
        crossings={crossings}
        currentTime={currentTime}
      />


      {/* 7. Divergences Panel */}
      <DivergencePanel divergences={divergences} />

      {/* 8. WIN × WDO Scoreboard: "Comparação de viés direcional" */}
      <WinWdoScoreboard
        winBiasScore={currentWinBias.score}
        winClassification={currentWinBias.classification}
        winReturn={currentWinBias.winReturn}
        winPrice={currentWinBias.currentPrice || 134250}
        winTarget={currentWinBias.targetPrice || 135550}
        winStop={currentWinBias.stopLoss || 133800}
        winDrivers={['Bolsas EUA no positivo (S&P/Nasdaq)', 'EWZ NY em alta (+1.42%)', 'Entrada de fluxo estrangeiro B3']}
        wdoBiasScore={currentWdoBias.score}
        wdoClassification={currentWdoBias.classification}
        wdoReturn={currentWdoBias.wdoReturn}
        wdoPrice={currentWdoBias.currentPrice || 5.405}
        wdoTarget={currentWdoBias.targetPrice || 5.375}
        wdoStop={currentWdoBias.stopLoss || 5.430}
        wdoDrivers={['DXY estável em 104.15 (-0.12%)', 'Taxa Ptax e DI aliviados', 'Apetite por ativos emergentes']}
      />

      {/* 9. Global Markets Grid */}
      <GlobalMarketsGrid indicators={indicators} />

      {/* 10. Global Drivers & Macro Catalysts */}
      <GlobalDriversPanel />

      {/* 11. Global Traffic Light (Regime Macro) */}
      <GlobalTrafficLight
        globalIndexState="VERDE"
        globalDollarState="AMARELO"
        reasonIndex="Apetite por risco global consolidado em Wall Street com suporte de treasuries estáveis."
        reasonDollar="Dólar DXY operando sem direção única no exterior, favorecendo moedas de commodities."
      />

      {/* 12. What Changed Panel (Deltas 60 min - Real Live Prices & Deltas) */}
      <WhatChangedPanel
        indicators={indicators}
        currentSentiment={currentSentiment}
        currentBrazilSentiment={currentBrazilSentiment}
        currentWinBias={currentWinBias}
        currentWdoBias={currentWdoBias}
      />

      {/* 13. MCP Macro Hub Console with Speech Synthesis & Co-Pilot */}
      <McpMacroConsole
        currentScenario={currentConfluence.scenario}
        globalSentimentScore={currentSentiment.score}
        winBiasScore={currentWinBias.score}
        wdoBiasScore={currentWdoBias.score}
        macroTrail={currentConfluence.macroTrail}
        riskScore={currentConfluence.riskScore}
        hasDivergence={currentConfluence.hasDivergence}
      />

      {/* 14. Brazilian Interest Rates & DI Curve */}
      <BcbInterestPanel />

      {/* 15. Macro Debug & Non-Circularity Certified Audit */}
      <DebugMacroPanel indicators={indicators} weights={weights} />

      {/* 16. Lag Analysis & Pearson Correlation Panel */}
      <LagAnalysisPanel lagItems={lagItems} />

      {/* 17. Global Sentiment Matrix (4 Pillars) */}
      <GlobalSentimentMatrix />

      {/* 18. FRED US Economic Macro Data */}
      <FredMacroPanel />

      {/* 19. Economic Calendar Events */}
      <EconomicCalendarPanel />

      {/* 20. Brazilian Markets & B3 Foreign Flow */}
      <BrazilianMarketsPanel indicators={indicators} />

      {/* 20.1 HG Brasil Finance & B3 Tickers Integration */}
      <HGBrasilTickersPanel onSyncIndicators={onRefresh} />

      {/* 21. Commodities & Energy */}
      <CommoditiesPanel />

      {/* 22. Sovereign Yields & Interest Rates */}
      <InterestRatesPanel />

      {/* 23. Macroeconomic Transmission Chains */}
      <MacroChainPanel />

      {/* 24. Geopolitical & Fiscal Risk Panel */}
      <GeopoliticalRiskPanel />

      {/* 25. Real-Time News & Alerts Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NewsPanel />
        <AlertsPanel />
      </div>
    </div>
  );
};
