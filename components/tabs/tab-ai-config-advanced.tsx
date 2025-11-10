'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Zap, Database, TestTube, BarChart3, Shield, 
  Activity, Cpu, Layers, Code, Brain, FileText, Target,
  Sliders, RefreshCw, Play, Save, Download, Upload,
  ChevronRight, Info, AlertCircle, CheckCircle2, TrendingUp,
  Clock, DollarSign, Gauge, GitBranch, Lock, Eye, EyeOff,
  Sparkles, Workflow, Filter, Search, ToggleLeft, ToggleRight,
  Microscope, LineChart, PieChart, Thermometer, Wifi, WifiOff,
  MessageSquare, Send, Pause, FastForward, Rewind, Copy,
  Check, X, Plus, Minus, Edit, Trash2, RotateCcw, Hash
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Types avancés pour la configuration IA
interface AdvancedAIConfig {
  // Modèles & Performance
  models: {
    primary: ModelConfig;
    fallback: ModelConfig[];
    loadBalancing: 'round-robin' | 'least-latency' | 'cost-optimized' | 'quality-first';
  };
  
  // Prompts & Context
  prompts: {
    system: PromptConfig;
    context: ContextConfig;
    templates: PromptTemplate[];
    chaining: ChainConfig[];
  };
  
  // RAG & Knowledge
  rag: {
    enabled: boolean;
    chunking: ChunkingStrategy;
    embedding: EmbeddingConfig;
    retrieval: RetrievalConfig;
    reranking: RerankingConfig;
  };
  
  // Few-Shots & Training
  fewShots: {
    enabled: boolean;
    examples: FewShotExample[];
    dynamicSelection: boolean;
    similarityThreshold: number;
  };
  
  // Testing & Analytics
  testing: {
    abTests: ABTest[];
    benchmarks: Benchmark[];
  };
  
  // Sécurité & RGPD
  security: {
    piiMasking: PIIMaskingConfig;
    dataRetention: DataRetentionConfig;
    auditLog: boolean;
    encryption: EncryptionConfig;
  };
  
  // Monitoring & Logs
  monitoring: {
    enabled: boolean;
    metrics: MetricsConfig;
    alerts: AlertConfig[];
    realtime: boolean;
  };
}

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'mistral' | 'cohere' | 'local' | 'azure';
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences: string[];
  streaming: boolean;
  timeout: number;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
    exponentialBackoff: boolean;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    semanticCache: boolean;
  };
}

interface PromptConfig {
  template: string;
  variables: Record<string, any>;
  version: string;
  preprocessing: {
    trimWhitespace: boolean;
    normalizeNewlines: boolean;
    removeHtml: boolean;
    maxLength: number;
  };
}

interface ContextConfig {
  maxTokens: number;
  priorityOrder: ('email' | 'history' | 'knowledge' | 'user-profile')[];
  truncationStrategy: 'oldest-first' | 'least-relevant' | 'smart-truncate';
  includeMetadata: boolean;
}

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'regex' | 'greater' | 'less';
    value: string;
  }[];
}

interface ChainConfig {
  id: string;
  name: string;
  steps: {
    prompt: string;
    extractVariables: string[];
    condition?: string;
  }[];
}

interface ChunkingStrategy {
  method: 'recursive' | 'semantic' | 'fixed-size' | 'paragraph' | 'sentence';
  chunkSize: number;
  chunkOverlap: number;
  respectBoundaries: boolean;
  minChunkSize: number;
  maxChunkSize: number;
}

interface EmbeddingConfig {
  model: 'text-embedding-3-small' | 'text-embedding-3-large' | 'cohere-embed' | 'local';
  dimensions: number;
  batchSize: number;
  normalized: boolean;
}

interface RetrievalConfig {
  topK: number;
  similarityThreshold: number;
  hybridSearch: {
    enabled: boolean;
    keywordWeight: number;
    semanticWeight: number;
  };
  metadataFilters: Record<string, any>;
  diversityPenalty: number;
}

interface RerankingConfig {
  enabled: boolean;
  model: 'cohere-rerank' | 'cross-encoder' | 'none';
  topN: number;
}

interface FewShotExample {
  id: string;
  category: string;
  input: string;
  output: string;
  metadata: Record<string, any>;
  priority: number;
  active: boolean;
}

interface ABTest {
  id: string;
  name: string;
  variants: {
    id: string;
    config: Partial<AdvancedAIConfig>;
    traffic: number;
  }[];
  metrics: string[];
  startDate: string;
  endDate?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

interface Benchmark {
  id: string;
  name: string;
  testCases: {
    input: string;
    expectedOutput: string;
    category: string;
  }[];
  lastRun?: {
    date: string;
    results: {
      accuracy: number;
      latency: number;
      cost: number;
    };
  };
}

interface PIIMaskingConfig {
  enabled: boolean;
  patterns: {
    email: boolean;
    phone: boolean;
    ssn: boolean;
    creditCard: boolean;
    custom: { pattern: string; replacement: string }[];
  };
  logMasked: boolean;
}

interface DataRetentionConfig {
  enabled: boolean;
  retentionDays: number;
  autoDelete: boolean;
  anonymize: boolean;
}

interface EncryptionConfig {
  enabled: boolean;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  keyRotation: boolean;
  rotationDays: number;
}

interface MetricsConfig {
  track: ('latency' | 'tokens' | 'cost' | 'accuracy' | 'satisfaction')[];
  aggregationInterval: '1min' | '5min' | '15min' | '1hour' | '1day';
  retention: number;
}

interface AlertConfig {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: 'greater' | 'less' | 'equals';
    threshold: number;
  };
  actions: ('email' | 'slack' | 'webhook')[];
  enabled: boolean;
}

export function TabAIConfigAdvanced() {
  const [activeSection, setActiveSection] = useState<string>('models');
  const [config, setConfig] = useState<AdvancedAIConfig>({
    models: {
      primary: {
        provider: 'openai',
        model: 'gpt-4-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stopSequences: [],
        streaming: true,
        timeout: 30000,
        retryConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          exponentialBackoff: true,
        },
        caching: {
          enabled: true,
          ttl: 3600,
          semanticCache: true,
        },
      },
      fallback: [],
      loadBalancing: 'quality-first',
    },
    prompts: {
      system: {
        template: 'Tu es un assistant support client expert...',
        variables: {},
        version: '1.0.0',
        preprocessing: {
          trimWhitespace: true,
          normalizeNewlines: true,
          removeHtml: false,
          maxLength: 4000,
        },
      },
      context: {
        maxTokens: 2000,
        priorityOrder: ['email', 'knowledge', 'history', 'user-profile'],
        truncationStrategy: 'smart-truncate',
        includeMetadata: true,
      },
      templates: [],
      chaining: [],
    },
    rag: {
      enabled: true,
      chunking: {
        method: 'semantic',
        chunkSize: 512,
        chunkOverlap: 50,
        respectBoundaries: true,
        minChunkSize: 100,
        maxChunkSize: 1000,
      },
      embedding: {
        model: 'text-embedding-3-small',
        dimensions: 1536,
        batchSize: 100,
        normalized: true,
      },
      retrieval: {
        topK: 5,
        similarityThreshold: 0.7,
        hybridSearch: {
          enabled: true,
          keywordWeight: 0.3,
          semanticWeight: 0.7,
        },
        metadataFilters: {},
        diversityPenalty: 0.5,
      },
      reranking: {
        enabled: true,
        model: 'cohere-rerank',
        topN: 3,
      },
    },
    fewShots: {
      enabled: true,
      examples: [],
      dynamicSelection: true,
      similarityThreshold: 0.8,
    },
    testing: {
      abTests: [],
      benchmarks: [],
    },
    security: {
      piiMasking: {
        enabled: true,
        patterns: {
          email: true,
          phone: true,
          ssn: true,
          creditCard: true,
          custom: [],
        },
        logMasked: true,
      },
      dataRetention: {
        enabled: true,
        retentionDays: 30,
        autoDelete: true,
        anonymize: false,
      },
      auditLog: true,
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotation: true,
        rotationDays: 90,
      },
    },
    monitoring: {
      enabled: true,
      metrics: {
        track: ['latency', 'tokens', 'cost', 'accuracy', 'satisfaction'],
        aggregationInterval: '5min',
        retention: 90,
      },
      alerts: [],
      realtime: true,
    },
  });

  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestting, setIsTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});

  const sections = [
    { id: 'models', name: 'Modèles & Performance', icon: Cpu, color: 'blue' },
    { id: 'prompts', name: 'Prompts & Context', icon: FileText, color: 'purple' },
    { id: 'rag', name: 'RAG & Knowledge Base', icon: Database, color: 'green' },
    { id: 'fewshots', name: 'Few-Shots & Training', icon: Brain, color: 'orange' },
    { id: 'testing', name: 'Testing & Analytics', icon: TestTube, color: 'pink' },
    { id: 'security', name: 'Sécurité & RGPD', icon: Shield, color: 'red' },
    { id: 'monitoring', name: 'Monitoring & Logs', icon: Activity, color: 'cyan' },
  ];

  const runTest = async () => {
    setIsTesting(true);
    // Simuler un test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResult({
      model: config.models.primary.model,
      latency: Math.random() * 2000 + 500,
      tokens: Math.floor(Math.random() * 500 + 100),
      cost: (Math.random() * 0.05).toFixed(4),
      response: 'Réponse générée simulée...',
      confidence: Math.random(),
      ragSources: ['doc1.pdf', 'doc2.pdf'],
    });
    setIsTesting(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Header avec navigation */}
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Configuration IA Avancée
          </h2>
          <Badge variant="outline" className="ml-auto">
            <Wifi className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        </div>

        {/* Navigation sections */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap',
                    isActive
                      ? `bg-${section.color}-500/10 border-${section.color}-500/50 text-${section.color}-700 dark:text-${section.color}-300`
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{section.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Contenu scrollable */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeSection === 'models' && (
              <ModelConfigSection key="models" config={config} setConfig={setConfig} />
            )}
            {activeSection === 'prompts' && (
              <PromptsConfigSection key="prompts" config={config} setConfig={setConfig} />
            )}
            {activeSection === 'rag' && (
              <RAGConfigSection key="rag" config={config} setConfig={setConfig} />
            )}
            {activeSection === 'fewshots' && (
              <FewShotsConfigSection key="fewshots" config={config} setConfig={setConfig} />
            )}
            {activeSection === 'testing' && (
              <TestingConfigSection 
                key="testing" 
                config={config} 
                setConfig={setConfig}
                testInput={testInput}
                setTestInput={setTestInput}
                testResult={testResult}
                isTestting={isTestting}
                runTest={runTest}
              />
            )}
            {activeSection === 'security' && (
              <SecurityConfigSection key="security" config={config} setConfig={setConfig} />
            )}
            {activeSection === 'monitoring' && (
              <MonitoringConfigSection key="monitoring" config={config} setConfig={setConfig} />
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer avec actions */}
      <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <Button size="sm" className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}

// Sections individuelles - À développer
function ModelConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          Configuration du Modèle Principal
        </h3>
        
        {/* Provider Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Provider</Label>
            <Select 
              value={config.models.primary.provider}
              onValueChange={(value) => setConfig({
                ...config,
                models: { ...config.models, primary: { ...config.models.primary, provider: value }}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="local">Local (Ollama)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Modèle</Label>
            <Select 
              value={config.models.primary.model}
              onValueChange={(value) => setConfig({
                ...config,
                models: { ...config.models, primary: { ...config.models.primary, model: value }}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.models.primary.provider === 'openai' && (
                  <>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </>
                )}
                {config.models.primary.provider === 'anthropic' && (
                  <>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                  </>
                )}
                {config.models.primary.provider === 'mistral' && (
                  <>
                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                    <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                    <SelectItem value="mixtral-8x7b">Mixtral 8x7B</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Parameters */}
        <div className="space-y-6">
          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Température
                <Badge variant="outline" className="text-xs">
                  {config.models.primary.temperature.toFixed(2)}
                </Badge>
              </Label>
              <span className="text-xs text-slate-500">Créativité vs Précision</span>
            </div>
            <Slider
              value={[config.models.primary.temperature]}
              onValueChange={([value]) => setConfig({
                ...config,
                models: { ...config.models, primary: { ...config.models.primary, temperature: value }}
              })}
              min={0}
              max={2}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0.0 (Précis)</span>
              <span>1.0 (Équilibré)</span>
              <span>2.0 (Créatif)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Max Tokens
                <Badge variant="outline" className="text-xs">
                  {config.models.primary.maxTokens}
                </Badge>
              </Label>
              <Input
                type="number"
                value={config.models.primary.maxTokens}
                onChange={(e) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, maxTokens: parseInt(e.target.value) }}
                })}
                className="w-24 h-8 text-xs"
              />
            </div>
            <Slider
              value={[config.models.primary.maxTokens]}
              onValueChange={([value]) => setConfig({
                ...config,
                models: { ...config.models, primary: { ...config.models.primary, maxTokens: value }}
              })}
              min={100}
              max={8000}
              step={100}
              className="w-full"
            />
          </div>

          {/* Top P */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Top P (Nucleus Sampling)
                <Badge variant="outline" className="text-xs">
                  {config.models.primary.topP.toFixed(2)}
                </Badge>
              </Label>
            </div>
            <Slider
              value={[config.models.primary.topP]}
              onValueChange={([value]) => setConfig({
                ...config,
                models: { ...config.models, primary: { ...config.models.primary, topP: value }}
              })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Frequency & Presence Penalty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Frequency Penalty</Label>
              <Slider
                value={[config.models.primary.frequencyPenalty]}
                onValueChange={([value]) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, frequencyPenalty: value }}
                })}
                min={-2}
                max={2}
                step={0.1}
                className="w-full mt-2"
              />
              <Badge variant="outline" className="text-xs mt-1">
                {config.models.primary.frequencyPenalty.toFixed(1)}
              </Badge>
            </div>
            <div>
              <Label className="text-xs">Presence Penalty</Label>
              <Slider
                value={[config.models.primary.presencePenalty]}
                onValueChange={([value]) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, presencePenalty: value }}
                })}
                min={-2}
                max={2}
                step={0.1}
                className="w-full mt-2"
              />
              <Badge variant="outline" className="text-xs mt-1">
                {config.models.primary.presencePenalty.toFixed(1)}
              </Badge>
            </div>
          </div>

          {/* Streaming & Timeout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FastForward className="w-4 h-4 text-blue-500" />
                <Label className="text-sm">Streaming</Label>
              </div>
              <Switch
                checked={config.models.primary.streaming}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, streaming: checked }}
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Timeout (ms)</Label>
              <Input
                type="number"
                value={config.models.primary.timeout}
                onChange={(e) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, timeout: parseInt(e.target.value) }}
                })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Caching */}
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                Cache Intelligent
              </Label>
              <Switch
                checked={config.models.primary.caching.enabled}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, caching: { ...config.models.primary.caching, enabled: checked }}}
                })}
              />
            </div>
            {config.models.primary.caching.enabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">TTL (secondes)</Label>
                  <Input
                    type="number"
                    value={config.models.primary.caching.ttl}
                    onChange={(e) => setConfig({
                      ...config,
                      models: { ...config.models, primary: { ...config.models.primary, caching: { ...config.models.primary.caching, ttl: parseInt(e.target.value) }}}
                    })}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Cache Sémantique</Label>
                  <Switch
                    checked={config.models.primary.caching.semanticCache}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      models: { ...config.models, primary: { ...config.models.primary, caching: { ...config.models.primary.caching, semanticCache: checked }}}
                    })}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Retry Logic */}
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
            <Label className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-orange-600" />
              Configuration de Retry
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Max Retries</Label>
                <Input
                  type="number"
                  value={config.models.primary.retryConfig.maxRetries}
                  onChange={(e) => setConfig({
                    ...config,
                    models: { ...config.models, primary: { ...config.models.primary, retryConfig: { ...config.models.primary.retryConfig, maxRetries: parseInt(e.target.value) }}}
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Retry Delay (ms)</Label>
                <Input
                  type="number"
                  value={config.models.primary.retryConfig.retryDelay}
                  onChange={(e) => setConfig({
                    ...config,
                    models: { ...config.models, primary: { ...config.models.primary, retryConfig: { ...config.models.primary.retryConfig, retryDelay: parseInt(e.target.value) }}}
                  })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Label className="text-xs">Exponential Backoff</Label>
              <Switch
                checked={config.models.primary.retryConfig.exponentialBackoff}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  models: { ...config.models, primary: { ...config.models.primary, retryConfig: { ...config.models.primary.retryConfig, exponentialBackoff: checked }}}
                })}
              />
            </div>
          </Card>
        </div>
      </Card>

      {/* Load Balancing & Fallback */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Load Balancing & Fallback
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label>Stratégie de Load Balancing</Label>
            <Select 
              value={config.models.loadBalancing}
              onValueChange={(value) => setConfig({
                ...config,
                models: { ...config.models, loadBalancing: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-robin">Round Robin (Équilibré)</SelectItem>
                <SelectItem value="least-latency">Least Latency (Plus rapide)</SelectItem>
                <SelectItem value="cost-optimized">Cost Optimized (Moins cher)</SelectItem>
                <SelectItem value="quality-first">Quality First (Meilleure qualité)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Modèles de Fallback</Label>
            <div className="space-y-2">
              {config.models.fallback.length === 0 ? (
                <div className="text-sm text-slate-500 italic p-4 border-2 border-dashed rounded-lg text-center">
                  Aucun modèle de fallback configuré
                </div>
              ) : (
                config.models.fallback.map((fallback: ModelConfig, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="flex-1 text-sm">{fallback.provider} - {fallback.model}</span>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un Fallback
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Les autres sections seront créées dans les prochains fichiers
function PromptsConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section Prompts - En développement</h3>
        <p className="text-sm text-slate-600">Configuration avancée des prompts et du contexte...</p>
      </Card>
    </motion.div>
  );
}

function RAGConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section RAG - En développement</h3>
        <p className="text-sm text-slate-600">Configuration RAG personnalisée...</p>
      </Card>
    </motion.div>
  );
}

function FewShotsConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section Few-Shots - En développement</h3>
        <p className="text-sm text-slate-600">Gestion des exemples d'entraînement...</p>
      </Card>
    </motion.div>
  );
}

function TestingConfigSection({ config, setConfig, testInput, setTestInput, testResult, isTestting, runTest }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section Testing - En développement</h3>
        <p className="text-sm text-slate-600">Playground de test et analytics...</p>
      </Card>
    </motion.div>
  );
}

function SecurityConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section Sécurité - En développement</h3>
        <p className="text-sm text-slate-600">Configuration sécurité et RGPD...</p>
      </Card>
    </motion.div>
  );
}

function MonitoringConfigSection({ config, setConfig }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Section Monitoring - En développement</h3>
        <p className="text-sm text-slate-600">Dashboard de monitoring temps réel...</p>
      </Card>
    </motion.div>
  );
}
