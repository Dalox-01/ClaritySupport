import { 
  AlertCircle, 
  Package, 
  RefreshCcw, 
  HelpCircle, 
  Truck, 
  Wrench, 
  AlertTriangle, 
  Info, 
  FileText, 
  Laptop, 
  Folder,
  LucideIcon
} from 'lucide-react';

/**
 * Configuration des catégories pour le support client professionnel
 */

export type SupportCategory = 
  | 'urgent'
  | 'commande'
  | 'remboursement'
  | 'question-produit'
  | 'suivi-commande'
  | 'sav'
  | 'reclamation'
  | 'information'
  | 'facturation'
  | 'technique'
  | 'autre';

export interface CategoryConfig {
  id: SupportCategory;
  label: string;
  icon: LucideIcon;
  color: {
    bg: string;
    text: string;
    border: string;
    darkText: string;
  };
  priority: 'high' | 'medium' | 'low';
  defaultResponse?: string;
  suggestedTemplates?: string[];
}

export const SUPPORT_CATEGORIES: CategoryConfig[] = [
  {
    id: 'urgent',
    label: 'Urgent',
    icon: AlertCircle,
    color: {
      bg: 'bg-red-500/10',
      text: 'text-red-600',
      border: 'border-red-500/20',
      darkText: 'dark:text-red-400'
    },
    priority: 'high',
    suggestedTemplates: ['urgent-issue', 'escalation']
  },
  {
    id: 'commande',
    label: 'Ma commande',
    icon: Package,
    color: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-600',
      border: 'border-blue-500/20',
      darkText: 'dark:text-blue-400'
    },
    priority: 'high',
    suggestedTemplates: ['order-confirmation', 'order-status']
  },
  {
    id: 'remboursement',
    label: 'Remboursement',
    icon: RefreshCcw,
    color: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-600',
      border: 'border-orange-500/20',
      darkText: 'dark:text-orange-400'
    },
    priority: 'high',
    suggestedTemplates: ['refund-request', 'refund-confirmation']
  },
  {
    id: 'question-produit',
    label: 'Question produit',
    icon: HelpCircle,
    color: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-600',
      border: 'border-purple-500/20',
      darkText: 'dark:text-purple-400'
    },
    priority: 'medium',
    suggestedTemplates: ['product-info', 'product-comparison']
  },
  {
    id: 'suivi-commande',
    label: 'Suivi commande',
    icon: Truck,
    color: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-600',
      border: 'border-cyan-500/20',
      darkText: 'dark:text-cyan-400'
    },
    priority: 'medium',
    suggestedTemplates: ['tracking-info', 'delivery-update']
  },
  {
    id: 'sav',
    label: 'SAV',
    icon: Wrench,
    color: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-600',
      border: 'border-yellow-500/20',
      darkText: 'dark:text-yellow-400'
    },
    priority: 'medium',
    suggestedTemplates: ['warranty-claim', 'repair-request']
  },
  {
    id: 'reclamation',
    label: 'Réclamation',
    icon: AlertTriangle,
    color: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500/20',
      darkText: 'dark:text-rose-400'
    },
    priority: 'high',
    suggestedTemplates: ['complaint-acknowledgment', 'complaint-resolution']
  },
  {
    id: 'information',
    label: 'Information',
    icon: Info,
    color: {
      bg: 'bg-green-500/10',
      text: 'text-green-600',
      border: 'border-green-500/20',
      darkText: 'dark:text-green-400'
    },
    priority: 'low',
    suggestedTemplates: ['general-info', 'faq-response']
  },
  {
    id: 'facturation',
    label: 'Facturation',
    icon: FileText,
    color: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-600',
      border: 'border-indigo-500/20',
      darkText: 'dark:text-indigo-400'
    },
    priority: 'medium',
    suggestedTemplates: ['invoice-request', 'payment-issue']
  },
  {
    id: 'technique',
    label: 'Support technique',
    icon: Laptop,
    color: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-600',
      border: 'border-teal-500/20',
      darkText: 'dark:text-teal-400'
    },
    priority: 'medium',
    suggestedTemplates: ['tech-support', 'troubleshooting']
  },
  {
    id: 'autre',
    label: 'Autre',
    icon: Folder,
    color: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-600',
      border: 'border-gray-500/20',
      darkText: 'dark:text-gray-400'
    },
    priority: 'low',
    suggestedTemplates: ['general-response']
  }
];

export function getCategoryConfig(categoryId: string): CategoryConfig | undefined {
  return SUPPORT_CATEGORIES.find(cat => cat.id === categoryId);
}

export function getCategoryColor(category: string | null): string {
  if (!category) return 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400';
  
  const config = getCategoryConfig(category);
  if (!config) return 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400';
  
  return `${config.color.bg} ${config.color.text} ${config.color.border} ${config.color.darkText}`;
}
