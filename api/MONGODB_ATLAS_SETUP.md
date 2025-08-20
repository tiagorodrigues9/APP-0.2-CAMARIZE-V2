# Configuração MongoDB Atlas

## Passos para conectar ao MongoDB Atlas

### 1. Criar conta no MongoDB Atlas
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita ou faça login
3. Crie um novo cluster (recomendado: M0 Free Tier)

### 2. Configurar o Cluster
1. Escolha um provedor (AWS, Google Cloud, Azure)
2. Escolha uma região próxima ao seu servidor
3. Selecione o plano M0 (Free Tier)
4. Clique em "Create"

### 3. Configurar Segurança
1. **Database Access**:
   - Vá em "Database Access" no menu lateral
   - Clique em "Add New Database User"
   - Crie um usuário com senha
   - Selecione "Read and write to any database"
   - Clique em "Add User"

2. **Network Access**:
   - Vá em "Network Access" no menu lateral
   - Clique em "Add IP Address"
   - Para desenvolvimento: clique em "Allow Access from Anywhere" (0.0.0.0/0)
   - Para produção: adicione apenas os IPs do seu servidor

### 4. Obter String de Conexão
1. No seu cluster, clique em "Connect"
2. Escolha "Connect your application"
3. Copie a string de conexão
4. Substitua `<username>`, `<password>` e `<database>` pelos seus valores

### 5. Configurar o Projeto
1. Crie um arquivo `.env` na pasta `api/`:
```bash
MONGO_URL=mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/camarize?retryWrites=true&w=majority
PORT=4000
NODE_ENV=development
```

2. Instale as dependências:
```bash
cd api
npm install dotenv
```

### 6. Testar a Conexão
1. Execute a aplicação:
```bash
npm start
```

2. Verifique se aparece a mensagem:
```
✅ MongoDB Atlas conectado com sucesso!
📊 Database: camarize
🌐 Host: seu_cluster.mongodb.net
```

## Exemplo de String de Conexão
```
mongodb+srv://usuario:senha@cluster0.abc123.mongodb.net/camarize?retryWrites=true&w=majority
```

## Troubleshooting

### Erro de Autenticação
- Verifique se o usuário e senha estão corretos
- Certifique-se de que o usuário tem permissões adequadas

### Erro de Rede
- Verifique se o IP está liberado no Network Access
- Para desenvolvimento, use "Allow Access from Anywhere"

### Erro de Timeout
- Verifique se a string de conexão está correta
- Certifique-se de que o cluster está ativo

## Configurações de Produção
Para produção, considere:
- Usar variáveis de ambiente seguras
- Configurar IPs específicos no Network Access
- Usar um usuário com permissões mínimas necessárias
- Configurar backup automático
- Monitorar o uso de recursos 