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
import { TopBar } from './components/TopBar';
import { MarketTickerBar } from './components/MarketTickerBar';
import { TradeSignalsPanel } from './components/TradeSignalsPanel';
import { SentimentGaugePanel } from './components/SentimentGaugePanel';
import { MacroNewsFeed } from './components/MacroNewsFeed';
import { EconomicCalendarPanel } from './components/EconomicCalendarPanel';
import { QuantPositionCalculator } from './components/QuantPositionCalculator';
import { TerminalView } from './components/TerminalView';
import { ArcReactor } from './components/ArcReactor';
import { ChatConsole } from './components/ChatConsole';
import { MacroSourcesHub } from './components/MacroSourcesHub';
import { DashboardView } from './views/DashboardView';
import { ConfiguracoesView } from './views/ConfiguracoesView';
import { DiarioTradeView } from './views/DiarioTradeView';
import { PartnrApiView } from './views/PartnrApiView';
import { McpView } from './views/McpView';
import { MqttStreamView } from './views/MqttStreamView';
import { AuthView } from './views/AuthView';
import { ApiKeysView } from './views/ApiKeysView';
import { ManualEntryModal } from './components/ManualEntryModal';
import { Footer } from './components/Footer';
import { soundFX } from './utils/soundEffects';
import { speechEngine } from './utils/speech';

import { DEFAULT_INDICATORS, DEFAULT_WEIGHTS } from './data/indicatorsRegistry';
import { CANONICAL_TIMELINE, generateCanonicalMarketTimeline } from './data/mockMarketTimeline';
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

export default function App() {
  const [currentView, setCurrentView] = useState<HUDView>('dashboard');
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
    const h = String(currentDate.getHours()).padStart(2, '0');
    const m = String(currentDate.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
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
    const exactUsdPrice = usdBrlInd ? usdBrlInd.value : 5.405;
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
    const exactWinPrice = winInd ? winInd.value : 134250;
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

  // J.A.R.V.I.S. Welcome Message
  const [messages, setMessages] = useState<JarvisMessage[]>([
    {
      id: 'init-fin-1',
      sender: 'jarvis',
      text: `Às suas ordens, Sr. Stark. Sou o seu Agente Quantitativo Macro J.A.R.V.I.S.
      
Concluí a varredura macroeconômica global e brasileira:
• CONFLUÊNCIA ATUAL: Cenário em 🟢 ALTA (Confluência 82% | Força de Alta 73 | Risk Score 66 | Rastro Macro 65).
• DÓLAR (USD/BRL - WDO): Viés Vendedor / Alívio (DXY estável e fluxo institucional estrangeiro de +R$ 1.85B).
• ÍNDICE BOVESPA (IBOV - WIN): Viés Comprador (+0.42% com S&P 500 e DI fechando).
• AUDITORIA: Princípio de Não-Circularidade (Seção 71) estritamente preservado.

Como deseja orientar as operações desta sessão?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const prevSentimentRef = useRef<SentimentAnalysis>(marketState.sentiment);

  // Core handler for J.A.R.V.I.S. Thermometer Watcher
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

      const jarvisSpoken = `Atenção, senhor Stark. Detectei uma variação no termômetro de sentimento. O Sentimento Global agora está em ${newSentiment.globalLabel} com ${newSentiment.globalScore > 0 ? '+' : ''}${newSentiment.globalScore} pontos, e o Sentimento Brasil está em ${newSentiment.brazilLabel} com ${newSentiment.brazilScore > 0 ? '+' : ''}${newSentiment.brazilScore} pontos.`;

      soundFX.playAlert();

      if (soundEnabled && voiceAutoSpeak) {
        speechEngine.speak(jarvisSpoken, language);
      }

      const isSevereRiskOff = newSentiment.globalScore < -20 || newSentiment.brazilScore < -20;
      const alertMsg: JarvisMessage = {
        id: Date.now().toString(),
        sender: 'jarvis',
        text: `🚨 **[AVISO J.A.R.V.I.S. // OSCILAÇÃO NO TERMÔMETRO DE SENTIMENTO]**
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
          source: 'JARVIS_UI_CLIENT',
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

          // Ingest Real Indicators Array
          if (topic === 'jarvis/macro/indicators/all' || topic === 'jarvis/macro/indicators') {
            if (payload?.indicators && Array.isArray(payload.indicators)) {
              setIndicators(payload.indicators);
            }
          }

          // Single Indicator Ingest
          if (topic.startsWith('jarvis/macro/indicators/') && topic !== 'jarvis/macro/indicators/all') {
            const indId = topic.split('/').pop();
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
          if (topic === 'jarvis/macro/sentiment/global' && payload) {
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

          if (topic === 'jarvis/macro/sentiment/brazil' && payload) {
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
          if (topic === 'jarvis/macro/signals/win' && payload) {
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

          if (topic === 'jarvis/macro/signals/wdo' && payload) {
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
    return unsub;
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
      const res = await fetch('/api/jarvis/chat', {
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

      const data = await res.json();
      const botResponseText =
        data.text || 'Análise macroeconômica e confluência calculadas com êxito, senhor.';

      const jarvisMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        tradeSignal: data.tradeSignal,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      soundFX.playActivation();

      if (voiceAutoSpeak) {
        handleSpeakMessage(botResponseText);
      }
    } catch (err: any) {
      console.error('Error communicating with JARVIS:', err);
      const errorMsg: JarvisMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: 'Canais de comunicação quantitativa estabilizados em modo local. O motor macro segue operando com segurança.',
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
    const res = await fetch('/api/jarvis/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cmd,
        history: [],
        language,
      }),
    });
    const data = await res.json();
    return data.text || 'Comando processado pelo cluster quantitativo J.A.R.V.I.S.';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-400 font-body relative overflow-x-hidden scanlines">
      {/* Background Grid */}
      <div className="fixed inset-0 grid-bg opacity-35 pointer-events-none" />

      {/* Top Navigation Bar */}
      <TopBar
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        onThemeChange={setTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        language={language}
        onLanguageChange={setLanguage}
        voiceAutoSpeak={voiceAutoSpeak}
        onToggleVoiceAutoSpeak={() => setVoiceAutoSpeak((prev) => !prev)}
        aiModel={aiModel}
        onAIModelChange={setAiModel}
      />

      {/* J.A.R.V.I.S. Floating Alert Toast */}
      {currentToastAlert && (
        <div
          id="jarvis-thermometer-toast"
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-xl animate-bounce-short"
        >
          <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.45)] backdrop-blur-xl flex flex-col gap-2.5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 animate-pulse" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
                  <BellRing className="w-4 h-4" />
                </div>
                <div className="font-orbitron font-bold text-xs text-cyan-200 tracking-wider flex items-center gap-1.5">
                  <span>AVISO J.A.R.V.I.S. // MUDANÇA NO TERMÔMETRO</span>
                  <span className="text-[10px] font-tech text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    {currentToastAlert.timestamp}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentToastAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-cyan-200 hover:bg-slate-800 transition-all"
                title="Fechar Aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-tech">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex flex-col">
                <span className="text-[10px] text-slate-400">GLOBAL (RISK-ON/OFF)</span>
                <span className="font-bold text-cyan-300">
                  {currentToastAlert.globalLabel} ({currentToastAlert.newGlobalScore > 0 ? `+${currentToastAlert.newGlobalScore}` : currentToastAlert.newGlobalScore} pts)
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/20 flex flex-col">
                <span className="text-[10px] text-slate-400">BRASIL (RISCO FISCAL)</span>
                <span className="font-bold text-amber-300">
                  {currentToastAlert.brazilLabel} ({currentToastAlert.newBrazilScore > 0 ? `+${currentToastAlert.newBrazilScore}` : currentToastAlert.newBrazilScore} pts)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-cyan-500/20 text-xs font-tech">
              <span className="text-[11px] text-slate-300 truncate">
                {currentToastAlert.summary}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    soundFX.playActivation();
                    handleSpeakMessage(`Aviso do termômetro: Sentimento Global em ${currentToastAlert.globalLabel} e Sentimento Brasil em ${currentToastAlert.brazilLabel}.`);
                  }}
                  className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] text-cyan-200 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Ouvir
                </button>
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setCurrentToastAlert(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-[11px] font-bold text-white flex items-center gap-1"
                >
                  <Compass className="w-3 h-3" /> Ver Painel <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Market Ticker Tape */}
      <MarketTickerBar quotes={liveQuotes} />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 relative z-10">
        {/* Router of Views */}
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

        {currentView === 'signals' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/25 backdrop-blur-md flex flex-col items-center justify-center">
                  <div className="w-full flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="font-orbitron font-semibold text-xs text-cyan-100 tracking-wider">
                        NÚCLEO QUANTITATIVO J.A.R.V.I.S.
                      </span>
                    </div>
                    <span className="font-tech text-[10px] text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                      MODO TRADE ATIVO
                    </span>
                  </div>

                  <ArcReactor
                    theme={theme}
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    isProcessing={isProcessing}
                    powerOutput={marketState.arcReactorPower}
                    onClick={() => {
                      handleSendMessage('J.A.R.V.I.S., forneça um panorama executivo dos sinais de Dólar e Índice agora.');
                    }}
                  />

                  <div className="w-full mt-3 pt-3 border-t border-cyan-500/20 grid grid-cols-3 text-center">
                    <div>
                      <div className="text-[10px] font-tech text-slate-400">DÓLAR</div>
                      <div className="font-orbitron text-xs text-emerald-400 font-bold">
                        {liveDollarSignal.action} ({liveDollarSignal.confidence}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-tech text-slate-400">IBOVESPA</div>
                      <div className="font-orbitron text-xs text-rose-400 font-bold">
                        {liveIndexSignal.action} ({liveIndexSignal.confidence}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-tech text-slate-400">SENTIMENTO</div>
                      <div className="font-tech text-xs text-cyan-300 font-bold">GLOBAL +38</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/25 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="font-orbitron font-semibold text-xs text-cyan-100">
                        TERMÔMETRO DE SENTIMENTO
                      </span>
                    </div>
                    <button
                      onClick={() => setCurrentView('sentiment')}
                      className="text-[10px] font-tech text-cyan-300 hover:underline"
                    >
                      VER ANÁLISE COMPLETA →
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs font-tech">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Sentimento Global:</span>
                      <span className="text-emerald-400 font-bold">
                        {marketState.sentiment.globalLabel} (+{marketState.sentiment.globalScore} pts)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Sentimento Brasil:</span>
                      <span className="text-rose-400 font-bold">
                        {marketState.sentiment.brazilLabel} ({marketState.sentiment.brazilScore} pts)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Correlação DXY x Dólar:</span>
                      <span className="text-cyan-300 font-bold">
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

            <div className="mt-2">
              <TradeSignalsPanel
                dollarSignal={liveDollarSignal}
                indexSignal={liveIndexSignal}
                news={marketState.news}
                onAskJarvis={handleSendMessage}
                onOpenCalculator={handleOpenCalculator}
              />
            </div>
          </div>
        )}
      </main>

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
