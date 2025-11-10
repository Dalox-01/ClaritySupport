import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Récupérer l'état de l'IA
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres IA de l'utilisateur
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erreur récupération paramètres IA:', error);
      return NextResponse.json(
        { error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    // Si pas de paramètres, retourner les valeurs par défaut
    if (!data) {
      return NextResponse.json({
        enabled: false,
        auto_reply_urgent: false,
        updated_at: new Date().toISOString()
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erreur GET ai-settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour l'état de l'IA
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { enabled, auto_reply_urgent } = body;

    // Vérifier si l'utilisateur a déjà des paramètres
    const { data: existing } = await supabase
      .from('ai_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    let result;

    if (existing) {
      // Mise à jour
      result = await supabase
        .from('ai_settings')
        .update({
          enabled: enabled ?? false,
          auto_reply_urgent: auto_reply_urgent ?? false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();
    } else {
      // Création
      result = await supabase
        .from('ai_settings')
        .insert({
          user_id: session.user.id,
          enabled: enabled ?? false,
          auto_reply_urgent: auto_reply_urgent ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Erreur sauvegarde paramètres IA:', result.error);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('Erreur POST ai-settings:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
