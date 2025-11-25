// API Route: Gestion des prompts contextuels par catégorie
// Permet de CRUD les category_templates

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { compressAIConfig } from '@/lib/ai-config-compressor';
import { DEFAULT_AI_CONFIG } from '@/lib/ai-prompt-config';

export const dynamic = 'force-dynamic';

// GET: Récupérer tous les templates de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('category_templates')
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      categoryTemplates: aiConfig?.category_templates || {},
    });

  } catch (error) {
    console.error('Error fetching category templates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Créer ou mettre à jour un template pour une catégorie
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { category, prompt } = await req.json();

    if (!category || !prompt) {
      return NextResponse.json({ error: 'Catégorie et prompt requis' }, { status: 400 });
    }

    // Récupérer la config actuelle
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('category_templates')
      .eq('user_id', session.user.id)
      .single();

    const currentTemplates = aiConfig?.category_templates || {};
    
    // Ajouter/Modifier le template
    const updatedTemplates = {
      ...currentTemplates,
      [category]: prompt,
    };

    // Mettre à jour dans la DB
    const { error } = await supabase
      .from('ai_configurations')
      .update({ category_templates: updatedTemplates })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating template:', error);
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    // 🎯 Régénérer la config compressée après modification
    try {
      const { data: fullConfig } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (fullConfig) {
        const aiConfigForCompression = {
          ...DEFAULT_AI_CONFIG,
          maxTokens: fullConfig.max_tokens || 300,
          creativity: fullConfig.creativity || 0.5,
          categoryTemplates: updatedTemplates,
          companyName: 'Notre entreprise', // TODO: récupérer depuis user profile
        };

        const compactConfig = compressAIConfig(aiConfigForCompression as any);
        
        await supabase
          .from('ai_configurations')
          .update({ 
            compact_config: compactConfig,
            compact_updated_at: new Date().toISOString(),
          })
          .eq('user_id', session.user.id);

        console.log('✅ Config compressée régénérée automatiquement');
      }
    } catch (compressError) {
      console.error('⚠️ Erreur compression config (non bloquant):', compressError);
    }

    return NextResponse.json({
      success: true,
      category,
      prompt,
      categoryTemplates: updatedTemplates,
    });

  } catch (error) {
    console.error('Error creating/updating template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE: Supprimer un template de catégorie
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 });
    }

    // Récupérer la config actuelle
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('category_templates')
      .eq('user_id', session.user.id)
      .single();

    const currentTemplates = aiConfig?.category_templates || {};
    
    // Supprimer la catégorie
    const updatedTemplates = { ...currentTemplates };
    delete updatedTemplates[category];

    // Mettre à jour dans la DB
    const { error } = await supabase
      .from('ai_configurations')
      .update({ category_templates: updatedTemplates })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deletedCategory: category,
      categoryTemplates: updatedTemplates,
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT: Mettre à jour tous les templates en une fois (bulk update)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { categoryTemplates } = await req.json();

    if (!categoryTemplates || typeof categoryTemplates !== 'object') {
      return NextResponse.json({ error: 'categoryTemplates invalide' }, { status: 400 });
    }

    // Mettre à jour tous les templates
    const { error } = await supabase
      .from('ai_configurations')
      .update({ category_templates: categoryTemplates })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error bulk updating templates:', error);
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      categoryTemplates,
    });

  } catch (error) {
    console.error('Error bulk updating templates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
