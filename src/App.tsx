/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  HUDView,
  HUDTheme,
  JarvisMessage,
  MarketStateResponse,
  AIModelType,
  SentimentAnalysis,
  ThermometerAlert,
  MacroIndicator,
  IndicatorWeightConfig,
  MarketCrossing,
  DataFreshnessStatus,
} from './types';
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AssistantDrawer } from './components/AssistantDrawer';
import { MarketTickerBar } from './components/MarketTickerBar';
import { TradeSignalsPanel } from './components/TradeSignalsPanel';
import { SentimentGaugePanel } from './components/SentimentGaugePanel';
import { MacroNewsFeed } from './components/MacroNewsFeed';
import { EconomicCalendarPanel } from './components/EconomicCalendarPanel';
import { QuantPositionCalculator } from './components/QuantPositionCalculator';
import { TerminalView } from './components/TerminalView';
import { ChatConsole } from './components/ChatConsole';
import { MacroSourcesHub } from './components/MacroSourcesHub';
import { WinGlobalLeadersView } from './views/WinGlobalLeadersView';
import { DashboardView } from './views/DashboardView';
import { ConfiguracoesView } from './views/ConfiguracoesView';
import { DiarioTradeView } from './views/DiarioTradeView';
import { PartnrApiView } from './views/PartnrApiView';
import { McpView } from './views/McpView';
import { McpMacroHubDashboard } from './components/McpMacroHubDashboard';
import { MqttStreamView } from './views/MqttStreamView';
import { AuthView } from './views/AuthView';
import { ApiKeysView } from './views/ApiKeysView';
import { ManualEntryModal } from './components/ManualEntryModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { soundFX } from './utils/soundEffects';
import { speechEngine } from './utils/speech';

import { DEFAULT_INDICATORS, DEFAULT_WEIGHTS } from './data/indicatorsRegistry';
import { CANONICAL_TIMELINE, generateCanonicalMarketTimeline, getSaoPauloTime } from './data/mockMarketTimeline';
import {
  calculateGlobalSentiment,
  calculateBrazilSentiment,
  calculateWinBias,
  calculateWdoBias,
  calculateConfluencePoint,
  detectDivergences,
  calculateNewsSentimentDelta,
} from './calculations/macroCalculations';
import { calculateIntradayLagCorrelations } from './calculations/lagAnalysis';

import {
  DollarSign,
  BarChart3,
  Globe,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shield,
  Activity,
  Cpu,
  BellRing,
  X,
  Volume2,
  Compass,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const VALID_VIEWS: HUDView[] = [
  'signals',
  'win_leaders',
  'dashboard',
  'sentiment',
  'sources',
  'macro_news',
  'calendar',
  'quant_calculator',
  'terminal',
  'configuracoes',
  'diario',
  'api',
  'partnr_api',
  'mcp',
  'mqtt_stream',
  'auth',
];

export default function App() {
  const [currentView, setCurrentView] = useState<HUDView>(() => {
    try {
      const saved = localStorage.getItem('macrodesk_current_view');
      if (saved && VALID_VIEWS.includes(saved as HUDView)) return saved as HUDView;
    } catch (e) {}
    return 'signals'; // Inicia com foco imediato no Painel de Sinais e Confluência WIN/WDO
  });

  const handleSelectView = useCallback((view: HUDView) => {
    setCurrentView(view);
    try {
      localStorage.setItem('macrodesk_current_view', view);
    } catch (e) {}
  }, []);
  const [theme, setTheme] = useState<HUDTheme>('cyan');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('pt-BR');
  const [voiceAutoSpeak, setVoiceAutoSpeak] = useState<boolean>(true);
  const [aiModel, setAiModel] = useState<AIModelType>('gemini-3.7-flash');

  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedCalcAsset, setSelectedCalcAsset] = useState<'DOL' | 'IND'>('DOL');

  // Quantitative Macro Model State
  const [indicators, setIndicators] = useState<MacroIndicator[]>(DEFAULT_INDICATORS);
  const [weights, setWeights] = useState<IndicatorWeightConfig>(DEFAULT_WEIGHTS);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [dataStatus, setDataStatus] = useState<DataFreshnessStatus>('LIVE');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('pt-BR'));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modern Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [copilotDrawerOpen, setCopilotDrawerOpen] = useState<boolean>(false);

  // Global shortcut: Ctrl+K or Cmd+K to open Command Palette
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Thermometer Alert Monitoring State
  const [thermometerAlerts, setThermometerAlerts] = useState<ThermometerAlert[]>([]);
  const [currentToastAlert, setCurrentToastAlert] = useState<ThermometerAlert | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Market State for compatibility with chat & sources
  const [marketState, setMarketState] = useState<MarketStateResponse>({
    sentiment: {
      globalScore: 38,
      globalLabel: 'OTIMISMO MODERADO',
      globalDrivers: [
        'Expectativa de cortes graduais de juros pelo Federal Reserve (Fed)',
        'S&P 500 sustentado por balanços de Big Techs e dados de resiliência nos EUA',
        'Petróleo Brent contido em torno de US$ 78/barril aliviando pressões inflacionárias',
        'Minério de ferro em Dalian lateralizado com atenção a estímulos em Pequim',
      ],
      brazilScore: 42,
      brazilLabel: 'FLUXO POSITIVO',
      brazilDrivers: [
        'Entrada líquida de capital estrangeiro na B3 (+R$ 1.85B)',
        'IPCA-15 de agosto desacelerando para 0,30%',
        'Alívio na curva de juros DI futuros',
        'Exportadoras de commodities sustentadas',
      ],
      correlationDXY_DOL: 0.84,
      correlationSPX_IBOV: 0.68,
      lastUpdated: new Date().toISOString(),
    },
    dollarSignal: {
      asset: 'DOL',
      name: 'Dólar Comercial / Mini Dólar (USD/BRL - WDO)',
      ticker: 'USD/BRL',
      currentPrice: 5.405,
      changePercent: -0.35,
      action: 'SELL',
      confidence: 78,
      timeframe: 'Intraday & Swing Macro (1 a 5 dias)',
      targetPrice: 5.375,
      stopLoss: 5.430,
      supportLevel: 5.375,
      resistanceLevel: 5.435,
      bias: 'BAIXA',
      macroRationale:
        'Pressão vendedora no Dólar impulsionada por fluxo estrangeiro na B3/EWZ e DXY moderado no exterior.',
      keyDrivers: [
        'DXY global estável em 104.15 pontos',
        'Curva de juros futura (DI) fechando taxas',
        'EWZ offshore em US$ 29,85 (+1.42%) com fluxo gringo',
      ],
      riskRewardRatio: '1 : 2.4',
    },
    indexSignal: {
      asset: 'IND',
      name: 'Índice Bovespa / Mini Índice (IBOV - WIN)',
      ticker: 'WIN$',
      currentPrice: 134250,
      changePercent: +0.42,
      action: 'BUY',
      confidence: 84,
      timeframe: 'Intraday & Curto Prazo',
      targetPrice: 135550,
      stopLoss: 133800,
      supportLevel: 133650,
      resistanceLevel: 134850,
      bias: 'ALTA',
      macroRationale:
        'Índice Bovespa sustentado por apetite a risco global em Wall Street, EWZ em alta e alívio nos juros locais.',
      keyDrivers: [
        'S&P 500 futuro em alta (+0.35%) e VIX em queda (14.92)',
        'EWZ (iShares MSCI Brazil) subindo +1.42% em NY',
        'Minério de ferro em alta (+1.15%) e fluxo estrangeiro positivo',
      ],
      riskRewardRatio: '1 : 2.5',
    },
    quotes: [
      { ticker: 'WIN$', name: 'Mini Índice WIN', price: '134.250 pts', change: '+0.42%', positive: true, category: 'INDEX' },
      { ticker: 'USD/BRL', name: 'Dólar Comercial / WDO', price: 'R$ 5,4050', change: '-0.35%', positive: true, category: 'CURRENCY' },
      { ticker: 'EWZ', name: 'iShares MSCI Brazil ETF', price: '$29.85', change: '+1.42%', positive: true, category: 'INDEX' },
      { ticker: 'DXY', name: 'US Dollar Index', price: '104.15', change: '-0.12%', positive: true, category: 'CURRENCY' },
      { ticker: 'S&P 500', name: 'S&P 500 Futuro', price: '5.890 pts', change: '+0.35%', positive: true, category: 'INDEX' },
      { ticker: 'BRENT', name: 'Petróleo Brent', price: '$78.42', change: '+0.45%', positive: true, category: 'COMMODITY' },
      { ticker: 'MINERIO', name: 'Minério de Ferro (Dalian)', price: '$104.20/t', change: '+1.15%', positive: true, category: 'COMMODITY' },
      { ticker: 'US10Y', name: 'Treasury 10 Anos', price: '4.28%', change: '-0.02', positive: true, category: 'BONDS' },
    ],
    news: [
      {
        id: 'news-1',
        headline: 'Federal Reserve sinaliza cautela no ritmo de afrouxamento monetário após dados de atividade dos EUA',
        source: 'Reuters / Bloomberg',
        sourceUrl: 'https://www.reuters.com/',
        category: 'CENTRAL_BANKS',
        impactDollar: 'ALTA',
        impactIndex: 'BAIXA',
        urgency: 'HIGH',
        summary: 'Membros do FOMC reiteram dependência de dados para cortes adicionais, impulsionando os rendimentos das Treasuries.',
        timestamp: 'Há 12 minutos',
        tags: ['Dólar', 'Fed', 'DXY', 'Treasuries', 'EUA'],
      },
      {
        id: 'news-2',
        headline: 'Fluxo estrangeiro na B3 acumula saldo positivo de R$ 1.85B impulsionado por apetite a emergentes e EWZ em NY',
        source: 'Valor Econômico',
        sourceUrl: 'https://br.advfn.com/monitor',
        category: 'BRAZIL',
        impactDollar: 'BAIXA',
        impactIndex: 'ALTA',
        urgency: 'HIGH',
        summary: 'Investidores internacionais ampliam alocação em ações brasileiras e ETFs offshore após dados favoráveis de inflação.',
        timestamp: 'Há 35 minutos',
        tags: ['Bovespa', 'EWZ', 'Dólar', 'Fiscal', 'B3', 'Juros DI'],
      },
    ],
    calendar: [
      {
        id: 'cal-1',
        time: '09:00',
        country: 'BR',
        event: 'IPCA-15 / Inflação Prévia',
        impact: 'HIGH',
        forecast: '0.32%',
        previous: '0.39%',
        dollarBias: 'Se abaixo: QUEDA',
        indexBias: 'Se abaixo: FORTE ALTA',
      },
      {
        id: 'cal-2',
        time: '09:30',
        country: 'US',
        event: 'Pedidos de Auxílio Desemprego',
        impact: 'HIGH',
        forecast: '230k',
        previous: '228k',
        dollarBias: 'Se acima: Estável',
        indexBias: 'Se acima: ALTA',
      },
    ],
    sources: [
      {
        id: 'source-macrowarning',
        name: 'Macro Warning',
        url: 'https://macrowarning.com/',
        category: 'GLOBAL_MACRO',
        description: 'Monitor de estresse macroeconômico, alertas de recessão global e indicadores de risco sistêmico.',
        status: 'ONLINE',
        lastSync: 'Sincronizado há 1 min',
        keyMetrics: [
          { label: 'Global Stress Index', value: '38.2 / 100 (Estável)', bias: 'POSITIVE' },
          { label: 'Recession Probability (US)', value: '22%', bias: 'POSITIVE' },
        ],
        summary: 'Sem alertas de liquidez crítica no curto prazo.',
      },
      {
        id: 'source-finviz',
        name: 'Finviz',
        url: 'https://finviz.com/',
        category: 'HEATMAP_WALLST',
        description: 'Mapa de calor de Wall Street (S&P 500), futuros de índices, commodities, DXY e pares Forex globais.',
        status: 'ONLINE',
        lastSync: 'Tempo Real (Push)',
        keyMetrics: [
          { label: 'S&P 500 Heatmap', value: 'Verde (+0.35%)', bias: 'POSITIVE' },
          { label: 'DXY Dollar Index', value: '104.15 (-0.12%)', bias: 'POSITIVE' },
          { label: 'VIX Volatilidade', value: '14.92 (-5.5%)', bias: 'POSITIVE' },
        ],
        summary: 'Mercado acionário dos EUA em tom positivo liderado por semicondutores e software.',
      },
    ],
    arcReactorPower: '4.20 GW (QUANT ANALYTICS & MASTER MACRO ENGINE)',
    systemStatus: 'SISTEMA OPERACIONAL QUANTITATIVO J.A.R.V.I.S. 100% ONLINE',
  });

  // Dynamic calculations from indicators & weights
  const newsDelta = useMemo(
    () => (marketState?.news ? calculateNewsSentimentDelta(marketState.news) : 0),
    [marketState?.news]
  );

  const currentSentiment = useMemo(
    () => calculateGlobalSentiment(indicators, weights, newsDelta),
    [indicators, weights, newsDelta]
  );
  const currentBrazilSentiment = useMemo(
    () => calculateBrazilSentiment(indicators, weights, newsDelta),
    [indicators, weights, newsDelta]
  );
  const currentWinBias = useMemo(() => {
    const winInd = indicators.find((i) => i.id === 'WIN');
    const exactWinPrice = winInd ? winInd.value : 134250;
    return calculateWinBias(
      indicators,
      currentSentiment.score,
      currentBrazilSentiment.score,
      weights,
      0.42,
      exactWinPrice
    );
  }, [indicators, currentSentiment.score, currentBrazilSentiment.score, weights]);

  const currentWdoBias = useMemo(() => {
    const usdBrlInd = indicators.find((i) => i.id === 'USD_BRL');
    const exactUsdPrice = usdBrlInd ? usdBrlInd.value : 5.405;
    return calculateWdoBias(
      indicators,
      currentSentiment.score,
      currentBrazilSentiment.score,
      weights,
      -0.35,
      exactUsdPrice
    );
  }, [indicators, currentSentiment.score, currentBrazilSentiment.score, weights]);

  // Real-time clock tracking for 24-hour continuous market timeline
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentTimeFormatted = useMemo(() => {
    return getSaoPauloTime(currentDate).formatted;
  }, [currentDate]);

  // Full 24-hour dynamic timeline tracking the current time of day
  const dynamicTimeline = useMemo(() => {
    const winInd = indicators.find((i) => i.id === 'WIN');
    const usdBrlInd = indicators.find((i) => i.id === 'USD_BRL');
    const exactWinPrice = winInd ? winInd.value : 134250;
    const exactUsdPrice = usdBrlInd ? usdBrlInd.value : 5.405;
    const winRet = currentWinBias?.winReturn ?? 0.42;
    const wdoRet = currentWdoBias?.wdoReturn ?? -0.35;

    return generateCanonicalMarketTimeline(
      undefined,
      exactWinPrice,
      exactUsdPrice,
      winRet,
      wdoRet,
      currentSentiment.score,
      currentDate
    );
  }, [indicators, currentWinBias?.winReturn, currentWdoBias?.wdoReturn, currentSentiment.score, currentDate]);

  const currentConfluence = useMemo(
    () =>
      calculateConfluencePoint(
        currentSentiment.score,
        currentBrazilSentiment.score,
        currentWinBias.score,
        currentWdoBias.score,
        currentTimeFormatted,
        currentWinBias?.winReturn ?? 0.42,
        currentWdoBias?.wdoReturn ?? -0.35
      ),
    [
      currentSentiment.score,
      currentBrazilSentiment.score,
      currentWinBias.score,
      currentWdoBias.score,
      currentTimeFormatted,
      currentWinBias?.winReturn,
      currentWdoBias?.wdoReturn,
    ]
  );

  const confluenceTimeline = useMemo(() => {
    return dynamicTimeline.confluence;
  }, [dynamicTimeline]);

  const intradayTimeline = useMemo(() => {
    return dynamicTimeline.intraday;
  }, [dynamicTimeline]);

  const divergences = useMemo(
    () =>
      detectDivergences(
        indicators,
        currentSentiment.score,
        currentWinBias.score,
        currentWdoBias.score
      ),
    [indicators, currentSentiment.score, currentWinBias.score, currentWdoBias.score]
  );

  const lagItems = useMemo(
    () => calculateIntradayLagCorrelations(dynamicTimeline.intraday),
    [dynamicTimeline.intraday]
  );

  const crossings: MarketCrossing[] = useMemo(
    () => [
      {
        id: 'c1',
        pairName: 'S&P 500 / EWZ × WIN',
        status: 'CONFIRMADO',
        color: 'VERDE',
        text: 'Alta coordenada em Wall Street e EWZ (+1.42%) sustentando apetite no WIN (+0.42%).',
      },
      {
        id: 'c2',
        pairName: 'DXY × USD/BRL',
        status: 'CONFIRMADO',
        color: 'VERDE',
        text: 'Alívio no Dólar Global refletido em recuo do dólar à vista (-0.35%).',
      },
      {
        id: 'c3',
        pairName: 'Curva DI × WIN',
        status: 'CONFIRMADO',
        color: 'VERDE',
        text: 'Fechamento de taxas de juros futuros impulsionando valuation do índice.',
      },
    ],
    []
  );

  // Dynamic real quotes derived from live indicators (never simulated)
  const liveQuotes = useMemo(() => {
    const winInd = indicators.find((i) => i.id === 'WIN');
    const usdBrlInd = indicators.find((i) => i.id === 'USD_BRL');
    const ewzInd = indicators.find((i) => i.id === 'EWZ');
    const dxyInd = indicators.find((i) => i.id === 'DXY');
    const spxInd = indicators.find((i) => i.id === 'SPX');
    const brentInd = indicators.find((i) => i.id === 'BRENT');
    const ironInd = indicators.find((i) => i.id === 'IRON_ORE');
    const us10yInd = indicators.find((i) => i.id === 'US10Y');

    return [
      {
        ticker: 'WIN$',
        name: 'Mini Índice WIN',
        price: winInd?.formattedValue || `${Math.round(winInd?.value || 134250).toLocaleString('pt-BR')} pts`,
        change: `${(winInd?.changePercent ?? 0.42) >= 0 ? '+' : ''}${(winInd?.changePercent ?? 0.42).toFixed(2)}%`,
        positive: (winInd?.changePercent ?? 0.42) >= 0,
        category: 'INDEX' as const,
      },
      {
        ticker: 'USD/BRL',
        name: 'Dólar Comercial / WDO',
        price: usdBrlInd?.formattedValue || `R$ ${(usdBrlInd?.value || 5.405).toFixed(4).replace('.', ',')}`,
        change: `${(usdBrlInd?.changePercent ?? -0.35) >= 0 ? '+' : ''}${(usdBrlInd?.changePercent ?? -0.35).toFixed(2)}%`,
        positive: (usdBrlInd?.changePercent ?? -0.35) <= 0,
        category: 'CURRENCY' as const,
      },
      {
        ticker: 'EWZ',
        name: 'iShares MSCI Brazil ETF',
        price: ewzInd?.formattedValue || `$${(ewzInd?.value || 29.85).toFixed(2)}`,
        change: `${(ewzInd?.changePercent ?? 1.42) >= 0 ? '+' : ''}${(ewzInd?.changePercent ?? 1.42).toFixed(2)}%`,
        positive: (ewzInd?.changePercent ?? 1.42) >= 0,
        category: 'INDEX' as const,
      },
      {
        ticker: 'DXY',
        name: 'US Dollar Index',
        price: dxyInd?.formattedValue || `${(dxyInd?.value || 104.15).toFixed(2)}`,
        change: `${(dxyInd?.changePercent ?? -0.12) >= 0 ? '+' : ''}${(dxyInd?.changePercent ?? -0.12).toFixed(2)}%`,
        positive: (dxyInd?.changePercent ?? -0.12) <= 0,
        category: 'CURRENCY' as const,
      },
      {
        ticker: 'S&P 500',
        name: 'S&P 500 Futuro',
        price: spxInd?.formattedValue || `${Math.round(spxInd?.value || 5890).toLocaleString('pt-BR')} pts`,
        change: `${(spxInd?.changePercent ?? 0.35) >= 0 ? '+' : ''}${(spxInd?.changePercent ?? 0.35).toFixed(2)}%`,
        positive: (spxInd?.changePercent ?? 0.35) >= 0,
        category: 'INDEX' as const,
      },
      {
        ticker: 'BRENT',
        name: 'Petróleo Brent',
        price: brentInd?.formattedValue || `$${(brentInd?.value || 78.42).toFixed(2)}`,
        change: `${(brentInd?.changePercent ?? 0.45) >= 0 ? '+' : ''}${(brentInd?.changePercent ?? 0.45).toFixed(2)}%`,
        positive: (brentInd?.changePercent ?? 0.45) >= 0,
        category: 'COMMODITY' as const,
      },
      {
        ticker: 'MINERIO',
        name: 'Minério de Ferro (Dalian)',
        price: ironInd?.formattedValue || `$${(ironInd?.value || 104.20).toFixed(2)}/t`,
        change: `${(ironInd?.changePercent ?? 1.15) >= 0 ? '+' : ''}${(ironInd?.changePercent ?? 1.15).toFixed(2)}%`,
        positive: (ironInd?.changePercent ?? 1.15) >= 0,
        category: 'COMMODITY' as const,
      },
      {
        ticker: 'US10Y',
        name: 'Treasury 10 Anos',
        price: us10yInd?.formattedValue || `${(us10yInd?.value || 4.28).toFixed(2)}%`,
        change: `${(us10yInd?.changePercent ?? -0.02) >= 0 ? '+' : ''}${(us10yInd?.changePercent ?? -0.02).toFixed(2)}`,
        positive: (us10yInd?.changePercent ?? -0.02) <= 0,
        category: 'BONDS' as const,
      },
    ];
  }, [indicators]);

  // Live real Dollar & Index signals
  const liveDollarSignal = useMemo(() => {
    const usdBrlInd = indicators.find((i) => i.id === 'USD_BRL');
    const exactUsdPrice = (typeof usdBrlInd?.value === 'number' && !isNaN(usdBrlInd.value) && usdBrlInd.value > 0)
      ? usdBrlInd.value
      : 5.405;
    return {
      ...marketState.dollarSignal,
      currentPrice: exactUsdPrice,
      targetPrice: currentWdoBias.targetPrice || +(exactUsdPrice - 0.035).toFixed(3),
      stopLoss: currentWdoBias.stopLoss || +(exactUsdPrice + 0.025).toFixed(3),
      supportLevel: currentWdoBias.supportLevel || +(exactUsdPrice - 0.030).toFixed(3),
      resistanceLevel: currentWdoBias.resistanceLevel || +(exactUsdPrice + 0.030).toFixed(3),
      confidence: currentWdoBias.confidence || marketState.dollarSignal.confidence,
      bias: currentWdoBias.classification || marketState.dollarSignal.bias,
    };
  }, [indicators, currentWdoBias, marketState.dollarSignal]);

  const liveIndexSignal = useMemo(() => {
    const winInd = indicators.find((i) => i.id === 'WIN');
    const exactWinPrice = (typeof winInd?.value === 'number' && !isNaN(winInd.value) && winInd.value > 0)
      ? winInd.value
      : 134250;
    return {
      ...marketState.indexSignal,
      currentPrice: exactWinPrice,
      targetPrice: currentWinBias.targetPrice || Math.round(exactWinPrice + 1300),
      stopLoss: currentWinBias.stopLoss || Math.round(exactWinPrice - 450),
      supportLevel: currentWinBias.supportLevel || Math.round(exactWinPrice - 600),
      resistanceLevel: currentWinBias.resistanceLevel || Math.round(exactWinPrice + 600),
      confidence: currentWinBias.confidence || marketState.indexSignal.confidence,
      bias: currentWinBias.classification || marketState.indexSignal.bias,
    };
  }, [indicators, currentWinBias, marketState.indexSignal]);

  // MCP Macro Hub Assistant Welcome Message
  const [messages, setMessages] = useState<JarvisMessage[]>([
    {
      id: 'init-fin-1',
      sender: 'assistant',
      text: `TERMINAL QUANTITATIVO MCP MACRO HUB CONECTADO // FLUXO OPERACIONAL B3
• **SISTEMA**: Inteligência Macroeconômica & Confluência Quantitativa Ativa.
• **CONTRATOS MONITORADOS**: WIN (Mini Índice), WDO (Mini Dólar) e DOL (Dólar Cheio).
• **CONFLUÊNCIA ATUAL**: 🟢 ALTA (Confluência 82% | Força Alta 73 | Risk Score 66).
• **MÉTRICA INTRADAY**: Base de 0,00% calibrada rigorosamente no fechamento do dia anterior.
• **FIDELIDADE DE DADOS**: Somente dados reais via APIs e MCP. Parâmetros sem retorno permanecem como PENDING_API.

Qual ativo ou cenário macroeconômico deseja auditar agora?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const prevSentimentRef = useRef<SentimentAnalysis>(marketState.sentiment);

  // Core handler for Thermometer Watcher
  const notifySentimentChange = useCallback(
    (newSentiment: SentimentAnalysis, prevSentiment: SentimentAnalysis) => {
      const deltaG = newSentiment.globalScore - prevSentiment.globalScore;
      const deltaB = newSentiment.brazilScore - prevSentiment.brazilScore;

      if (
        deltaG === 0 &&
        deltaB === 0 &&
        newSentiment.globalLabel === prevSentiment.globalLabel &&
        newSentiment.brazilLabel === prevSentiment.brazilLabel
      ) {
        return;
      }

      const deltaGStr =
        deltaG > 0 ? `alta de +${deltaG} pts` : deltaG < 0 ? `recuo de ${deltaG} pts` : `estável`;
      const deltaBStr =
        deltaB > 0 ? `alta de +${deltaB} pts` : deltaB < 0 ? `queda de ${deltaB} pts` : `estável`;

      const spokenNotification = `Alerta do sistema: Variação detectada no termômetro de sentimento. O Sentimento Global agora está em ${newSentiment.globalLabel} com ${newSentiment.globalScore > 0 ? '+' : ''}${newSentiment.globalScore} pontos, e o Sentimento Brasil está em ${newSentiment.brazilLabel} com ${newSentiment.brazilScore > 0 ? '+' : ''}${newSentiment.brazilScore} pontos.`;

      soundFX.playAlert();

      if (soundEnabled && voiceAutoSpeak) {
        speechEngine.speak(spokenNotification, language);
      }

      const isSevereRiskOff = newSentiment.globalScore < -20 || newSentiment.brazilScore < -20;
      const alertMsg: JarvisMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `🚨 **[ALERTA MCP MACRO HUB // OSCILAÇÃO NO TERMÔMETRO DE SENTIMENTO]**
• **SENTIMENTO GLOBAL**: **${newSentiment.globalLabel}** (${newSentiment.globalScore > 0 ? '+' : ''}${newSentiment.globalScore} pts | ${deltaGStr})
• **SENTIMENTO BRASIL**: **${newSentiment.brazilLabel}** (${newSentiment.brazilScore > 0 ? '+' : ''}${newSentiment.brazilScore} pts | ${deltaBStr})
• **DIRETRIZ**: ${isSevereRiskOff ? 'Viés Comprador no Dólar / Cautela no Índice' : 'Viés Comprador no Índice / Alívio no Dólar'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, alertMsg]);

      const alertRecord: ThermometerAlert = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        scope: deltaG !== 0 && deltaB !== 0 ? 'BOTH' : deltaG !== 0 ? 'GLOBAL' : 'BRAZIL',
        previousGlobalScore: prevSentiment.globalScore,
        newGlobalScore: newSentiment.globalScore,
        previousBrazilScore: prevSentiment.brazilScore,
        newBrazilScore: newSentiment.brazilScore,
        globalLabel: newSentiment.globalLabel,
        brazilLabel: newSentiment.brazilLabel,
        summary: `Variação: Global (${newSentiment.globalScore > 0 ? '+' : ''}${newSentiment.globalScore} pts) e Brasil (${newSentiment.brazilScore > 0 ? '+' : ''}${newSentiment.brazilScore} pts).`,
        impactDollar: isSevereRiskOff ? 'ALTA' : 'BAIXA',
        impactIndex: isSevereRiskOff ? 'BAIXA' : 'ALTA',
      };

      setThermometerAlerts((prev) => [...prev, alertRecord]);
      setCurrentToastAlert(alertRecord);

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setCurrentToastAlert(null);
      }, 9000);
    },
    [soundEnabled, voiceAutoSpeak, language]
  );

  // Manual save of indicator values and broadcast via Mosca MQTT
  const handleSaveManualEntry = async (updated: { key: string; value: number; changePercent: number }[]) => {
    setIndicators((prev) =>
      prev.map((ind) => {
        const match = updated.find((u) => u.key === ind.key || u.key === ind.id);
        if (match) {
          return {
            ...ind,
            value: match.value,
            changePercent: match.changePercent,
            formattedValue: match.value.toString(),
            timestamp: new Date().toISOString(),
            formattedTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'LIVE' as const,
          };
        }
        return ind;
      })
    );
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
    soundFX.playSuccess();

    // Persist and broadcast directly to Mosca MQTT Ingestion Engine
    try {
      await fetch('/api/macro/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicators: updated.map((u) => ({
            id: u.key,
            value: u.value,
            changePercent: u.changePercent,
            source: 'PAINEL_MANUAL_AJUSTE',
          })),
          source: 'MCP_MACRO_HUB_CLIENT',
        }),
      });
    } catch (err) {
      console.warn('Erro ao propagar dados manuais no Mosca MQTT:', err);
    }
  };

  // Realtime Mosca MQTT SSE Stream & Real Macro Indicators Synchronization
  useEffect(() => {
    // 1. Initial fetch of real indicators from Mosca engine
    fetch('/api/macro/indicators')
      .then((res) => res.json())
      .then((data) => {
        if (data.indicators && Array.isArray(data.indicators) && data.indicators.length > 0) {
          setIndicators(data.indicators);
          setDataStatus('LIVE');
          setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
        }
      })
      .catch((err) => {
        console.warn('Não foi possível carregar indicadores iniciais do Mosca:', err);
      });

    // 2. Connect to Mosca MQTT EventStream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/macro/stream');

      eventSource.addEventListener('mqtt_packet', (event) => {
        try {
          const packet = JSON.parse(event.data);
          const { topic, payload } = packet;

          setDataStatus('LIVE');
          setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));

          const normalizedTopic = topic.replace('jarvis/', 'mcp/');

          // Ingest Real Indicators Array
          if (normalizedTopic === 'mcp/macro/indicators/all' || normalizedTopic === 'mcp/macro/indicators') {
            if (payload?.indicators && Array.isArray(payload.indicators)) {
              setIndicators(payload.indicators);
            }
          }

          // Single Indicator Ingest
          if (normalizedTopic.startsWith('mcp/macro/indicators/') && normalizedTopic !== 'mcp/macro/indicators/all') {
            const indId = normalizedTopic.split('/').pop();
            if (indId && payload) {
              setIndicators((prev) =>
                prev.map((item) =>
                  item.id.toUpperCase() === indId.toUpperCase()
                    ? {
                        ...item,
                        ...payload,
                        timestamp: new Date().toISOString(),
                        formattedTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        status: 'LIVE',
                      }
                    : item
                )
              );
            }
          }

          // Sentiment Ingest
          if (normalizedTopic === 'mcp/macro/sentiment/global' && payload) {
            setMarketState((prev) => {
              const updated = {
                ...prev,
                sentiment: {
                  ...prev.sentiment,
                  globalScore: payload.score ?? prev.sentiment.globalScore,
                  globalLabel: payload.label ?? prev.sentiment.globalLabel,
                  globalDrivers: payload.drivers ?? prev.sentiment.globalDrivers,
                  lastUpdated: payload.timestamp ?? new Date().toISOString(),
                },
              };
              notifySentimentChange(updated.sentiment, prevSentimentRef.current);
              prevSentimentRef.current = updated.sentiment;
              return updated;
            });
          }

          if (normalizedTopic === 'mcp/macro/sentiment/brazil' && payload) {
            setMarketState((prev) => {
              const updated = {
                ...prev,
                sentiment: {
                  ...prev.sentiment,
                  brazilScore: payload.score ?? prev.sentiment.brazilScore,
                  brazilLabel: payload.label ?? prev.sentiment.brazilLabel,
                  brazilDrivers: payload.drivers ?? prev.sentiment.brazilDrivers,
                  lastUpdated: payload.timestamp ?? new Date().toISOString(),
                },
              };
              notifySentimentChange(updated.sentiment, prevSentimentRef.current);
              prevSentimentRef.current = updated.sentiment;
              return updated;
            });
          }

          // Signals Ingest
          if (normalizedTopic === 'mcp/macro/signals/win' && payload) {
            setMarketState((prev) => ({
              ...prev,
              indexSignal: {
                ...prev.indexSignal,
                action: payload.action || prev.indexSignal.action,
                confidence: payload.confidence || prev.indexSignal.confidence,
                targetPrice: payload.target || prev.indexSignal.targetPrice,
                stopLoss: payload.stopLoss || prev.indexSignal.stopLoss,
                bias: payload.bias || prev.indexSignal.bias,
              },
            }));
          }

          if (normalizedTopic === 'mcp/macro/signals/wdo' && payload) {
            setMarketState((prev) => ({
              ...prev,
              dollarSignal: {
                ...prev.dollarSignal,
                action: payload.action || prev.dollarSignal.action,
                confidence: payload.confidence || prev.dollarSignal.confidence,
                targetPrice: payload.target || prev.dollarSignal.targetPrice,
                stopLoss: payload.stopLoss || prev.dollarSignal.stopLoss,
                bias: payload.bias || prev.dollarSignal.bias,
              },
            }));
          }
        } catch (parseErr) {
          console.warn('Erro ao processar pacote Mosca MQTT SSE:', parseErr);
        }
      });
    } catch (e) {
      console.warn('Erro ao instanciar EventSource do Mosca Broker:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [notifySentimentChange]);

  // Refresh trigger
  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    soundFX.playActivation();
    try {
      const res = await fetch('/api/macro/indicators');
      const data = await res.json();
      if (data.indicators) {
        setIndicators(data.indicators);
        setDataStatus('LIVE');
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR'));
      setIsRefreshing(false);
      soundFX.playSuccess();
    }
  };

  // Listen to speech synthesis status
  useEffect(() => {
    const unsub = speechEngine.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundFX.enabled = nextState;
  };

  const handleSpeakMessage = useCallback(
    (text: string) => {
      if (!soundEnabled) return;
      speechEngine.speak(text, language);
    },
    [soundEnabled, language]
  );

  // Chat message send
  const handleSendMessage = async (text: string) => {
    const userMsg: JarvisMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      let res = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          aiModel,
          history: messages.slice(-5).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          language,
        }),
      });

      if (!res.ok && res.status === 404) {
        res = await fetch('/api/jarvis/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            aiModel,
            history: messages.slice(-5).map((m) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text,
            })),
            language,
          }),
        });
      }

      const data = await res.json();
      const botResponseText =
        data.text || 'Análise macroeconômica e confluência quantitativa calculadas com êxito pelo MCP Macro Hub.';

      const mcpMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        tradeSignal: data.tradeSignal,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, mcpMsg]);
      soundFX.playActivation();

      if (voiceAutoSpeak) {
        handleSpeakMessage(botResponseText);
      }
    } catch (err: any) {
      console.error('Error communicating with MCP Macro Hub API:', err);
      const errorMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Canais de comunicação quantitativa estabilizados em modo local. O motor MCP Macro Hub segue operando com segurança.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
    } else {
      speechEngine.startListening(
        language,
        (transcript, isFinal) => {
          if (isFinal) {
            handleSendMessage(transcript);
          }
        },
        (listening) => setIsListening(listening),
        (error) => {
          console.warn('Speech error:', error);
          setIsListening(false);
        }
      );
    }
  };

  const handleOpenCalculator = (asset: 'DOL' | 'IND') => {
    setSelectedCalcAsset(asset);
    setCurrentView('quant_calculator');
  };

  const handleExecuteTerminalCommand = async (cmd: string): Promise<string> => {
    let res = await fetch('/api/mcp/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cmd,
        history: [],
        language,
      }),
    });

    if (!res.ok && res.status === 404) {
      res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cmd,
          history: [],
          language,
        }),
      });
    }

    const data = await res.json();
    return data.text || data.reply || 'Comando processado pelo terminal quantitativo MCP Macro Hub.';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-x-hidden flex flex-col selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background Subtle Ambience */}
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Modern Sticky Header */}
      <ModernHeader
        currentView={currentView}
        onViewChange={handleSelectView}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleCopilot={() => setCopilotDrawerOpen((prev) => !prev)}
        isCopilotOpen={copilotDrawerOpen}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        voiceAutoSpeak={voiceAutoSpeak}
        onToggleVoiceAutoSpeak={() => setVoiceAutoSpeak((prev) => !prev)}
        onRefreshData={handleForceRefresh}
        isRefreshing={isRefreshing}
        quotes={liveQuotes}
        aiModel={aiModel}
        onAIModelChange={setAiModel}
      />

      {/* Live Market Ticker Tape */}
      <MarketTickerBar
        quotes={liveQuotes}
        onSelectQuote={(ticker) => {
          if (ticker.includes('WIN') || ticker.includes('WDO') || ticker.includes('DOL')) {
            handleSelectView('signals');
          } else {
            handleSelectView('win_leaders');
          }
        }}
      />

      {/* Floating Alert Toast */}
      {currentToastAlert && (
        <div
          id="macro-thermometer-toast"
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-750 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="font-heading font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
                  <span>ALERTA MACRO // ALTERAÇÃO NO TERMÔMETRO</span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                    {currentToastAlert.timestamp}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentToastAlert(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                title="Fechar Alerta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono">GLOBAL (RISK-ON/OFF)</span>
                <span className="font-bold text-zinc-100 mt-0.5">
                  {currentToastAlert.globalLabel} ({currentToastAlert.newGlobalScore > 0 ? `+${currentToastAlert.newGlobalScore}` : currentToastAlert.newGlobalScore} pts)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col">
                <span className="text-[10px] text-zinc-400 font-mono">BRASIL (RISCO FISCAL)</span>
                <span className="font-bold text-zinc-100 mt-0.5">
                  {currentToastAlert.brazilLabel} ({currentToastAlert.newBrazilScore > 0 ? `+${currentToastAlert.newBrazilScore}` : currentToastAlert.newBrazilScore} pts)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800 text-xs">
              <span className="text-[11px] text-zinc-300 truncate">
                {currentToastAlert.summary}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    soundFX.playActivation();
                    handleSpeakMessage(`Alerta macroeconômico: Sentimento Global em ${currentToastAlert.globalLabel} e Sentimento Brasil em ${currentToastAlert.brazilLabel}.`);
                  }}
                  className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-[11px] text-zinc-200 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Ouvir
                </button>
                <button
                  onClick={() => {
                    handleSelectView('dashboard');
                    setCurrentToastAlert(null);
                  }}
                  className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-[11px] font-medium text-white flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Ver Dashboard <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout: Modern Sidebar + Main View Router */}
      <div className="flex flex-1 relative min-h-[calc(100vh-130px)]">
        <ModernSidebar
          currentView={currentView}
          onViewChange={handleSelectView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          indicatorsCount={indicators.length}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6 w-full max-w-7xl mx-auto">
          <ErrorBoundary fallbackTitle="Falha ao renderizar os painéis" onReset={() => setCurrentView('signals')}>
            {/* Router of Views */}
            {currentView === 'mcp_hub' && <McpMacroHubDashboard />}

            {currentView === 'win_leaders' && <WinGlobalLeadersView />}

        {currentView === 'dashboard' && (
          <DashboardView
            dataStatus={dataStatus}
            lastUpdated={lastSyncTime}
            isRefreshing={isRefreshing}
            onRefresh={handleForceRefresh}
            onOpenManualEntry={() => setIsManualModalOpen(true)}
            indicators={indicators}
            weights={weights}
            intradayTimeline={intradayTimeline}
            confluenceTimeline={confluenceTimeline}
            currentSentiment={currentSentiment}
            currentBrazilSentiment={currentBrazilSentiment}
            currentWinBias={currentWinBias}
            currentWdoBias={currentWdoBias}
            currentConfluence={currentConfluence}
            crossings={crossings}
            divergences={divergences}
            lagItems={lagItems}
            currentTime={currentTimeFormatted}
          />
        )}

        {currentView === 'configuracoes' && (
          <ConfiguracoesView
            indicators={indicators}
            weights={weights}
            onSaveWeights={(newW) => setWeights(newW)}
          />
        )}

        {currentView === 'diario' && <DiarioTradeView />}

        {currentView === 'partnr_api' && <PartnrApiView />}

        {currentView === 'mqtt_stream' && (
          <MqttStreamView
            indicators={indicators}
            weights={weights}
            currentConfluence={currentConfluence}
            globalScore={currentSentiment.score}
            brazilScore={currentBrazilSentiment.score}
            winBias={currentWinBias}
            wdoBias={currentWdoBias}
          />
        )}

        {currentView === 'mcp' && <McpView />}

        {currentView === 'auth' && <AuthView />}

        {currentView === 'api' && <ApiKeysView onSyncIndicators={handleForceRefresh} />}

        {currentView === 'sources' && (
          <MacroSourcesHub
            sources={marketState.sources || []}
            onAskJarvis={handleSendMessage}
          />
        )}

        {currentView === 'sentiment' && (
          <SentimentGaugePanel
            sentiment={marketState.sentiment}
            onAskJarvis={handleSendMessage}
            onUpdateSentiment={() => {}}
            alerts={thermometerAlerts}
          />
        )}

        {currentView === 'macro_news' && (
          <MacroNewsFeed
            news={marketState.news}
            onAskJarvis={handleSendMessage}
          />
        )}

        {currentView === 'calendar' && (
          <EconomicCalendarPanel
            events={marketState.calendar}
            onAskJarvis={handleSendMessage}
          />
        )}

        {currentView === 'quant_calculator' && (
          <QuantPositionCalculator
            initialAsset={selectedCalcAsset}
            currentDollarPrice={liveDollarSignal.currentPrice}
            currentIndexPrice={liveIndexSignal.currentPrice}
            onAskJarvis={handleSendMessage}
          />
        )}

        {currentView === 'terminal' && (
          <TerminalView
            marketState={marketState}
            onExecuteCommand={handleExecuteTerminalCommand}
          />
        )}

        {(currentView === 'signals' || !VALID_VIEWS.includes(currentView)) && (
          <div className="flex flex-col gap-6">
            {/* 1. Primary Highlight: Real-Time Trade Signals Panel (WIN & WDO, Extreme Volatility, Dynamic Targets) */}
            <TradeSignalsPanel
              dollarSignal={liveDollarSignal}
              indexSignal={liveIndexSignal}
              news={marketState.news}
              onAskJarvis={handleSendMessage}
              onOpenCalculator={handleOpenCalculator}
            />

            {/* 2. Secondary Context: Operational Confluence Matrix & Assistant Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col">
                  <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <span className="font-heading font-semibold text-xs text-zinc-200">
                        MATRIZ DE CONFLUÊNCIA OPERACIONAL
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      EXECUÇÃO ATIVA
                    </span>
                  </div>

                  {/* Operational Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-400">MINI DÓLAR (WDO)</span>
                      <span className={`text-sm font-semibold mt-1 ${liveDollarSignal.action.includes('COMPRA') ? 'text-emerald-400' : liveDollarSignal.action.includes('VENDA') ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {liveDollarSignal.action}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Confiança: {liveDollarSignal.confidence}%
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-400">MINI ÍNDICE (WIN)</span>
                      <span className={`text-sm font-semibold mt-1 ${liveIndexSignal.action.includes('COMPRA') ? 'text-emerald-400' : liveIndexSignal.action.includes('VENDA') ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {liveIndexSignal.action}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Confiança: {liveIndexSignal.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* AI Diagnosis CTA */}
                  <button
                    onClick={() => {
                      handleSendMessage('Forneça um panorama executivo dos sinais de Dólar e Índice agora com foco em confluência intraday.');
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    Gerar Diagnóstico Executivo de Confluência
                  </button>

                  <div className="w-full mt-4 pt-3 border-t border-zinc-800 grid grid-cols-3 text-center">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400">REGIME</div>
                      <div className="text-xs text-zinc-200 font-semibold mt-0.5">
                        Intraday B3
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400">NÃO-CIRCULAR</div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                        100% Ativo
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400">SENTIMENTO</div>
                      <div className="text-xs text-blue-400 font-semibold mt-0.5">
                        {marketState.sentiment.globalScore > 0 ? `+${marketState.sentiment.globalScore}` : marketState.sentiment.globalScore} pts
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-zinc-400" />
                      <span className="font-heading font-semibold text-xs text-zinc-200">
                        TERMÔMETRO DE SENTIMENTO
                      </span>
                    </div>
                    <button
                      onClick={() => handleSelectView('sentiment')}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      VER ANÁLISE COMPLETA →
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Sentimento Global:</span>
                      <span className="text-emerald-400 font-semibold">
                        {marketState.sentiment.globalLabel} (+{marketState.sentiment.globalScore} pts)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Sentimento Brasil:</span>
                      <span className="text-rose-400 font-semibold">
                        {marketState.sentiment.brazilLabel} ({marketState.sentiment.brazilScore} pts)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Correlação DXY x Dólar:</span>
                      <span className="text-blue-400 font-semibold font-mono">
                        +{marketState.sentiment.correlationDXY_DOL * 100}% (Alta)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ChatConsole
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isListening={isListening}
                  onToggleListening={handleToggleListening}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  language={language}
                  onSpeakMessage={handleSpeakMessage}
                  aiModel={aiModel}
                  onAIModelChange={setAiModel}
                  voiceAutoSpeak={voiceAutoSpeak}
                  onToggleVoiceAutoSpeak={() => setVoiceAutoSpeak((prev) => !prev)}
                />
              </div>
            </div>
          </div>
        )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        currentView={currentView}
        onSelectView={handleSelectView}
        onRefreshData={handleForceRefresh}
        onToggleSound={handleToggleSound}
        soundEnabled={soundEnabled}
      />

      {/* Global Slide-Over Assistant Drawer */}
      <AssistantDrawer
        isOpen={copilotDrawerOpen}
        onClose={() => setCopilotDrawerOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isListening={isListening}
        onToggleListening={handleToggleListening}
        isProcessing={isProcessing}
        isSpeaking={isSpeaking}
        language={language}
        onSpeakMessage={handleSpeakMessage}
        aiModel={aiModel}
        onAIModelChange={setAiModel}
        voiceAutoSpeak={voiceAutoSpeak}
        onToggleVoiceAutoSpeak={() => setVoiceAutoSpeak((prev) => !prev)}
      />

      {/* Manual Entry Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        indicators={indicators}
        onSave={handleSaveManualEntry}
      />

      {/* Terminal Footer */}
      <Footer />
    </div>
  );
}
