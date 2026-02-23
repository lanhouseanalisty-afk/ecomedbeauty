$content = Get-Content migration_list.txt
$migrations = @()

foreach ($line in $content) {
    if ($line -match '^\s*(\d+)') {
        $version = $matches[1]
        # Only process migrations before the recursion fix (20260219...)
        # And exclude 999... which we don't want to mess up prematurely if it's special
        if ($version -lt "20260219204500" -and $version -ne "99999999999999") {
            $migrations += $version
        }
    }
}

# Add 20240127 if it wasn't captured (it was listed weirdly)
if (-not ($migrations -contains "20240127")) {
    $migrations += "20240127"
}

Write-Host "Repairing migrations..."
foreach ($mig in $migrations) {
    Write-Host "Repairing $mig"
    cmd /c "npx supabase migration repair --status applied $mig"
}
