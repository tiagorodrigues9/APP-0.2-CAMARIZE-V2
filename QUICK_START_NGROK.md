# 🚀 Guia Rápido - ngrok para Celular

## ⚡ Comece Agora (4 passos)

### 1️⃣ Configure o Auth Token
1. Crie conta em: https://ngrok.com
2. Pegue seu token em: https://dashboard.ngrok.com/get-started/your-authtoken
3. Edite o arquivo `ngrok.yml` e substitua `YOUR_AUTH_TOKEN_HERE` pelo seu token

### 2️⃣ Instale as Dependências
```bash
npm run install-deps
```

### 3️⃣ Inicie os Serviços
```bash
# Terminal 1: API
npm run dev-api

# Terminal 2: Frontend (opcional)
npm run dev-front
```

### 4️⃣ Inicie o ngrok
```bash
# Terminal 3: Para ambos (recomendado)
npm run start-ngrok-single

# OU para tudo de uma vez
npm run start-simple
```

## 📱 Acesse no Celular

Após iniciar o ngrok, você verá algo como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:4000
```

Use essa URL no seu celular! 🎉

## 🔧 Comandos Úteis

```bash
# Configurar ngrok
npm run setup-ngrok

# Testar configuração
npm run test-ngrok

# 🚀 INICIAR TUDO DE UMA VEZ
npm run start
```

## 📖 Documentação Completa
Consulte: `NGROK_SETUP.md`
