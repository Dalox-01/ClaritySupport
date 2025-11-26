import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('ai_configurations')
      .select('advanced_mode_config')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching AI config:', error);
      // If column doesn't exist, we might get an error. 
      // But we can't easily detect that without checking schema.
      // We'll assume if error, return null config.
    }

    return NextResponse.json({
      config: data?.advanced_mode_config || null
    });

  } catch (error) {
    console.error('Error in GET /api/ai/config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 400 });
    }

    // Upsert configuration
    // First check if record exists
    const { data: existing } = await supabase
      .from('ai_configurations')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({ 
          advanced_mode_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('ai_configurations')
        .insert({
          user_id: userId,
          advanced_mode_config: config
        });
      error = insertError;
    }

    if (error) {
      console.error('Error saving AI config:', error);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in POST /api/ai/config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
