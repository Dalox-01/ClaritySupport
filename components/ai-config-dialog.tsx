'use client';

import { useState } from 'react';
import { Bot, Save, X, Sparkles, MessageSquare, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type CategoryConfig = {
  enabled: boolean;
  autoReply: boolean;
  requireValidation: boolean;
  tone: 'professionnel' | 'amical' | 'formel';
  customPrompt: string;
  keywords: string[];
  responseTemplate: string;
  delayMinutes: number;
};

type AIConfig = {
  support: CategoryConfig;
  vente: CategoryConfig;
  client: CategoryConfig;
  interne: CategoryConfig;
  partenaire: CategoryConfig;
  urgent: CategoryConfig;
  spam: CategoryConfig;
};

const defaultConfig: AIConfig = {
  support: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'professionnel',
    customPrompt: 'Je suis un assistant de support technique bienveillant et efficace. Je réponds de manière claire, rassurante et je propose des solutions concrètes.',
    keywords: ['problème', 'bug', 'erreur', 'aide', 'support', 'ne fonctionne pas', 'panne', 'défaut', 'dysfonctionnement', 'assistance', 'besoin d\'aide', 'impossible', 'bloqué', 'SOS', 'help', 'issue', 'error'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nMerci de nous avoir contactés concernant votre demande. Notre équipe analyse votre situation et vous apportera une solution rapidement.\n\nNous restons à votre disposition pour toute information complémentaire.\n\nCordialement,\nL\'équipe Support',
    delayMinutes: 0,
  },
  vente: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'professionnel',
    customPrompt: 'Je suis un conseiller commercial attentif et à l\'écoute. Je valorise nos offres de manière naturelle, sans être insistant, et je m\'adapte aux besoins du client.',
    keywords: ['devis', 'prix', 'tarif', 'acheter', 'commander', 'intéressé', 'offre', 'promotion', 'achat', 'coût', 'budget', 'combien', 'catalogue', 'produit', 'service', 'souscription', 'abonnement'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nMerci pour votre intérêt pour nos solutions ! Nous sommes ravis d\'échanger avec vous sur vos besoins spécifiques.\n\nJe me permets de revenir vers vous rapidement avec une proposition adaptée.\n\nBien cordialement,\nL\'équipe Commerciale',
    delayMinutes: 0,
  },
  client: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'professionnel',
    customPrompt: 'Je communique avec un client de manière professionnelle, courtoise et attentionnée. Je maintiens une relation de qualité et je valorise notre partenariat.',
    keywords: ['client', 'commande', 'facture', 'livraison', 'suivi', 'compte client', 'satisfaction', 'retour', 'réclamation', 'demande client', 'question client'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nMerci de votre message. Nous avons bien pris connaissance de votre demande et nous nous engageons à vous apporter une réponse complète rapidement.\n\nNous restons à votre entière disposition.\n\nCordialement,\nVotre équipe',
    delayMinutes: 0,
  },
  interne: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'amical',
    customPrompt: 'Je communique avec un collègue de manière collaborative et conviviale. Je favorise le travail d\'équipe et la bonne entente.',
    keywords: ['équipe', 'collègue', 'réunion', 'meeting', 'projet', 'tâche', 'deadline', 'collaboration', 'briefing', 'interne', 'team', 'RH', 'ressources humaines'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nMerci pour ton message. Je prends note et je reviens vers toi rapidement.\n\nBonne journée,',
    delayMinutes: 0,
  },
  partenaire: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'professionnel',
    customPrompt: 'Je communique avec un partenaire ou fournisseur de manière professionnelle et stratégique. Je maintiens une relation de confiance mutuelle.',
    keywords: ['partenaire', 'fournisseur', 'prestataire', 'collaboration', 'contrat', 'accord', 'partenariat', 'business', 'coopération', 'supplier', 'vendor'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nMerci pour votre message. Nous sommes ravis de poursuivre notre collaboration et nous reviendrons vers vous prochainement.\n\nBien cordialement,',
    delayMinutes: 0,
  },
  urgent: {
    enabled: true,
    autoReply: false,
    requireValidation: true,
    tone: 'professionnel',
    customPrompt: 'Je traite une demande urgente avec réactivité et professionnalisme. Je suis direct, efficace et je propose immédiatement des actions concrètes.',
    keywords: ['urgent', 'URGENT', 'immédiat', 'critique', 'asap', 'rapidement', 'priorité', 'tout de suite', 'emergency', 'important', 'vite', 'pressing', 'au plus vite'],
    responseTemplate: 'Bonjour {nom_expediteur},\n\nVotre demande urgente est bien reçue et traitée en priorité absolue par notre équipe.\n\nNous vous recontactons dans les plus brefs délais avec une solution.\n\nCordialement,\nL\'équipe Support Urgent',
    delayMinutes: 0,
  },
  spam: {
    enabled: true,
    autoReply: false,
    requireValidation: false,
    tone: 'formel',
    customPrompt: 'Email détecté comme spam ou indésirable. Aucune réponse automatique ne sera envoyée.',
    keywords: ['spam', 'publicité', 'marketing', 'unsubscribe', 'viagra', 'casino', 'lottery', 'winner', 'gratuit', 'promo', 'click here', 'cliquez ici'],
    responseTemplate: '',
    delayMinutes: 0,
  },
};

export function AIConfigDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState<Record<string, string>>({});

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/mail-center/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setOpen(false);
        // TODO: Afficher notification succès
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      // TODO: Afficher notification erreur
    } finally {
      setIsSaving(false);
    }
  };

  const updateCategory = (
    category: keyof AIConfig,
    field: keyof CategoryConfig,
    value: any
  ) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const addKeyword = (category: keyof AIConfig) => {
    const keyword = newKeyword[category]?.trim();
    if (keyword && !config[category].keywords.includes(keyword)) {
      updateCategory(category, 'keywords', [...config[category].keywords, keyword]);
      setNewKeyword(prev => ({ ...prev, [category]: '' }));
    }
  };

  const removeKeyword = (category: keyof AIConfig, keyword: string) => {
    updateCategory(
      category,
      'keywords',
      config[category].keywords.filter(k => k !== keyword)
    );
  };

  const renderCategoryConfig = (
    category: keyof AIConfig,
    title: string,
    icon: React.ReactNode,
    color: string
  ) => {
    const categoryConfig = config[category];

    return (
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">
                Configuration des réponses automatiques
              </p>
            </div>
          </div>
          <Switch
            checked={categoryConfig.enabled}
            onCheckedChange={(checked) =>
              updateCategory(category, 'enabled', checked)
            }
          />
        </div>

        {categoryConfig.enabled && (
          <>
            <Separator />

            {/* Mode de réponse */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Mode de réponse</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`auto-${category}`}
                    checked={categoryConfig.autoReply}
                    onCheckedChange={(checked) =>
                      updateCategory(category, 'autoReply', checked)
                    }
                  />
                  <Label htmlFor={`auto-${category}`} className="cursor-pointer">
                    Réponse automatique
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`validation-${category}`}
                    checked={categoryConfig.requireValidation}
                    onCheckedChange={(checked) =>
                      updateCategory(category, 'requireValidation', checked)
                    }
                  />
                  <Label htmlFor={`validation-${category}`} className="cursor-pointer">
                    Validation requise
                  </Label>
                </div>
              </div>
            </div>

            {/* Ton de réponse */}
            <div className="space-y-3">
              <Label htmlFor={`tone-${category}`}>Ton de réponse</Label>
              <Select
                value={categoryConfig.tone}
                onValueChange={(value: any) =>
                  updateCategory(category, 'tone', value)
                }
              >
                <SelectTrigger id={`tone-${category}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professionnel">Professionnel</SelectItem>
                  <SelectItem value="amical">Amical</SelectItem>
                  <SelectItem value="formel">Formel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Délai de réponse */}
            <div className="space-y-3">
              <Label htmlFor={`delay-${category}`}>
                Délai avant réponse (minutes)
              </Label>
              <Input
                id={`delay-${category}`}
                type="number"
                min="0"
                value={categoryConfig.delayMinutes}
                onChange={(e) =>
                  updateCategory(category, 'delayMinutes', parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                0 = immédiat, &gt;0 = différé
              </p>
            </div>

            {/* Mots-clés de détection */}
            <div className="space-y-3">
              <Label>Mots-clés de détection</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg min-h-[60px]">
                {categoryConfig.keywords.map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="group cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => removeKeyword(category, keyword)}
                    title="Cliquer pour supprimer"
                  >
                    {keyword}
                    <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
              
              {/* Ajouter un mot-clé */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau mot-clé..."
                  value={newKeyword[category] || ''}
                  onChange={(e) => setNewKeyword(prev => ({ ...prev, [category]: e.target.value }))}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword(category);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addKeyword(category)}
                  disabled={!newKeyword[category]?.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                L&apos;IA détecte automatiquement ces mots pour catégoriser l&apos;email. Cliquez sur un badge pour le supprimer.
              </p>
            </div>

            {/* Rôle de la réponse */}
            <div className="space-y-3">
              <Label htmlFor={`prompt-${category}`}>
                Rôle de la réponse
              </Label>
              <Textarea
                id={`prompt-${category}`}
                value={categoryConfig.customPrompt}
                onChange={(e) =>
                  updateCategory(category, 'customPrompt', e.target.value)
                }
                rows={4}
                placeholder="Décrivez le style et le rôle que l'IA doit adopter pour répondre à ce type d'email..."
              />
              <p className="text-xs text-muted-foreground">
                Définissez le rôle et le style de l&apos;IA pour personnaliser les réponses
              </p>
            </div>

            {/* Template de réponse */}
            {category !== 'spam' && (
              <div className="space-y-3">
                <Label htmlFor={`template-${category}`}>
                  Template de réponse pour {title}
                </Label>
                <Textarea
                  id={`template-${category}`}
                  value={categoryConfig.responseTemplate}
                  onChange={(e) =>
                    updateCategory(category, 'responseTemplate', e.target.value)
                  }
                  rows={6}
                  placeholder="Template spécifique qui sera utilisé pour ce type d'email..."
                />
                <p className="text-xs text-muted-foreground">
                  📌 L&apos;IA utilisera ce template selon la catégorie détectée. Variables: {'{nom_expediteur}'}, {'{sujet}'}, {'{entreprise}'}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20">
          <Bot className="w-4 h-4" />
          Régler l&apos;IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Configuration de l&apos;Intelligence Artificielle
          </DialogTitle>
          <DialogDescription>
            Configurez le comportement de l&apos;IA selon le type d&apos;email détecté. L&apos;IA analysera automatiquement
            chaque email et le classera (Support, Vente, Client, Interne, Partenaire, Urgent, Spam) pour utiliser le template adapté et générer une réponse personnalisée.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="support" className="mt-6">
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="support" className="text-xs">
              <span className="flex items-center gap-1">
                🔧 Support
              </span>
            </TabsTrigger>
            <TabsTrigger value="vente" className="text-xs">
              <span className="flex items-center gap-1">
                💰 Vente
              </span>
            </TabsTrigger>
            <TabsTrigger value="client" className="text-xs">
              <span className="flex items-center gap-1">
                👤 Client
              </span>
            </TabsTrigger>
            <TabsTrigger value="interne" className="text-xs">
              <span className="flex items-center gap-1">
                👥 Interne
              </span>
            </TabsTrigger>
            <TabsTrigger value="partenaire" className="text-xs">
              <span className="flex items-center gap-1">
                🤝 Partenaire
              </span>
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">
              <span className="flex items-center gap-1">
                ⚠️ Urgent
              </span>
            </TabsTrigger>
            <TabsTrigger value="spam" className="text-xs">
              <span className="flex items-center gap-1">
                🚫 Spam
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="support" className="mt-0">
              {renderCategoryConfig(
                'support',
                'Support Client',
                <MessageSquare className="w-5 h-5 text-blue-500" />,
                'bg-blue-500/10'
              )}
            </TabsContent>

            <TabsContent value="vente" className="mt-0">
              {renderCategoryConfig(
                'vente',
                'Commercial & Ventes',
                <MessageSquare className="w-5 h-5 text-blue-500" />,
                'bg-blue-500/10'
              )}
            </TabsContent>

            <TabsContent value="client" className="mt-0">
              {renderCategoryConfig(
                'client',
                'Communication Client',
                <MessageSquare className="w-5 h-5 text-purple-500" />,
                'bg-purple-500/10'
              )}
            </TabsContent>

            <TabsContent value="interne" className="mt-0">
              {renderCategoryConfig(
                'interne',
                'Communication Interne',
                <MessageSquare className="w-5 h-5 text-cyan-500" />,
                'bg-cyan-500/10'
              )}
            </TabsContent>

            <TabsContent value="partenaire" className="mt-0">
              {renderCategoryConfig(
                'partenaire',
                'Partenaires & Fournisseurs',
                <MessageSquare className="w-5 h-5 text-orange-500" />,
                'bg-orange-500/10'
              )}
            </TabsContent>

            <TabsContent value="urgent" className="mt-0">
              {renderCategoryConfig(
                'urgent',
                'Emails Urgents',
                <MessageSquare className="w-5 h-5 text-red-500" />,
                'bg-red-500/10'
              )}
            </TabsContent>

            <TabsContent value="spam" className="mt-0">
              {renderCategoryConfig(
                'spam',
                'Spam & Indésirables',
                <MessageSquare className="w-5 h-5 text-gray-500" />,
                'bg-gray-500/10'
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
