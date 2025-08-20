# 🚀 Deploy Camarize no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Conta no MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub/GitLab**: Para conectar o repositório

## 🔧 Passo a Passo

### **1. Preparar o Backend (API)**

#### 1.1 Criar projeto no Vercel para a API
```bash
# Na pasta api/
vercel --name camarize-api
```

#### 1.2 Configurar variáveis de ambiente no Vercel
No dashboard do Vercel, vá em **Settings > Environment Variables**:

```
MONGO_URL=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/camarize?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_segura
```

#### 1.3 Deploy da API
```bash
cd api/
vercel --prod
```

### **2. Preparar o Frontend**

#### 2.1 Configurar variáveis de ambiente
No dashboard do Vercel, vá em **Settings > Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://camarize-api.vercel.app
```

#### 2.2 Deploy do Frontend
```bash
cd front-react/
vercel --prod
```

### **3. Configurações Finais**

#### 3.1 CORS no Backend
Certifique-se de que o CORS está configurado para aceitar o domínio do frontend:

```javascript
// Em api/index.js
app.use(cors({
  origin: ['https://camarize-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

#### 3.2 Testar a Aplicação
1. Acesse o frontend: `https://camarize-frontend.vercel.app`
2. Teste o login e funcionalidades
3. Verifique se a API está respondendo

## 🔗 URLs Finais

- **Frontend**: `https://camarize-frontend.vercel.app`
- **Backend**: `https://camarize-api.vercel.app`

## 🛠️ Troubleshooting

### Erro de CORS
- Verifique se o domínio do frontend está na lista de origens permitidas
- Teste com `origin: '*'` temporariamente

### Erro de Conexão com MongoDB
- Verifique se a string de conexão está correta
- Confirme se o IP do Vercel está liberado no MongoDB Atlas

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js versão está correta

## 📊 Monitoramento

### Vercel Analytics
- Ative o Vercel Analytics para monitorar performance
- Configure alertas para erros

### MongoDB Atlas
- Monitore o uso do banco de dados
- Configure alertas para uso de recursos

## 🔒 Segurança

### Variáveis de Ambiente
- Nunca commite senhas no código
- Use variáveis de ambiente do Vercel
- Rotacione chaves JWT regularmente

### MongoDB Atlas
- Configure IPs específicos para produção
- Use usuários com permissões mínimas
- Ative autenticação de dois fatores

## 🚀 Próximos Passos

1. **Configurar domínio personalizado**
2. **Implementar CDN**
3. **Configurar backup automático**
4. **Monitoramento avançado**
5. **CI/CD pipeline**

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs) 