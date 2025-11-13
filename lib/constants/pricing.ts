import { ShoppingCart, User } from 'lucide-react';

export type SegmentType = 'shopify' | 'freelance';

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  name: string;
  price: number;
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
          { text: '3 comptes email', included: true },
          { text: '5 000 réponses automatiques/mois', included: true },
          { text: '1 boutique Shopify', included: true },
          { text: 'Tracking automatique des commandes', included: true },
          { text: 'Support par email', included: true },
          { text: 'Templates de réponses IA', included: false },
          { text: 'Upsell automatique', included: false },
          { text: 'Multi-boutiques', included: false },
        ],
      },
      {
        name: 'PRO',
        price: 99,
        period: 'mois',
        description: 'Pour les boutiques en croissance',
        popular: true,
        cta: 'Essayer gratuitement',
        stripeProductId: 'prod_TPrPIGmPWUTOxL',
        stripePriceId: 'price_1ST1gZGJn0NQpREz5KODKSCP',
        features: [
          { text: '10 comptes email', included: true },
          { text: '20 000 réponses automatiques/mois', included: true },
          { text: '3 boutiques Shopify', included: true },
          { text: 'Tracking automatique des commandes', included: true },
          { text: 'Support prioritaire 24/7', included: true },
          { text: 'Templates de réponses IA avancés', included: true },
          { text: 'Upsell automatique par IA', included: true },
          { text: 'Analytics avancées', included: true },
        ],
      },
      {
        name: 'SCALE',
        price: 199,
        period: 'mois',
        description: 'Pour les entreprises e-commerce établies',
        cta: 'Contactez-nous',
        stripeProductId: 'prod_TPrR9cb7ptCzIV',
        stripePriceId: 'price_1ST1iLGJn0NQpREzIdkg9x2N',
        features: [
          { text: 'Comptes email illimités', included: true },
          { text: '50 000 réponses automatiques/mois', included: true },
          { text: 'Boutiques Shopify illimitées', included: true },
          { text: 'Tracking multi-plateforme', included: true },
          { text: 'Support VIP dédié', included: true },
          { text: 'IA personnalisée pour votre marque', included: true },
          { text: 'Upsell & cross-sell avancés', included: true },
          { text: 'White-label & API complète', included: true },
        ],
      },
    ],
  },
  {
    id: 'freelance',
    label: 'Freelance',
    icon: User,
    plans: [
      {
        name: 'SOLO',
        price: 19,
        period: 'mois',
        description: 'Pour les indépendants qui démarrent',
        cta: 'Commencer',
        stripeProductId: 'prod_TPrW8AoxGc2X5C',
        stripePriceId: 'price_1ST1nmGJn0NQpREzqP6lfgbH',
        features: [
          { text: '1 compte email', included: true },
          { text: '500 réponses automatiques/mois', included: true },
          { text: 'Mode focus (inbox zéro)', included: true },
          { text: 'Application mobile PWA', included: true },
          { text: 'Support communautaire', included: true },
          { text: 'Templates IA', included: false },
          { text: 'Réponses illimitées', included: false },
          { text: 'API personnalisée', included: false },
        ],
      },
      {
        name: 'PRO',
        price: 39,
        period: 'mois',
        description: 'Pour les freelances professionnels',
        popular: true,
        cta: 'Essayer 14 jours',
        stripeProductId: 'prod_TPrZSMdjLdu6kF',
        stripePriceId: 'price_1ST1qTGJn0NQpREzJUHjVmtt',
        features: [
          { text: '1 compte email', included: true },
          { text: '2 000 réponses automatiques/mois', included: true },
          { text: 'Mode focus avancé', included: true },
          { text: 'Application mobile premium', included: true },
          { text: 'Support par email', included: true },
          { text: 'Templates IA professionnels', included: true },
          { text: 'Signatures dynamiques', included: true },
          { text: 'Analytics détaillées', included: true },
        ],
      },
      {
        name: 'UNLIMITED',
        price: 69,
        period: 'mois',
        description: 'Pour les freelances high-performers',
        cta: 'Commencer',
        stripeProductId: 'prod_TPrcMECD2gO3Et',
        stripePriceId: 'price_1ST1t9GJn0NQpREzTsWCr3w4',
        features: [
          { text: '1 compte email', included: true },
          { text: 'Réponses automatiques illimitées', included: true },
          { text: 'Mode focus + automatisations', included: true },
          { text: 'Application mobile offline', included: true },
          { text: 'Support prioritaire', included: true },
          { text: 'IA personnalisée à votre ton', included: true },
          { text: 'Intégrations avancées', included: true },
          { text: 'API personnalisée complète', included: true },
        ],
      },
    ],
  },
];
