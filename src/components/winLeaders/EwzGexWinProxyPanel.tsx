import React from 'react';
import { EwzGexState, WinPriceState, Bova11State } from '../../types/winGlobalLeadersTypes';
import { Target, Activity, Zap, TrendingUp, TrendingDown, Layers, ShieldAlert, Cpu, Compass } from 'lucide-react';

interface EwzGexWinProxyPanelProps {
  ewzState: EwzGexState;
  winPriceState: WinPriceState;
  bova11State?: Bova11State;
  onOpenManualModal?: () => void;
}

export const EwzGexWinProxyPanel: React.FC<EwzGexWinProxyPanelProps> = ({
  ewzState,
  winPriceState,
  bova11State,
  onOpenManualModal,
}) => {
  const isGammaPos = ewzState.gammaRegime === 'GAMMA_POSITIVO';
  const isGammaNeg = ewzState.gammaRegime === 'GAMMA_NEGATIVO';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 rounded-lg">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-tech text-white flex items-center gap-2">
              <span>MERCADO À VISTA & GEX PROXIES // BOVA11 & EWZ</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                B3 & NYSE
              </span>
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Mapeamento direto entre o ETF âncora local (BOVA11), Gamma de Opções no exterior (EWZ) e o WIN Futuro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-2.5 py-1 rounded text-xs font-tech font-bold border ${
            isGammaPos
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
              : isGammaNeg
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
          }`}>
            REGIME: {ewzState.gammaRegime.replace('_', ' ')}
          </span>

          {ewzState.isManual && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded text-xs font-mono">
              MANUAL ({ewzState.manualTimestamp})
            </span>
          )}
        </div>
      </div>

      {/* Grid: BOVA11 SPOT + EWZ Core Stats + GEX Strikes & Projected WIN Proxies + ZONAS ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* COL 1: BOVA11 (B3 SPOT ANCHOR) */}
        {bova11State && (() => {
          const bovaPrice = bova11State.price ?? 128.45;
          const bovaChg = bova11State.changePercent ?? bova11State.returnPercent ?? 0;
          const bovaVwap = bova11State.vwap ?? bovaPrice;
          const bovaBeta = bova11State.betaToWin ?? bova11State.betaWithWin ?? 1.02;
          const bovaCorr = bova11State.correlationToWin ?? bova11State.correlationWithWin ?? 0.97;
          const bovaContrib = bova11State.contributionPoints ?? Math.round(bovaChg * 240);
          const bovaSup = bova11State.supportLevel ?? (bovaPrice * 0.988);
          const bovaRes = bova11State.resistanceLevel ?? (bovaPrice * 1.012);
          const bovaFlow = bova11State.flowDirection ?? (bovaChg > 0 ? 'COMPRADOR' : bovaChg < 0 ? 'VENDEDOR' : 'NEUTRO');

          return (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/30 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tech text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>BOVA11 (B3 SPOT)</span>
                </span>
                <span className={bovaChg >= 0 ? 'text-emerald-400 font-mono text-xs font-bold' : 'text-rose-400 font-mono text-xs font-bold'}>
                  {bovaChg >= 0 ? `+${bovaChg.toFixed(2)}%` : `${bovaChg.toFixed(2)}%`}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-tech text-white">R$ {bovaPrice.toFixed(2)}</span>
                <span className="text-xs font-mono text-slate-400">VWAP: <strong className="text-cyan-300">R$ {bovaVwap.toFixed(2)}</strong></span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Fluxo Institucional:</span>
                  <span className={`font-bold ${bovaFlow === 'COMPRADOR' ? 'text-emerald-400' : bovaFlow === 'VENDEDOR' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {bovaFlow}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Beta WIN:</span>
                  <span className="text-white font-bold">{bovaBeta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correlação WIN:</span>
                  <span className="text-cyan-300 font-bold">{bovaCorr.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contribuição WIN:</span>
                  <span className={bovaContrib >= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                    {bovaContrib >= 0 ? `+${bovaContrib} pts` : `${bovaContrib} pts`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sup / Res:</span>
                  <span className="text-slate-300">{bovaSup.toFixed(2)} / {bovaRes.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* COL 2: EWZ Price & Volatility metrics */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech text-slate-400 uppercase font-bold">EWZ METRICS (NY)</span>
            <span className={ewzState.returnPercent >= 0 ? 'text-emerald-400 font-mono text-xs font-bold' : 'text-rose-400 font-mono text-xs font-bold'}>
              {ewzState.returnPercent >= 0 ? `+${ewzState.returnPercent}%` : `${ewzState.returnPercent}%`}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-tech text-white">US$ {ewzState.price.toFixed(2)}</span>
            <span className="text-xs font-mono text-slate-400">RSI: <strong className="text-cyan-300">{ewzState.rsi}</strong></span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Implied Vol (IV):</span>
              <span className="text-white font-bold">{ewzState.iv}%</span>
            </div>
            <div className="flex justify-between">
              <span>Historical Vol (HV):</span>
              <span className="text-slate-300">{ewzState.hv}%</span>
            </div>
            <div className="flex justify-between">
              <span>IV/HV Spread:</span>
              <span className={ewzState.ivHvSpread > 0 ? 'text-amber-400' : 'text-cyan-400'}>
                {ewzState.ivHvSpread > 0 ? `+${ewzState.ivHvSpread}%` : `${ewzState.ivHvSpread}%`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IV Percentile:</span>
              <span className="text-indigo-300 font-bold">{ewzState.ivPercentile}%</span>
            </div>
            <div className="flex justify-between">
              <span>Expected Move:</span>
              <span className="text-cyan-300">± US$ {ewzState.expectedMove}</span>
            </div>
          </div>
        </div>

        {/* COL 3: EWZ GEX Strikes vs WIN Proxies */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech text-slate-400 uppercase font-bold">ESTRUTURA GEX &rarr; WIN PROXY</span>
            <span className="text-[11px] font-mono text-cyan-400">Beta: {ewzState.betaEwzWin}</span>
          </div>

          {/* Call Wall */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-emerald-400 uppercase block font-bold">CALL WALL (TETO)</span>
              <span className="text-[11px] font-mono text-slate-400">EWZ: US$ {(ewzState.callWallStrike ?? 31).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-tech text-emerald-400">
                {(ewzState.winCallWallProxy ?? 0).toLocaleString('pt-BR')} pts
              </span>
            </div>
          </div>

          {/* Gamma Flip */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase block font-bold">GAMMA FLIP (DIVISOR)</span>
              <span className="text-[11px] font-mono text-slate-400">EWZ: US$ {(ewzState.gammaFlipStrike ?? 29).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-tech text-cyan-300">
                {(ewzState.winGammaFlipProxy ?? 0).toLocaleString('pt-BR')} pts
              </span>
            </div>
          </div>

          {/* Put Wall */}
          <div className="bg-slate-900/90 p-2 rounded-lg border border-rose-500/30 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-rose-400 uppercase block font-bold">PUT WALL (SUPORTE)</span>
              <span className="text-[11px] font-mono text-slate-400">EWZ: US$ {(ewzState.putWallStrike ?? 28).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-tech text-rose-400">
                {(ewzState.winPutWallProxy ?? 0).toLocaleString('pt-BR')} pts
              </span>
            </div>
          </div>
        </div>

        {/* COL 4: ZONAS ESTATÍSTICAS (Volatilidade Implícita e Histórica) */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech text-slate-400 uppercase font-bold">ZONAS ESTATÍSTICAS (WIN)</span>
            <span className="text-[10px] font-mono text-slate-500">Desvios &sigma;</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-1.5 rounded bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-emerald-400">+1.0&sigma; Expansão:</span>
              <span className="text-white font-bold">{(ewzState.winIvPlus1Sigma ?? 0).toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-emerald-950/20 border border-emerald-500/10">
              <span className="text-emerald-300">+0.5&sigma; Médio:</span>
              <span className="text-slate-200">{(ewzState.winIvPlus05Sigma ?? 0).toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-cyan-950/30 border border-cyan-500/30 font-bold">
              <span className="text-cyan-300">WIN Base:</span>
              <span className="text-cyan-200">{(winPriceState?.currentPrice ?? 0).toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-rose-950/20 border border-rose-500/10">
              <span className="text-rose-300">-0.5&sigma; Médio:</span>
              <span className="text-slate-200">{(ewzState.winIvMinus05Sigma ?? 0).toLocaleString('pt-BR')} pts</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-rose-950/30 border border-rose-500/20">
              <span className="text-rose-400">-1.0&sigma; Contração:</span>
              <span className="text-white font-bold">{(ewzState.winIvMinus1Sigma ?? 0).toLocaleString('pt-BR')} pts</span>
            </div>
          </div>
        </div>

      </div>

      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
        <span>⚠️ <strong>Nota Metodológica:</strong> BOVA11 representa a âncora à vista local com correlação &gt; 0,95 ao WIN. As projeções EWZ GEX são bandas estatísticas paramétricas estimadas sobre volatilidade implícita em NY.</span>
      </div>
    </div>
  );
};

