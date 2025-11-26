import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_AI_CONFIG,
  type AIPromptConfig,
  type PromptTone,
  type ResponseLength,
  type ResponseStyle,
} from '@/lib/ai-prompt-config';
import { saveCompactConfig } from '@/lib/ai-config-compressor';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type SanitizedAIParams = {
  maxTokens: number;
  creativity: number;
  tone?: PromptTone;
  style?: ResponseStyle;
  length?: ResponseLength;
  language?: string;
};

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numericValue = typeof value === 'number' && !Number.isNaN(value)
    ? value
    : typeof value === 'string'
      ? Number(value)
      : NaN;

  if (Number.isNaN(numericValue)) {
    return fallback;
  }

  return Math.min(Math.max(numericValue, min), max);
}

function mapTone(config: any): PromptTone | undefined {
  const humanization = config?.prompts?.system?.style?.humanization;
  const emotionalTone = config?.prompts?.system?.style?.emotionalTone;

  const humanizationMap: Record<string, PromptTone> = {
    'robotic': 'formel',
    'professional': 'professionnel',
    'balanced': 'professionnel',
    'friendly': 'amical',
    'very-human': 'empathique',
  };

  const emotionalToneMap: Record<string, PromptTone> = {
    'neutral': 'professionnel',
    'empathetic': 'empathique',
    'enthusiastic': 'amical',
    'reassuring': 'empathique',
    'apologetic': 'formel',
  };

  return humanizationMap[humanization] || emotionalToneMap[emotionalTone];
}

function mapStyle(config: any): ResponseStyle | undefined {
  const useBulletPoints = config?.prompts?.system?.style?.useBulletPoints;
  if (useBulletPoints) {
    return 'bullet-points';
  }

  const responseLength = config?.prompts?.system?.style?.responseLength;
  const formality = config?.prompts?.system?.style?.formality;

  if (responseLength === 'very-short' || responseLength === 'short') {
    return 'concis';
  }

  if (responseLength === 'detailed' || responseLength === 'comprehensive') {
    return 'détaillé';
  }

  if (formality === 'casual' || formality === 'very-casual') {
    return 'conversationnel';
  }

  return undefined;
}

function mapLength(config: any): ResponseLength | undefined {
  const responseLength = config?.prompts?.system?.style?.responseLength;
  const lengthMap: Record<string, ResponseLength> = {
    'very-short': 'court',
    'short': 'court',
    'medium': 'moyen',
    'detailed': 'long',
    'comprehensive': 'long',
  };

  return lengthMap[responseLength];
}

function mapLanguage(config: any): string | undefined {
  const language = config?.prompts?.system?.variables?.language;
  if (typeof language === 'string' && language.length >= 2 && language.length <= 5) {
    return language.toLowerCase();
  }
  return undefined;
}

function extractAIParameters(config: any, currentPromptConfig: AIPromptConfig): SanitizedAIParams {
  const baseConfig = currentPromptConfig || DEFAULT_AI_CONFIG;
  const maxTokens = clampNumber(
    config?.models?.primary?.maxTokens,
    100,
    1000,
    baseConfig.maxTokens || 300
  );

  const temperature = config?.models?.primary?.temperature;
  const normalizedCreativity = clampNumber(
    typeof temperature === 'number' ? (temperature - 0.2) / 0.8 : baseConfig.creativity ?? 0.5,
    0,
    1,
    baseConfig.creativity ?? 0.5
  );

  return {
    maxTokens,
    creativity: normalizedCreativity,
    tone: mapTone(config),
    style: mapStyle(config),
    length: mapLength(config),
    language: mapLanguage(config),
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('ai_configurations')
      .select('advanced_mode_config')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching AI config:', error);
      // If column doesn't exist, we might get an error. 
      // But we can't easily detect that without checking schema.
      // We'll assume if error, return null config.
    }

    return NextResponse.json({
      config: data?.advanced_mode_config || null
    });

  } catch (error) {
    console.error('Error in GET /api/ai/config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 400 });
    }

    const { data: promptConfigData, error: promptConfigError } = await supabase
      .from('users')
      .select('ai_prompt_config')
      .eq('id', userId)
      .single();

    if (promptConfigError && promptConfigError.code !== 'PGRST116') {
      console.error('Error fetching prompt config:', promptConfigError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    const currentPromptConfig: AIPromptConfig = promptConfigData?.ai_prompt_config || DEFAULT_AI_CONFIG;
    const sanitizedParams = extractAIParameters(config, currentPromptConfig);

    const updatedPromptConfig: AIPromptConfig = {
      ...currentPromptConfig,
      tone: sanitizedParams.tone || currentPromptConfig.tone,
      style: sanitizedParams.style || currentPromptConfig.style,
      length: sanitizedParams.length || currentPromptConfig.length,
      language: sanitizedParams.language || currentPromptConfig.language,
      maxTokens: sanitizedParams.maxTokens,
      creativity: sanitizedParams.creativity,
    };

    const aiConfigurationPayload = {
      advanced_mode_config: config,
      max_tokens: sanitizedParams.maxTokens,
      creativity: sanitizedParams.creativity,
      tone: updatedPromptConfig.tone,
      style: updatedPromptConfig.style,
      length: updatedPromptConfig.length,
      language: updatedPromptConfig.language,
      updated_at: new Date().toISOString()
    };

    // Upsert configuration
    // First check if record exists
    const { data: existing } = await supabase
      .from('ai_configurations')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existing) {
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update(aiConfigurationPayload)
        .eq('user_id', userId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('ai_configurations')
        .insert({
          user_id: userId,
          ...aiConfigurationPayload
        });
      error = insertError;
    }

    if (error) {
      console.error('Error saving AI config:', error);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    const { error: updatePromptError } = await supabase
      .from('users')
      .update({
        ai_prompt_config: updatedPromptConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updatePromptError) {
      console.error('Error updating prompt config:', updatePromptError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    try {
      await saveCompactConfig(userId, updatedPromptConfig, supabase);
    } catch (compactError) {
      console.warn('Unable to generate compact config:', compactError);
    }

    return NextResponse.json({
      success: true,
      maxTokens: sanitizedParams.maxTokens,
      creativity: sanitizedParams.creativity
    });

  } catch (error) {
    console.error('Error in POST /api/ai/config:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
