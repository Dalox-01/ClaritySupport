import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import type { Shop } from '@/lib/shop-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: { id: string };
}

// GET - Récupérer une boutique spécifique avec tous ses détails
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const shopId = params.id;

    // Récupérer la boutique avec signatures et config IA
    const { data: shop, error } = await supabase
      .from('shops')
      .select(`
        *,
        shop_email_signatures(*),
        shop_ai_configurations(*)
      `)
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (error || !shop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Compter les comptes email liés
    const { count: emailCount } = await supabase
      .from('mail_accounts')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .eq('is_active', true);

    // Compter les emails
    const { count: emailsCount } = await supabase
      .from('emails_cache')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      data: {
        ...shop,
        signatures: shop.shop_email_signatures || [],
        ai_config: shop.shop_ai_configurations?.[0] || null,
        email_accounts_count: emailCount || 0,
        emails_count: emailsCount || 0,
      }
    });
  } catch (error: any) {
    console.error('GET /api/shops/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une boutique
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const shopId = params.id;
    const body = await req.json();

    // Vérifier que la boutique appartient à l'utilisateur
    const { data: existingShop } = await supabase
      .from('shops')
      .select('id')
      .eq('id', shopId)
      .eq('user_id', userId)
      .single();

    if (!existingShop) {
      return NextResponse.json({ error: 'Boutique non trouvée' }, { status: 404 });
    }

    // Préparer les données de mise à jour
    const updateData: Partial<Shop> = {};
    const allowedFields = ['name', 'display_name', 'description', 'color', 'logo_url', 'platform', 'shop_domain', 'is_active', 'is_default', 'settings'];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field as keyof Shop] = body[field];
      }
    }

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
    if (body.is_default === true) {
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
    console.error('PATCH /api/shops/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une boutique
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const shopId = params.id;

    // Vérifier que la boutique existe
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

    // Supprimer (cascade sur signatures et config)
    const { error } = await supabase
      .from('shops')
      .delete()
      .eq('id', shopId)
      .eq('user_id', userId);

    if (error) throw error;

    // Si c'était la boutique par défaut, en définir une autre
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
    console.error('DELETE /api/shops/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
