# Script PowerShell: Appliquer TOUTES les migrations nécessaires
# - ai_settings (activation IA)
# - ai_prompt_config (configuration prompts)

Write-Host "🚀 APPLICATION DES MIGRATIONS MAIL CENTER" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Migrations à appliquer (dans l'ordre)
$migrations = @(
    "migrations/create_ai_settings_table.sql",
    "migrations/add_ai_prompt_config.sql"
)

Write-Host "📋 Migrations à appliquer:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    Write-Host "   - $migration" -ForegroundColor Gray
}
Write-Host ""

Write-Host "⚠️  INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connectez-vous à Supabase Dashboard" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Cliquez sur 'SQL Editor' → 'New Query'" -ForegroundColor White
Write-Host ""
Write-Host "3. Copiez-collez le contenu de chaque fichier:" -ForegroundColor White
Write-Host ""

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "   📄 $migration" -ForegroundColor Green
        Write-Host "   ----------------------------------------" -ForegroundColor DarkGray
        
        $content = Get-Content $migration -Raw
        Write-Host $content -ForegroundColor White
        
        Write-Host ""
        Write-Host "   ----------------------------------------" -ForegroundColor DarkGray
        Write-Host ""
        
        # Copier dans le presse-papiers (si disponible)
        try {
            Set-Clipboard -Value $content
            Write-Host "   ✅ Copié dans le presse-papiers!" -ForegroundColor Green
            Write-Host ""
            Read-Host "   Appuyez sur ENTRÉE après avoir exécuté cette migration dans Supabase"
            Write-Host ""
        } catch {
            Write-Host "   ℹ️  Copiez manuellement le contenu ci-dessus" -ForegroundColor Yellow
            Write-Host ""
        }
    } else {
        Write-Host "   ❌ Fichier non trouvé: $migration" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ TOUTES LES MIGRATIONS ONT ÉTÉ AFFICHÉES" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Vérifications post-migration:" -ForegroundColor Yellow
Write-Host "   1. La table 'ai_settings' existe avec colonnes: enabled, auto_reply_urgent" -ForegroundColor White
Write-Host "   2. La colonne 'users.ai_prompt_config' (JSONB) existe" -ForegroundColor White
Write-Host "   3. Les indexes sont créés pour performance" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Redémarrer le serveur Next.js: npm run dev" -ForegroundColor White
Write-Host "   2. Tester connexion Gmail/Outlook" -ForegroundColor White
Write-Host "   3. Activer l'IA dans Mail Center" -ForegroundColor White
Write-Host "   4. Vérifier que les emails s'affichent" -ForegroundColor White
Write-Host ""
