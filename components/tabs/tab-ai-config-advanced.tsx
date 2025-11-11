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

  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});

  const sections = [
    { id: 'models', name: 'Modèles & Performance', icon: Cpu, color: 'blue' },
    { id: 'prompts', name: 'Prompts & Contexte', icon: FileText, color: 'purple' },
    { id: 'rag', name: 'Base de Connaissances', icon: Database, color: 'blue' },
    { id: 'testing', name: 'Tests & Analyse', icon: TestTube, color: 'pink' },
    { id: 'security', name: 'Sécurité & RGPD', icon: Shield, color: 'red' },
    { id: 'monitoring', name: 'Surveillance & Logs', icon: Activity, color: 'cyan' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Header avec navigation */}
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Configuration IA Avancée
          </h2>
          <a href="/docs/ai-config" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="ml-auto">
              <FileText className="w-4 h-4 mr-2" />
              Fiches Techniques
            </Button>
          </a>
          <Badge variant="outline">
            <Wifi className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        </div>

        {/* Navigation sections avec scroll horizontal */}
        <div className="relative">
          {/* Indicateur de scroll */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2">
            <ChevronRight className="w-4 h-4 text-slate-400 animate-pulse" />
          </div>
          
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2 pr-12">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]',
                      isActive
                        ? `bg-${section.color}-500/10 border-${section.color}-500/50 text-${section.color}-700 dark:text-${section.color}-300`
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
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
            {activeSection === 'testing' && (
              <TestingConfigSection 
                key="testing" 
                config={config} 
                setConfig={setConfig}
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
          {/* Creativity Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Niveau de Créativité
                <Badge variant="outline" className="text-xs">
                  {config.models.primary.temperature.toFixed(2)}
                </Badge>
              </Label>
              <span className="text-xs text-slate-500">Réponses créatives ou précises</span>
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
                Tokens Maximum
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
              <Label className="text-xs flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Anti-Répétition
              </Label>
              <p className="text-[10px] text-slate-500 mb-1">Évite la répétition des mots</p>
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
              <Label className="text-xs flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Diversité des Sujets
              </Label>
              <p className="text-[10px] text-slate-500 mb-1">Encourage de nouveaux thèmes</p>
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
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
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
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
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
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-500" />
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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{id: string, name: string, type: string, size: number, uploadedAt: string}>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Limites selon le plan (à récupérer du contexte utilisateur)
  const userPlan = 'pro'; // 'basic', 'pro', 'enterprise'
  const fileLimits = {
    basic: 1,
    pro: 5,
    enterprise: Infinity
  };
  const maxFiles = fileLimits[userPlan as keyof typeof fileLimits];
  const canUploadMore = uploadedFiles.length < maxFiles;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!canUploadMore) {
      alert(`Limite atteinte : ${maxFiles} fichier(s) maximum pour le plan ${userPlan.toUpperCase()}`);
      return;
    }

    setIsUploading(true);
    const newFiles = Array.from(files).slice(0, maxFiles - uploadedFiles.length);
    
    // Validation des types de fichiers
    const allowedTypes = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.txt', '.csv'];
    const validFiles = newFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(extension);
    });

    if (validFiles.length === 0) {
      alert('Format non supporté. Formats acceptés : PDF, Excel, Word, TXT, CSV');
      setIsUploading(false);
      return;
    }

    // Simulation upload (à remplacer par vrai appel API)
    setTimeout(() => {
      const uploaded = validFiles.map(file => ({
        id: Math.random().toString(36),
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));
      
      setUploadedFiles([...uploadedFiles, ...uploaded]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-blue-200 dark:border-blue-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Base de Connaissances (RAG)
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Importez vos documents (manuels produits, guides utilisateur, FAQ, procédures) pour enrichir 
          les réponses de l'IA avec des informations spécifiques à votre entreprise.
        </p>

        {/* Limite de plan */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Plan {userPlan.toUpperCase()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {uploadedFiles.length} / {maxFiles === Infinity ? '∞' : maxFiles} fichier(s) utilisé(s)
              </p>
            </div>
            {maxFiles !== Infinity && (
              <Badge variant={uploadedFiles.length >= maxFiles ? "destructive" : "default"}>
                {maxFiles - uploadedFiles.length} restant(s)
              </Badge>
            )}
          </div>
        </div>

        {/* Zone de drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all",
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400",
            !canUploadMore && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-sm font-medium mb-1">
            {canUploadMore ? "Glissez-déposez vos fichiers ici" : "Limite atteinte"}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Formats supportés : PDF, Excel, Word, TXT, CSV
          </p>
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canUploadMore || isUploading}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Parcourir
                </>
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.docx,.doc,.txt,.csv"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={!canUploadMore}
            />
          </label>
        </div>

        {/* Liste des fichiers uploadés */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents importés ({uploadedFiles.length})
            </h4>
            <ScrollArea className="h-64 rounded-lg border">
              <div className="p-3 space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Exemples d'usage :</strong> Fonctionnement des produits, procédures de retour, 
            garanties, questions techniques spécifiques, politiques de l'entreprise.
          </p>
        </div>
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

function TestingConfigSection({ config, setConfig }: any) {
  const [testProblem, setTestProblem] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestting, setIsTesting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleRunTest = async () => {
    if (!testProblem.trim()) return;
    
    setIsTesting(true);
    try {
      // Appel réel au backend pour générer une réponse
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testProblem,
          config: config.models.primary, // Utilise la config actuelle
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setTestResult({
          response: data.reply,
          category: data.category || 'Général',
          confidence: data.confidence || 0,
          latency: data.processingTime || 0,
          tokens: data.tokensUsed || 0,
          cost: data.cost || 0,
        });
      } else {
        setTestResult({
          error: data.error || 'Erreur lors de la génération',
        });
      }
    } catch (error: any) {
      setTestResult({
        error: error.message || 'Erreur de connexion au serveur',
      });
    } finally {
      setIsTesting(false);
    }
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
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Message Client à Tester
            </Label>
            <Textarea
              value={testProblem}
              onChange={(e) => setTestProblem(e.target.value)}
              placeholder="Ex: Bonjour, j'ai reçu mon laptop mais il ne démarre pas. L'écran reste noir même après avoir chargé la batterie. Que puis-je faire ?"
              className="min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-2">
              Testez la réponse de l'IA avec votre configuration actuelle
            </p>
          </div>

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
                  Tester la Configuration
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
          {testResult.error ? (
            <Card className="p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
              <p className="text-red-700 dark:text-red-300">
                ❌ <strong>Erreur :</strong> {testResult.error}
              </p>
            </Card>
          ) : (
            <>
              {/* Métriques */}
              {testResult.latency > 0 && (
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
                      {testResult.latency}ms
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Tokens</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {testResult.tokens}
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Coût</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      ${testResult.cost.toFixed(4)}
                    </div>
                  </Card>
                </div>
              )}

              {/* Réponse Générée */}
              <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Réponse Générée
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">
                    {testResult.response}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(testResult.response)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                </div>
              </Card>

              {/* Debug Info */}
              {showDebug && (
                <Card className="p-6 bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Microscope className="w-5 h-5" />
                    Informations de Debug
                  </h4>
                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto">
                    {JSON.stringify({ 
                      config: config.models.primary,
                      result: testResult 
                    }, null, 2)}
                  </pre>
                </Card>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Exemples rapides */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Exemples Rapides</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Bonjour, je n'ai toujours pas reçu ma commande passée il y a 2 semaines. C'est inadmissible ! Je veux un remboursement immédiat.")}
            className="justify-start text-left h-auto p-3"
          >
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500" />
            <span className="text-xs">Réclamation livraison retardée</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestProblem("Mon laptop ne démarre plus depuis ce matin. L'écran reste noir. Acheté il y a 3 mois. Que faire ?")}
            className="justify-start text-left h-auto p-3"
          >
            <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
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
  const [piiMaskingEnabled, setPiiMaskingEnabled] = useState(true);
  const [auditLogEnabled, setAuditLogEnabled] = useState(true);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-red-200 dark:border-red-900">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          Sécurité & RGPD
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Configurez les paramètres de sécurité et de conformité RGPD pour protéger les données sensibles.
        </p>

        {/* Masquage des données sensibles */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <EyeOff className="w-4 h-4 text-purple-500" />
                  <Label className="text-sm font-medium">Masquage des Données Personnelles (PII)</Label>
                </div>
                <p className="text-xs text-slate-500">
                  Masque automatiquement les emails, téléphones, adresses et numéros de carte bancaire
                </p>
              </div>
              <Switch
                checked={piiMaskingEnabled}
                onCheckedChange={setPiiMaskingEnabled}
              />
            </div>
            
            {piiMaskingEnabled && (
              <div className="space-y-2 pl-6 border-l-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Emails : user@example.com → u***@e***.com</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Téléphones : 06 12 34 56 78 → 06 ** ** ** 78</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Cartes bancaires : masquage complet</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-green-500" />
                  <span>Adresses : masquage partiel</span>
                </div>
              </div>
            )}
          </div>

          {/* Logs d'audit */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <Label className="text-sm font-medium">Logs d'Audit</Label>
                </div>
                <p className="text-xs text-slate-500">
                  Enregistre toutes les actions pour traçabilité et conformité
                </p>
              </div>
              <Switch
                checked={auditLogEnabled}
                onCheckedChange={setAuditLogEnabled}
              />
            </div>
            
            {auditLogEnabled && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                <p className="text-blue-700 dark:text-blue-300">
                  📝 Enregistrement : Accès données, modifications config, générations IA, suppressions
                </p>
              </div>
            )}
          </div>

          {/* Rétention des données */}
          <div className="p-4 border rounded-lg">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-500" />
                <Label className="text-sm font-medium">Rétention des Données</Label>
              </div>
              <p className="text-xs text-slate-500">
                Durée de conservation des emails et réponses générées
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Durée de conservation :</span>
                <Badge variant="outline">{dataRetentionDays} jours</Badge>
              </div>
              <Slider
                value={[dataRetentionDays]}
                onValueChange={([value]) => setDataRetentionDays(value)}
                min={30}
                max={365}
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>30 jours</span>
                <span>6 mois</span>
                <span>1 an</span>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded text-xs text-orange-700 dark:text-orange-300">
                ⚠️ Après {dataRetentionDays} jours, les données seront automatiquement supprimées
              </div>
            </div>
          </div>

          {/* Chiffrement */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-green-500" />
                  <Label className="text-sm font-medium">Chiffrement des Données</Label>
                </div>
                <p className="text-xs text-slate-500">
                  Chiffrement AES-256 pour les données au repos et en transit
                </p>
              </div>
              <Switch
                checked={encryptionEnabled}
                onCheckedChange={setEncryptionEnabled}
                disabled
              />
            </div>
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs text-green-700 dark:text-green-300">
              🔒 Chiffrement activé par défaut (obligatoire pour conformité RGPD)
            </div>
          </div>

          {/* Conformité RGPD */}
          <div className="p-4 border-2 border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Conformité RGPD
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5" />
                <span>Droit à l'oubli : Suppression automatique après période de rétention</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5" />
                <span>Minimisation des données : Seules les données nécessaires sont collectées</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5" />
                <span>Transparence : Logs d'audit complets et accessibles</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5" />
                <span>Sécurité : Chiffrement bout-en-bout et masquage PII</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5" />
                <span>Hébergement : Serveurs en Union Européenne (Paris, Francfort)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function MonitoringConfigSection({ config, setConfig }: any) {
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Données de démonstration (à remplacer par vraies métriques)
  const metrics = {
    totalRequests: 1247,
    successRate: 94.3,
    avgLatency: 1.2,
    totalTokens: 487532,
    estimatedCost: 12.45,
    errorRate: 5.7
  };

  const recentActivity = [
    { id: 1, timestamp: '2024-01-15 14:32', action: 'Génération réponse', category: 'Support technique', latency: 1.1, tokens: 342, status: 'success' },
    { id: 2, timestamp: '2024-01-15 14:28', action: 'Classification email', category: 'Facturation', latency: 0.8, tokens: 124, status: 'success' },
    { id: 3, timestamp: '2024-01-15 14:25', action: 'Génération réponse', category: 'Demande info', latency: 2.3, tokens: 521, status: 'error' },
    { id: 4, timestamp: '2024-01-15 14:20', action: 'Génération réponse', category: 'Réclamation', latency: 1.5, tokens: 398, status: 'success' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-purple-200 dark:border-purple-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Monitoring & Analytics
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Surveillance en temps réel de l'activité IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                realTimeEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
              )} />
              <span className="text-xs text-slate-500">
                {realTimeEnabled ? "En direct" : "Pausé"}
              </span>
            </div>
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="mb-6 flex gap-2">
          {['24h', '7d', '30d', '90d'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="text-xs"
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 border-blue-200 dark:border-blue-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalRequests}</p>
                <p className="text-xs text-slate-500">Requêtes totales</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-green-200 dark:border-green-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.successRate}%</p>
                <p className="text-xs text-slate-500">Taux de succès</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-purple-200 dark:border-purple-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Gauge className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgLatency}s</p>
                <p className="text-xs text-slate-500">Latence moyenne</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-orange-200 dark:border-orange-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Hash className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(metrics.totalTokens / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Tokens utilisés</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <DollarSign className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${metrics.estimatedCost}</p>
                <p className="text-xs text-slate-500">Coût estimé</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.errorRate}%</p>
                <p className="text-xs text-slate-500">Taux d'erreur</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Graphique simplifié (placeholder) */}
        <Card className="p-4 mb-6 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Activité sur {selectedPeriod}
            </h4>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </Badge>
          </div>
          <div className="h-32 flex items-end justify-around gap-1">
            {[65, 80, 72, 90, 85, 95, 88, 92, 78, 85, 95, 100].map((height, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t opacity-70 hover:opacity-100 transition-opacity" style={{ height: `${height}%` }} />
            ))}
          </div>
        </Card>

        {/* Activité récente */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Activité récente
          </h4>
          <ScrollArea className="h-64 rounded-lg border">
            <div className="p-3 space-y-2">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === 'success' ? "bg-green-500" : "bg-red-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{item.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{item.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{item.latency}s</span>
                    <span>{item.tokens} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Alertes configurées */}
        <Card className="p-4 mt-6 border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            Alertes configurées
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Taux d'erreur {'>'} 10%</span>
              <Badge variant="outline" className="bg-white dark:bg-slate-900">Actif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Latence moyenne {'>'} 3s</span>
              <Badge variant="outline" className="bg-white dark:bg-slate-900">Actif</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Coût journalier {'>'} $50</span>
              <Badge variant="outline" className="bg-white dark:bg-slate-900">Actif</Badge>
            </div>
          </div>
        </Card>
      </Card>
    </motion.div>
  );
}
