# Script de correction du schéma mail_accounts
# Date: 2025-11-12

Write-Host "🔧 Correction du schéma mail_accounts..." -ForegroundColor Cyan

# Vérifier que les variables d'environnement sont définies
if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    Write-Host "❌ NEXT_PUBLIC_SUPABASE_URL non définie" -ForegroundColor Red
    exit 1
}

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY non définie" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Application de la migration..." -ForegroundColor Yellow

# Lire le fichier de migration
$migrationSQL = Get-Content -Path ".\supabase\migrations\20251112000000_fix_mail_accounts_schema.sql" -Raw

Write-Host "✅ Migration prête à être appliquée" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Contenu de la migration:" -ForegroundColor Cyan
Write-Host $migrationSQL
Write-Host ""
Write-Host "⚠️  Pour appliquer cette migration, connectez-vous à votre dashboard Supabase:" -ForegroundColor Yellow
Write-Host "   1. Allez sur https://supabase.com/dashboard/project/[votre-projet-id]/sql" -ForegroundColor White
Write-Host "   2. Créez une nouvelle requête SQL" -ForegroundColor White
Write-Host "   3. Copiez-collez le contenu ci-dessus" -ForegroundColor White
Write-Host "   4. Exécutez la requête" -ForegroundColor White
Write-Host ""
Write-Host "ℹ️  Ou utilisez la CLI Supabase si installée:" -ForegroundColor Cyan
Write-Host "   supabase db push" -ForegroundColor White
