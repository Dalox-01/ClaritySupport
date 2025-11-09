'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
  requiredPlan?: 'STARTER' | 'PRO';
}

export function UpgradePrompt({ open, onOpenChange, feature, requiredPlan = 'PRO' }: UpgradePromptProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: 'STARTER',
      displayName: 'Starter',
      price: '7,99€',
      icon: Zap,
      color: 'text-blue-500',
      features: [
        '500 générations par mois',
        'Templates personnalisés',
        'Extension Chrome/Edge',
        'Support email',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY,
    },
    {
      name: 'PRO',
      displayName: 'Pro',
      price: '18,99€',
      icon: Crown,
      color: 'text-yellow-500',
      features: [
        '5000 générations par mois',
        'Tout de STARTER',
        'Variables personnalisées illimitées',
        'Analyse avancée',
        'Support prioritaire',
        'Signatures multiples',
      ],
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    },
  ];

  const handleUpgrade = async (plan: 'STARTER' | 'PRO') => {
    setLoading(plan);
    try {
      const selectedPlan = plans.find(p => p.name === plan);
      const priceId = selectedPlan?.priceId;

      console.log('🔍 Upgrade Plan:', plan);
      console.log('🔍 Price ID:', priceId);

      if (!priceId) {
        toast.error('Configuration Stripe manquante. Veuillez contacter le support.');
        console.error('❌ Price ID is undefined for plan:', plan);
        setLoading(null);
        return;
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan }),
      });

      const data = await response.json();
      console.log('📡 Checkout Response:', data);

      if (data.success && data.url) {
        console.log('✅ Redirecting to Stripe:', data.url);
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Erreur lors de la création de la session de paiement');
        setLoading(null);
      }
    } catch (error) {
      console.error('❌ Upgrade error:', error);
      toast.error('Une erreur est survenue');
      setLoading(null);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">
            Passez à un plan supérieur pour utiliser {feature}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette fonctionnalité nécessite un plan {requiredPlan}. Choisissez le plan qui vous convient :
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isRecommended = plan.name === requiredPlan;
            
            return (
              <Card
                key={plan.name}
                className={`relative ${isRecommended ? 'border-2 border-primary shadow-lg' : ''}`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-6 w-6 ${plan.color}`} />
                    {plan.displayName}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/mois</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isRecommended ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.name as 'STARTER' | 'PRO')}
                    disabled={loading !== null}
                  >
                    {loading === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      'Commencer'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading !== null}>
            Annuler
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
