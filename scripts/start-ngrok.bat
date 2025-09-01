@echo off
echo 🚀 Iniciando ngrok...

REM Verificar se o ngrok está instalado
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ngrok não encontrado. Instale o ngrok primeiro:
    echo    https://ngrok.com/download
    pause
    exit /b 1
)

echo ✅ Ngrok encontrado
echo.
echo 📋 Configuração:
echo    - API: http://localhost:4000 → https://camarize-api.ngrok.io
echo    - Frontend: http://localhost:3000 → https://camarize-frontend.ngrok.io
echo.
echo 💡 Pressione Ctrl+C para parar o ngrok
echo.

REM Iniciar ngrok com configuração fixa
ngrok start --config ngrok-fixed.yml api frontend

if %errorlevel% neq 0 (
    echo ❌ Erro ao iniciar ngrok
    pause
    exit /b 1
)
