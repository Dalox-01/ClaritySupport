// Types pour le Mail Center

import { SupportCategory } from './support-categories';

export type MailProvider = 'gmail' | 'outlook';

export type EmailCategory = 'support' | 'vente' | 'client' | 'interne' | 'partenaire' | 'urgent' | 'spam' | 'autre';

export type EmailSentiment = 'positif' | 'neutre' | 'negatif' | 'urgent';

export type ReplyStatus = 'pending' | 'validated' | 'sent' | 'rejected';

export type AutomationActionType = 'auto_reply' | 'suggest_reply' | 'categorize' | 'forward' | 'archive';

export type AutomationMode = 'auto' | 'validation' | 'disabled';

export type MailAccount = {
  id: string;
  user_id: string;
  provider: MailProvider;
  email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
};

export type EmailCache = {
  id: string;
  account_id: string;
  user_id: string;
  external_message_id: string;
  thread_id: string | null;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  snippet: string | null;
  body_text: string | null;
  body_html: string | null;
  received_at: string;
  
  // Analyse IA
  category: EmailCategory | null;
  sentiment: EmailSentiment | null;
  urgency_score: number;
  requires_validation: boolean;
  detected_entities: Record<string, any>;
  
  // Classification par hashtags (Mail Center professionnel)
  support_category: SupportCategory | null;
  detected_hashtags: string[];
  
  // État
  is_read: boolean;
  is_auto_replied: boolean;
  is_archived: boolean;
  reply_status: ReplyStatus;
  replied_at: string | null; // Date de la réponse manuelle
  
  has_attachments: boolean;
  labels: string[];
  
  created_at: string;
  expires_at: string;
};

export type ResponseTemplate = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: EmailCategory;
  tone: string;
  language: string;
  
  subject_template: string | null;
  body_template: string;
  variables: Record<string, any>;
  
  ai_prompt_override: string | null;
  use_ai_enhancement: boolean;
  
  is_active: boolean;
  usage_count: number;
  
  created_at: string;
  updated_at: string;
};

export type AutomationRule = {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  description: string | null;
  
  priority: number;
  
  triggers: {
    subject_contains?: string[];
    from_domain?: string[];
    from_email?: string[];
    category?: EmailCategory[];
    sentiment?: EmailSentiment[];
    has_attachments?: boolean;
    urgency_min?: number;
  };
  
  action_type: AutomationActionType;
  template_id: string | null;
  
  action_config: {
    delay_minutes?: number;
    forward_to?: string;
    custom_prompt?: string;
  };
  
  mode: AutomationMode;
  require_validation_if_urgent: boolean;
  
  active_hours: {
    days?: number[]; // 1-7 (lundi-dimanche)
    start?: string; // "09:00"
    end?: string; // "18:00"
  };
  
  is_active: boolean;
  
  triggered_count: number;
  success_count: number;
  last_triggered_at: string | null;
  
  created_at: string;
  updated_at: string;
};

export type PendingReply = {
  id: string;
  email_id: string;
  user_id: string;
  rule_id: string | null;
  template_id: string | null;
  
  generated_subject: string | null;
  generated_body_text: string | null;
  generated_body_html: string | null;
  
  ai_prompt_used: string | null;
  ai_model_used: string;
  
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  edited_subject: string | null;
  edited_body_html: string | null;
  
  reason_for_validation: string | null;
  validated_at: string | null;
  sent_at: string | null;
  
  created_at: string;
  expires_at: string;
};

export type MailAIActivityLog = {
  id: string;
  user_id: string;
  email_id: string | null;
  rule_id: string | null;
  
  action_type: string;
  action_result: string;
  
  metadata: Record<string, any>;
  
  tokens_used: number;
  processing_time_ms: number | null;
  
  created_at: string;
};

export type MailStatistics = {
  id: string;
  user_id: string;
  account_id: string | null;
  date: string;
  
  total_received: number;
  total_auto_replied: number;
  total_manual_replied: number;
  total_pending_validation: number;
  
  category_support: number;
  category_vente: number;
  category_spam: number;
  category_autre: number;
  
  avg_response_time_minutes: number | null;
  
  sentiment_positive: number;
  sentiment_neutral: number;
  sentiment_negative: number;
  
  created_at: string;
  updated_at: string;
};

// Types pour les vues enrichies
export type EmailWithAccount = EmailCache & {
  account: MailAccount;
  pending_reply?: PendingReply;
};

export type RuleWithTemplate = AutomationRule & {
  template?: ResponseTemplate;
};

// Types pour les dashboards
export type DashboardStats = {
  today: {
    received: number;
    auto_replied: number;
    pending_validation: number;
    avg_response_time: number;
  };
  week: {
    received: number;
    auto_replied: number;
    manual_replied: number;
  };
  month: {
    received: number;
    auto_replied: number;
    manual_replied: number;
  };
  categories: {
    support: number;
    vente: number;
    spam: number;
    autre: number;
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  top_rules: Array<{
    rule_id: string;
    rule_name: string;
    triggered_count: number;
    success_rate: number;
  }>;
};

// Types pour les APIs externes
export type GmailMessage = {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: { size: number; data?: string };
    parts?: Array<{
      mimeType: string;
      body: { size: number; data?: string };
    }>;
  };
  internalDate: string;
};

export type OutlookMessage = {
  id: string;
  conversationId: string;
  subject: string;
  bodyPreview: string;
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  receivedDateTime: string;
  body: {
    contentType: string;
    content: string;
  };
  hasAttachments: boolean;
};

// Helpers de validation
export const EMAIL_CATEGORIES: EmailCategory[] = ['support', 'vente', 'client', 'interne', 'partenaire', 'urgent', 'spam', 'autre'];
export const EMAIL_SENTIMENTS: EmailSentiment[] = ['positif', 'neutre', 'negatif', 'urgent'];

export function isValidCategory(category: string): category is EmailCategory {
  return EMAIL_CATEGORIES.includes(category as EmailCategory);
}

export function isValidSentiment(sentiment: string): sentiment is EmailSentiment {
  return EMAIL_SENTIMENTS.includes(sentiment as EmailSentiment);
}
