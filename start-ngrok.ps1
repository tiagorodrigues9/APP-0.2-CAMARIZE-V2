# Script PowerShell para iniciar ngrok
Write-Host "🚀 Iniciando ngrok..." -ForegroundColor Green

# Verificar se o ngrok está instalado
try {
    $ngrokVersion = ngrok version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ngrok encontrado" -ForegroundColor Green
    } else {
        throw "Ngrok não encontrado"
    }
} catch {
    Write-Host "❌ Ngrok não encontrado. Instale o ngrok primeiro:" -ForegroundColor Red
    Write-Host "   https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Configuração:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:4000 → https://camarize-api.ngrok.io" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:3000 → https://camarize-frontend.ngrok.io" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pressione Ctrl+C para parar o ngrok" -ForegroundColor Yellow
Write-Host ""

# Iniciar ngrok com configuração fixa
try {
    ngrok start --config ngrok-fixed.yml api frontend
} catch {
    Write-Host "❌ Erro ao iniciar ngrok: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
