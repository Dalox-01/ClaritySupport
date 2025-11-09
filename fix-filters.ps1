# Script pour corriger la section des filtres

$file = "app\mail-center\page.tsx"
$lines = Get-Content $file -Encoding UTF8

$newLines = @()
$skip = 0

for ($i = 0; $i < $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Détecter le début de la section problématique
    if ($line -match '{ id: ''inbox'', label: ''📬 Inbox'' },') {
        $newLines += $line
        # Ajouter les nouvelles lignes correc�tes
        $newLines += "                    ...SUPPORT_CATEGORIES.map(cat => ({"
        $newLines += "                      id: cat.id,"
        $newLines += "                      label: ``${cat.icon} ${cat.label}``"
        $newLines += "                    }))"
       
        # Sauter jusqu'à la ligne "].slice"
        while ($i < $lines.Count -and $lines[$i] -notmatch '^\s*\]\.slice') {
            $i++
        }
        $i-- # Revenir en arrière d'une ligne pour ne pas sauter "].slice"
    }
    else {
        $newLines += $line
    }
}

# Sauvegarder le fichier corrigé
$newLines | Set-Content $file -Encoding UTF8
Write-Host "Fichier corrigé!" -ForegroundColor Green
