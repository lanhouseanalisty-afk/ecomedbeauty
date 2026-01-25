# Script de Deploy da Edge Function de Busca de Leads
# Execute este script para fazer o deploy da função no Supabase

Write-Host "🚀 Deploy da Edge Function - Busca de Leads" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está instalado
Write-Host "📦 Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseVersion = supabase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: npm install -g supabase" -ForegroundColor White
    exit 1
}
Write-Host "✅ Supabase CLI instalado: $supabaseVersion" -ForegroundColor Green
Write-Host ""

# Verificar se está logado
Write-Host "🔐 Verificando login..." -ForegroundColor Yellow
$loginCheck = supabase projects list 2>&1
if ($loginCheck -match "not logged in") {
    Write-Host "❌ Você não está logado no Supabase!" -ForegroundColor Red
    Write-Host "   Execute: supabase login" -ForegroundColor White
    exit 1
}
Write-Host "✅ Login verificado" -ForegroundColor Green
Write-Host ""

# Verificar se o projeto está linkado
Write-Host "🔗 Verificando link do projeto..." -ForegroundColor Yellow
if (-not (Test-Path ".\.supabase\config.toml")) {
    Write-Host "❌ Projeto não está linkado!" -ForegroundColor Red
    Write-Host "   Execute: supabase link --project-ref hxdfbwptgtthaqddneyr" -ForegroundColor White
    exit 1
}
Write-Host "✅ Projeto linkado" -ForegroundColor Green
Write-Host ""

# Perguntar pela chave da API do Google Maps
Write-Host "🔑 Configuração da API do Google Maps" -ForegroundColor Cyan
Write-Host ""
Write-Host "Você já configurou a chave GOOGLE_MAPS_API_KEY?" -ForegroundColor Yellow
Write-Host "1. Sim, já configurei"
Write-Host "2. Não, quero configurar agora"
Write-Host "3. Pular esta etapa"
Write-Host ""
$choice = Read-Host "Escolha uma opção (1-3)"

switch ($choice) {
    "2" {
        Write-Host ""
        Write-Host "⚠️  MUDANÇA DE CONFIGURAÇÃO:" -ForegroundColor Yellow
        Write-Host "   A configuração agora é feita via interface web para maior segurança." -ForegroundColor White
        Write-Host "   1. Faça o deploy primeiro (escolha a opção 1 abaixo)" -ForegroundColor White
        Write-Host "   2. Acesse: http://localhost:8080/crm/admin/settings" -ForegroundColor Cyan
        Write-Host "   3. Insira sua chave na aba 'Chaves de API'" -ForegroundColor White
    }
    "3" {
        Write-Host "⚠️  Atenção: A função usará dados de demonstração sem a chave configurada no painel" -ForegroundColor Yellow
    }
}
Write-Host ""

# Deploy da função
Write-Host "🚀 Fazendo deploy da Edge Function..." -ForegroundColor Cyan
supabase functions deploy search-leads-google-maps

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Acesse a página Comercial no sistema"
    Write-Host "   2. Clique em 'Buscar Leads'"
    Write-Host "   3. Preencha os campos de busca"
    Write-Host "   4. Importe os leads encontrados"
    Write-Host ""
    Write-Host "📚 Para mais informações, consulte: GUIA_BUSCA_LEADS_API.md" -ForegroundColor White
}
else {
    Write-Host ""
    Write-Host "❌ Erro no deploy!" -ForegroundColor Red
    Write-Host "   Verifique os logs acima para mais detalhes" -ForegroundColor White
    exit 1
}
