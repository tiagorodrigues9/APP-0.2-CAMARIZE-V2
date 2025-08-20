# ⚡ Deploy Rápido - Camarize

## 🚀 Deploy em 5 minutos

### **1. Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **2. Deploy do Backend**
```bash
cd api/
vercel --prod
```

### **3. Deploy do Frontend**
```bash
cd front-react/
vercel --prod
```

### **4. Configurar Variáveis de Ambiente**

No dashboard do Vercel, configure:

**Backend (API):**
```
MONGO_URL=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/camarize?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_muito_segura
NODE_ENV=production
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://sua-api.vercel.app
```

### **5. Testar**
- Acesse o frontend
- Teste login e funcionalidades
- Verifique se tudo está funcionando

## 🎯 URLs Finais
- **Frontend**: `https://seu-frontend.vercel.app`
- **Backend**: `https://sua-api.vercel.app`

## 📞 Suporte
- Consulte `DEPLOY_VERCEL.md` para detalhes completos
- Verifique logs no dashboard do Vercel 