// API Route: Profil utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile
 * Récupère le profil de l'utilisateur connecté
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, plan, stripe_customer_id, created_at, updated_at')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Erreur récupération profil:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération du profil' 
      }, { status: 500 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Erreur API user/profile:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PATCH /api/user/profile
 * Met à jour le profil de l'utilisateur
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Le nom est requis' 
      }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select('id, email, name, plan, stripe_customer_id, created_at, updated_at')
      .single();

    if (error) {
      console.error('Erreur mise à jour profil:', error);
      return NextResponse.json({ 
        error: 'Erreur lors de la mise à jour du profil' 
      }, { status: 500 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Erreur API user/profile PATCH:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
