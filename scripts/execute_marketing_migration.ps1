# PowerShell script to execute Supabase migration for marketing_requests
# Ensure Supabase CLI is installed and authenticated.
# Usage: ./scripts/execute_marketing_migration.ps1

$migrationFile = "supabase/migrations/20260124140000_create_marketing_requests.sql"

Write-Host "Running Supabase migration: $migrationFile"

# Execute migration using Supabase CLI
npx supabase db push --file $migrationFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration completed successfully."
}
else {
    Write-Error "Migration failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
}
