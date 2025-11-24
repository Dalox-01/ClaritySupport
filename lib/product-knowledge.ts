/**
 * Système de base de connaissances produits pour le support client
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price?: number;
  features: string[];
  specifications: Record<string, string>;
  faq: FAQ[];
  commonIssues: Issue[];
  relatedProducts?: string[];
  tags: string[];
  warranty?: {
    duration: string;
    conditions: string;
  };
  shipping?: {
    delays: string;
    zones: string[];
    cost: string;
  };
}

export interface FAQ {
  question: string;
  answer: string;
  tags: string[];
}

export interface Issue {
  problem: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CompanyInfo {
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  warrantyPolicy?: string;
  customPolicies?: Array<{
    title: string;
    content: string;
  }>;
}

export interface KnowledgeBase {
  products: Product[];
  companyInfo: CompanyInfo;
  generalFAQ: FAQ[];
  businessRules: string[];
}

// Classe pour gérer la base de connaissances
export class KnowledgeBaseManager {
  private kb: KnowledgeBase;

  constructor(initialData?: Partial<KnowledgeBase>) {
    this.kb = {
      products: initialData?.products || [],
      companyInfo: initialData?.companyInfo || {
        name: 'Mon Entreprise'
      },
      generalFAQ: initialData?.generalFAQ || [],
      businessRules: initialData?.businessRules || []
    };
  }

  // Produits
  addProduct(product: Product): void {
    this.kb.products.push(product);
  }

  updateProduct(productId: string, updates: Partial<Product>): void {
    const index = this.kb.products.findIndex(p => p.id === productId);
    if (index !== -1) {
      this.kb.products[index] = { ...this.kb.products[index], ...updates };
    }
  }

  deleteProduct(productId: string): void {
    this.kb.products = this.kb.products.filter(p => p.id !== productId);
  }

  getProduct(productId: string): Product | undefined {
    return this.kb.products.find(p => p.id === productId);
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.kb.products.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Informations entreprise
  updateCompanyInfo(info: Partial<CompanyInfo>): void {
    this.kb.companyInfo = { ...this.kb.companyInfo, ...info };
  }

  getCompanyInfo(): CompanyInfo {
    return this.kb.companyInfo;
  }

  // FAQ générale
  addFAQ(faq: FAQ): void {
    this.kb.generalFAQ.push(faq);
  }

  updateFAQ(index: number, faq: FAQ): void {
    if (index >= 0 && index < this.kb.generalFAQ.length) {
      this.kb.generalFAQ[index] = faq;
    }
  }

  deleteFAQ(index: number): void {
    this.kb.generalFAQ.splice(index, 1);
  }

  searchFAQ(query: string): FAQ[] {
    const lowerQuery = query.toLowerCase();
    return this.kb.generalFAQ.filter(faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery)
    );
  }

  // Règles métier
  addBusinessRule(rule: string): void {
    this.kb.businessRules.push(rule);
  }

  updateBusinessRule(index: number, rule: string): void {
    if (index >= 0 && index < this.kb.businessRules.length) {
      this.kb.businessRules[index] = rule;
    }
  }

  deleteBusinessRule(index: number): void {
    this.kb.businessRules.splice(index, 1);
  }

  // Export/Import
  export(): KnowledgeBase {
    return JSON.parse(JSON.stringify(this.kb));
  }

  import(data: KnowledgeBase): void {
    this.kb = data;
  }

  // Génération de contexte pour l'IA
  generateContextForAI(options?: {
    includeProducts?: boolean;
    includeCompanyInfo?: boolean;
    includeFAQ?: boolean;
    includeBusinessRules?: boolean;
    productIds?: string[];
  }): string {
    const parts: string[] = [];

    // Informations entreprise
    if (options?.includeCompanyInfo !== false) {
      const info = this.kb.companyInfo;
      parts.push(`# Informations Entreprise`);
      parts.push(`Nom: ${info.name}`);
      if (info.email) parts.push(`Email: ${info.email}`);
      if (info.phone) parts.push(`Téléphone: ${info.phone}`);
      if (info.workingHours) parts.push(`Horaires: ${info.workingHours}`);
      if (info.returnPolicy) parts.push(`Politique de retour: ${info.returnPolicy}`);
      if (info.shippingPolicy) parts.push(`Politique de livraison: ${info.shippingPolicy}`);
      if (info.warrantyPolicy) parts.push(`Politique de garantie: ${info.warrantyPolicy}`);
      parts.push('');
    }

    // Produits
    if (options?.includeProducts !== false) {
      let productsToInclude = this.kb.products;
      if (options?.productIds && options.productIds.length > 0) {
        productsToInclude = this.kb.products.filter(p => options.productIds!.includes(p.id));
      }

      if (productsToInclude.length > 0) {
        parts.push(`# Catalogue Produits`);
        productsToInclude.forEach(product => {
          parts.push(`## ${product.name}`);
          parts.push(`Description: ${product.description}`);
          if (product.price) parts.push(`Prix: ${product.price}€`);
          if (product.features.length > 0) {
            parts.push(`Caractéristiques: ${product.features.join(', ')}`);
          }
          if (product.faq.length > 0) {
            parts.push(`FAQ du produit:`);
            product.faq.forEach(faq => {
              parts.push(`  Q: ${faq.question}`);
              parts.push(`  R: ${faq.answer}`);
            });
          }
          parts.push('');
        });
      }
    }

    // FAQ générale
    if (options?.includeFAQ !== false && this.kb.generalFAQ.length > 0) {
      parts.push(`# FAQ Générale`);
      this.kb.generalFAQ.forEach(faq => {
        parts.push(`Q: ${faq.question}`);
        parts.push(`R: ${faq.answer}`);
        parts.push('');
      });
    }

    // Règles métier
    if (options?.includeBusinessRules !== false && this.kb.businessRules.length > 0) {
      parts.push(`# Règles Métier`);
      this.kb.businessRules.forEach((rule, index) => {
        parts.push(`${index + 1}. ${rule}`);
      });
      parts.push('');
    }

    return parts.join('\n');
  }
}

// Stockage localStorage
export function saveKnowledgeBase(kb: KnowledgeBase): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('support_knowledge_base', JSON.stringify(kb));
  }
}

export function loadKnowledgeBase(): KnowledgeBase | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('support_knowledge_base');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Erreur lors du chargement de la base de connaissances:', e);
      }
    }
  }
  return null;
}
