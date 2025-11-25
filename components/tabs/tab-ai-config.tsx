'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Power,
  Globe,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Code,
  Sparkles,
  Send,
  Download,
  Upload,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AIConfig {
  ai_enabled: boolean;
  mode: 'auto' | 'draft' | 'off';
  default_language: 'FR' | 'EN' | 'auto-detect';
  global_fallback_threshold: number;
  max_ai_replies_per_ticket: number;
  retention_days: number;
  mask_pii: boolean;
  system_prompt: string;
  few_shots: {
    category: string;
    example_email: string;
    expected_response: string;
  }[];
  tone_profiles: {
    formal: string;
    friendly: string;
    technical: string;
  };
}

const DEFAULT_AI_CONFIG: AIConfig = {
  ai_enabled: false,
  mode: 'draft',
  default_language: 'FR',
  global_fallback_threshold: 0.6,
  max_ai_replies_per_ticket: 3,
  retention_days: 30,
  mask_pii: true,
  system_prompt: `Tu es un assistant support client expert et professionnel.
Ta mission est d'analyser les emails entrants et de générer des réponses appropriées.

Contexte:
- Tu as accès à une base de connaissances produits
- Tu dois classifier chaque email par catégorie
- Tu dois évaluer le niveau d'urgence (0-10)
- Tu génères des réponses personnalisées et empathiques

Consignes:
1. Analyse le contexte et l'intention du client
2. Utilise les informations de la base de connaissances
3. Réponds de manière claire, concise et professionnelle
4. Adapte ton ton selon la situation
5. Si incertitude > 40%, marque comme "nécessite révision humaine"`,
  few_shots: [
    {
      category: 'Remboursement',
      example_email: 'Bonjour, j\'ai reçu mon produit cassé. Je voudrais un remboursement.',
      expected_response: 'Bonjour, nous sommes vraiment désolés pour ce désagrément. Nous allons procéder à votre remboursement immédiatement...'
    }
  ],
  tone_profiles: {
    formal: 'Style formel et professionnel, vouvoiement systématique',
    friendly: 'Style amical et chaleureux, tutoiement possible',
    technical: 'Style technique et précis, vocabulaire expert'
  }
};

export function TabAIConfig({ onChange }: { onChange?: () => void }) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const updateConfig = (key: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    onChange?.();
  };

  const handleTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Entrez un email de test');
      return;
    }

    setIsTesting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        category: 'Remboursement',
        confidence: 0.85,
        urgency: 6,
        generated_reply: `Bonjour,

Nous avons bien reçu votre demande concernant un remboursement.

Notre équipe va traiter votre demande dans les plus brefs délais. Nous reviendrons vers vous sous 24h avec une réponse définitive.

Cordialement,
L'équipe Support`,
        sources_used: ['manuel-remboursement.pdf', 'politique-garantie.pdf'],
        needs_human_review: false,
        processing_time_ms: 1850
      };

      setTestResult(mockResult);
      toast.success('Test effectué avec succès');
    } catch (error) {
      toast.error('Erreur lors du test');
    } finally {
      setIsTesting(false);
    }
  };

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-config-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exportée');
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        setConfig(imported);
        toast.success('Configuration importée');
        onChange?.();
      } catch (error) {
        toast.error('Fichier invalide');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header avec toggle principal */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            Configuration IA
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personnalisez le comportement de l&apos;assistant IA
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="ai-toggle" className="text-sm font-medium">
              IA Globale
            </Label>
            <Switch
              id="ai-toggle"
              checked={config.ai_enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  // Show RGPD confirmation
                  const confirmed = window.confirm(
                    'Activation de l\'IA\n\n' +
                    '✓ Traitement automatique des emails\n' +
                    '✓ Génération de réponses IA\n' +
                    '✓ Analyse et classification\n\n' +
                    'Conformité RGPD:\n' +
                    '• Les données sont traitées de manière sécurisée\n' +
                    '• Option de masquage PII disponible\n' +
                    '• Logs conservés selon rétention définie\n\n' +
                    'Activer l\'IA ?'
                  );
                  if (confirmed) {
                    updateConfig('ai_enabled', true);
                    toast.success('IA activée', {
                      description: 'Les réponses automatiques sont maintenant actives'
                    });
                  }
                } else {
                  updateConfig('ai_enabled', false);
                  toast.info('IA désactivée');
                }
              }}
              className={cn(
                'data-[state=checked]:bg-green-600',
                config.ai_enabled && 'animate-pulse'
              )}
            />
            <Badge
              variant="outline"
              className={cn(
                'ml-2',
                config.ai_enabled
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                  : 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/30'
              )}
            >
              <Power className="w-3 h-3 mr-1" />
              {config.ai_enabled ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportConfig}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={importConfig}>
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
          </div>
        </div>
      </div>

      {/* Paramètres principaux */}
      <Card className="p-6 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Paramètres généraux
        </h4>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="mode">Mode de fonctionnement</Label>
            <Select
              value={config.mode}
              onValueChange={(value: AIConfig['mode']) => updateConfig('mode', value)}
              disabled={!config.ai_enabled}
            >
              <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (envoi direct)</SelectItem>
                <SelectItem value="draft">Brouillon (révision requise)</SelectItem>
                <SelectItem value="off">Désactivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Langue par défaut</Label>
            <Select
              value={config.default_language}
              onValueChange={(value: AIConfig['default_language']) => updateConfig('default_language', value)}
              disabled={!config.ai_enabled}
            >
              <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FR">Français</SelectItem>
                <SelectItem value="EN">Anglais</SelectItem>
                <SelectItem value="auto-detect">Auto-détection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="threshold">Seuil de confiance (0-1)</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.global_fallback_threshold}
              onChange={(e) => updateConfig('global_fallback_threshold', parseFloat(e.target.value))}
              disabled={!config.ai_enabled}
              className="border-blue-200 dark:border-blue-500/30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              En dessous → brouillon
            </p>
          </div>

          <div>
            <Label htmlFor="max-replies">Max réponses IA / ticket</Label>
            <Input
              id="max-replies"
              type="number"
              min="1"
              max="10"
              value={config.max_ai_replies_per_ticket}
              onChange={(e) => updateConfig('max_ai_replies_per_ticket', parseInt(e.target.value))}
              disabled={!config.ai_enabled}
              className="border-blue-200 dark:border-blue-500/30"
            />
          </div>

          <div>
            <Label htmlFor="retention">Rétention logs (jours)</Label>
            <Input
              id="retention"
              type="number"
              min="1"
              max="365"
              value={config.retention_days}
              onChange={(e) => updateConfig('retention_days', parseInt(e.target.value))}
              disabled={!config.ai_enabled}
              className="border-blue-200 dark:border-blue-500/30"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-blue-200 dark:border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <Label htmlFor="mask-pii" className="text-sm font-medium cursor-pointer">
                Masquer les PII
              </Label>
            </div>
            <Switch
              id="mask-pii"
              checked={config.mask_pii}
              onCheckedChange={(checked) => updateConfig('mask_pii', checked)}
              disabled={!config.ai_enabled}
            />
          </div>
        </div>
      </Card>

      {/* Prompt System */}
      <Card className="p-6 border-purple-200/50 dark:border-purple-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-500" />
            Prompt système
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            disabled={!config.ai_enabled}
          >
            {showPromptEditor ? 'Masquer' : 'Éditer'}
          </Button>
        </div>

        {showPromptEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Textarea
              value={config.system_prompt}
              onChange={(e) => updateConfig('system_prompt', e.target.value)}
              rows={12}
              className="font-mono text-sm border-purple-200 dark:border-purple-500/30"
              disabled={!config.ai_enabled}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Variables disponibles: {'{'}client_nom{'}'}, {'{'}order_id{'}'}, {'{'}product_name{'}'}, {'{'}confidence_score{'}'}, {'{'}source_doc{'}'}
            </p>
          </motion.div>
        )}
      </Card>

      {/* Test Area */}
      <Card className="p-6 border-green-200/50 dark:border-green-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" />
          Tester la configuration
        </h4>

        <div className="space-y-4">
          <div>
            <Label htmlFor="test-email">Email de test</Label>
            <Textarea
              id="test-email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Bonjour, j'ai un problème avec mon Laptop Pro X1..."
              rows={4}
              className="border-green-200 dark:border-green-500/30"
              disabled={!config.ai_enabled || isTesting}
            />
          </div>

          <Button
            onClick={handleTest}
            disabled={!config.ai_enabled || isTesting || !testEmail.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isTesting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Bot className="w-4 h-4" />
                </motion.div>
                Analyse en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Tester
              </>
            )}
          </Button>

          {/* Test Results */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-green-900 dark:text-green-300">
                  Résultat de l&apos;analyse
                </h5>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                  {testResult.processing_time_ms}ms
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-[#0f1320] rounded border border-green-200 dark:border-green-500/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Catégorie</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{testResult.category}</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#0f1320] rounded border border-green-200 dark:border-green-500/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Confiance</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{(testResult.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-white dark:bg-[#0f1320] rounded border border-green-200 dark:border-green-500/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Urgence</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{testResult.urgency}/10</p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#0f1320] rounded border border-green-200 dark:border-green-500/20">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Réponse générée</p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                  {testResult.generated_reply}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Sources:</span>
                {testResult.sources_used.map((source: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>

              {testResult.needs_human_review && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-900 dark:text-orange-300">
                    Révision humaine recommandée
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}
