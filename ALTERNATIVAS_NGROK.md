# Alternativas para URLs Fixas com "Camarize"

## 🎯 **Objetivo:** URLs fixas como `camarize-api.xyz` e `camarize-frontend.xyz`

## 📋 **Opções:**

### 1. **Ngrok Pro** (Pago - $8/mês)
```bash
# Com conta paga, você pode usar:
camarize-api.ngrok.io
camarize-frontend.ngrok.io
```

### 2. **Cloudflare Tunnel** (Gratuito)
```bash
# Instalar cloudflared
# URLs: camarize-api.trycloudflare.com
```

### 3. **LocalTunnel** (Gratuito)
```bash
npm install -g localtunnel
lt --port 4000 --subdomain camarize-api
lt --port 3000 --subdomain camarize-frontend
```

### 4. **Serveo** (Gratuito)
```bash
ssh -R camarize-api:80:localhost:4000 serveo.net
ssh -R camarize-frontend:80:localhost:3000 serveo.net
```

### 5. **PageKite** (Gratuito)
```bash
# URLs: camarize-api.pagekite.me
```

## 🚀 **Recomendação:**

**Para desenvolvimento:** Use LocalTunnel (gratuito)
**Para produção:** Use Ngrok Pro (pago)

## 📝 **Como implementar LocalTunnel:**

```bash
# Instalar
npm install -g localtunnel

# Iniciar túneis
lt --port 4000 --subdomain camarize-api
lt --port 3000 --subdomain camarize-frontend
```

## 💡 **Vantagens do LocalTunnel:**
- ✅ Gratuito
- ✅ URLs fixas
- ✅ Sem limite de conexões
- ✅ Fácil de usar
