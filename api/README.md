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
├── 📁 tests/               # Testes e documentação
├── 📄 index.js             # Ponto de entrada da aplicação
├── 📄 package.json         # Dependências e scripts
├── 📄 .env                 # Variáveis de ambiente
└── 📄 README.md            # Esta documentação
```

## 🚀 Início Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
```bash
npm run create-env
```

### 3. Iniciar aplicação
```bash
npm start
```

## 🔧 Scripts Principais

- **`npm start`** - Inicia a API em desenvolvimento
- **`npm run test-api`** - Verifica se a API está funcionando
- **`npm run debug`** - Diagnóstico completo do sistema

## 📚 Documentação Completa

Para documentação detalhada, consulte:
- **📄 `tests/README-API.md`** - Documentação completa da API
- **📄 `tests/README-TESTES.md`** - Documentação dos testes
- **📄 `tests/TESTE_EDICAO_SENSORES.md`** - Guia de testes específicos

## 🧪 Testes

Execute os testes para verificar se tudo está funcionando:

```bash
# Verificar status da API
npm run test-api

# Debug completo
npm run debug

# Testes específicos
npm run test-sensor
npm run test-multiple
npm run test-edit
```

## 🗄️ Banco de Dados

- **MongoDB Atlas** - Configurado via variável `MONGO_URL` no `.env`
- **Coleções**: users, fazendas, cativeiros, sensores, sensoresxcativeiros, etc.

## 🔐 Autenticação

JWT (JSON Web Tokens) para autenticação de usuários.

## 📞 Suporte

Para problemas ou dúvidas:
1. Execute `npm run debug` para diagnóstico
2. Consulte a documentação em `tests/`
3. Verifique os logs no console

---

**📖 Para documentação completa, consulte `tests/README-API.md`** 