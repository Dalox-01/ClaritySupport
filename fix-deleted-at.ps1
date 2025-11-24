# Script pour retirer toutes les références à deleted_at
# Car la colonne n'existe pas encore dans la table emails_cache

$files = @(
    "app\api\mail-center\debug-emails\route.ts",
    "app\api\mail-center\emails-direct\route.ts",
    "app\api\mail-center\stats\route.ts",
    "app\api\mail-center\debug\route.ts"
)

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    if (Test-Path $path) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $path -Raw
        
        # Retirer .is('deleted_at', null)
        $newContent = $content -replace "\.is\('deleted_at', null\)\s*", ""
        
        Set-Content -Path $path -Value $newContent -NoNewline
        
        Write-Host "  ✓ Fixed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $path" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
