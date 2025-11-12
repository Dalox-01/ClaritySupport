// API Route: Statistiques Mail Center

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    const userId = session.user.id;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Stats aujourd'hui
    const { data: todayEmails } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('received_at', startDate.toISOString());

    const totalReceived = todayEmails?.length || 0;
    const autoReplied = todayEmails?.filter(e => e.is_auto_replied).length || 0;

    // Compter les réponses en attente de validation depuis la table pending_replies
    const { data: pendingReplies } = await supabase
      .from('pending_replies')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending');
    
    const pendingValidation = pendingReplies?.length || 0;

    // Calcul temps moyen de réponse réel
    const { data: sentReplies } = await supabase
      .from('pending_replies')
      .select('created_at, sent_at')
      .eq('user_id', userId)
      .eq('status', 'sent')
      .not('sent_at', 'is', null)
      .gte('created_at', startDate.toISOString());

    let avgResponseTime = 0;
    if (sentReplies && sentReplies.length > 0) {
      const totalMinutes = sentReplies.reduce((acc, reply) => {
        const created = new Date(reply.created_at).getTime();
        const sent = new Date(reply.sent_at!).getTime();
        return acc + (sent - created) / (1000 * 60); // en minutes
      }, 0);
      avgResponseTime = Math.round(totalMinutes / sentReplies.length);
    }

    // Catégories
    const categories = {
      support: todayEmails?.filter(e => e.category === 'support').length || 0,
      vente: todayEmails?.filter(e => e.category === 'vente').length || 0,
      spam: todayEmails?.filter(e => e.category === 'spam').length || 0,
      urgent: todayEmails?.filter(e => e.category === 'urgent').length || 0,
      autre: todayEmails?.filter(e => !e.category || e.category === 'autre').length || 0,
    };

    // Sentiment
    const sentiment = {
      positive: todayEmails?.filter(e => e.sentiment === 'positif').length || 0,
      neutral: todayEmails?.filter(e => e.sentiment === 'neutre' || !e.sentiment).length || 0,
      negative: todayEmails?.filter(e => e.sentiment === 'negatif').length || 0,
    };

    // Top règles
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('name, triggered_count, success_count')
      .eq('user_id', userId)
      .order('triggered_count', { ascending: false })
      .limit(5);

    const topRules = rules?.map(rule => ({
      name: rule.name.replace('AI_', '').replace('_', ' '),
      triggered: rule.triggered_count || 0,
      success_rate: rule.triggered_count > 0 
        ? Math.round((rule.success_count / rule.triggered_count) * 100)
        : 100,
    })) || [];

    // Stats semaine
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const { data: weekEmails } = await supabase
      .from('emails_cache')
      .select('*')
      .eq('user_id', userId)
      .gte('received_at', weekStart.toISOString());

    const weekReceived = weekEmails?.length || 0;
    const weekAutoReplied = weekEmails?.filter(e => e.is_auto_replied).length || 0;
    const weekManualReplied = weekReceived - weekAutoReplied; // Approximation

    const stats = {
      today: {
        received: totalReceived,
        auto_replied: autoReplied,
        pending_validation: pendingValidation,
        avg_response_time: avgResponseTime,
      },
      week: {
        received: weekReceived,
        auto_replied: weekAutoReplied,
        manual_replied: weekManualReplied,
      },
      categories,
      sentiment,
      topRules,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
