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
  Check, X, Plus, Minus, Edit, Trash2, RotateCcw, Hash,
  AlertTriangle, Wrench
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
    loadBalancing: 'least-latency' | 'cost-optimized';
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
  provider: 'openai';
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
  style?: {
    humanization: 'robotic' | 'professional' | 'balanced' | 'friendly' | 'very-human';
    responseLength: 'very-short' | 'short' | 'medium' | 'detailed' | 'comprehensive';
    formality: 'very-formal' | 'formal' | 'neutral' | 'casual' | 'very-casual';
    emotionalTone: 'neutral' | 'empathetic' | 'enthusiastic' | 'reassuring' | 'apologetic';
    technicalLevel: 'simple' | 'intermediate' | 'adaptive' | 'advanced' | 'expert';
    useEmojis: boolean;
    useBulletPoints: boolean;
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
      loadBalancing: 'least-latency',
    },
    prompts: {
      system: {
        template: 'Tu es un assistant support client expert et professionnel.\nTa mission est d\'analyser les emails entrants et de générer des réponses appropriées.\n\nContexte:\n- Tu as accès à une base de connaissances produits\n- Tu dois classifier chaque email par catégorie\n- Tu dois évaluer le niveau d\'urgence (0-10)\n- Tu génères des réponses personnalisées et empathiques\n\nConsignes:\n1. Analyse le contexte et l\'intention du client\n2. Utilise les informations de la base de connaissances\n3. Réponds de manière claire, concise et professionnelle\n4. Adapte ton ton selon la situation\n5. Si incertitude > 40%, marque comme "nécessite révision humaine"',
        variables: {},
        version: '1.0.0',
        preprocessing: {
          trimWhitespace: true,
          normalizeNewlines: true,
          removeHtml: false,
          maxLength: 4000,
        },
        style: {
          humanization: 'balanced',
          responseLength: 'medium',
          formality: 'neutral',
          emotionalTone: 'empathetic',
          technicalLevel: 'adaptive',
          useEmojis: false,
          useBulletPoints: true,
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
          Configuration du Modèle OpenAI
        </h3>
        
        {/* Note sur la clé API */}
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            La clé API OpenAI est configurée de manière sécurisée côté serveur
          </p>
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

      {/* Load Balancing & Fallback - Simplifié pour OpenAI */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Stratégie de Répartition
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label>Mode de Répartition des Requêtes</Label>
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
                <SelectItem value="least-latency">Latence Minimale (Plus rapide)</SelectItem>
                <SelectItem value="cost-optimized">Optimisé Coût (Moins cher)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-2">
              Détermine comment les requêtes sont distribuées pour optimiser les performances
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Les autres sections seront créées dans les prochains fichiers
function PromptsConfigSection({ config, setConfig }: any) {
  const [customVariables, setCustomVariables] = useState<{ key: string; value: string }[]>([]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Éditeur de Prompt Système */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-purple-200 dark:border-purple-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Prompt Système Principal
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label>Instructions pour l'IA</Label>
            <Textarea
              value={config.prompts.system.template}
              onChange={(e) => setConfig({
                ...config,
                prompts: { ...config.prompts, system: { ...config.prompts.system, template: e.target.value }}
              })}
              placeholder="Tu es un assistant support client expert..."
              className="min-h-[200px] font-mono text-sm mt-2"
            />
            <p className="text-xs text-slate-500 mt-2">
              Ce prompt définit le comportement global de l'IA pour toutes les réponses
            </p>
          </div>

          {/* Paramètres de Style */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Niveau d'Humanisation
              </Label>
              <Select 
                value={config.prompts.style?.humanization || 'balanced'}
                onValueChange={(value) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, humanization: value }}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="robotic">Robotique (Très formel)</SelectItem>
                  <SelectItem value="professional">Professionnel</SelectItem>
                  <SelectItem value="balanced">Équilibré</SelectItem>
                  <SelectItem value="friendly">Amical</SelectItem>
                  <SelectItem value="very-human">Très Humain (Conversationnel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Temps de Réponse
              </Label>
              <Select 
                value={config.prompts.style?.responseLength || 'medium'}
                onValueChange={(value) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, responseLength: value }}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-short">Très Court (1-2 phrases)</SelectItem>
                  <SelectItem value="short">Court (3-5 phrases)</SelectItem>
                  <SelectItem value="medium">Moyen (1-2 paragraphes)</SelectItem>
                  <SelectItem value="detailed">Détaillé (3-4 paragraphes)</SelectItem>
                  <SelectItem value="comprehensive">Complet (5+ paragraphes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Formalité et Ton */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Formalité</Label>
              <Select 
                value={config.prompts.style?.formality || 'neutral'}
                onValueChange={(value) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, formality: value }}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-formal">Très Formel (Vous)</SelectItem>
                  <SelectItem value="formal">Formel</SelectItem>
                  <SelectItem value="neutral">Neutre</SelectItem>
                  <SelectItem value="casual">Décontracté</SelectItem>
                  <SelectItem value="very-casual">Très Décontracté (Tu)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ton Émotionnel</Label>
              <Select 
                value={config.prompts.style?.emotionalTone || 'empathetic'}
                onValueChange={(value) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, emotionalTone: value }}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutre</SelectItem>
                  <SelectItem value="empathetic">Empathique</SelectItem>
                  <SelectItem value="enthusiastic">Enthousiaste</SelectItem>
                  <SelectItem value="reassuring">Rassurant</SelectItem>
                  <SelectItem value="apologetic">Désolé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Niveau Technique</Label>
              <Select 
                value={config.prompts.style?.technicalLevel || 'adaptive'}
                onValueChange={(value) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, technicalLevel: value }}
                })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple (Grand public)</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="adaptive">Adaptatif</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options supplémentaires */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <Label className="text-sm">Utiliser des Emojis</Label>
              </div>
              <Switch
                checked={config.prompts.style?.useEmojis || false}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, useEmojis: checked }}
                })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <Label className="text-sm">Format Bullet Points</Label>
              </div>
              <Switch
                checked={config.prompts.style?.useBulletPoints || false}
                onCheckedChange={(checked) => setConfig({
                  ...config,
                  prompts: { ...config.prompts, style: { ...config.prompts.style, useBulletPoints: checked }}
                })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Variables Personnalisées */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-green-200 dark:border-green-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-green-500" />
          Variables Personnalisées
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Définissez des variables réutilisables dans vos prompts avec la syntaxe <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">{'{{nom_variable}}'}</code>
          </p>

          {/* Variables prédéfinies */}
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-start">
              <Code className="w-3 h-3 mr-2" />
              {'{{client_nom}}'} - Nom du client
            </Badge>
            <Badge variant="outline" className="justify-start">
              <Code className="w-3 h-3 mr-2" />
              {'{{order_id}}'} - Numéro de commande
            </Badge>
            <Badge variant="outline" className="justify-start">
              <Code className="w-3 h-3 mr-2" />
              {'{{product_name}}'} - Nom du produit
            </Badge>
            <Badge variant="outline" className="justify-start">
              <Code className="w-3 h-3 mr-2" />
              {'{{confidence_score}}'} - Score de confiance
            </Badge>
          </div>

          {/* Custom variables */}
          <div className="space-y-2">
            <Label>Variables Supplémentaires</Label>
            {customVariables.map((variable, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="nom_variable"
                  value={variable.key}
                  onChange={(e) => {
                    const newVars = [...customVariables];
                    newVars[index].key = e.target.value;
                    setCustomVariables(newVars);
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="Valeur par défaut"
                  value={variable.value}
                  onChange={(e) => {
                    const newVars = [...customVariables];
                    newVars[index].value = e.target.value;
                    setCustomVariables(newVars);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCustomVariables(customVariables.filter((_, i) => i !== index));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setCustomVariables([...customVariables, { key: '', value: '' }])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Variable
            </Button>
          </div>
        </div>
      </Card>

      {/* Contexte et Préprocessing */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-orange-200 dark:border-orange-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          Gestion du Contexte
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Limite de Tokens pour le Contexte
              <Badge variant="outline">{config.prompts.context.maxTokens}</Badge>
            </Label>
            <Slider
              value={[config.prompts.context.maxTokens]}
              onValueChange={([value]) => setConfig({
                ...config,
                prompts: { ...config.prompts, context: { ...config.prompts.context, maxTokens: value }}
              })}
              min={500}
              max={8000}
              step={100}
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label>Ordre de Priorité du Contexte</Label>
            <p className="text-xs text-slate-500 mb-2">
              Glissez-déposez pour réordonner
            </p>
            <div className="space-y-2">
              {config.prompts.context.priorityOrder.map((item: string, index: number) => (
                <div key={item} className="flex items-center gap-2 p-3 border rounded-lg bg-white dark:bg-slate-800">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="flex-1 text-sm capitalize">{item.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Stratégie de Troncature</Label>
            <Select 
              value={config.prompts.context.truncationStrategy}
              onValueChange={(value) => setConfig({
                ...config,
                prompts: { ...config.prompts, context: { ...config.prompts.context, truncationStrategy: value }}
              })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oldest-first">Supprimer les plus anciens</SelectItem>
                <SelectItem value="least-relevant">Supprimer les moins pertinents</SelectItem>
                <SelectItem value="smart-truncate">Troncature Intelligente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              <Label className="text-sm">Inclure les Métadonnées</Label>
            </div>
            <Switch
              checked={config.prompts.context.includeMetadata}
              onCheckedChange={(checked) => setConfig({
                ...config,
                prompts: { ...config.prompts, context: { ...config.prompts.context, includeMetadata: checked }}
              })}
            />
          </div>
        </div>
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
  const [testProblem, setTestProblem] = useState('');
  const [testCategory, setTestCategory] = useState('general');
  const [showDebug, setShowDebug] = useState(false);

  const handleRunTest = async () => {
    if (!testProblem.trim()) return;
    
    await runTest();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Playground de Test */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-pink-200 dark:border-pink-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TestTube className="w-5 h-5 text-pink-500" />
          Playground de Test IA
        </h3>
        
        <div className="space-y-4">
          {/* Input du problème */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Problème Client à Tester
            </Label>
            <Textarea
              value={testProblem}
              onChange={(e) => setTestProblem(e.target.value)}
              placeholder="Ex: Bonjour, j'ai reçu mon laptop mais il ne démarre pas. L'écran reste noir même après avoir chargé la batterie pendant 2 heures. C'est urgent car j'en ai besoin pour travailler demain. Que puis-je faire ?"
              className="min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-2">
              Entrez un message client pour tester la réponse de l'IA avec votre configuration actuelle
            </p>
          </div>

          {/* Catégorie suggérée */}
          <div>
            <Label>Catégorie Attendue (Optionnel)</Label>
            <Select value={testCategory} onValueChange={setTestCategory}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général (Auto-détection)</SelectItem>
                <SelectItem value="remboursement">Remboursement</SelectItem>
                <SelectItem value="sav">SAV / Technique</SelectItem>
                <SelectItem value="commande">Commande</SelectItem>
                <SelectItem value="livraison">Livraison</SelectItem>
                <SelectItem value="info-produit">Info Produit</SelectItem>
                <SelectItem value="reclamation">Réclamation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button
              onClick={handleRunTest}
              disabled={isTestting || !testProblem.trim()}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {isTestting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Générer la Réponse
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDebug(!showDebug)}
            >
              <Microscope className="w-4 h-4 mr-2" />
              {showDebug ? 'Masquer' : 'Debug'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Résultats du Test */}
      {testResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Métriques Rapides */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Confiance</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {(testResult.confidence * 100).toFixed(0)}%
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Latence</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {testResult.latency.toFixed(0)}ms
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Tokens</span>
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {testResult.tokens}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Coût</span>
              </div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                ${testResult.cost}
              </div>
            </Card>
          </div>

          {/* Réponse Générée */}
          <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                Réponse Générée par l'IA
              </h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
              <div className="whitespace-pre-wrap">{testResult.response}</div>
            </div>

            {/* Sources RAG */}
            {testResult.ragSources && testResult.ragSources.length > 0 && (
              <div className="mt-4">
                <Label className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4" />
                  Sources Utilisées (RAG)
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {testResult.ragSources.map((source: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Mode Debug */}
          {showDebug && (
            <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Microscope className="w-5 h-5 text-slate-600" />
                Informations de Debug
              </h4>
              
              <div className="space-y-4">
                {/* Configuration Utilisée */}
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Configuration du Modèle</Label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Modèle:</span>
                      <div className="font-mono font-bold">{config.models.primary.model}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Temperature:</span>
                      <div className="font-mono font-bold">{config.models.primary.temperature}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Max Tokens:</span>
                      <div className="font-mono font-bold">{config.models.primary.maxTokens}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Top P:</span>
                      <div className="font-mono font-bold">{config.models.primary.topP}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Freq Penalty:</span>
                      <div className="font-mono font-bold">{config.models.primary.frequencyPenalty}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                      <span className="text-slate-500">Pres Penalty:</span>
                      <div className="font-mono font-bold">{config.models.primary.presencePenalty}</div>
                    </div>
                  </div>
                </div>

                {/* Prompt Système Utilisé */}
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Prompt Système Envoyé</Label>
                  <pre className="p-3 bg-white dark:bg-slate-800 rounded border text-xs font-mono overflow-x-auto">
                    {config.prompts.system.template}
                  </pre>
                </div>

                {/* Détails de Style */}
                {config.prompts.style && (
                  <div>
                    <Label className="text-xs text-slate-500 mb-2 block">Paramètres de Style Appliqués</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                        <span className="text-slate-500">Humanisation:</span>
                        <div className="font-mono capitalize">{config.prompts.style.humanization || 'balanced'}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                        <span className="text-slate-500">Formalité:</span>
                        <div className="font-mono capitalize">{config.prompts.style.formality || 'neutral'}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                        <span className="text-slate-500">Longueur:</span>
                        <div className="font-mono capitalize">{config.prompts.style.responseLength || 'medium'}</div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded border">
                        <span className="text-slate-500">Ton:</span>
                        <div className="font-mono capitalize">{config.prompts.style.emotionalTone || 'empathetic'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tokens Breakdown */}
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Répartition des Tokens</Label>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span>Prompt (Input):</span>
                      <span className="font-mono font-bold">{Math.floor(testResult.tokens * 0.4)} tokens</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span>Réponse (Output):</span>
                      <span className="font-mono font-bold">{Math.floor(testResult.tokens * 0.6)} tokens</span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded font-bold">
                      <span>Total:</span>
                      <span className="font-mono">{testResult.tokens} tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Exemples rapides */}
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-slate-200 dark:border-slate-800">
        <h4 className="font-semibold flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Exemples Rapides
        </h4>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Bonjour, je n'ai toujours pas reçu ma commande passée il y a 2 semaines. C'est inadmissible ! Je veux un remboursement immédiat.")}
            className="justify-start text-left h-auto p-3"
          >
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">Réclamation livraison retardée</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Mon laptop ne démarre plus depuis ce matin. L'écran reste noir. Acheté il y a 3 mois. Que faire ?")}
            className="justify-start text-left h-auto p-3"
          >
            <Wrench className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">Problème technique SAV</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Bonjour, j'aimerais commander 5 licences logiciel pour mon entreprise. Quels sont les tarifs ?")}
            className="justify-start text-left h-auto p-3"
          >
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">Demande devis entreprise</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Quelle est la différence entre le modèle Pro X1 et Pro X2 ? Lequel me conseillez-vous pour du montage vidéo ?")}
            className="justify-start text-left h-auto p-3"
          >
            <Info className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs">Comparaison produits</span>
          </Button>
        </div>
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
