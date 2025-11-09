// ⚠️ FICHIER OBSOLÈTE - Remplacé par /api/stripe/create-checkout-session
// Ce fichier peut être supprimé
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Endpoint obsolète. Utilisez /api/stripe/create-checkout-session' 
  }, { status: 410 });
}
