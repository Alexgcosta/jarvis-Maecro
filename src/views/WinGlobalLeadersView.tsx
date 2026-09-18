import React, { useState, useEffect, useCallback } from 'react';
import {
  calculateWinGlobalLeadersState,
  generateWinLeadersTimeline,
  RawMarketInputs,
} from '../calculations/winGlobalLeadersEngine';
import { WinGlobalLeadersState, IntradayConfluenceTimelinePoint } from '../types/winGlobalLeadersTypes';
import { WinLeadersTopPanel } from '../components/winLeaders/WinLeadersTopPanel';
import { WinLeadersRankingPanel } from '../components/winLeaders/WinLeadersRankingPanel';
import { WinLeadersConfirmationMatrix } from '../components/winLeaders/WinLeadersConfirmationMatrix';
import { WinLeadersConfluenceChart } from '../components/winLeaders/WinLeadersConfluenceChart';
import { EwzGexWinProxyPanel } from '../components/winLeaders/EwzGexWinProxyPanel';
import { WinLeadersAdrsCommoditiesPanel } from '../components/winLeaders/WinLeadersAdrsCommoditiesPanel';
import { WinLeadersDivergenceLeadLagPanel } from '../components/winLeaders/WinLeadersDivergenceLeadLagPanel';
import { WinLeadersExecutivePanel } from '../components/winLeaders/WinLeadersExecutivePanel';
import { WinLeadersBacktestPanel } from '../components/winLeaders/WinLeadersBacktestPanel';
import { WinLeadersDebugPanel } from '../components/winLeaders/WinLeadersDebugPanel';
import { WinLeadersManualModal } from '../components/winLeaders/WinLeadersManualModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { soundFX } from '../utils/soundEffects';

export const WinGlobalLeadersView: React.FC = () => {
  const [rawInputs, setRawInputs] = useState<RawMarketInputs>({});
  const [state, setState] = useState<WinGlobalLeadersState>(() => calculateWinGlobalLeadersState(rawInputs));
  const [timeline, setTimeline] = useState<IntradayConfluenceTimelinePoint[]>(() => generateWinLeadersTimeline());
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live polling / sync every 5 seconds
  const handleRecalculate = useCallback((customInputs?: RawMarketInputs) => {
    const inputsToUse = customInputs || rawInputs;
    setState((prevState) =>
      calculateWinGlobalLeadersState({
        ...inputsToUse,
        lastScenario: prevState.scenario,
        scenarioConsecutiveCount: prevState.consecutiveScenarioTicks,
      })
    );
  }, [rawInputs]);

  const handleForceRefresh = useCallback(() => {
    setIsRefreshing(true);
    soundFX.playClick();
    setTimeout(() => {
      handleRecalculate();
      setIsRefreshing(false);
      soundFX.playSuccess();
    }, 600);
  }, [handleRecalculate]);

  const handleApplyManualInputs = (inputs: RawMarketInputs) => {
    setRawInputs(inputs);
    handleRecalculate(inputs);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleRecalculate();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleRecalculate]);

  return (
    <div id="win_global_leaders_view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER & CORE METRICS (WIN Global Score, Bullish/Bearish, Confluence, Confidence, Faróis) */}
      <ErrorBoundary name="WinLeadersTopPanel">
        <WinLeadersTopPanel
          state={state}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onForceRefresh={handleForceRefresh}
          isRefreshing={isRefreshing}
        />
      </ErrorBoundary>

      {/* 2. RANKING DE LÍDERES ("QUEM ESTÁ LIDERANDO O WIN?") */}
      <ErrorBoundary name="WinLeadersRankingPanel">
        <WinLeadersRankingPanel ranking={state.leaderRanking} />
      </ErrorBoundary>

      {/* 3. GRÁFICO DE CONFLUÊNCIA INTRADAY */}
      <ErrorBoundary name="WinLeadersConfluenceChart">
        <WinLeadersConfluenceChart timeline={timeline} />
      </ErrorBoundary>

      {/* 4. MATRIZ DE CONFIRMAÇÃO (9 GRUPOS) & MATRIZ WIN × WDO */}
      <ErrorBoundary name="WinLeadersConfirmationMatrix">
        <WinLeadersConfirmationMatrix
          groups={state.confluenceGroups}
          winPriceState={state.winPriceState}
          wdoPriceState={state.wdoPriceState}
        />
      </ErrorBoundary>

      {/* 5. EWZ GEX & PROJEÇÃO ESTATÍSTICA WIN PROXY & ZONAS ESTATÍSTICAS */}
      <ErrorBoundary name="EwzGexWinProxyPanel">
        <EwzGexWinProxyPanel
          ewzState={state.ewzGexState}
          winPriceState={state.winPriceState}
          bova11State={state.bova11State}
          onOpenManualModal={() => setIsManualModalOpen(true)}
        />
      </ErrorBoundary>

      {/* 6. ADRs BRASILEIRAS (NYSE) & COMMODITIES GLOBAIS */}
      <ErrorBoundary name="WinLeadersAdrsCommoditiesPanel">
        <WinLeadersAdrsCommoditiesPanel
          adrs={state.adrs}
          adrScore={state.adrScore}
          commodities={state.commodities}
        />
      </ErrorBoundary>

      {/* 7. MOTOR DE DIVERGÊNCIAS, LEAD/LAG ENGINE & CORRELAÇÕES DINÂMICAS */}
      <ErrorBoundary name="WinLeadersDivergenceLeadLagPanel">
        <WinLeadersDivergenceLeadLagPanel
          divergences={state.divergences}
          correlations={state.correlations}
          betas={state.betas}
          leadLags={state.leadLags}
        />
      </ErrorBoundary>

      {/* 8. SÍNTESE EXECUTIVA & AUDITORIA QUANTITATIVA DE LIDERANÇA */}
      <ErrorBoundary name="WinLeadersExecutivePanel">
        <WinLeadersExecutivePanel state={state} />
      </ErrorBoundary>

      {/* 9. BACKTESTING & ROBUSTEZ ESTATÍSTICA (Horizontes +5m, +15m, +30m, +60m) */}
      <ErrorBoundary name="WinLeadersBacktestPanel">
        <WinLeadersBacktestPanel />
      </ErrorBoundary>

      {/* 10. DEBUG & MATRIZ DE AUDITORIA FORMAL (SEM CIRCULARIDADE) */}
      <ErrorBoundary name="WinLeadersDebugPanel">
        <WinLeadersDebugPanel state={state} />
      </ErrorBoundary>

      {/* Manual Entry Modal */}
      <WinLeadersManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onApplyManualInputs={handleApplyManualInputs}
      />
    </div>
  );
};
