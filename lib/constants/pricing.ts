import { ShoppingCart } from 'lucide-react';

export type SegmentType = 'shopify';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  price: number | string;
  period: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  cta: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface Segment {
  id: SegmentType;
  label: string;
  icon: typeof ShoppingCart;
  plans: PricingPlan[];
}

export const PRICING_SEGMENTS: Segment[] = [
  {
    id: 'shopify',
    label: 'E-commerce',
    icon: ShoppingCart,
    plans: [
      {
        name: 'STARTER',
        price: 49,
        period: 'mois',
        description: 'Parfait pour démarrer votre boutique en ligne',
        cta: 'Commencer',
        stripeProductId: 'prod_TPrM3fOyRync4I',
        stripePriceId: 'price_1ST1dgGJn0NQpREzoGsS4OPI',
        features: [
          { text: 'Jusqu\'à 3 comptes email', included: true },
          { text: '5 000 clients traités automatiquement/mois', included: true },
          { text: '1 boutique connectée', included: true },
          { text: 'Suivi automatique des commandes', included: true },
          { text: 'Support réactif par email', included: true },
          { text: 'Réponses IA personnalisées', included: false },
          { text: 'Recommandations produits automatiques', included: false },
          { text: 'Plusieurs boutiques', included: false },
        ],
      },
      {
        name: 'PRO',
        price: 99,
        period: 'mois',
        description: 'Pour les boutiques en croissance',
        popular: true,
        cta: 'Commencer',
        stripeProductId: 'prod_TPrPIGmPWUTOxL',
        stripePriceId: 'price_1ST1gZGJn0NQpREz5KODKSCP',
        features: [
          { text: 'Jusqu\'à 10 comptes email', included: true },
          { text: '20 000 clients traités automatiquement/mois', included: true },
          { text: 'Jusqu\'à 3 boutiques connectées', included: true },
          { text: 'Suivi en temps réel des commandes', included: true },
          { text: 'Support prioritaire 24/7', included: true },
          { text: 'Réponses IA adaptées à votre marque', included: true },
          { text: 'Ventes additionnelles automatiques', included: true },
          { text: 'Statistiques de performance', included: true },
        ],
      },
      {
        name: 'SCALE',
        price: 199,
        period: 'mois',
        description: 'Pour les entreprises e-commerce établies',
        cta: 'Commencer',
        stripeProductId: 'prod_TPrR9cb7ptCzIV',
        stripePriceId: 'price_1ST1iLGJn0NQpREzIdkg9x2N',
        features: [
          { text: 'Comptes email illimités', included: true },
          { text: '50 000+ clients traités automatiquement/mois', included: true },
          { text: 'Toutes vos boutiques connectées', included: true },
          { text: 'Suivi multi-plateforme centralisé', included: true },
          { text: 'Account Manager dédié', included: true },
          { text: 'IA entraînée sur votre marque', included: true },
          { text: 'Maximisation du panier moyen', included: true },
          { text: 'Solution personnalisée & API', included: true },
        ],
      },
    ],
  },
];
