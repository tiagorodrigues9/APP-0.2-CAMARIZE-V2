#!/bin/bash

echo "🚀 Iniciando deploy do Camarize no Vercel..."
echo "=============================================="

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Deploy do Backend
echo ""
echo "📦 Deployando Backend (API)..."
echo "================================"

cd api/

# Verificar se já existe projeto no Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "🔧 Configurando projeto backend no Vercel..."
    vercel --yes
else
    echo "✅ Projeto backend já configurado."
fi

# Deploy da API
echo "🚀 Fazendo deploy da API..."
vercel --prod --yes

# Obter URL da API
API_URL=$(vercel ls | grep "camarize-api" | awk '{print $2}')
echo "✅ API deployada em: $API_URL"

cd ..

# Deploy do Frontend
echo ""
echo "📦 Deployando Frontend..."
echo "=========================="

cd front-react/

# Verificar se já existe projeto no Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "🔧 Configurando projeto frontend no Vercel..."
    vercel --yes
else
    echo "✅ Projeto frontend já configurado."
fi

# Deploy do Frontend
echo "🚀 Fazendo deploy do Frontend..."
vercel --prod --yes

# Obter URL do Frontend
FRONTEND_URL=$(vercel ls | grep "camarize-frontend" | awk '{print $2}')
echo "✅ Frontend deployado em: $FRONTEND_URL"

cd ..

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "================================"
echo "🌐 Frontend: $FRONTEND_URL"
echo "🔧 API: $API_URL"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no Vercel"
echo "2. Teste o login e funcionalidades"
echo "3. Configure domínio personalizado (opcional)"
echo ""
echo "📖 Consulte o arquivo DEPLOY_VERCEL.md para mais detalhes." 