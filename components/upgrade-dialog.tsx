'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PlanType = 'FREE' | 'STARTER' | 'PRO' | 'ADMIN';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanType;
  reason: 'limit' | 'signatures' | 'variables' | 'templates' | 'voice' | 'chatbot';
  usageInfo?: {
    used: number;
    limit: number;
  };
}

export function UpgradeDialog({ open, onOpenChange, currentPlan, reason, usageInfo }: UpgradeDialogProps) {
  const [loading, setLoading] = useState(false);

  // Les utilisateurs ADMIN ne devraient jamais voir ce dialog
  if (currentPlan === 'ADMIN') {
    return null;
  }

  const reasonMessages = {
    limit: {
      title: '🚀 Limite atteinte !',
      description: currentPlan === 'FREE' 
        ? `Vous avez utilisé vos ${usageInfo?.limit || 10} générations gratuites ce mois-ci.`
        : `Vous avez utilisé vos ${usageInfo?.limit || 500} générations ce mois-ci.`,
    },
    signatures: {
      title: '✍️ Signatures personnalisées',
      description: 'Cette fonctionnalité nécessite un plan supérieur.',
    },
    variables: {
      title: '⚙️ Variables auto-remplissables',
      description: 'Cette fonctionnalité nécessite un plan supérieur.',
    },
    templates: {
      title: '📝 Templates personnalisés',
      description: currentPlan === 'FREE'
        ? 'Créez et sauvegardez vos propres templates.'
        : 'Vous avez atteint la limite de 10 templates. Passez au plan PRO pour des templates illimités.',
    },
    voice: {
      title: '🎙️ Dictée vocale',
      description: 'Dictez vos emails au lieu de les taper.',
    },
    chatbot: {
      title: '🤖 Chatbot IA',
      description: 'Améliorez vos emails avec l\'intelligence artificielle.',
    },
  };

  const message = reasonMessages[reason];

  // Déterminer quels plans proposer
  const suggestedPlans = currentPlan === 'FREE' 
    ? ['STARTER', 'PRO'] 
    : ['PRO'];

  const planDetails: Record<string, {
    name: string;
    price: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    features: string[];
    highlight?: boolean;
  }> = {
    STARTER: {
      name: 'Starter',
      price: '7.99€',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        '500 générations/mois',
        '3 signatures personnalisées',
        'Variables auto-remplissables',
        '10 templates personnalisés',
        'Dictée vocale',
      ],
      highlight: false,
    },
    PRO: {
      name: 'Pro',
      price: '18.99€',
      icon: Crown,
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary',
      features: [
        '5000 générations/mois',
        'Signatures illimitées',
        'Variables activées',
        'Templates illimités',
        'Dictée vocale',
        'Chatbot IA',
        'Support prioritaire',
      ],
      highlight: true,
    },
  };

  const handleUpgrade = async (plan: 'STARTER' | 'PRO') => {
    setLoading(true);
    try {
      const priceId = plan === 'STARTER' 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Erreur');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la redirection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{message.title}</DialogTitle>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className={`grid gap-4 ${suggestedPlans.length === 2 ? 'md:grid-cols-2' : ''}`}>
            {suggestedPlans.map((planKey) => {
              const plan = planDetails[planKey as keyof typeof planDetails];
              const Icon = plan.icon;

              return (
                <Card
                  key={planKey}
                  className={`relative ${plan.highlight ? `border-2 ${plan.borderColor} shadow-lg` : ''}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                      RECOMMANDÉ
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${plan.bgColor}`}>
                        <Icon className={`h-5 w-5 ${plan.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                          <span className="text-muted-foreground">/mois</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleUpgrade(planKey as 'STARTER' | 'PRO')}
                      disabled={loading}
                      className="w-full"
                      variant={plan.highlight ? 'default' : 'outline'}
                      size="lg"
                    >
                      {loading ? (
                        'Chargement...'
                      ) : (
                        <>
                          Passer à {plan.name}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {reason === 'limit' && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                💡 <strong>Astuce :</strong> Votre quota se réinitialise automatiquement le 1er de chaque mois.
                {currentPlan === 'FREE' && ' Passez au plan STARTER pour 500 générations/mois, ou PRO pour 5000.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
