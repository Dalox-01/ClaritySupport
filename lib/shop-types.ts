// Types pour le système multi-boutiques

export interface Shop {
  id: string;
  user_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  color: string;
  logo_url: string | null;
  platform: 'shopify' | 'woocommerce' | 'prestashop' | 'custom' | null;
  external_shop_id: string | null;
  shop_domain: string | null;
  is_active: boolean;
  is_default: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShopEmailSignature {
  id: string;
  shop_id: string;
  user_id: string;
  name: string;
  closing_text: string;
  sender_name: string;
  sender_email: string | null;
  sender_title: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  logo_url: string | null;
  logo_width: number;
  custom_html: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopAIConfiguration {
  id: string;
  shop_id: string;
  user_id: string;
  model: string;
  max_tokens: number;
  temperature: number;
  tone: 'professional' | 'friendly' | 'formal' | 'casual' | 'empathetic';
  language: string;
  response_length: 'short' | 'medium' | 'long';
  auto_reply_enabled: boolean;
  require_validation: boolean;
  business_context: string | null;
  custom_instructions: string | null;
  faq_content: string | null;
  default_signature_id: string | null;
  category_templates: Record<string, string>;
  advanced_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ShopWithDetails extends Shop {
  signatures: ShopEmailSignature[];
  ai_config: ShopAIConfiguration | null;
  email_accounts_count: number;
}

export interface CreateShopInput {
  name: string;
  display_name?: string;
  description?: string;
  color?: string;
  platform?: Shop['platform'];
  shop_domain?: string;
  is_default?: boolean;
}

export interface UpdateShopInput extends Partial<CreateShopInput> {
  is_active?: boolean;
  logo_url?: string;
  settings?: Record<string, any>;
}

export interface CreateSignatureInput {
  shop_id: string;
  name?: string;
  closing_text?: string;
  sender_name: string;
  sender_email?: string;
  sender_title?: string;
  phone?: string;
  website?: string;
  address?: string;
  social_links?: ShopEmailSignature['social_links'];
  logo_url?: string;
  custom_html?: string;
  is_default?: boolean;
}

export interface UpdateSignatureInput extends Partial<Omit<CreateSignatureInput, 'shop_id'>> {
  is_active?: boolean;
}

// Couleurs prédéfinies pour les boutiques
export const SHOP_COLORS = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Vert', value: '#22C55E' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Indigo', value: '#6366F1' },
];

// Formules de politesse prédéfinies
export const CLOSING_TEXTS = [
  'Cordialement,',
  'Bien cordialement,',
  'Bien à vous,',
  'À votre disposition,',
  'Sincèrement,',
  'Avec nos salutations distinguées,',
  'Merci et à bientôt,',
  'Belle journée,',
  'Amicalement,',
];

// Helper pour formater une signature en texte
export function formatSignatureText(signature: ShopEmailSignature): string {
  const lines: string[] = [];
  
  // Formule de politesse
  lines.push('');
  lines.push(signature.closing_text || 'Cordialement,');
  lines.push('');
  
  // Nom et titre
  lines.push(signature.sender_name);
  if (signature.sender_title) {
    lines.push(signature.sender_title);
  }
  
  // Email
  if (signature.sender_email) {
    lines.push(signature.sender_email);
  }
  
  // Téléphone et site web
  const contactLine: string[] = [];
  if (signature.phone) {
    contactLine.push(`📞 ${signature.phone}`);
  }
  if (signature.website) {
    contactLine.push(`🌐 ${signature.website}`);
  }
  if (contactLine.length > 0) {
    lines.push(contactLine.join(' | '));
  }
  
  // Adresse
  if (signature.address) {
    lines.push(`📍 ${signature.address}`);
  }
  
  return lines.join('\n');
}

// Helper pour formater une signature en HTML
export function formatSignatureHtml(signature: ShopEmailSignature): string {
  if (signature.custom_html) {
    return signature.custom_html;
  }
  
  const parts: string[] = [];
  
  parts.push('<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">');
  parts.push(`<p style="margin: 16px 0 8px 0;">${signature.closing_text || 'Cordialement,'}</p>`);
  
  // Logo
  if (signature.logo_url) {
    parts.push(`<img src="${signature.logo_url}" alt="Logo" style="max-width: ${signature.logo_width}px; height: auto; margin-bottom: 12px;" /><br />`);
  }
  
  // Nom et titre
  parts.push(`<strong style="font-size: 15px;">${signature.sender_name}</strong><br />`);
  if (signature.sender_title) {
    parts.push(`<span style="color: #666;">${signature.sender_title}</span><br />`);
  }
  
  // Email
  if (signature.sender_email) {
    parts.push(`<a href="mailto:${signature.sender_email}" style="color: #3B82F6; text-decoration: none;">${signature.sender_email}</a><br />`);
  }
  
  // Téléphone et site web
  const contactParts: string[] = [];
  if (signature.phone) {
    contactParts.push(`📞 ${signature.phone}`);
  }
  if (signature.website) {
    contactParts.push(`<a href="${signature.website.startsWith('http') ? signature.website : 'https://' + signature.website}" style="color: #3B82F6; text-decoration: none;">🌐 ${signature.website}</a>`);
  }
  if (contactParts.length > 0) {
    parts.push(`<span style="color: #666;">${contactParts.join(' | ')}</span><br />`);
  }
  
  // Adresse
  if (signature.address) {
    parts.push(`<span style="color: #666;">📍 ${signature.address}</span><br />`);
  }
  
  // Réseaux sociaux
  if (signature.social_links) {
    const socialParts: string[] = [];
    if (signature.social_links.facebook) {
      socialParts.push(`<a href="${signature.social_links.facebook}" style="color: #3B82F6; text-decoration: none;">Facebook</a>`);
    }
    if (signature.social_links.twitter) {
      socialParts.push(`<a href="${signature.social_links.twitter}" style="color: #3B82F6; text-decoration: none;">Twitter</a>`);
    }
    if (signature.social_links.instagram) {
      socialParts.push(`<a href="${signature.social_links.instagram}" style="color: #3B82F6; text-decoration: none;">Instagram</a>`);
    }
    if (signature.social_links.linkedin) {
      socialParts.push(`<a href="${signature.social_links.linkedin}" style="color: #3B82F6; text-decoration: none;">LinkedIn</a>`);
    }
    if (socialParts.length > 0) {
      parts.push(`<div style="margin-top: 8px;">${socialParts.join(' | ')}</div>`);
    }
  }
  
  parts.push('</div>');
  
  return parts.join('');
}
