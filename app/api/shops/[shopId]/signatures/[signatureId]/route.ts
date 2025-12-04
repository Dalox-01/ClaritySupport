import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import type { UpdateSignatureInput } from '@/lib/shop-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: { shopId: string; signatureId: string };
}

// GET - Récupérer une signature spécifique
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { shopId, signatureId } = params;

    const { data: signature, error } = await supabase
      .from('shop_email_signatures')
      .select('*')
      .eq('id', signatureId)
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .single();

    if (error || !signature) {
      return NextResponse.json({ error: 'Signature non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: signature
    });
  } catch (error: any) {
    console.error('GET /api/shops/[shopId]/signatures/[signatureId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une signature
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { shopId, signatureId } = params;
    const body: UpdateSignatureInput = await req.json();

    // Vérifier que la signature existe
    const { data: existingSignature } = await supabase
      .from('shop_email_signatures')
      .select('id')
      .eq('id', signatureId)
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .single();

    if (!existingSignature) {
      return NextResponse.json({ error: 'Signature non trouvée' }, { status: 404 });
    }

    // Préparer les données
    const updateData: any = {};
    const allowedFields = [
      'name', 'closing_text', 'sender_name', 'sender_email', 'sender_title',
      'phone', 'website', 'address', 'social_links', 'logo_url', 'logo_width',
      'custom_html', 'is_default', 'is_active'
    ];

    for (const field of allowedFields) {
      if (body[field as keyof UpdateSignatureInput] !== undefined) {
        updateData[field] = body[field as keyof UpdateSignatureInput];
      }
    }

    // Mettre à jour
    const { data: signature, error } = await supabase
      .from('shop_email_signatures')
      .update(updateData)
      .eq('id', signatureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour signature:', error);
      throw error;
    }

    // Si cette signature devient la défaut, retirer le défaut des autres
    if (body.is_default === true) {
      await supabase
        .from('shop_email_signatures')
        .update({ is_default: false })
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .neq('id', signatureId);

      // Mettre à jour la config IA
      await supabase
        .from('shop_ai_configurations')
        .update({ default_signature_id: signatureId })
        .eq('shop_id', shopId)
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      data: signature,
      message: 'Signature mise à jour'
    });
  } catch (error: any) {
    console.error('PATCH /api/shops/[shopId]/signatures/[signatureId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une signature
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const { shopId, signatureId } = params;

    // Vérifier que la signature existe
    const { data: signature } = await supabase
      .from('shop_email_signatures')
      .select('id, is_default')
      .eq('id', signatureId)
      .eq('shop_id', shopId)
      .eq('user_id', userId)
      .single();

    if (!signature) {
      return NextResponse.json({ error: 'Signature non trouvée' }, { status: 404 });
    }

    // Compter les signatures restantes
    const { count } = await supabase
      .from('shop_email_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('user_id', userId);

    if ((count || 0) <= 1) {
      return NextResponse.json(
        { error: 'Impossible de supprimer la dernière signature' },
        { status: 400 }
      );
    }

    // Supprimer
    const { error } = await supabase
      .from('shop_email_signatures')
      .delete()
      .eq('id', signatureId)
      .eq('user_id', userId);

    if (error) throw error;

    // Si c'était la signature par défaut, en définir une autre
    if (signature.is_default) {
      const { data: firstSignature } = await supabase
        .from('shop_email_signatures')
        .select('id')
        .eq('shop_id', shopId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstSignature) {
        await supabase
          .from('shop_email_signatures')
          .update({ is_default: true })
          .eq('id', firstSignature.id);

        await supabase
          .from('shop_ai_configurations')
          .update({ default_signature_id: firstSignature.id })
          .eq('shop_id', shopId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Signature supprimée'
    });
  } catch (error: any) {
    console.error('DELETE /api/shops/[shopId]/signatures/[signatureId] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
