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
        cta: 'Contactez-nous',
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
          { text: '1 compte email connecté', included: true },
          { text: '500 clients traités automatiquement/mois', included: true },
          { text: 'Inbox toujours à zéro', included: true },
          { text: 'Accès mobile optimisé', included: true },
          { text: 'Support communautaire', included: true },
          { text: 'Réponses IA personnalisées', included: false },
          { text: 'Clients illimités', included: false },
          { text: 'Intégrations avancées', included: false },
        ],
      },
      {
        name: 'PRO',
        price: 39,
        period: 'mois',
        description: 'Pour les freelances professionnels',
        popular: true,
        cta: 'Commencer',
        stripeProductId: 'prod_TPrZSMdjLdu6kF',
        stripePriceId: 'price_1ST1qTGJn0NQpREzJUHjVmtt',
        features: [
          { text: '1 compte email connecté', included: true },
          { text: '2 000 clients traités automatiquement/mois', included: true },
          { text: 'Gestion prioritaire intelligente', included: true },
          { text: 'Application mobile complète', included: true },
          { text: 'Support réactif par email', included: true },
          { text: 'Réponses IA professionnelles', included: true },
          { text: 'Signatures à votre image', included: true },
          { text: 'Suivi de vos performances', included: true },
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
          { text: '1 compte email connecté', included: true },
          { text: 'Clients illimités sans restriction', included: true },
          { text: 'Automatisations intelligentes complètes', included: true },
          { text: 'Application mobile hors-ligne', included: true },
          { text: 'Support prioritaire dédié', included: true },
          { text: 'IA adaptée à votre personnalité', included: true },
          { text: 'Connectez vos outils favoris', included: true },
          { text: 'Accès développeur complet', included: true },
        ],
      },
    ],
  },
];
