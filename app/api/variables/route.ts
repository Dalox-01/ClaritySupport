import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';

// GET - Récupérer les variables de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('user_variables')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) throw error;

    // Convertir en objet { nom: "John", entreprise: "Acme" }
    const variables: Record<string, string> = {};
    data?.forEach((v) => {
      variables[v.variable_name] = v.variable_value;
    });

    return NextResponse.json({
      success: true,
      data: variables,
    });
  } catch (error: any) {
    console.error('Get variables error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder/Mettre à jour les variables
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { variables } = body; // { nom: "John", entreprise: "Acme" }

    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Variables invalides' },
        { status: 400 }
      );
    }

    // Supprimer les anciennes variables
    await supabase
      .from('user_variables')
      .delete()
      .eq('user_id', session.user.id);

    // Insérer les nouvelles
    const dataToInsert = Object.entries(variables).map(([name, value]) => ({
      user_id: session.user.id,
      variable_name: name,
      variable_value: value as string,
    }));

    if (dataToInsert.length > 0) {
      const { error } = await supabase
        .from('user_variables')
        .insert(dataToInsert);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Variables sauvegardées',
    });
  } catch (error: any) {
    console.error('Save variables error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
