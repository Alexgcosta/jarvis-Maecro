import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AssetVolatilityState,
  VolatilityDetectorConfig,
  loadVolatilityConfig,
  saveVolatilityConfig,
  evaluatePriceVolatility,
  generateSyntheticSpikePrices,
} from '../calculations/volatilitySpikeDetector';
import { soundFX } from '../utils/soundEffects';

interface UseVolatilitySpikeDetectorOptions {
  dollarPrice?: number;
  indexPrice?: number;
  enabled?: boolean;
}

export interface VolatilityDetectorHookResult {
  config: VolatilityDetectorConfig;
  dollarVolatility: AssetVolatilityState;
  indexVolatility: AssetVolatilityState;
  hasExtremeVolatility: boolean;
  activeSpikeAssets: Array<'DOL' | 'IND'>;
  updateThreshold: (asset: 'DOL' | 'IND', threshold: number) => void;
  updateWindowSize: (windowSize: number) => void;
  updateCooldown: (cooldownSeconds: number) => void;
  toggleSoundAlert: () => void;
  triggerTestSpike: (asset: 'DOL' | 'IND') => void;
  resetSpikes: (asset?: 'DOL' | 'IND') => void;
}

export function useVolatilitySpikeDetector({
  dollarPrice = 5.405,
  indexPrice = 134250,
  enabled = true,
}: UseVolatilitySpikeDetectorOptions = {}): VolatilityDetectorHookResult {
  // 1. Configuração com persistência local
  const [config, setConfig] = useState<VolatilityDetectorConfig>(() => loadVolatilityConfig());

  // 2. Filas de preços amostrados em background
  const dollarPricesRef = useRef<number[]>([]);
  const indexPricesRef = useRef<number[]>([]);
  const lastSpikeRef = useRef<{ DOL: number | null; IND: number | null }>({ DOL: null, IND: null });

  // Inicializa com sementes realistas caso ainda vazio
  if (dollarPricesRef.current.length === 0) {
    const base = dollarPrice || 5.405;
    const initial: number[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push(+(base + (Math.random() - 0.5) * 0.006).toFixed(3));
    }
    dollarPricesRef.current = initial;
  }

  if (indexPricesRef.current.length === 0) {
    const base = indexPrice || 134250;
    const initial: number[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push(Math.round(base + (Math.random() - 0.5) * 60));
    }
    indexPricesRef.current = initial;
  }

  // 3. Estados de volatilidade para DOL e IND
  const [dollarVolatility, setDollarVolatility] = useState<AssetVolatilityState>(() => {
    const evalResult = evaluatePriceVolatility(
      dollarPricesRef.current,
      config.dollarThresholdPercent,
      config.windowSize
    );
    return {
      asset: 'DOL',
      ticker: 'WDO / USD',
      currentPrice: dollarPrice,
      sampleCount: dollarPricesRef.current.length,
      recentReturns: evalResult.returns,
      meanPriceChangePercent: evalResult.mean,
      stdDevPriceChangePercent: evalResult.stdDev,
      thresholdPercent: config.dollarThresholdPercent,
      isExtremeVolatility: evalResult.isExtremeVolatility,
      spikeRatio: evalResult.spikeRatio,
      lastSpikeTimestamp: null,
      spikeActiveSince: null,
      history: [],
    };
  });

  const [indexVolatility, setIndexVolatility] = useState<AssetVolatilityState>(() => {
    const evalResult = evaluatePriceVolatility(
      indexPricesRef.current,
      config.indexThresholdPercent,
      config.windowSize
    );
    return {
      asset: 'IND',
      ticker: 'WIN / IBOV',
      currentPrice: indexPrice,
      sampleCount: indexPricesRef.current.length,
      recentReturns: evalResult.returns,
      meanPriceChangePercent: evalResult.mean,
      stdDevPriceChangePercent: evalResult.stdDev,
      thresholdPercent: config.indexThresholdPercent,
      isExtremeVolatility: evalResult.isExtremeVolatility,
      spikeRatio: evalResult.spikeRatio,
      lastSpikeTimestamp: null,
      spikeActiveSince: null,
      history: [],
    };
  });

  // Grava novos preços passados por props se houver variação real
  useEffect(() => {
    if (dollarPrice && dollarPrice > 0) {
      const last = dollarPricesRef.current[dollarPricesRef.current.length - 1];
      if (last === undefined || Math.abs(last - dollarPrice) > 0.0001) {
        dollarPricesRef.current.push(dollarPrice);
        if (dollarPricesRef.current.length > config.windowSize * 3) {
          dollarPricesRef.current.shift();
        }
      }
    }
  }, [dollarPrice, config.windowSize]);

  useEffect(() => {
    if (indexPrice && indexPrice > 0) {
      const last = indexPricesRef.current[indexPricesRef.current.length - 1];
      if (last === undefined || Math.abs(last - indexPrice) > 0.5) {
        indexPricesRef.current.push(indexPrice);
        if (indexPricesRef.current.length > config.windowSize * 3) {
          indexPricesRef.current.shift();
        }
      }
    }
  }, [indexPrice, config.windowSize]);

  // 4. Background Detector Loop (Processamento contínuo em background a cada 2.5s)
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const formattedTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Atualiza DOL
      const dPrices = dollarPricesRef.current;
      const dEval = evaluatePriceVolatility(dPrices, config.dollarThresholdPercent, config.windowSize);

      let dIsSpike = dEval.isExtremeVolatility;
      // Regra de Cooldown: se já teve spike recente dentro de cooldownSeconds, mantém ativo
      if (!dIsSpike && lastSpikeRef.current.DOL && (now - lastSpikeRef.current.DOL) < config.cooldownSeconds * 1000) {
        dIsSpike = true;
      } else if (dEval.isExtremeVolatility) {
        if (!lastSpikeRef.current.DOL && config.soundAlertEnabled) {
          soundFX.playAlert();
        }
        lastSpikeRef.current.DOL = now;
      } else {
        lastSpikeRef.current.DOL = null;
      }

      setDollarVolatility((prev) => {
        const historyItem = {
          timestamp: now,
          formattedTime,
          stdDev: dEval.stdDev,
          price: dPrices[dPrices.length - 1] || prev.currentPrice,
          isSpike: dIsSpike,
        };
        const newHistory = [...prev.history, historyItem].slice(-20);

        return {
          ...prev,
          currentPrice: dPrices[dPrices.length - 1] || prev.currentPrice,
          sampleCount: dPrices.length,
          recentReturns: dEval.returns,
          meanPriceChangePercent: dEval.mean,
          stdDevPriceChangePercent: dEval.stdDev,
          thresholdPercent: config.dollarThresholdPercent,
          isExtremeVolatility: dIsSpike,
          spikeRatio: dEval.spikeRatio,
          lastSpikeTimestamp: dIsSpike ? (prev.lastSpikeTimestamp || now) : null,
          spikeActiveSince: dIsSpike ? (prev.spikeActiveSince || now) : null,
          history: newHistory,
        };
      });

      // Atualiza IND
      const iPrices = indexPricesRef.current;
      const iEval = evaluatePriceVolatility(iPrices, config.indexThresholdPercent, config.windowSize);

      let iIsSpike = iEval.isExtremeVolatility;
      if (!iIsSpike && lastSpikeRef.current.IND && (now - lastSpikeRef.current.IND) < config.cooldownSeconds * 1000) {
        iIsSpike = true;
      } else if (iEval.isExtremeVolatility) {
        if (!lastSpikeRef.current.IND && config.soundAlertEnabled) {
          soundFX.playAlert();
        }
        lastSpikeRef.current.IND = now;
      } else {
        lastSpikeRef.current.IND = null;
      }

      setIndexVolatility((prev) => {
        const historyItem = {
          timestamp: now,
          formattedTime,
          stdDev: iEval.stdDev,
          price: iPrices[iPrices.length - 1] || prev.currentPrice,
          isSpike: iIsSpike,
        };
        const newHistory = [...prev.history, historyItem].slice(-20);

        return {
          ...prev,
          currentPrice: iPrices[iPrices.length - 1] || prev.currentPrice,
          sampleCount: iPrices.length,
          recentReturns: iEval.returns,
          meanPriceChangePercent: iEval.mean,
          stdDevPriceChangePercent: iEval.stdDev,
          thresholdPercent: config.indexThresholdPercent,
          isExtremeVolatility: iIsSpike,
          spikeRatio: iEval.spikeRatio,
          lastSpikeTimestamp: iIsSpike ? (prev.lastSpikeTimestamp || now) : null,
          spikeActiveSince: iIsSpike ? (prev.spikeActiveSince || now) : null,
          history: newHistory,
        };
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [
    enabled,
    config.dollarThresholdPercent,
    config.indexThresholdPercent,
    config.windowSize,
    config.cooldownSeconds,
    config.soundAlertEnabled,
  ]);

  // 5. Handlers de Calibração e Controle
  const updateThreshold = useCallback((asset: 'DOL' | 'IND', threshold: number) => {
    const valid = Math.max(0.01, Number(threshold.toFixed(3)));
    const updated = asset === 'DOL'
      ? saveVolatilityConfig({ dollarThresholdPercent: valid })
      : saveVolatilityConfig({ indexThresholdPercent: valid });
    setConfig(updated);
  }, []);

  const updateWindowSize = useCallback((windowSize: number) => {
    const valid = Math.max(3, Math.min(60, windowSize));
    const updated = saveVolatilityConfig({ windowSize: valid });
    setConfig(updated);
  }, []);

  const updateCooldown = useCallback((cooldownSeconds: number) => {
    const valid = Math.max(5, Math.min(120, cooldownSeconds));
    const updated = saveVolatilityConfig({ cooldownSeconds: valid });
    setConfig(updated);
  }, []);

  const toggleSoundAlert = useCallback(() => {
    setConfig((prev) => {
      const updated = saveVolatilityConfig({ soundAlertEnabled: !prev.soundAlertEnabled });
      return updated;
    });
  }, []);

  // Injeção de teste imediato para validação do badge pelo usuário
  const triggerTestSpike = useCallback((asset: 'DOL' | 'IND') => {
    const now = Date.now();
    if (asset === 'DOL') {
      const base = dollarPricesRef.current[dollarPricesRef.current.length - 1] || dollarPrice || 5.405;
      const synthetic = generateSyntheticSpikePrices(base, 'DOL');
      dollarPricesRef.current = synthetic;
      lastSpikeRef.current.DOL = now;
      const evalRes = evaluatePriceVolatility(synthetic, config.dollarThresholdPercent, config.windowSize);

      setDollarVolatility((prev) => ({
        ...prev,
        sampleCount: synthetic.length,
        recentReturns: evalRes.returns,
        meanPriceChangePercent: evalRes.mean,
        stdDevPriceChangePercent: evalRes.stdDev,
        isExtremeVolatility: true,
        spikeRatio: evalRes.spikeRatio > 1 ? evalRes.spikeRatio : 1.75,
        lastSpikeTimestamp: now,
        spikeActiveSince: now,
      }));
    } else {
      const base = indexPricesRef.current[indexPricesRef.current.length - 1] || indexPrice || 134250;
      const synthetic = generateSyntheticSpikePrices(base, 'IND');
      indexPricesRef.current = synthetic;
      lastSpikeRef.current.IND = now;
      const evalRes = evaluatePriceVolatility(synthetic, config.indexThresholdPercent, config.windowSize);

      setIndexVolatility((prev) => ({
        ...prev,
        sampleCount: synthetic.length,
        recentReturns: evalRes.returns,
        meanPriceChangePercent: evalRes.mean,
        stdDevPriceChangePercent: evalRes.stdDev,
        isExtremeVolatility: true,
        spikeRatio: evalRes.spikeRatio > 1 ? evalRes.spikeRatio : 1.85,
        lastSpikeTimestamp: now,
        spikeActiveSince: now,
      }));
    }

    if (config.soundAlertEnabled) {
      soundFX.playAlert();
    }
  }, [dollarPrice, indexPrice, config.dollarThresholdPercent, config.indexThresholdPercent, config.windowSize, config.soundAlertEnabled]);

  const resetSpikes = useCallback((asset?: 'DOL' | 'IND') => {
    const now = Date.now();
    if (!asset || asset === 'DOL') {
      lastSpikeRef.current.DOL = null;
      // Restabelece preços calmos
      const base = dollarPricesRef.current[dollarPricesRef.current.length - 1] || 5.405;
      const calm: number[] = [];
      for (let i = 0; i < config.windowSize; i++) {
        calm.push(+(base + (Math.random() - 0.5) * 0.002).toFixed(3));
      }
      dollarPricesRef.current = calm;
      const dEval = evaluatePriceVolatility(calm, config.dollarThresholdPercent, config.windowSize);
      setDollarVolatility((prev) => ({
        ...prev,
        recentReturns: dEval.returns,
        meanPriceChangePercent: dEval.mean,
        stdDevPriceChangePercent: dEval.stdDev,
        isExtremeVolatility: false,
        spikeRatio: dEval.spikeRatio,
        lastSpikeTimestamp: null,
        spikeActiveSince: null,
      }));
    }

    if (!asset || asset === 'IND') {
      lastSpikeRef.current.IND = null;
      const base = indexPricesRef.current[indexPricesRef.current.length - 1] || 134250;
      const calm: number[] = [];
      for (let i = 0; i < config.windowSize; i++) {
        calm.push(Math.round(base + (Math.random() - 0.5) * 20));
      }
      indexPricesRef.current = calm;
      const iEval = evaluatePriceVolatility(calm, config.indexThresholdPercent, config.windowSize);
      setIndexVolatility((prev) => ({
        ...prev,
        recentReturns: iEval.returns,
        meanPriceChangePercent: iEval.mean,
        stdDevPriceChangePercent: iEval.stdDev,
        isExtremeVolatility: false,
        spikeRatio: iEval.spikeRatio,
        lastSpikeTimestamp: null,
        spikeActiveSince: null,
      }));
    }
  }, [config.windowSize, config.dollarThresholdPercent, config.indexThresholdPercent]);

  const activeSpikeAssets: Array<'DOL' | 'IND'> = [];
  if (dollarVolatility.isExtremeVolatility) activeSpikeAssets.push('DOL');
  if (indexVolatility.isExtremeVolatility) activeSpikeAssets.push('IND');

  return {
    config,
    dollarVolatility,
    indexVolatility,
    hasExtremeVolatility: activeSpikeAssets.length > 0,
    activeSpikeAssets,
    updateThreshold,
    updateWindowSize,
    updateCooldown,
    toggleSoundAlert,
    triggerTestSpike,
    resetSpikes,
  };
}
