# Camarize - Sistema de Monitoramento de Camarões

## 📁 Estrutura do Projeto

O projeto foi organizado em pastas específicas para melhor manutenção e organização:

### 📚 **docs/** - Documentação
- `README.md` - Documentação principal do projeto
- `API_README.md` - Documentação da API
- `README-TESTES.md` - Documentação dos testes
- `README-API.md` - Documentação da API (detalhada)
- `EMAIL_SETTINGS_README.md` - Configuração de emails
- `EMAIL_ALERTS_README.md` - Sistema de alertas por email
- `NGROK_SETUP.md` - Configuração do Ngrok
 
- `MONGODB_ATLAS_SETUP.md` - Configuração do MongoDB Atlas
- `README_ESP32.md` - Documentação do ESP32
- E outros arquivos de documentação...

### 🛠️ **scripts/** - Scripts e Testes
- Scripts de inicialização (ngrok, localtunnel)
- Scripts de teste da API
- Scripts de manutenção do banco de dados
- Scripts de configuração
- Arquivos batch (.bat) e PowerShell (.ps1)

### 🧰 **tools/** - Ferramentas e Configurações
- Arquivos de configuração do Ngrok
- Configurações do Docker
 
- Executáveis e arquivos de ferramentas

### 🚀 **api/** - Backend da Aplicação
- Controllers, Models, Routes
- Middleware e Services
- Configurações da API

### ⚛️ **front-react/** - Frontend da Aplicação
- Interface React/Next.js
- Componentes e páginas
- Estilos e configurações

## 🚀 Como Executar

### Backend (API)
```bash
cd api
npm install
npm start
```

### Frontend
```bash
cd front-react
npm install
npm run dev
```

### Scripts Úteis
```bash
# Iniciar com Ngrok
cd scripts
node start-ngrok.js

# Iniciar com LocalTunnel
cd scripts
node start-localtunnel.js

# Executar testes
cd scripts
node [nome-do-teste].js
```

## 📋 Pré-requisitos
- Node.js
- MongoDB
- Ngrok (para desenvolvimento)
- Docker (opcional)

## 🔧 Configuração
1. Configure as variáveis de ambiente em `api/env.example`
2. Configure o Ngrok em `tools/ngrok.yml`
3. Configure o Docker em `tools/docker-compose.yml`

## 📖 Documentação
Consulte a pasta `docs/` para documentação detalhada de cada componente do sistema.
