import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { getPlanLimits, normalizePlanName } from '@/lib/plan-limits';
import type { Shop, CreateShopInput, UpdateShopInput } from '@/lib/shop-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper pour obtenir le nombre max de boutiques selon le plan
function getMaxShops(plan: string): number {
  const normalizedPlan = normalizePlanName(plan);
  const limits = getPlanLimits(normalizedPlan);
  // multiShops = nombre de boutiques Shopify, mais on l'utilise aussi pour les boutiques générales
  // STARTER = 1, PRO = 3, SCALE = illimité (-1)
  if (normalizedPlan === 'STARTER') return 1;
  if (normalizedPlan === 'PRO') return 3;
  if (normalizedPlan === 'SCALE') return -1; // Illimité
  return 1; // Par défaut (FREE)
}

// GET - Liste des boutiques de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les boutiques avec leurs détails
    const { data: shops, error } = await supabase
      .from('shops')
      .select(`
        *,
        shop_email_signatures(id, name, is_default),
        shop_ai_configurations(id)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur récupération boutiques:', error);
      throw error;
    }

    // Compter les comptes email par boutique
    const { data: emailCounts } = await supabase
      .from('mail_accounts')
      .select('shop_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    const emailCountsByShop: Record<string, number> = {};
    emailCounts?.forEach((acc: { shop_id: string | null }) => {
      if (acc.shop_id) {
        emailCountsByShop[acc.shop_id] = (emailCountsByShop[acc.shop_id] || 0) + 1;
      }
    });

    // Récupérer le plan utilisateur
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'FREE';
    const maxShops = getMaxShops(plan);

    const shopsWithDetails = shops?.map((shop: Shop & { shop_email_signatures?: { id: string; name: string; is_default: boolean }[]; shop_ai_configurations?: { id: string }[] }) => ({
      ...shop,
      signatures_count: shop.shop_email_signatures?.length || 0,
      has_ai_config: !!shop.shop_ai_configurations?.length,
      email_accounts_count: emailCountsByShop[shop.id] || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      data: shopsWithDetails,
      meta: {
        total: shopsWithDetails.length,
        maxShops,
        canAddMore: maxShops === -1 || shopsWithDetails.length < maxShops,
        plan: normalizePlanName(plan),
      }
    });
  } catch (error: any) {
    console.error('GET /api/shops error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle boutique
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body: CreateShopInput = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom de la boutique est requis' },
        { status: 400 }
      );
    }

    // Vérifier le plan et les limites
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'FREE';
    const maxShops = getMaxShops(plan);

    // Compter les boutiques existantes
    const { count } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (maxShops !== -1 && (count || 0) >= maxShops) {
      const planName = normalizePlanName(plan);
      return NextResponse.json(
        { 
          error: `Limite de ${maxShops} boutique(s) atteinte pour le plan ${planName}. Passez au plan supérieur pour ajouter plus de boutiques.`,
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }

    // Si c'est la première boutique, la définir par défaut
    const isFirstShop = (count || 0) === 0;

    // Créer la boutique
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        user_id: userId,
        name: body.name.trim(),
        display_name: body.display_name?.trim() || body.name.trim(),
        description: body.description?.trim() || null,
        color: body.color || '#3B82F6',
        platform: body.platform || null,
        shop_domain: body.shop_domain?.trim() || null,
        is_default: body.is_default ?? isFirstShop,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création boutique:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Une boutique avec ce nom existe déjà' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Si cette boutique est définie par défaut, retirer le défaut des autres
    if (shop.is_default) {
      await supabase
        .from('shops')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', shop.id);
    }

    // Créer automatiquement une signature par défaut
    const { data: signature } = await supabase
      .from('shop_email_signatures')
      .insert({
        shop_id: shop.id,
        user_id: userId,
        name: 'Signature principale',
        closing_text: 'Cordialement,',
        sender_name: `L'équipe ${shop.display_name || shop.name}`,
        sender_email: session.user.email || null,
        is_default: true,
        is_active: true,
      })
      .select()
      .single();

    // Créer automatiquement une configuration IA par défaut
    await supabase
      .from('shop_ai_configurations')
      .insert({
        shop_id: shop.id,
        user_id: userId,
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        tone: 'professional',
        language: 'fr',
        response_length: 'medium',
        auto_reply_enabled: false,
        require_validation: true,
        default_signature_id: signature?.id || null,
      });

    return NextResponse.json({
      success: true,
      data: shop,
      message: 'Boutique créée avec succès'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/shops error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une boutique
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('id');

    if (!shopId) {
      return NextResponse.json({ error: 'ID boutique requis' }, { status: 400 });
    }

    const body: UpdateShopInput = await req.json();

    // Vérifier que la boutique appartient à l'utilisateur
    const { data: existingShop } = await supabase
      .from('shops')
      .select('id, is_default')
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (!existingShop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.display_name !== undefined) updateData.display_name = body.display_name?.trim() || null;
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.platform !== undefined) updateData.platform = body.platform;
    if (body.shop_domain !== undefined) updateData.shop_domain = body.shop_domain?.trim() || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_default !== undefined) updateData.is_default = body.is_default;
    if (body.settings !== undefined) updateData.settings = body.settings;

    // Mettre à jour
    const { data: shop, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', shopId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour boutique:', error);
      throw error;
    }

    // Si cette boutique devient la défaut, retirer le défaut des autres
    if (body.is_default) {
      await supabase
        .from('shops')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', shopId);
    }

    return NextResponse.json({
      success: true,
      data: shop,
      message: 'Boutique mise à jour'
    });
  } catch (error: any) {
    console.error('PATCH /api/shops error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une boutique
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('id');

    if (!shopId) {
      return NextResponse.json({ error: 'ID boutique requis' }, { status: 400 });
    }

    // Vérifier que la boutique existe et appartient à l'utilisateur
    const { data: shop } = await supabase
      .from('shops')
      .select('id, is_default')
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Compter les boutiques restantes
    const { count } = await supabase
      .from('shops')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if ((count || 0) <= 1) {
      return NextResponse.json(
        { error: 'Impossible de supprimer la dernière boutique' },
        { status: 400 }
      );
    }

    // Supprimer la boutique (les signatures et configs sont supprimées en cascade)
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur suppression boutique:', error);
      throw error;
    }

    // Si c'était la boutique par défaut, définir une autre comme défaut
    if (shop.is_default) {
      const { data: firstShop } = await supabase
        .from('shops')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstShop) {
        await supabase
          .from('shops')
          .update({ is_default: true })
          .eq('id', firstShop.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Boutique supprimée'
    });
  } catch (error: any) {
    console.error('DELETE /api/shops error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
