import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  subject: z.string().min(1, 'Le sujet est requis'),
  text: z.string().min(1, 'Le contenu est requis'),
  html: z.string().optional(),
  type: z.enum(['candidature', 'relance', 'prospection', 'support', 'reponse', 'negociation']),
  tone: z.enum(['pro', 'cordial', 'direct']).optional(),
  style: z.enum(['formel', 'creatif', 'technique', 'commercial']).optional(),
  variables: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');
    const type = searchParams.get('type');

    let query = supabase
      .from('templates')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%,text.ilike.%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: data,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createTemplateSchema.parse(body);

    // Récupérer l'utilisateur
    const { data: user } = await supabase
      .from('users')
      .select('id, plan')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier la limite pour les utilisateurs gratuits
    if (user.plan === 'FREE') {
      const { count } = await supabase
        .from('templates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= 5) {
        return NextResponse.json(
          {
            error: 'Template limit reached',
            message: 'Vous avez atteint la limite de 5 templates pour le plan gratuit.',
          },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        user_id: user.id,
        name: validated.name,
        subject: validated.subject,
        text: validated.text,
        html: validated.html,
        type: validated.type,
        tone: validated.tone,
        style: validated.style,
        variables: validated.variables,
        is_public: validated.is_public,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      template: data,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
