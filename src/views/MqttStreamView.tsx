import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Cpu,
  Download,
  Copy,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Send,
  Terminal,
  Layers,
  Code,
  Zap,
  Activity,
  Filter,
  Check,
  ExternalLink,
  Bell,
  Trash2,
  Plus,
  Globe,
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { MacroIndicator, IndicatorWeightConfig, ConfluencePoint } from '../types';

interface MqttStreamViewProps {
  indicators: MacroIndicator[];
  weights: IndicatorWeightConfig;
  currentConfluence: ConfluencePoint;
  globalScore: number;
  brazilScore: number;
  winBias: any;
  wdoBias: any;
}

interface MqttPacketItem {
  messageId: string;
  topic: string;
  payload: any;
  qos: number;
  retain: boolean;
  timestamp: string;
  clientId?: string;
}

export const MqttStreamView: React.FC<MqttStreamViewProps> = ({
  indicators,
  weights,
  currentConfluence,
  globalScore,
  brazilScore,
  winBias,
  wdoBias,
}) => {
  const [packets, setPackets] = useState<MqttPacketItem[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('mcp/macro/#');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'nodejs' | 'python' | 'curl' | 'sse' | 'metatrader'>('python');
  const [brokerStats, setBrokerStats] = useState({
    broker: 'Mosca-Compatible Macro MQTT Broker',
    status: 'OPERATIONAL',
    connectedSseClients: 1,
    totalPublished: 42,
    uniqueTopicsCount: 8,
    retainedCount: 5,
    uptimeSeconds: 1240,
    webhookDispatches: 0,
  });

  // Real Mosca Data Ingestion State
  const [ingestIndicatorId, setIngestIndicatorId] = useState<string>('DXY');
  const [ingestVal, setIngestVal] = useState<string>('103.85');
  const [ingestChg, setIngestChg] = useState<string>('+0.18');
  const [ingestSrc, setIngestSrc] = useState<string>('METATRADER_5_FEED');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [showBatchIngest, setShowBatchIngest] = useState<boolean>(false);
  const [batchIngestText, setBatchIngestText] = useState<string>(
    JSON.stringify(
      {
        indicators: [
          { id: 'DXY', value: 104.15, changePercent: 0.35, source: 'MOSCA_REALTIME' },
          { id: 'USD_BRL', value: 5.485, changePercent: 0.82, source: 'MOSCA_REALTIME' },
          { id: 'IBOV', value: 133800, changePercent: -0.65, source: 'MOSCA_REALTIME' },
          { id: 'VIX', value: 16.40, changePercent: 3.20, source: 'MOSCA_REALTIME' },
          { id: 'DI_F27', value: 12.25, changePercent: 0.12, source: 'MOSCA_REALTIME' },
        ],
        source: 'MOSCA_BATCH_INGESTOR',
      },
      null,
      2
    )
  );

  const handleIngestSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIngesting(true);
    soundFX.playActivation();
    try {
      const res = await fetch('/api/macro/indicators/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ingestIndicatorId,
          value: parseFloat(ingestVal),
          changePercent: parseFloat(ingestChg),
          source: ingestSrc || 'MOSCA_LIVE_INGEST',
          status: 'LIVE',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPubStatus(`✅ Dado real extraído: Indicador ${ingestIndicatorId} atualizado no Mosca! Sinais reais recalculados.`);
        soundFX.playSuccess();
      } else {
        setPubStatus(`❌ Falha: ${data.error}`);
      }
    } catch (err: any) {
      setPubStatus(`❌ Falha na extração: ${err.message}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setPubStatus(null), 4000);
    }
  };

  const handleIngestBatch = async () => {
    setIsIngesting(true);
    soundFX.playActivation();
    try {
      const parsed = JSON.parse(batchIngestText);
      const res = await fetch('/api/macro/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (data.success) {
        setPubStatus(`✅ Lote de ${data.updatedIndicators} indicadores reais injetado no Mosca! Sinais recalculados sem simulação.`);
        soundFX.playSuccess();
      } else {
        setPubStatus(`❌ Falha: ${data.error}`);
      }
    } catch (err: any) {
      setPubStatus(`❌ Erro no JSON do lote: ${err.message}`);
    } finally {
      setIsIngesting(false);
      setTimeout(() => setPubStatus(null), 4000);
    }
  };

  // Webhooks State
  interface WebhookItem {
    id: string;
    name: string;
    url: string;
    topicFilter: string;
    active: boolean;
    lastDelivered?: string;
    deliveryCount: number;
  }
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [newWhName, setNewWhName] = useState<string>('');
  const [newWhUrl, setNewWhUrl] = useState<string>('');
  const [newWhTopic, setNewWhTopic] = useState<string>('mcp/macro/#');
  const [showAddWebhook, setShowAddWebhook] = useState<boolean>(false);
  const [whTestingId, setWhTestingId] = useState<string | null>(null);

  // Ping & Latency Diagnostic State
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  // Market Simulator State
  const [simDirection, setSimDirection] = useState<'RISK_ON' | 'RISK_OFF'>('RISK_ON');
  const [simIntensity, setSimIntensity] = useState<number>(1.2);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);

  // Custom Publisher state
  const [pubTopic, setPubTopic] = useState<string>('mcp/macro/custom-alert');
  const [pubQos, setPubQos] = useState<number>(1);
  const [pubRetain, setPubRetain] = useState<boolean>(false);
  const [pubPayload, setPubPayload] = useState<string>(
    JSON.stringify(
      {
        alerta: 'VOLATILIDADE_ELEVADA',
        ativo: 'WIN',
        pontos: 134500,
        scoreMacro: globalScore,
        acaoRecomendada: 'REDUZIR_EXPOSICAO',
      },
      null,
      2
    )
  );
  const [pubStatus, setPubStatus] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch Webhooks & Status
  const fetchWebhooks = async () => {
    try {
      const res = await fetch('/api/macro/webhooks');
      if (res.ok) {
        const data = await res.json();
        if (data.webhooks) setWebhooks(data.webhooks);
      }
    } catch {}
  };

  const handlePingBroker = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/macro/mqtt/ping');
      if (res.ok) {
        const end = performance.now();
        setLatencyMs(Math.round(end - start));
        soundFX.playClick();
      }
    } catch {
      setLatencyMs(null);
    } finally {
      setIsPinging(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName || !newWhUrl) return;
    soundFX.playActivation();
    try {
      const res = await fetch('/api/macro/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWhName,
          url: newWhUrl,
          topicFilter: newWhTopic,
        }),
      });
      if (res.ok) {
        setNewWhName('');
        setNewWhUrl('');
        setShowAddWebhook(false);
        fetchWebhooks();
        setPubStatus('✅ Webhook registrado com sucesso no barramento!');
        setTimeout(() => setPubStatus(null), 3000);
      }
    } catch (err: any) {
      setPubStatus(`❌ Falha: ${err.message}`);
    }
  };

  const handleToggleWebhook = async (id: string, currentActive: boolean) => {
    soundFX.playClick();
    try {
      await fetch(`/api/macro/webhooks/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      fetchWebhooks();
    } catch {}
  };

  const handleDeleteWebhook = async (id: string) => {
    soundFX.playClick();
    try {
      await fetch(`/api/macro/webhooks/${id}`, { method: 'DELETE' });
      fetchWebhooks();
    } catch {}
  };

  const handleTestWebhook = async (id: string) => {
    setWhTestingId(id);
    soundFX.playActivation();
    try {
      const res = await fetch(`/api/macro/webhooks/${id}/test`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPubStatus('✅ Teste de Webhook disparado com sucesso!');
      } else {
        setPubStatus(`⚠️ Teste enviado (HTTP response: ${data.result?.error || 'disparado'})`);
      }
      fetchWebhooks();
    } catch (err: any) {
      setPubStatus(`❌ Erro no teste: ${err.message}`);
    } finally {
      setWhTestingId(null);
      setTimeout(() => setPubStatus(null), 4000);
    }
  };

  const handleInjectMarketPulse = async (dir: 'RISK_ON' | 'RISK_OFF') => {
    setIsSimulating(true);
    soundFX.playActivation();
    try {
      const res = await fetch('/api/macro/simulate-tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: dir,
          intensity: simIntensity,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPubStatus(`⚡ ${data.message}`);
        setTimeout(() => setPubStatus(null), 4000);
      }
    } catch (err: any) {
      setPubStatus(`❌ Erro na injeção: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Auto-pulse simulator loop
  useEffect(() => {
    if (!autoSimulate) return;
    const interval = setInterval(() => {
      const randomDir = Math.random() > 0.5 ? 'RISK_ON' : 'RISK_OFF';
      handleInjectMarketPulse(randomDir);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoSimulate, simIntensity]);

  // Fetch initial messages & setup SSE listener
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsRes, msgsRes] = await Promise.all([
          fetch('/api/macro/mqtt/status'),
          fetch(`/api/macro/mqtt/messages?topic=${encodeURIComponent(selectedFilter)}&limit=30`),
        ]);

        if (statsRes.ok) {
          const stats = await statsRes.json();
          setBrokerStats(stats);
        }

        if (msgsRes.ok) {
          const data = await msgsRes.json();
          if (Array.isArray(data.messages)) {
            setPackets(data.messages);
          }
        }
      } catch (err) {
        console.warn('Could not fetch MQTT initial history:', err);
      }
    };

    fetchInitialData();
    fetchWebhooks();

    // Connect to real-time Server-Sent Events stream
    if (isStreaming) {
      try {
        const es = new EventSource('/api/macro/stream');
        eventSourceRef.current = es;

        es.addEventListener('mqtt_packet', (event) => {
          try {
            const newPacket: MqttPacketItem = JSON.parse(event.data);
            setPackets((prev) => [newPacket, ...prev.slice(0, 70)]);
            setBrokerStats((prev) => ({
              ...prev,
              totalPublished: prev.totalPublished + 1,
            }));
          } catch (e) {
            console.error('Error parsing SSE mqtt_packet:', e);
          }
        });

        es.onerror = () => {
          es.close();
        };
      } catch (e) {
        console.warn('SSE stream error:', e);
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isStreaming, selectedFilter]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFX.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadJson = async () => {
    soundFX.playSuccess();
    try {
      const res = await fetch('/api/macro/export/json');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `macrodesk_tracker_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Error downloading JSON:', e);
    }
  };

  const handleDownloadCsv = async () => {
    soundFX.playSuccess();
    try {
      const res = await fetch('/api/macro/export/csv');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `macrodesk_indicators_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Error downloading CSV:', e);
    }
  };

  const handleForceBroadcast = async () => {
    soundFX.playActivation();
    try {
      const payload = {
        topic: 'mcp/macro/confluence',
        payload: {
          scenario: currentConfluence?.scenario || 'ALTA',
          bullishStrength: currentConfluence?.bullishStrength || 70,
          bearishStrength: currentConfluence?.bearishStrength || 30,
          riskScore: currentConfluence?.riskScore || 65,
          macroTrail: currentConfluence?.macroTrail || 65,
          globalScore,
          brazilScore,
          winBias: winBias?.classification || 'COMPRA',
          wdoBias: wdoBias?.classification || 'VENDA',
          timestamp: new Date().toISOString(),
        },
        qos: 1,
        retain: true,
      };

      await fetch('/api/macro/mqtt/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setPubStatus('✅ Pacote propagado no barramento Mosca!');
      setTimeout(() => setPubStatus(null), 3000);
    } catch (err: any) {
      setPubStatus(`❌ Erro ao propagar: ${err.message}`);
    }
  };

  const handlePublishCustomPacket = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(pubPayload);
      } catch {
        parsedPayload = { text: pubPayload };
      }

      const res = await fetch('/api/macro/mqtt/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: pubTopic,
          payload: parsedPayload,
          qos: pubQos,
          retain: pubRetain,
          clientId: 'dashboard-publisher',
        }),
      });

      if (res.ok) {
        setPubStatus('✅ Publicado com sucesso!');
        setTimeout(() => setPubStatus(null), 3000);
      }
    } catch (err: any) {
      setPubStatus(`❌ Falha: ${err.message}`);
    }
  };

  // Pre-formatted code integration templates
  const codeSnippets = {
    nodejs: `// ==========================================
// CLIENTE NODE.JS (MQTT.js / Mosca Compatível)
// ==========================================
import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'macrodesk-quant-bot-01',
  clean: true,
});

client.on('connect', () => {
  console.log('⚡ Conectado ao Broker MacroDesk');
  
  // Inscreve-se em todos os tópicos do rastreador macro
  client.subscribe('jarvis/macro/#', { qos: 1 }, (err) => {
    if (!err) console.log('📡 Inscrito nos tópicos macro');
  });
});

client.on('message', (topic, message) => {
  const packet = JSON.parse(message.toString());
  console.log(\`[MQTT \${topic}]:\`, packet);

  // Execução condicional automatizada para WIN/WDO
  if (topic === 'jarvis/macro/confluence') {
    if (packet.scenario === 'ALTA' && packet.confidence >= 75) {
      console.log('🟢 CONFLUÊNCIA DE ALTA: Armar ordens de compra no WIN!');
    } else if (packet.scenario === 'BAIXA' && packet.confidence >= 75) {
      console.log('🔴 CONFLUÊNCIA DE BAIXA: Armar ordens de compra no WDO / venda WIN!');
    }
  }
});`,

    python: `# ==========================================
# CLIENTE PYTHON (paho-mqtt & Extração Macro)
# ==========================================
import paho.mqtt.client as mqtt
import json
import requests

# 1. Extração Instantânea via REST / JSON
def get_macro_snapshot():
    url = "http://localhost:3000/api/macro/export/json"
    res = requests.get(url).json()
    print("Score Global:", res['sentiment']['global']['score'])
    print("Veredito Confluência:", res['confluencePillars']['scenario'])
    return res

# 2. Stream em Tempo Real via MQTT (Mosca Broker)
def on_connect(client, userdata, flags, rc):
    print("⚡ Conectado ao Broker MacroDesk (RC: %d)" % rc)
    client.subscribe("jarvis/macro/#", qos=1)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode('utf-8'))
    topic = msg.topic
    print(f"📡 [MQTT {topic}] -> {payload}")

    # Exemplo de lógica de trade quant
    if topic == "mcp/macro/signals/win" or topic == "jarvis/macro/signals/win":
        print(f"👉 Mini Índice WIN: {payload.get('bias')} | Alvo: {payload.get('target')}")
    elif topic == "mcp/macro/signals/wdo" or topic == "jarvis/macro/signals/wdo":
        print(f"👉 Mini Dólar WDO: {payload.get('bias')} | Alvo: {payload.get('target')}")

client = mqtt.Client(client_id="python_quant_agent")
client.on_connect = on_connect
client.on_message = on_message

# client.connect("localhost", 1883, 60)
# client.loop_forever()
get_macro_snapshot()`,

    curl: `# ==========================================
# cURL & ENDPOINTS DE EXTRAÇÃO MACRO REST
# ==========================================

# 1. Download do Snapshot Completo do Rastreador (JSON)
curl -X GET "http://localhost:3000/api/macro/export/json" -o macro_snapshot.json

# 2. Download da Planilha de Indicadores (CSV)
curl -X GET "http://localhost:3000/api/macro/export/csv" -o macro_indicadores.csv

# 3. Consultar Confluência dos 4 Pilares
curl -X GET "http://localhost:3000/api/macro/confluence"

# 4. Consultar Sentimento Global e Brasil
curl -X GET "http://localhost:3000/api/macro/sentiment"

# 5. Publicar Pacote no Barramento Mosca via HTTP
curl -X POST "http://localhost:3000/api/macro/mqtt/publish" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "mcp/macro/signals/win",
    "payload": { "action": "BUY", "target": 135000, "confidence": 85 },
    "qos": 1,
    "retain": true
  }'`,

    sse: `// ==========================================
// JAVASCRIPT / BROWSER NATIVE EVENTSOURCE (SSE)
// ==========================================
const eventSource = new EventSource('http://localhost:3000/api/macro/stream');

eventSource.addEventListener('mqtt_packet', (event) => {
  const packet = JSON.parse(event.data);
  console.log('📡 Pacote MQTT em Tempo Real:', packet.topic, packet.payload);

  if (packet.topic === 'mcp/macro/sentiment/global' || packet.topic === 'jarvis/macro/sentiment/global') {
    document.getElementById('global-score').innerText = packet.payload.score;
  }
});

eventSource.onerror = (err) => {
  console.error('Erro na conexão SSE:', err);
};`,

    metatrader: `// =========================================================
// MQL5 (MetaTrader 5) / Webhook Connector para Rastreador
// =========================================================
#property strict

void OnTick()
{
   static datetime lastCheck = 0;
   if (TimeCurrent() - lastCheck < 5) return; // Checa a cada 5 segundos
   lastCheck = TimeCurrent();

   string url = "http://localhost:3000/api/macro/confluence";
   char post[], result[];
   string headers = "Content-Type: application/json\\r\\n";
   int res = WebRequest("GET", url, headers, 3000, post, result, headers);

   if(res == 200)
   {
      string response = CharArrayToString(result);
      // Analisa o cenário recebido (ex: ALTA, BAIXA, AGUARDAR)
      if(StringFind(response, "\\"scenario\\":\\"ALTA\\"") >= 0)
      {
         Print("🟢 MACRODESK: ALTA CONFIRMADA - Permitir Compras WIN!");
      }
      else if(StringFind(response, "\\"scenario\\":\\"BAIXA\\"") >= 0)
      {
         Print("🔴 MACRODESK: BAIXA CONFIRMADA - Permitir Vendas WIN / Compra WDO!");
      }
   }
}`,
  };

  const filteredPackets =
    selectedFilter === 'mcp/macro/#' || selectedFilter === 'jarvis/macro/#'
      ? packets
      : packets.filter((p) => {
          if (selectedFilter.endsWith('/#')) {
            const prefix = selectedFilter.replace('/#', '');
            return p.topic.startsWith(prefix) || p.topic.replace('jarvis/', 'mcp/').startsWith(prefix);
          }
          return p.topic === selectedFilter || p.topic.replace('jarvis/', 'mcp/') === selectedFilter;
        });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Control Deck */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-100 flex items-center gap-2">
                EXTRATOR MACRO // MOSCA MQTT & REAL-TIME STREAM
              </h2>
              <p className="font-tech text-xs text-slate-400">
                Barramento de publicação e assinatura de telemetria macroeconômica para robôs e terminais externos
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            id="btn-download-json"
            onClick={handleDownloadJson}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            title="Exportar todo o estado macro em formato JSON padronizado"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Baixar JSON Completo</span>
          </button>

          <button
            id="btn-download-csv"
            onClick={handleDownloadCsv}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-400/50 text-emerald-200 font-tech text-xs font-bold transition-all"
            title="Exportar tabela de 24 indicadores para CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar CSV (Planilha)</span>
          </button>

          <button
            id="btn-force-broadcast"
            onClick={handleForceBroadcast}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-400/50 text-purple-200 font-tech text-xs font-bold transition-all"
            title="Forçar envio de pacote com cálculo atualizado para todos os clientes conectados"
          >
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            <span>Forçar Broadcast MQTT</span>
          </button>
        </div>
      </div>

      {pubStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-200 font-tech text-xs flex items-center gap-2 animate-fade-in">
          <Zap className="w-4 h-4 text-cyan-300" />
          <span>{pubStatus}</span>
        </div>
      )}

      {/* Broker Metrics & Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="font-tech text-xs text-slate-400">STATUS DO BROKER</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-orbitron font-bold text-sm text-emerald-300">{brokerStats.status}</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800">
            <span className="font-mono text-[10px] text-slate-500">Mosca Core / SSE</span>
            <button
              onClick={handlePingBroker}
              disabled={isPinging}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-[10px] font-mono text-cyan-300 transition-all flex items-center gap-1"
              title="Testar latência de ida e volta ao Mosca Broker"
            >
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>{latencyMs !== null ? `${latencyMs}ms` : 'Ping'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="font-tech text-xs text-slate-400">MENSAGENS PUBLICADAS</span>
          <span className="font-orbitron font-extrabold text-xl text-cyan-300 mt-1">
            {brokerStats.totalPublished} <span className="text-xs font-normal text-slate-400">pkts</span>
          </span>
          <span className="font-mono text-[10px] text-cyan-500 mt-1">QoS 0, 1 & 2 Suportados</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="font-tech text-xs text-slate-400">TÓPICOS ATIVOS</span>
          <span className="font-orbitron font-extrabold text-xl text-purple-300 mt-1">
            {brokerStats.uniqueTopicsCount} <span className="text-xs font-normal text-slate-400">canais</span>
          </span>
          <span className="font-mono text-[10px] text-purple-400 mt-1">Root: mcp/macro/#</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="font-tech text-xs text-slate-400">WEBHOOKS & CLIENTES</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-orbitron font-extrabold text-xl text-amber-300">
              {webhooks.filter((w) => w.active).length}
            </span>
            <span className="text-xs font-tech text-slate-400">ativos / {brokerStats.connectedSseClients} SSE</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400 mt-1">
            {brokerStats.retainedCount} Retidos em Memória
          </span>
        </div>
      </div>

      {/* Real Data Extraction & Ingestion Engine (No Simulation) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-cyan-950/50 to-slate-900 border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-orbitron font-extrabold text-sm text-cyan-100 uppercase tracking-wider">
                  EXTRAÇÃO E INGESTÃO DE DADOS REAIS DO MOSCA
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-[10px] font-tech font-bold text-emerald-300 animate-pulse">
                  🟢 SINAIS REAIS // SEM SIMULAÇÃO
                </span>
              </div>
              <p className="font-tech text-xs text-slate-300 mt-0.5">
                Os dados recebidos via MQTT/REST alimentam o Rastreador Macro instantaneamente, recalculando confluência e viés quantitativo
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBatchIngest(!showBatchIngest)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 font-tech text-xs font-bold transition-all self-start sm:self-auto"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showBatchIngest ? 'Modo Rápido' : 'Modo Lote (JSON)'}</span>
          </button>
        </div>

        {/* Quick Ingest Form */}
        {!showBatchIngest ? (
          <form onSubmit={handleIngestSingle} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block font-tech text-[11px] text-cyan-300 mb-1 font-bold">
                1. Indicador / Ativo:
              </label>
              <select
                value={ingestIndicatorId}
                onChange={(e) => {
                  setIngestIndicatorId(e.target.value);
                  const found = indicators.find((ind) => ind.id === e.target.value || ind.key === e.target.value);
                  if (found) {
                    setIngestVal(String(found.value));
                    setIngestChg(String(found.changePercent));
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              >
                {indicators.map((ind) => (
                  <option key={ind.id || ind.key} value={ind.id || ind.key}>
                    {ind.name} ({ind.ticker || ind.id || ind.key})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-tech text-[11px] text-slate-300 mb-1">
                2. Valor Atual da Cotação:
              </label>
              <input
                type="number"
                step="any"
                required
                value={ingestVal}
                onChange={(e) => setIngestVal(e.target.value)}
                placeholder="Ex: 103.85"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-tech text-[11px] text-slate-300 mb-1">
                3. Variação Diária (%):
              </label>
              <input
                type="number"
                step="any"
                required
                value={ingestChg}
                onChange={(e) => setIngestChg(e.target.value)}
                placeholder="Ex: +0.25 ou -0.40"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-200 font-mono text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-tech text-[11px] text-slate-300 mb-1">
                4. Origem do Feed:
              </label>
              <input
                type="text"
                value={ingestSrc}
                onChange={(e) => setIngestSrc(e.target.value)}
                placeholder="Ex: METATRADER_5"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 font-tech text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-tech text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>{isIngesting ? 'Processando...' : 'Injetar no Mosca'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block font-tech text-xs text-slate-300 mb-1">
                Payload JSON para Ingestão em Lote (Multi-Indicadores):
              </label>
              <textarea
                rows={5}
                value={batchIngestText}
                onChange={(e) => setBatchIngestText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-emerald-300 font-mono text-xs focus:border-cyan-400 focus:outline-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleIngestBatch}
                disabled={isIngesting}
                className="flex items-center gap-2 py-2 px-5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 font-tech text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>{isIngesting ? 'Processando Lote...' : 'Ingerir Lote de Dados Reais'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Live Signals Summary Pill */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-tech text-[10px] text-slate-400 block">SCORE SENTIMENTO GLOBAL</span>
            <span className={`font-orbitron font-bold text-sm ${globalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {globalScore > 0 ? `+${globalScore}` : globalScore} pts
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-tech text-[10px] text-slate-400 block">TERMÔMETRO BRASIL</span>
            <span className={`font-orbitron font-bold text-sm ${brazilScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {brazilScore > 0 ? `+${brazilScore}` : brazilScore} pts
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-tech text-[10px] text-slate-400 block">SINAL IBOVESPA / WIN</span>
            <span className="font-orbitron font-bold text-sm text-cyan-300">
              {winBias?.classification || 'COMPRA / ALTA'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="font-tech text-[10px] text-slate-400 block">SINAL DÓLAR / WDO</span>
            <span className="font-orbitron font-bold text-sm text-purple-300">
              {wdoBias?.classification || 'VENDA / BAIXA'}
            </span>
          </div>
        </div>
      </div>

      {/* Market Pulse Injector / Live Tick Simulator Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/40 text-cyan-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-orbitron font-bold text-xs text-cyan-200 uppercase tracking-wider">
              Simulador de Pulso de Mercado & Disparo de Volatilidade
            </h4>
            <p className="font-tech text-xs text-slate-400">
              Injeta choque macroeconômico simulado em tempo real e transmite para robôs inscritos via MQTT
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleInjectMarketPulse('RISK_ON')}
            disabled={isSimulating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-tech text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>⚡ Pulso Risk-On (Alta WIN)</span>
          </button>

          <button
            onClick={() => handleInjectMarketPulse('RISK_OFF')}
            disabled={isSimulating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-tech text-xs font-bold transition-all shadow-[0_0_10px_rgba(244,63,94,0.2)] disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>⚡ Pulso Risk-Off (Alta DOL)</span>
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-tech text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSimulate}
              onChange={(e) => setAutoSimulate(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Auto (12s)</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Packet Streamer vs Interactive Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live MQTT Packet Streamer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/85 border border-cyan-500/25 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-sm text-cyan-100">
                  STREAM DE PACOTES MQTT (LIVE CONSOLE)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-tech text-xs border transition-colors ${
                    isStreaming
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {isStreaming ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Retomar Stream</span>
                    </>
                  )}
                </button>

                <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  {filteredPackets.length} pkts
                </span>
              </div>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="font-tech text-xs text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filtro:
              </span>
              {[
                { label: 'Todos (/#)', value: 'mcp/macro/#' },
                { label: 'Confluência', value: 'mcp/macro/confluence' },
                { label: 'Sentimento', value: 'mcp/macro/sentiment/#' },
                { label: 'Sinais WIN/WDO', value: 'mcp/macro/signals/#' },
                { label: 'Heartbeat', value: 'mcp/macro/heartbeat' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setSelectedFilter(f.value);
                    soundFX.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg font-tech text-xs whitespace-nowrap transition-all border ${
                    selectedFilter === f.value
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Packets Log Container */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredPackets.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-spin" />
                  <p className="font-tech text-xs text-slate-400">
                    Aguardando pacotes nos tópicos selecionados...
                  </p>
                </div>
              ) : (
                filteredPackets.map((pkt) => {
                  const isRetained = pkt.retain;
                  const pktId = pkt.messageId || String(Math.random());
                  const formattedTime = new Date(pkt.timestamp).toLocaleTimeString('pt-BR');

                  return (
                    <div
                      key={pktId}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 transition-all font-mono text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                            {pkt.topic}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                            QoS {pkt.qos}
                          </span>
                          {isRetained && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-[10px] text-amber-300 font-bold">
                              RETAINED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{formattedTime}</span>
                          <button
                            onClick={() => handleCopyText(JSON.stringify(pkt.payload, null, 2), pktId)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Copiar JSON do payload"
                          >
                            {copiedId === pktId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <pre className="p-2.5 rounded-lg bg-slate-900/90 text-slate-300 text-[11px] overflow-x-auto border border-slate-800/80 leading-relaxed font-mono">
                        {JSON.stringify(pkt.payload, null, 2)}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Mosca Publisher & Topic Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mosca Interactive Publisher */}
          <div className="p-5 rounded-2xl bg-slate-900/85 border border-purple-500/25 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-400" />
              <h3 className="font-orbitron font-bold text-sm text-purple-100">
                PUBLICADOR INTERATIVO MOSCA
              </h3>
            </div>
            <p className="font-tech text-xs text-slate-400">
              Simule publicações de robôs externos ou dispare comandos no barramento:
            </p>

            <form onSubmit={handlePublishCustomPacket} className="space-y-3">
              <div>
                <label className="block font-tech text-[11px] text-slate-400 mb-1">
                  Tópico MQTT de Destino:
                </label>
                <input
                  type="text"
                  value={pubTopic}
                  onChange={(e) => setPubTopic(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-200 font-mono text-xs focus:border-purple-400 focus:outline-none"
                  placeholder="mcp/macro/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-tech text-[11px] text-slate-400 mb-1">QoS Level:</label>
                  <select
                    value={pubQos}
                    onChange={(e) => setPubQos(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:border-purple-400 focus:outline-none"
                  >
                    <option value={0}>0 - At most once</option>
                    <option value={1}>1 - At least once</option>
                    <option value={2}>2 - Exactly once</option>
                  </select>
                </div>

                <div>
                  <label className="block font-tech text-[11px] text-slate-400 mb-1">Retain Flag:</label>
                  <label className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-tech cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pubRetain}
                      onChange={(e) => setPubRetain(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0"
                    />
                    <span>Manter Retido (Retain)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-tech text-[11px] text-slate-400 mb-1">
                  Payload JSON:
                </label>
                <textarea
                  rows={4}
                  value={pubPayload}
                  onChange={(e) => setPubPayload(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs focus:border-purple-400 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-400/50 text-purple-200 font-tech text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Pacote no Barramento</span>
              </button>
            </form>
          </div>

          {/* MQTT Topic Catalog */}
          <div className="p-5 rounded-2xl bg-slate-900/85 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="font-orbitron font-bold text-sm text-cyan-100">
                CATÁLOGO DE TÓPICOS // ESQUEMA
              </h3>
            </div>

            <div className="space-y-2 text-xs font-tech">
              {[
                { topic: 'mcp/macro/sentiment/global', desc: 'Score Global, classificação e drivers', qos: 1 },
                { topic: 'mcp/macro/sentiment/brazil', desc: 'Termômetro Brasil, juros e fiscal', qos: 1 },
                { topic: 'mcp/macro/confluence', desc: '4 Pilares quantitativos e veredito', qos: 1 },
                { topic: 'mcp/macro/signals/win', desc: 'Sinal Mini Índice (alvo/stop)', qos: 1 },
                { topic: 'mcp/macro/signals/wdo', desc: 'Sinal Mini Dólar (alvo/stop)', qos: 1 },
                { topic: 'mcp/macro/indicators/all', desc: 'Cesta dos 24 indicadores em tempo real', qos: 0 },
              ].map((t) => (
                <div
                  key={t.topic}
                  onClick={() => setPubTopic(t.topic)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-bold text-[11px]">{t.topic}</span>
                    <span className="text-[10px] text-slate-500">QoS {t.qos}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Dispatcher & External Notifications Deck */}
      <div className="p-6 rounded-2xl bg-slate-900/85 border border-amber-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-orbitron font-bold text-sm text-amber-100">
                GERENCIADOR DE WEBHOOKS // DISPAROS EXTERNOS
              </h3>
              <p className="font-tech text-xs text-slate-400">
                Dispare requisições HTTP POST automáticas para Discord, Telegram ou endpoints customizados em cada publicação MQTT
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowAddWebhook(!showAddWebhook);
              soundFX.playClick();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400/50 text-amber-200 font-tech text-xs font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{showAddWebhook ? 'Fechar Formulário' : 'Novo Webhook'}</span>
          </button>
        </div>

        {/* Add Webhook Form Modal/Drawer */}
        {showAddWebhook && (
          <form
            onSubmit={handleCreateWebhook}
            className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fade-in"
          >
            <h4 className="font-orbitron font-bold text-xs text-amber-300">CADASTRAR DESTINO DE WEBHOOK</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-tech text-[11px] text-slate-400 mb-1">Nome do Destino:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Canal Discord / Sinais VIP"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-tech text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-tech text-[11px] text-slate-400 mb-1">URL do Endpoint HTTP POST:</label>
                <input
                  type="url"
                  required
                  placeholder="https://discord.com/api/webhooks/..."
                  value={newWhUrl}
                  onChange={(e) => setNewWhUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-tech text-[11px] text-slate-400 mb-1">Filtro de Tópico MQTT:</label>
                <input
                  type="text"
                  placeholder="mcp/macro/signals/#"
                  value={newWhTopic}
                  onChange={(e) => setNewWhTopic(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-purple-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddWebhook(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 font-tech text-xs hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-400/60 text-amber-200 font-tech text-xs font-bold transition-all"
              >
                Salvar e Ativar Webhook
              </button>
            </div>
          </form>
        )}

        {/* Registered Webhooks List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {webhooks.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 font-tech text-xs col-span-2">
              Nenhum webhook registrado no momento.
            </div>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className={`p-3.5 rounded-xl bg-slate-950/90 border transition-all ${
                  wh.active ? 'border-slate-800 hover:border-amber-500/40' : 'border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wh.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <h4 className="font-orbitron font-bold text-xs text-slate-200 truncate">{wh.name}</h4>
                    </div>
                    <p className="font-mono text-[10px] text-cyan-400 truncate" title={wh.url}>
                      {wh.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleWebhook(wh.id, wh.active)}
                      className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold border transition-colors ${
                        wh.active
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                      title="Ativar/desativar webhook"
                    >
                      {wh.active ? 'ATIVO' : 'PAUSADO'}
                    </button>

                    <button
                      onClick={() => handleTestWebhook(wh.id)}
                      disabled={whTestingId === wh.id}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
                      title="Testar disparo de payload de teste"
                    >
                      <Zap className={`w-3.5 h-3.5 ${whTestingId === wh.id ? 'animate-spin text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 rounded hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remover webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                  <span>Tópico: {wh.topicFilter}</span>
                  <span>Disparos: {wh.deliveryCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Integration Code Generator & Connector Snippets */}
      <div className="p-6 rounded-2xl bg-slate-900/85 border border-cyan-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-orbitron font-bold text-sm text-cyan-100">
                CÓDIGO DE INTEGRAÇÃO & CONECTORES PRONTOS
              </h3>
              <p className="font-tech text-xs text-slate-400">
                Copie e cole em seus algoritmos de execução para consumir o rastreador macro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyText(codeSnippets[activeCodeTab], 'active-code')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 font-tech text-xs font-bold transition-colors"
            >
              {copiedId === 'active-code' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'python', label: '🐍 Python (paho-mqtt & REST)' },
            { id: 'nodejs', label: '⚡ Node.js (Mosca / MQTT.js)' },
            { id: 'metatrader', label: '📈 MetaTrader 5 (MQL5)' },
            { id: 'curl', label: '💻 cURL / REST Bash' },
            { id: 'sse', label: '🌐 Web / EventSource (SSE)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCodeTab(tab.id as any);
                soundFX.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-tech text-xs font-bold transition-all border whitespace-nowrap ${
                activeCodeTab === tab.id
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[380px]">
            {codeSnippets[activeCodeTab]}
          </pre>
        </div>
      </div>
    </div>
  );
};
