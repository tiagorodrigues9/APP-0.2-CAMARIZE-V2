# 🚀 API Camarize

API backend para o sistema de monitoramento de camarões.

## 📁 Estrutura do Projeto

```
api/
├── 📁 controllers/          # Controladores da aplicação
├── 📁 middleware/           # Middlewares (Auth, etc.)
├── 📁 models/              # Modelos do MongoDB/Mongoose
├── 📁 routes/              # Rotas da API
├── 📁 services/            # Lógica de negócio
├── 📁 tests/               # 🆕 Testes e debug
├── 📄 index.js             # Ponto de entrada da aplicação
├── 📄 package.json         # Dependências e scripts
├── 📄 .env                 # Variáveis de ambiente
└── 📄 README.md            # Esta documentação
```

## 🚀 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Ou usar o script automático
npm run create-env
```

### 3. Iniciar a aplicação
```bash
# Desenvolvimento (com nodemon)
npm start

# Produção
node index.js
```

## 🔧 Scripts Disponíveis

### 🚀 Execução
- **`npm start`** - Inicia a API em modo desenvolvimento
- **`npm run setup`** - Script de configuração inicial

### 🧪 Testes
- **`npm run test-sensor`** - Teste de relacionamento sensor-cativeiro
- **`npm run test-multiple`** - Teste de múltiplos sensores
- **`npm run test-edit`** - Teste de edição de sensores
- **`npm run debug`** - Diagnóstico completo do sistema
- **`npm run test-api`** - Verificação rápida da API
- **`npm run test-manual`** - Guia para testes manuais
- **`npm run quick-test`** - Teste rápido da API

### ⚙️ Configuração
- **`npm run create-env`** - Cria arquivo .env automaticamente
- **`npm run setup`** - Configuração inicial do MongoDB

## 📊 Endpoints Principais

### 🔐 Autenticação
- `POST /users/register` - Cadastro de usuário
- `POST /users/login` - Login
- `GET /users/profile` - Perfil do usuário

### 🏠 Fazendas
- `GET /fazendas` - Listar fazendas
- `POST /fazendas` - Criar fazenda
- `PUT /fazendas/:id` - Atualizar fazenda
- `DELETE /fazendas/:id` - Deletar fazenda

### 🦐 Cativeiros
- `GET /cativeiros` - Listar cativeiros
- `POST /cativeiros` - Criar cativeiro
- `PUT /cativeiros/:id` - Atualizar cativeiro
- `DELETE /cativeiros/:id` - Deletar cativeiro
- `GET /cativeiros/:id/sensores` - Sensores do cativeiro

### 📡 Sensores
- `GET /sensores` - Listar sensores
- `POST /sensores` - Criar sensor
- `PUT /sensores/:id` - Atualizar sensor
- `DELETE /sensores/:id` - Deletar sensor

### 🔗 Relacionamentos
- `GET /sensoresxcativeiros` - Listar relações sensor-cativeiro
- `POST /sensoresxcativeiros` - Criar relação

### 🧪 Testes
- `GET /test/test-sensores` - Listar sensores para teste
- `GET /test/test-cativeiros` - Listar cativeiros para teste
- `POST /test/test-relacao` - Criar relação de teste
- `GET /test/test-relacoes` - Listar relações de teste
- `DELETE /test/limpar-relacoes/:id` - Limpar relações

## 🗄️ Banco de Dados

### MongoDB Atlas
- **Configuração**: Via variável `MONGO_URL` no `.env`
- **Coleções principais**:
  - `users` - Usuários
  - `fazendas` - Fazendas
  - `cativeiros` - Cativeiros
  - `sensores` - Sensores
  - `sensoresxcativeiros` - Relacionamentos
  - `tiposcamaroes` - Tipos de camarão
  - `condicoesideais` - Condições ideais

### Relacionamentos
- **Usuários ↔ Fazendas**: Via `UsuariosxFazendas`
- **Fazendas ↔ Cativeiros**: Via `FazendasxCativeiros`
- **Sensores ↔ Cativeiros**: Via `SensoresxCativeiros`

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

1. **Login**: Recebe email/senha, retorna token
2. **Proteção**: Middleware `Auth.js` verifica token
3. **Rotas protegidas**: Requerem header `Authorization: Bearer <token>`

## 📝 Logs e Debug

### Console Logs
- ✅ Sucessos
- ❌ Erros
- 🔍 Informações de debug
- 📊 Estatísticas

### Debug Completo
```bash
npm run debug
```

## 🧪 Testes

### Estrutura de Testes
```
tests/
├── 📄 test-sensor-cativeiro.js      # Teste básico
├── 📄 test-multiple-sensors.js      # Múltiplos sensores
├── 📄 test-edit-sensors.js          # Edição
├── 📄 debug-sensor-cativeiro.js     # Debug completo
├── 📄 test-api-status.js            # Status da API
├── 📄 test-manual.js                # Guia manual
├── 📄 quick-test.js                 # Teste rápido
├── 📄 TESTE_EDICAO_SENSORES.md      # Documentação
└── 📄 README.md                     # Documentação dos testes
```

### Executar Testes
```bash
# Verificar se a API está funcionando
npm run test-api

# Debug completo
npm run debug

# Teste específico
npm run test-sensor
npm run test-multiple
npm run test-edit
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **API não inicia**
   - Verificar se MongoDB está conectado
   - Verificar arquivo `.env`
   - Verificar porta 4000 disponível

2. **Erro de conexão MongoDB**
   - Verificar `MONGO_URL` no `.env`
   - Verificar credenciais do Atlas
   - Verificar IP whitelist

3. **Testes falhando**
   - Verificar se API está rodando
   - Executar `npm run debug`
   - Verificar dados de teste

### Logs de Debug
```bash
# Debug completo
npm run debug

# Verificar status da API
npm run test-api

# Teste rápido
npm run quick-test
```

## 🔄 Desenvolvimento

### Adicionar Nova Funcionalidade
1. Criar modelo em `models/`
2. Criar controller em `controllers/`
3. Criar service em `services/`
4. Criar rotas em `routes/`
5. Adicionar testes em `tests/`

### Adicionar Novo Teste
1. Criar arquivo em `tests/`
2. Adicionar script no `package.json`
3. Documentar no `tests/README.md`

## 📞 Suporte

Para problemas ou dúvidas:
1. Execute `npm run debug` para diagnóstico
2. Verifique os logs no console
3. Consulte a documentação específica
4. Teste via interface manual

## 📄 Licença

Este projeto faz parte do sistema Camarize. 