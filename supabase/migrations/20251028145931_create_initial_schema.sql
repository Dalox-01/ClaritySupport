/*
  # MailWizard - Initial Database Schema

  ## Overview
  Complete database schema for MailWizard SaaS application for AI-powered email generation.

  ## Tables Created

  ### 1. users
  Stores user account information with authentication and billing data
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `name` (text) - User display name
  - `image` (text) - Profile picture URL (from Google)
  - `role` (text) - User role: USER or ADMIN
  - `provider` (text) - Authentication provider (google)
  - `stripe_customer_id` (text) - Stripe customer ID
  - `plan` (text) - Subscription plan: FREE or PRO
  - `usage_month` (integer) - Current usage tracking month (YYYYMM format)
  - `usage_count` (integer) - Number of generations used this month
  - `tokens_used` (integer) - Total AI tokens consumed
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. templates
  Stores reusable email templates with AI prompts
  - `id` (uuid, primary key) - Unique template identifier
  - `user_id` (uuid, foreign key) - Template owner
  - `title` (text) - Template title
  - `description` (text) - Template description
  - `tags` (text[]) - Searchable tags array
  - `language` (text) - Template language (fr, en)
  - `tone` (text) - Email tone (pro, cordial, direct)
  - `type` (text) - Email type (candidature, relance, prospection, support, reponse, negociation)
  - `variables` (jsonb) - Variable definitions
  - `prompt` (text) - AI prompt template
  - `content` (text) - Default content (markdown/html)
  - `is_global` (boolean) - Admin-created global template
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. emails
  Stores generated emails and drafts
  - `id` (uuid, primary key) - Unique email identifier
  - `user_id` (uuid, foreign key) - Email owner
  - `template_id` (uuid, foreign key, nullable) - Source template if any
  - `title` (text) - Email title/subject
  - `type` (text) - Email type
  - `language` (text) - Email language
  - `tone` (text) - Email tone
  - `variables` (jsonb) - Variable values used
  - `prompt_used` (text) - AI prompt that was used
  - `html` (text) - Generated HTML content
  - `text` (text) - Plain text version
  - `tokens_used` (integer) - AI tokens consumed
  - `created_at` (timestamptz) - Generation timestamp

  ### 4. subscriptions
  Tracks user subscription status with Stripe
  - `id` (uuid, primary key) - Unique subscription identifier
  - `user_id` (uuid, unique, foreign key) - Subscribed user
  - `stripe_subscription_id` (text) - Stripe subscription ID
  - `status` (text) - Subscription status (active, past_due, canceled, inactive)
  - `current_period_end` (timestamptz) - Subscription renewal date
  - `created_at` (timestamptz) - Subscription creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. audit_logs
  Tracks important user actions for security and compliance
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, nullable) - User who performed action
  - `action` (text) - Action type (login, generate, send, upgrade, etc.)
  - `meta` (jsonb) - Additional action metadata
  - `created_at` (timestamptz) - Action timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Restrictive policies ensuring users can only access their own data
  - Admin role can access all data for management
  - Public read access for global templates only

  ## Indexes
  - Primary keys on all tables
  - Foreign key indexes for efficient joins
  - Unique constraints on email and stripe_customer_id
  - GIN index on template tags for fast search
  - Index on usage_month for quota queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  image text,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  provider text NOT NULL DEFAULT 'google',
  stripe_customer_id text UNIQUE,
  plan text NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO')),
  usage_month integer NOT NULL DEFAULT 0,
  usage_count integer NOT NULL DEFAULT 0,
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  tone text NOT NULL DEFAULT 'pro' CHECK (tone IN ('pro', 'cordial', 'direct')),
  type text NOT NULL CHECK (type IN ('candidature', 'relance', 'prospection', 'support', 'reponse', 'negociation')),
  variables jsonb DEFAULT '{}',
  prompt text NOT NULL,
  content text,
  is_global boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  title text NOT NULL,
  type text NOT NULL,
  language text NOT NULL DEFAULT 'fr',
  tone text NOT NULL DEFAULT 'pro',
  variables jsonb DEFAULT '{}',
  prompt_used text NOT NULL,
  html text NOT NULL,
  text text NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'past_due', 'canceled', 'inactive')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_templates_is_global ON templates(is_global) WHERE is_global = true;
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_template_id ON emails(template_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_usage_month ON users(usage_month);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- RLS Policies for templates table
CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_global = true);

CREATE POLICY "Users can create own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage global templates"
  ON templates FOR ALL
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- RLS Policies for emails table
CREATE POLICY "Users can view own emails"
  ON emails FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own emails"
  ON emails FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own emails"
  ON emails FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all emails"
  ON emails FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- RLS Policies for audit_logs table
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
