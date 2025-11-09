import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
    const period = parseInt(searchParams.get('period') || '30'); // jours

    // Date de début (période jours en arrière)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Récupérer tous les emails de l'utilisateur pour la période
    const { data: emails, error } = await supabase
      .from('emails')
      .select('created_at, type, tone, style')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculer les stats par jour
    const dailyStats: { [key: string]: number } = {};
    const typeDistribution: { [key: string]: number } = {};
    const toneDistribution: { [key: string]: number } = {};
    const styleDistribution: { [key: string]: number } = {};

    emails?.forEach((email) => {
      // Stats quotidiennes
      const date = new Date(email.created_at).toLocaleDateString('fr-FR');
      dailyStats[date] = (dailyStats[date] || 0) + 1;

      // Distribution par type
      if (email.type) {
        typeDistribution[email.type] = (typeDistribution[email.type] || 0) + 1;
      }

      // Distribution par tone
      if (email.tone) {
        toneDistribution[email.tone] = (toneDistribution[email.tone] || 0) + 1;
      }

      // Distribution par style
      if (email.style) {
        styleDistribution[email.style] = (styleDistribution[email.style] || 0) + 1;
      }
    });

    // Formater les stats quotidiennes pour les graphiques
    const dailyStatsArray = Object.entries(dailyStats).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - 
                        new Date(b.date.split('/').reverse().join('-')).getTime());

    // Formater les distributions
    const typeDistributionArray = Object.entries(typeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    const toneDistributionArray = Object.entries(toneDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    const styleDistributionArray = Object.entries(styleDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        totalGenerated: emails?.length || 0,
        dailyStats: dailyStatsArray,
        typeDistribution: typeDistributionArray,
        toneDistribution: toneDistributionArray,
        styleDistribution: styleDistributionArray,
        period,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
