# 🔧 Solução: Limite de Sessões do ngrok

## ❌ Problema Encontrado

A conta gratuita do ngrok **limita a 1 sessão simultânea**, mas estávamos tentando criar 2 túneis separados:

```
ERROR: Your account is limited to 1 simultaneous ngrok agent sessions.
```

## ✅ Solução Implementada

### 🎯 **Usar 1 sessão com múltiplos túneis**

Em vez de criar 2 sessões separadas, agora usamos **1 sessão** com **2 túneis**:

```yaml
# ngrok.yml
version: "2"
authtoken: SEU_TOKEN_AQUI
tunnels:
  api:
    addr: 4000
    proto: http
  frontend:
    addr: 3000
    proto: http
```

### 🚀 **Comando correto:**

```bash
# ✅ CORRETO: 1 sessão, múltiplos túneis
ngrok start --all --config ngrok.yml

# ❌ INCORRETO: Múltiplas sessões
ngrok http 4000
ngrok http 3000
```

## 📋 Scripts Atualizados

### **Script Principal (Recomendado):**
```bash
npm run start-simple
```
- ✅ API (porta 4000)
- ✅ Frontend (porta 3000)
- ✅ ngrok com 2 túneis (1 sessão)

### **Script Individual:**
```bash
npm run start-ngrok-single
```
- ✅ Inicia apenas o ngrok com 2 túneis

## 📱 URLs Geradas

Após executar, você verá algo como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:4000
Forwarding    https://def456.ngrok.io -> http://localhost:3000
```

- **API**: `https://abc123.ngrok.io`
- **Frontend**: `https://def456.ngrok.io`

## ⚠️ Limitações da Conta Gratuita

- **1 sessão simultânea** ✅ (Resolvido)
- **40 conexões/minuto** por túnel
- **URLs temporárias** (mudam a cada reinicialização)
- **Sem subdomínios personalizados**

## 🎉 Resultado

Agora você pode acessar tanto a API quanto o Frontend pelo celular usando URLs diferentes do ngrok! 📱
