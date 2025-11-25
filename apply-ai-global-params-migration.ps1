# Script PowerShell pour appliquer la migration AI Global Params
# Ce script ajoute les nouveaux champs à la table ai_configurations

$ErrorActionPreference = "Stop"

Write-Host "🚀 Application de la migration AI Global Params..." -ForegroundColor Cyan

# Vérifier que le fichier de migration existe
$migrationFile = "supabase\migrations\20250110_add_ai_global_params.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier de migration introuvable: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de migration trouvé" -ForegroundColor Green

# Lire le contenu de la migration
$migrationSQL = Get-Content $migrationFile -Raw

Write-Host ""
Write-Host "📝 Contenu de la migration:" -ForegroundColor Yellow
Write-Host $migrationSQL

Write-Host ""
Write-Host "⚠️  ATTENTION !" -ForegroundColor Yellow
Write-Host "Cette migration va ajouter les colonnes suivantes à la table ai_configurations:" -ForegroundColor Yellow
Write-Host "  - model (TEXT)" -ForegroundColor White
Write-Host "  - max_tokens (INTEGER)" -ForegroundColor White
Write-Host "  - creativity (NUMERIC)" -ForegroundColor White
Write-Host "  - style, tone, length, language (TEXT)" -ForegroundColor White
Write-Host "  - category_templates (JSONB)" -ForegroundColor White
Write-Host "  - security_audit_log, security_mask_personal_data (BOOLEAN)" -ForegroundColor White
Write-Host "  - security_data_retention_days (INTEGER)" -ForegroundColor White

Write-Host ""
$confirmation = Read-Host "Voulez-vous continuer ? (o/n)"

if ($confirmation -ne 'o') {
    Write-Host "❌ Migration annulée" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔧 Application de la migration via Supabase CLI..." -ForegroundColor Cyan

try {
    # Vérifier si la CLI Supabase est installée
    $supabaseVersion = supabase --version 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Supabase CLI non détecté" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 INSTRUCTIONS MANUELLES:" -ForegroundColor Cyan
        Write-Host "1. Ouvrez votre Dashboard Supabase: https://app.supabase.com" -ForegroundColor White
        Write-Host "2. Sélectionnez votre projet ClaritySupport" -ForegroundColor White
        Write-Host "3. Allez dans 'SQL Editor' (icône </> dans la barre latérale)" -ForegroundColor White
        Write-Host "4. Créez une nouvelle requête" -ForegroundColor White
        Write-Host "5. Copiez-collez le contenu du fichier:" -ForegroundColor White
        Write-Host "   $migrationFile" -ForegroundColor Yellow
        Write-Host "6. Cliquez sur 'Run' (ou Ctrl+Enter)" -ForegroundColor White
        Write-Host ""
        Write-Host "📂 Le fichier de migration est prêt à être copié!" -ForegroundColor Green
        
        # Copier automatiquement le contenu dans le presse-papier si possible
        try {
            Set-Clipboard -Value $migrationSQL
            Write-Host "✅ Contenu de la migration copié dans le presse-papier!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Impossible de copier automatiquement. Copiez manuellement le fichier." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "✅ Supabase CLI détecté: $supabaseVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔄 Exécution de 'supabase db push'..." -ForegroundColor Cyan
        
        supabase db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
            Write-Host "Essayez d'appliquer manuellement via le Dashboard Supabase" -ForegroundColor Yellow
            exit 1
        }
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Migration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Vérifiez que les colonnes ont été ajoutées:" -ForegroundColor White
Write-Host "   SELECT column_name FROM information_schema.columns" -ForegroundColor Yellow
Write-Host "   WHERE table_name = 'ai_configurations';" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Testez la génération de réponses avec différents maxTokens (200, 300, 800)" -ForegroundColor White
Write-Host ""
Write-Host "3. Créez l'interface utilisateur pour configurer ces paramètres" -ForegroundColor White

Write-Host ""
Write-Host "✨ Configuration IA maintenant complète!" -ForegroundColor Green
