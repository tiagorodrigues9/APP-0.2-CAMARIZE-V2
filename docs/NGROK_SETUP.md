# 🚀 Configuração do ngrok para Acesso Externo

Este guia te ajudará a configurar o ngrok para acessar sua aplicação Camarize pelo celular ou qualquer dispositivo externo.

## 📋 Pré-requisitos

1. **Conta no ngrok**: Crie uma conta gratuita em [https://ngrok.com](https://ngrok.com)
2. **Auth Token**: Obtenha seu token em [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

## 🛠️ Configuração Automática

### 1. Execute o script de configuração:
```bash
npm run setup-ngrok
```

### 2. Configure seu auth token:
Edite o arquivo `ngrok.yml` e substitua `YOUR_AUTH_TOKEN_HERE` pelo seu token real.

## 🚀 Como Usar

### Opção 1: Apenas API (Recomendado para testes)
```bash
# Terminal 1: Inicie a API
npm run dev-api

# Terminal 2: Inicie o túnel ngrok para a API
npm run start-ngrok-api
```

### Opção 2: Apenas Frontend
```bash
# Terminal 1: Inicie o frontend
npm run dev-front

# Terminal 2: Inicie o túnel ngrok para o frontend
npm run start-ngrok-front
```

### Opção 3: Ambos simultaneamente
```bash
# Terminal 1: Inicie API e Frontend
npm run dev-both

# Terminal 2: Inicie túneis ngrok para ambos
npm run start-ngrok-both
```

## 📱 Acessando pelo Celular

Após iniciar o ngrok, você verá uma URL como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:4000
```

Use essa URL no seu celular para acessar a aplicação!

## 🔧 Configuração Manual (Alternativa)

Se preferir configurar manualmente:

### 1. Instalar ngrok:
```bash
npm install -g ngrok
```

### 2. Autenticar:
```bash
ngrok authtoken SEU_TOKEN_AQUI
```

### 3. Criar túnel:
```bash
# Para API (porta 4000)
ngrok http 4000

# Para Frontend (porta 3000)
ngrok http 3000
```

## 📊 URLs de Acesso

- **API**: `https://[subdomain].ngrok.io` (porta 4000)
- **Frontend**: `https://[subdomain].ngrok.io` (porta 3000)

## 🔍 Verificando se está funcionando

### API:
```bash
curl https://[subdomain].ngrok.io/
# Deve retornar: {"message":"🚀 API Camarize funcionando!","status":"online",...}
```

### Frontend:
Acesse a URL no navegador do celular e verifique se a página carrega.

## ⚠️ Importante

1. **URLs temporárias**: As URLs do ngrok mudam a cada reinicialização (na versão gratuita)
2. **Limite de conexões**: A versão gratuita tem limite de 40 conexões/minuto
3. **Segurança**: As URLs são públicas, use apenas para desenvolvimento/testes
4. **CORS**: A API já está configurada para aceitar conexões externas

## 🐛 Solução de Problemas

### Erro: "tunnel not found"
- Verifique se o ngrok está rodando
- Confirme se a porta está correta (4000 para API, 3000 para Frontend)

### Erro: "authtoken not found"
- Execute: `ngrok authtoken SEU_TOKEN_AQUI`

### Erro de CORS no celular
- Verifique se a API está aceitando a origem do ngrok
- A API já está configurada para aceitar origens externas

### Aplicação não carrega no celular
- Verifique se ambos os serviços (API e Frontend) estão rodando
- Confirme se as URLs estão corretas
- Teste primeiro no navegador do computador

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do ngrok
2. Confirme se os serviços estão rodando nas portas corretas
3. Teste a conectividade local primeiro
