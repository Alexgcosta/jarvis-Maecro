import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Activity,
  Server,
  AlertTriangle,
  Globe,
  Database,
  Cpu,
  Radio,
  SlidersHorizontal,
  Download,
  Upload,
  Info,
} from 'lucide-react';
import { ApiKeyItem } from '../types';
import { soundFX } from '../utils/soundEffects';

interface ApiKeysViewProps {
  onSyncIndicators?: () => void;
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({ onSyncIndicators }) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [customKeys, setCustomKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  
  // Local edit states map { [keyId]: string }
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  // Visibility map { [keyId]: boolean }
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>({});
  // Copied state map { [keyId]: boolean }
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  // Testing state map { [keyId]: boolean }
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({});
  // Saved state map { [keyId]: boolean }
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  // Test result messages { [keyId]: { success: boolean; message: string; latencyMs?: number } }
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});

  // Global actions state
  const [isTestingAll, setIsTestingAll] = useState<boolean>(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // New custom key modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyProvider, setNewKeyProvider] = useState('');
  const [newKeyCategory, setNewKeyCategory] = useState<'MARKET_DATA' | 'MACRO_INDEX' | 'AI_MODEL' | 'EXECUTION' | 'CUSTOM'>('CUSTOM');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyDocUrl, setNewKeyDocUrl] = useState('');
  const [newKeyNotes, setNewKeyNotes] = useState('');

  // Fetch keys list from server
  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res拼 = await fetch('/api/keys');
      const data = await res拼.json();
      if (data && data.keys) {
        setKeys(data.keys);
        setCustomKeys(data.customKeys || []);
        
        // Initialize local edit values
        const initialEditVals: Record<string, string> = {};
        data.keys.forEach((k: ApiKeyItem) => {
          // Check if user has a custom override stored in localStorage
          const localOverride = localStorage.getItem(`macro_key_${k.id}`);
          initialEditVals[k.id] = localOverride !== null ? localOverride : k.key;
        });
        (data.customKeys || []).forEach((ck: ApiKeyItem) => {
          initialEditVals[ck.id] = ck.key;
        });
        setEditValues(initialEditVals);
      }
    } catch (err) {
      console.warn('Erro ao carregar chaves da API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleToggleVisibility不易 = (id: string) => {
    soundFX.playClick();
    setVisibleMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    soundFX.playSuccess();
    setCopiedMap((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSaveKey = async (id: string) => {
    const value = editValues[id] ?? '';
    soundFX.playClick();

    // Persist in localStorage
    localStorage.setItem(`macro_key_${id}`, value);

    try {
      const res = await fetch('/api/keys/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, key: value }),
      });
      const data不易 = await res.json();
      if (data不易.success) {
        soundFX.playSuccess();
        setSavedMap((prev) => ({ ...prev, [id]: true }));
        setGlobalMessage({
          type: 'success',
          text: `Chave [${id.toUpperCase()}] salva e ativada com sucesso no motor J.A.R.V.I.S.!`,
        });
        setTimeout(() => {
          setSavedMap((prev) => ({ ...prev, [id]: false }));
        }, 3000);
        setTimeout(() => setGlobalMessage(null), 5000);

        if (onSyncIndicators) onSyncIndicators();
        fetchKeys();
      } else {
        setGlobalMessage({ type: 'error', text: data不易.error || 'Falha ao salvar chave no servidor.' });
      }
    } catch (err: any) {
      setGlobalMessage({ type: 'error', text: `Erro de comunicação: ${err.message}` });
    }
  };

  const handleTestKey = async (id: string) => {
    const value = editValues[id] ?? '';
    setTestingMap((prev) => ({ ...prev, [id]: true }));
    soundFX.playBlip(950);

    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, key: value }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          message: data.message || (data.success ? 'Conexão validada com sucesso!' : 'Falha na conexão.'),
          latencyMs: data.latencyMs,
        },
      }));

      if (data.success) {
        soundFX.playSuccess();
      } else {
        soundFX.playAlert();
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: false,
          message: `Erro ao testar: ${err.message}`,
        },
      }));
    } finally {
      setTestingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleTestAllKeys = async () => {
    setIsTestingAll(true);
    soundFX.playActivation();
    const allKeyItems = [...keys, ...customKeys];

    for (const k of allKeyItems) {
      await handleTestKey(k.id);
    }
    setIsTestingAll(false);
    setGlobalMessage({
      type: 'info',
      text: 'Diagnóstico de conexões de API concluído em todos os provedores.',
    });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  const handleResetDefaults = async () => {
    if (!confirm('Deseja restaurar todas as chaves de API para os valores originais de fábrica?')) {
      return;
    }
    soundFX.playClick();
    try {
      // Clear local overrides
      keys.forEach((k) => localStorage.removeItem(`macro_key_${k.id}`));

      const res = await fetch('/api/keys/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setGlobalMessage({ type: 'success', text: 'Chaves padrão restauradas com sucesso!' });
        setTimeout(() => setGlobalMessage(null), 4000);
        fetchKeys();
      }
    } catch (err: any) {
      setGlobalMessage({ type: 'error', text: `Erro ao restaurar: ${err.message}` });
    }
  };

  const handleAddCustomKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      alert('Preencha o nome e o valor da chave.');
      return;
    }

    try {
      const res = await fetch('/api/keys/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          provider: newKeyProvider || 'Custom Provider',
          category: newKeyCategory,
          key: newKeyValue,
          docUrl: newKeyDocUrl,
          notes: newKeyNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        setShowAddModal(false);
        setNewKeyName('');
        setNewKeyProvider('');
        setNewKeyValue('');
        setNewKeyDocUrl('');
        setNewKeyNotes('');
        setGlobalMessage({ type: 'success', text: `Nova chave [${newKeyName}] cadastrada com sucesso!` });
        setTimeout(() => setGlobalMessage(null), 4000);
        fetchKeys();
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleDeleteCustomKey不易 = async (id: string, name: string) => {
    if (!confirm(`Deseja remover a chave personalizada "${name}"?`)) return;
    soundFX.playClick();
    try {
      const res = await fetch(`/api/keys/custom/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        soundFX.playSuccess();
        fetchKeys();
      }
    } catch (err) {
      console.warn('Erro ao deletar chave:', err);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      keys: [...keys, ...customKeys].map((k) => ({
        id: k.id,
        name: k.name,
        provider: k.provider,
        key: editValues[k.id] || k.key,
      })),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_api_keys_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundFX.playSuccess();
  };

  const allItems = [...keys, ...customKeys];
  const filteredItems = activeCategory === 'ALL'
    ? allItems
    : allItems.filter((item) => item.category === activeCategory);

  const totalActive = allItems.filter((k) => {
    const val = editValues[k.id] ?? k.key;
    return val && val.trim().length > 0;
  }).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cyan-950/90 border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
              <Key className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-orbitron font-extrabold text-base sm:text-xl text-cyan-100">
                  CENTRAL DE CHAVES DE API & CONECTORES
                </h2>
                <span className="font-tech text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                  🟢 {totalActive}/{allItems.length} CONECTORES ATIVOS
                </span>
                <span className="font-tech text-xs px-2 py-0.5 rounded bg-blue-950/80 border border-blue-400/30 text-blue-300">
                  PROXY SERVER-SIDE SEGURO
                </span>
              </div>
              <p className="font-tech text-xs text-slate-400 mt-1">
                Configure, substitua ou adicione chaves de autenticação para os provedores de dados de mercado da B3, cotações mundiais, índices do Banco Central e IA.
              </p>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <button
              onClick={handleTestAllKeys}
              disabled={isTestingAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-tech text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] disabled:opacity-50"
              title="Disparar ping e diagnóstico de conexão em todos os provedores"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingAll ? 'animate-spin' : ''}`} />
              <span>{isTestingAll ? 'DIAGNOSTICANDO...' : 'TESTAR TODAS AS CHAVES'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-tech text-xs font-bold transition-colors"
              title="Adicionar nova chave de provedor customizado ou webhook"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NOVA CHAVE</span>
            </button>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-tech text-xs transition-colors"
              title="Restaurar chaves padrões de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RESTAURAR</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 font-tech text-xs transition-colors"
              title="Exportar backup de chaves configuradas (.json)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Toast / Feedback */}
        {globalMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs font-tech font-bold flex items-center gap-2 animate-fadeIn ${
              globalMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : globalMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-400 text-rose-300'
                : 'bg-cyan-950/90 border-cyan-400 text-cyan-300'
            }`}
          >
            {globalMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : globalMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{globalMessage.text}</span>
          </div>
        )}
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'TODAS AS CHAVES', icon: <Key className="w-3.5 h-3.5" /> },
          { id: 'MARKET_DATA', label: 'DADOS DE MERCADO (B3 / CÂMBIO)', icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'MACRO_INDEX', label: 'MACRO & BANCO CENTRAL', icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'AI_MODEL', label: 'INTELIGÊNCIA ARTIFICIAL', icon: <Cpu className="w-3.5 h-3.5" /> },
          { id: 'EXECUTION', label: 'ROBÔS & EXECUÇÃO (MT5)', icon: <Zap className="w-3.5 h-3.5" /> },
          { id: 'CUSTOM', label: 'PERSONALIZADAS', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
        ].map((cat) => {
          const isActive不易 = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFX.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-tech text-xs whitespace-nowrap transition-all border ${
                isActive不易
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Keys List Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="font-tech text-sm text-cyan-300">Carregando registro de chaves de API e conectores...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 font-tech text-sm">
          Nenhuma chave encontrada nesta categoria. Clique em <span className="text-cyan-300 font-bold">"NOVA CHAVE"</span> para cadastrar um serviço personalizado.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isVisible = visibleMap[item.id] || false;
            const isCopied = copiedMap[item.id] || false;
            const isTesting = testingMap[item.id] || false;
            const isSaved = savedMap[item.id] || false;
            const currentValue = editValues[item.id] ?? item.key;
            const testResult = testResults[item.id];
            const isCustom = item.id.startsWith('custom_') || item.category === 'CUSTOM';

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                {/* Card Top: Provider, Category, Status Badge & Links */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
                      {item.category === 'MARKET_DATA' ? (
                        <Activity className="w-5 h-5" />
                      ) : item.category === 'MACRO_INDEX' ? (
                        <Database className="w-5 h-5" />
                      ) : item.category === 'AI_MODEL' ? (
                        <Cpu className="w-5 h-5" />
                      ) : item.category === 'EXECUTION' ? (
                        <Zap className="w-5 h-5" />
                      ) : (
                        <Key className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-orbitron font-bold text-sm sm:text-base text-slate-100">
                          {item.name}
                        </h3>
                        <span className="font-tech text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {item.provider}
                        </span>
                        {item.required && (
                          <span className="font-tech text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                            ESSENCIAL
                          </span>
                        )}
                      </div>
                      <p className="font-tech text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {/* Status Indicator & Doc Link */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {testResult ? (
                      <span
                        className={`font-tech text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                          testResult.success
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                            : 'bg-rose-950/80 border-rose-400 text-rose-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${testResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {testResult.success ? 'CONECTADO' : 'ERRO'}
                        {testResult.latencyMs && (
                          <span className="text-[10px] opacity-75">({testResult.latencyMs}ms)</span>
                        )}
                      </span>
                    ) : (
                      <span className="font-tech text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {currentValue ? 'CONFIGURADO' : 'NÃO CONFIGURADO'}
                      </span>
                    )}

                    {item.docUrl && (
                      <a
                        href={item.docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-tech flex items-center gap-1 border border-slate-700 transition-colors"
                        title="Abrir Documentação do Provedor"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Docs</span>
                      </a>
                    )}

                    {isCustom && (
                      <button
                        onClick={() => handleDeleteCustomKey不易(item.id, item.name)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 transition-colors"
                        title="Excluir Chave Personalizada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Key Input Field with Action Tools */}
                <div>
                  <label className="text-[11px] font-tech text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                    VALOR DA CHAVE / TOKEN DE ACESSO:
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={currentValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditValues((prev) => ({ ...prev, [item.id]: val }));
                        }}
                        placeholder={`Insira a chave da API ${item.provider}...`}
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-4 py-2.5 font-mono text-xs text-cyan-200 focus:outline-none pr-24 transition-all"
                      />

                      {/* Input Inner Buttons: View & Copy */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility不易(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                          title={isVisible ? 'Ocultar chave' : 'Exibir chave'}
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyKey(item.id, currentValue)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Copiar Chave"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons: Test Connection & Save */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestKey(item.id)}
                        disabled={isTesting}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-tech text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Testar validade e latência desta chave contra o provedor"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
                        <span>{isTesting ? 'TESTANDO...' : 'TESTAR'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveKey(item.id)}
                        className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-tech text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] ${
                          isSaved
                            ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                            : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200'
                        }`}
                        title="Salvar alterações e aplicar em tempo real"
                      >
                        {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'SALVO!' : 'SALVAR & ATIVAR'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Result Message Box */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-tech flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block">{testResult.message}</span>
                      {testResult.latencyMs && (
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Latência de resposta da API: {testResult.latencyMs}ms • Diagnóstico OK
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Endpoints & Technical Info */}
                {item.endpoints && item.endpoints.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-tech text-slate-500 font-bold uppercase">Rotas Vinculadas:</span>
                    {item.endpoints.map((ep, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300"
                      >
                        {ep}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Information & Security Architecture Callout */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h4 className="font-orbitron font-bold text-xs sm:text-sm text-cyan-100">
            SEGURANÇA, ISOLAMENTO & DIRETRIZES DE USO DAS CHAVES
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-tech text-slate-400">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">🔒 Proxy Server-Side</span>
            <p>Todas as requisições que envolvem chaves de API passam pelo backend seguro do Node.js, nunca expondo credenciais privadas para inspeção no navegador.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">⚡ Hot-Reload Imediato</span>
            <p>Ao clicar em "Salvar & Ativar", o motor J.A.R.V.I.S. e os extratores MQTT atualizam a sessão imediatamente sem necessidade de reiniciar a aplicação.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">💾 Persistência Dupla</span>
            <p>As preferências e substituições de chaves são gravadas em memória no servidor e no seu navegador (LocalStorage) para preservar seu ambiente de trading.</p>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Nova Chave Personalizada */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-extrabold text-sm sm:text-base text-slate-100">
                  ADICIONAR CHAVE DE API PERSONALIZADA
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomKey} className="space-y-3.5 font-tech text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nome do Serviço / Indicador:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TradingView Webhook Alert, Binance API, Polygon.io..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Provedor / Empresa:</label>
                  <input
                    type="text"
                    placeholder="Ex: TradingView, Binance, CoinGecko"
                    value={newKeyProvider}
                    onChange={(e) => setNewKeyProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Categoria:</label>
                  <select
                    value={newKeyCategory}
                    onChange={(e: any) => setNewKeyCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="MARKET_DATA">Dados de Mercado</option>
                    <option value="MACRO_INDEX">Macro & Índices</option>
                    <option value="AI_MODEL">Inteligência Artificial</option>
                    <option value="EXECUTION">Robôs & Execução</option>
                    <option value="CUSTOM">Personalizada / Webhook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Chave da API ou Token Secreto:</label>
                <input
                  type="text"
                  required
                  placeholder="Cole aqui o token da API ou segredo..."
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">URL da Documentação (Opcional):</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newKeyDocUrl}
                  onChange={(e) => setNewKeyDocUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Notas / Instruções de Uso:</label>
                <textarea
                  rows={2}
                  placeholder="Anotações para sua equipe de trading..."
                  value={newKeyNotes}
                  onChange={(e) => setNewKeyNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Salvar Nova Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
