/**
 * MIDDLEWARE DE TRACKING AUTOMATIQUE DES USAGES
 * 
 * Ce middleware intercepte les actions critiques et incrémente automatiquement
 * les compteurs d'utilisation dans la table email_automations.
 * 
 * Usage automatique - aucun appel manuel requis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

const serviceClient = supabase;

/**
 * Enregistre une action d'utilisation dans la base de données
 */
export async function trackUsage(params: {
  userId: string;
  actionType: 'auto_reply_sent' | 'email_processed' | 'manual_reply_sent' | 'shopify_store_connected';
  emailId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { userId, actionType, emailId, metadata } = params;

  try {
    const { error } = await serviceClient
      .from('email_automations')
      .insert({
        user_id: userId,
        email_id: emailId || null,
        action_type: actionType,
        action_result: 'success',
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`❌ Erreur tracking usage ${actionType}:`, error);
    } else {
      console.log(`✅ Usage tracké: ${actionType} pour user ${userId}`);
    }
  } catch (error) {
    console.error(`❌ Exception tracking usage:`, error);
  }
}

/**
 * Wrapper pour tracker automatiquement après envoi de réponse
 */
export async function trackAutoReplySent(userId: string, emailId: string, metadata?: Record<string, any>): Promise<void> {
  await trackUsage({
    userId,
    actionType: 'auto_reply_sent',
    emailId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      source: 'auto_reply',
    },
  });
}

/**
 * Wrapper pour tracker une réponse manuelle
 */
export async function trackManualReplySent(userId: string, emailId: string, metadata?: Record<string, any>): Promise<void> {
  await trackUsage({
    userId,
    actionType: 'manual_reply_sent',
    emailId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      source: 'manual',
    },
  });
}

/**
 * Wrapper pour tracker le traitement d'un email
 */
export async function trackEmailProcessed(userId: string, emailId: string, metadata?: Record<string, any>): Promise<void> {
  await trackUsage({
    userId,
    actionType: 'email_processed',
    emailId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Obtient le compte d'utilisation ce mois pour un type d'action
 */
export async function getMonthlyUsageCount(userId: string, actionType: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await serviceClient
    .from('email_automations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('Erreur comptage usage:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Obtient un résumé de l'utilisation du mois en cours
 */
export async function getMonthlyUsageSummary(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await serviceClient
    .from('email_automations')
    .select('action_type')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    console.error('Erreur résumé usage:', error);
    return {
      auto_reply_sent: 0,
      manual_reply_sent: 0,
      email_processed: 0,
      total: 0,
    };
  }

  const summary = {
    auto_reply_sent: 0,
    manual_reply_sent: 0,
    email_processed: 0,
    total: data?.length || 0,
  };

  data?.forEach((item) => {
    if (item.action_type === 'auto_reply_sent') summary.auto_reply_sent++;
    if (item.action_type === 'manual_reply_sent') summary.manual_reply_sent++;
    if (item.action_type === 'email_processed') summary.email_processed++;
  });

  return summary;
}
