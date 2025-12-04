import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { getPlanLimits, normalizePlanName } from '@/lib/plan-limits';
import type { CreateSignatureInput, UpdateSignatureInput } from '@/lib/shop-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper pour obtenir le nombre max de signatures par boutique selon le plan
function getMaxSignaturesPerShop(plan: string): number {
  const normalizedPlan = normalizePlanName(plan);
  if (normalizedPlan === 'STARTER') return 1;
  if (normalizedPlan === 'PRO') return 3;
  if (normalizedPlan === 'SCALE') return -1; // Illimité
  return 1; // Par défaut (FREE)
}

interface RouteParams {
  params: { shopId: string };
}

// GET - Liste des signatures d'une boutique
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const shopId = params.shopId;

    // Vérifier que la boutique appartient à l'utilisateur
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name')
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Récupérer les signatures
    const { data: signatures, error } = await supabase
      .from('shop_email_signatures')
      .select('*')
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Récupérer le plan pour les limites
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'FREE';
    const maxSignatures = getMaxSignaturesPerShop(plan);

    return NextResponse.json({
      success: true,
      data: signatures || [],
      meta: {
        total: signatures?.length || 0,
        maxSignatures,
        canAddMore: maxSignatures === -1 || (signatures?.length || 0) < maxSignatures,
        plan: normalizePlanName(plan),
      }
    });
  } catch (error: any) {
    console.error('GET /api/shops/[shopId]/signatures error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle signature
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const shopId = params.shopId;
    const body: CreateSignatureInput = await req.json();

    // Vérifier que la boutique appartient à l'utilisateur
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name, display_name')
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (!shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Vérifier le plan et les limites
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    const plan = subscription?.plan || 'FREE';
    const maxSignatures = getMaxSignaturesPerShop(plan);

    // Compter les signatures existantes
    const { count } = await supabase
      .from('shop_email_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('user_id', userId);

    if (maxSignatures !== -1 && (count || 0) >= maxSignatures) {
      return NextResponse.json(
        { 
          error: `Limite de ${maxSignatures} signature(s) atteinte pour cette boutique. Passez au plan supérieur.`,
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }

    // Validation
    if (!body.sender_name?.trim()) {
      return NextResponse.json(
        { error: 'Le nom de l\'expéditeur est requis' },
        { status: 400 }
      );
    }

    const isFirstSignature = (count || 0) === 0;

    // Créer la signature
    const { data: signature, error } = await supabase
      .from('shop_email_signatures')
      .insert({
        shop_id: shopId,
        user_id: userId,
        name: body.name?.trim() || 'Signature principale',
        closing_text: body.closing_text || 'Cordialement,',
        sender_name: body.sender_name.trim(),
        sender_email: body.sender_email?.trim() || null,
        sender_title: body.sender_title?.trim() || null,
        phone: body.phone?.trim() || null,
        website: body.website?.trim() || null,
        address: body.address?.trim() || null,
        social_links: body.social_links || {},
        logo_url: body.logo_url || null,
        custom_html: body.custom_html || null,
        is_default: body.is_default ?? isFirstSignature,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création signature:', error);
      throw error;
    }

    // Si cette signature est par défaut, retirer le défaut des autres
    if (signature.is_default) {
      await supabase
        .from('shop_email_signatures')
        .update({ is_default: false })
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .neq('id', signature.id);

      // Mettre à jour la config IA pour utiliser cette signature par défaut
      await supabase
        .from('shop_ai_configurations')
        .update({ default_signature_id: signature.id })
        .eq('shop_id', shopId)
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      data: signature,
      message: 'Signature créée avec succès'
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/shops/[shopId]/signatures error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
