# Script de vérification des variables d'environnement critiques

Write-Host "🔍 VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Charger .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green
    
    $env = @{}
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $env[$key] = $value
        }
    }
    
    Write-Host ""
    Write-Host "Variables critiques pour Mail Center:" -ForegroundColor Yellow
    Write-Host ""
    
    # Vérifier NEXT_PUBLIC_SUPABASE_URL
    if ($env['NEXT_PUBLIC_SUPABASE_URL']) {
        Write-Host "  ✅ NEXT_PUBLIC_SUPABASE_URL: $($env['NEXT_PUBLIC_SUPABASE_URL'].Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "  ❌ NEXT_PUBLIC_SUPABASE_URL: MANQUANTE" -ForegroundColor Red
    }
    
    # Vérifier SUPABASE_SERVICE_ROLE_KEY
    if ($env['SUPABASE_SERVICE_ROLE_KEY']) {
        Write-Host "  ✅ SUPABASE_SERVICE_ROLE_KEY: eyJ***...$(($env['SUPABASE_SERVICE_ROLE_KEY']).Substring($env['SUPABASE_SERVICE_ROLE_KEY'].Length - 10))" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SUPABASE_SERVICE_ROLE_KEY: MANQUANTE" -ForegroundColor Red
    }
    
    # Vérifier NEXTAUTH_SECRET
    if ($env['NEXTAUTH_SECRET']) {
        Write-Host "  ✅ NEXTAUTH_SECRET: Définie ($(($env['NEXTAUTH_SECRET']).Length) caractères)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ NEXTAUTH_SECRET: MANQUANTE" -ForegroundColor Red
    }
    
    # Vérifier NEXTAUTH_URL
    if ($env['NEXTAUTH_URL']) {
        Write-Host "  ✅ NEXTAUTH_URL: $($env['NEXTAUTH_URL'])" -ForegroundColor Green
    } else {
        Write-Host "  ❌ NEXTAUTH_URL: MANQUANTE" -ForegroundColor Red
    }
    
    # Vérifier GOOGLE_CLIENT_ID
    if ($env['GOOGLE_CLIENT_ID']) {
        Write-Host "  ✅ GOOGLE_CLIENT_ID: Définie" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  GOOGLE_CLIENT_ID: MANQUANTE (optionnel)" -ForegroundColor Yellow
    }
    
    # Vérifier OPENAI_API_KEY
    if ($env['OPENAI_API_KEY']) {
        Write-Host "  ✅ OPENAI_API_KEY: sk-***...$(($env['OPENAI_API_KEY']).Substring($env['OPENAI_API_KEY'].Length - 10))" -ForegroundColor Green
    } else {
        Write-Host "  ❌ OPENAI_API_KEY: MANQUANTE" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 NOTE:" -ForegroundColor Yellow
    Write-Host "  - Ces variables doivent AUSSI être définies sur Vercel" -ForegroundColor White
    Write-Host "  - Allez sur: https://vercel.com/dashboard → Project → Settings → Environment Variables" -ForegroundColor Cyan
    Write-Host ""
    
} else {
    Write-Host "❌ Fichier .env.local non trouvé !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Créez un fichier .env.local avec:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co" -ForegroundColor White
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=eyJ..." -ForegroundColor White
    Write-Host "NEXTAUTH_SECRET=[random-string]" -ForegroundColor White
    Write-Host "NEXTAUTH_URL=http://localhost:3000" -ForegroundColor White
}
