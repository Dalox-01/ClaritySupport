-- Create user_templates table for custom user-created templates
CREATE TABLE IF NOT EXISTS public.user_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON public.user_templates(user_id);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON public.user_templates(category);

-- Disable RLS for demo purposes
ALTER TABLE public.user_templates DISABLE ROW LEVEL SECURITY;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_templates_updated_at ON public.user_templates;
CREATE TRIGGER update_user_templates_updated_at
    BEFORE UPDATE ON public.user_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
