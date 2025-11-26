// API Route: Configuration des prompts IA utilisateur (créativité, ton, style, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { AIPromptConfig, DEFAULT_AI_CONFIG } from '@/lib/ai-prompt-config';

export const dynamic = 'force-dynamic';

/**
 * GET: Récupérer la configuration des prompts IA de l'utilisateur
 */
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

    // Récupérer la config depuis la table users (colonne ai_prompt_config)
    const { data, error } = await supabase
      .from('users')
      .select('ai_prompt_config')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Supabase error fetching prompt config:', error);
      // If error is not found, return default
      if (error.code === 'PGRST116') {
         return NextResponse.json({ 
          success: true,
          config: DEFAULT_AI_CONFIG 
        });
      }
      return NextResponse.json({ error: 'Erreur DB', details: error.message }, { status: 500 });
    }

    if (!data || !data.ai_prompt_config) {
      // Retourner la config par défaut si pas encore sauvegardée
      return NextResponse.json({ 
        success: true,
        config: DEFAULT_AI_CONFIG 
      });
    }

    return NextResponse.json({ 
      success: true,
      config: data.ai_prompt_config as AIPromptConfig
    });

  } catch (error) {
    console.error('❌ Erreur récupération config prompts IA:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST: Sauvegarder la configuration des prompts IA
 */
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

    const { config } = await req.json();

    if (!config) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 400 });
    }

    // Sauvegarder dans la colonne ai_prompt_config
    const { error } = await supabase
      .from('users')
      .update({
        ai_prompt_config: config,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('❌ Erreur sauvegarde config prompts IA:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la sauvegarde',
        details: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Config prompts IA sauvegardée pour user ${session.user.id}`);

    return NextResponse.json({ 
      success: true,
      message: 'Configuration sauvegardée'
    });

  } catch (error) {
    console.error('❌ Erreur sauvegarde config prompts IA:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
