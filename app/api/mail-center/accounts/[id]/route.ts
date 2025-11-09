import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/mail-center/accounts/[id]
 * Supprime un compte email connecté
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: accountId } = await params;
    const userId = session.user.id;

    console.log('🗑️ [DELETE ACCOUNT] Tentative de suppression:', { accountId, userId });

    // Vérifier que le compte appartient à l'utilisateur
    const { data: account, error: fetchError } = await supabase
      .from('mail_accounts')
      .select('id, email, user_id')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !account) {
      console.error('❌ [DELETE ACCOUNT] Compte non trouvé:', { fetchError, accountId, userId });
      return NextResponse.json(
        { error: 'Compte non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    console.log('✅ [DELETE ACCOUNT] Compte trouvé:', account.email);

    console.log('✅ [DELETE ACCOUNT] Compte trouvé:', account.email);

    // Supprimer les emails associés (cascade si configuré, sinon manuel)
    const { error: deleteEmailsError } = await supabase
      .from('emails_cache')
      .delete()
      .eq('account_id', accountId);

    if (deleteEmailsError) {
      console.error('❌ Erreur suppression emails:', deleteEmailsError);
      // On continue quand même pour supprimer le compte
    } else {
      console.log('✅ [DELETE ACCOUNT] Emails supprimés');
    }

    // Supprimer le compte
    const { error: deleteError } = await supabase
      .from('mail_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId); // Double vérification

    if (deleteError) {
      console.error('❌ Erreur suppression compte:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du compte' },
        { status: 500 }
      );
    }

    console.log('🎉 [DELETE ACCOUNT] Compte supprimé avec succès:', account.email);

    return NextResponse.json({
      success: true,
      message: `Compte ${account.email} supprimé avec succès`,
      deletedAccount: account.email
    });

  } catch (error) {
    console.error('❌ [DELETE ACCOUNT] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
