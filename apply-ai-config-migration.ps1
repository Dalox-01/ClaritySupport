# Script PowerShell: Appliquer la migration ai_prompt_config
# Ajoute la colonne ai_prompt_config JSONB à la table users dans Supabase

Write-Host "🔧 Application de la migration: ai_prompt_config..." -ForegroundColor Cyan

# Charger les variables d'environnement depuis .env.local
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✅ Variables d'environnement chargées" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
    exit 1
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Variables SUPABASE manquantes" -ForegroundColor Red
    exit 1
}

Write-Host "📡 URL Supabase: $supabaseUrl" -ForegroundColor Gray

# Lire le fichier SQL
$sqlFile = "migrations/add_ai_prompt_config.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Fichier SQL non trouvé: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw

# Retirer les commentaires et lignes vides pour l'API
$sqlCommands = $sqlContent -split ';' | Where-Object { 
    $_ -notmatch '^\s*--' -and $_ -notmatch '^\s*/\*' -and $_.Trim() -ne ''
}

Write-Host "📝 Exécution de $($sqlCommands.Count) commandes SQL..." -ForegroundColor Cyan

foreach ($sql in $sqlCommands) {
    $trimmedSql = $sql.Trim()
    if ($trimmedSql) {
        Write-Host "  → $($trimmedSql.Substring(0, [Math]::Min(60, $trimmedSql.Length)))..." -ForegroundColor Gray
        
        try {
            $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" `
                -Method Post `
                -Headers @{
                    "apikey" = $supabaseKey
                    "Authorization" = "Bearer $supabaseKey"
                    "Content-Type" = "application/json"
                } `
                -Body (@{ query = $trimmedSql } | ConvertTo-Json)
            
            Write-Host "    ✅ OK" -ForegroundColor Green
        } catch {
            # Si exec_sql n'existe pas, essayer directement avec l'API SQL Editor
            Write-Host "    ⚠️ Méthode alternative..." -ForegroundColor Yellow
            
            # Note: Supabase n'expose pas directement d'API pour exécuter du SQL arbitraire
            # Il faut utiliser le SQL Editor dans le dashboard ou psql
            Write-Host "    ℹ️ Exécutez cette commande manuellement dans Supabase SQL Editor:" -ForegroundColor Cyan
            Write-Host $trimmedSql -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "📋 INSTRUCTIONS MANUELLES:" -ForegroundColor Yellow
Write-Host "Si l'exécution automatique a échoué, copiez le contenu de:" -ForegroundColor White
Write-Host "  migrations/add_ai_prompt_config.sql" -ForegroundColor Cyan
Write-Host "Et collez-le dans:" -ForegroundColor White
Write-Host "  Supabase Dashboard → SQL Editor → New Query" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou utilisez psql:" -ForegroundColor White
Write-Host "  psql -h [DB_HOST] -U postgres -d postgres -f migrations/add_ai_prompt_config.sql" -ForegroundColor Cyan
Write-Host ""
