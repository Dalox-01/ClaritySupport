// API Route: Configuration IA

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Récupérer la configuration IA de l'utilisateur
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', session.user.id)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Supabase error fetching config:', error);
      return NextResponse.json({ error: 'Erreur récupération config', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const config = await req.json();

    // Pour chaque catégorie, créer ou mettre à jour la règle
    for (const [category, settings] of Object.entries(config)) {
      const categoryConfig = settings as any;

      if (!categoryConfig.enabled) {
        // Si désactivé, supprimer la règle existante
        await supabase
          .from('automation_rules')
          .delete()
          .eq('user_id', session.user.id)
          .eq('name', `AI_${category.toUpperCase()}`);
        continue;
      }

      // Créer ou mettre à jour la règle
      const { error } = await supabase
        .from('automation_rules')
        .upsert({
          user_id: session.user.id,
          name: `AI_${category.toUpperCase()}`,
          description: `Configuration IA pour les emails ${category}`,
          priority: category === 'urgent' ? 1 : category === 'support' ? 10 : 50,
          triggers: {
            category: [category],
            subject_contains: categoryConfig.keywords || [],
          },
          action_type: categoryConfig.autoReply ? 'auto_reply' : 'suggest_reply',
          action_config: {
            delay_minutes: categoryConfig.delayMinutes || 0,
            custom_prompt: categoryConfig.customPrompt || '',
          },
          mode: categoryConfig.requireValidation ? 'validation' : 'auto',
          require_validation_if_urgent: categoryConfig.requireValidation,
          is_active: true,
        }, {
          onConflict: 'user_id,name',
        });

      if (error) {
        console.error(`Error saving rule for ${category}:`, error);
        // Continue to next category instead of failing completely, but log error
      }

      // Créer ou mettre à jour le template de réponse
      if (categoryConfig.responseTemplate && category !== 'spam') {
        await supabase
          .from('response_templates')
          .upsert({
            user_id: session.user.id,
            name: `Template ${category}`,
            description: `Template automatique pour ${category}`,
            category: category,
            tone: categoryConfig.tone || 'professionnel',
            body_template: categoryConfig.responseTemplate,
            ai_prompt_override: categoryConfig.customPrompt,
            is_active: true,
          }, {
            onConflict: 'user_id,name',
          });
      }
    }

    return NextResponse.json({ success: true, message: 'Configuration sauvegardée' });
  } catch (error) {
    console.error('Error saving AI config:', error);
    return NextResponse.json({ error: 'Erreur sauvegarde', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
