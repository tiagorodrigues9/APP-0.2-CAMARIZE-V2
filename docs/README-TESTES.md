# 🧪 Testes Essenciais da API

Esta pasta contém os arquivos de teste essenciais da API, mantendo apenas os mais importantes para desenvolvimento e debug.

## 📁 Arquivos de Teste Essenciais

### 🔧 Testes de Status e Conectividade
- **`test-api-status.js`** - Verifica se todos os endpoints da API estão funcionando
- **`quick-test.js`** - Teste rápido de conectividade com a API
- **`debug-database-connection.js`** - Debug completo da conexão com MongoDB

### 📊 Scripts de Dados Essenciais
- **`populate-parametros.js`** - Popula dados de parâmetros para o dashboard funcionar
- **`populate-specific-cativeiros.js`** - Adiciona parâmetros manualmente (interativo)
- **`clear-mock-parametros.js`** - Limpa dados de parâmetros existentes
- **`check-condicoes-ideais.js`** - Verifica configurações de condições ideais
- **`view-parametros.js`** - Visualiza dados de parâmetros no banco

### 🔍 Testes de Funcionalidade Core
- **`test-sensor-cativeiro.js`** - Teste básico de relacionamento sensor-cativeiro
- **`test-cativeiros-status.js`** - Verifica status dos cativeiros

### 📚 Documentação
- **`README-TESTES.md`** - Este arquivo - documentação dos testes
- **`README-API.md`** - Documentação completa da API

## 🚀 Como Executar

### Via npm scripts (recomendado)
```bash
# Teste de status da API
npm run test-api

# Debug completo do sistema
npm run debug

# Teste de relacionamento sensor-cativeiro
npm run test-sensor

# Teste de status dos cativeiros
npm run test-cativeiros

# Teste rápido
npm run quick-test
```

### Via Node diretamente
```bash
# Testes de conectividade
node tests/test-api-status.js
node tests/quick-test.js
node tests/debug-database-connection.js

# Scripts de dados
node tests/populate-parametros.js
node tests/populate-specific-cativeiros.js
node tests/clear-mock-parametros.js
node tests/check-condicoes-ideais.js
node tests/view-parametros.js

# Testes de funcionalidade
node tests/test-sensor-cativeiro.js
node tests/test-cativeiros-status.js
```

## 📝 Script Interativo de Adição Manual

### **`populate-specific-cativeiros.js`** - Adicionar Parâmetros Manualmente

Este script permite adicionar registros de parâmetros de forma interativa:

1. **Lista cativeiros disponíveis** no banco
2. **Permite escolher** qual cativeiro
3. **Solicita valores** de temperatura, pH e amônia
4. **Confirma dados** antes de inserir
5. **Permite adicionar múltiplos** registros

#### Como usar:
```bash
npm run populate-specific-cativeiros
# ou
node tests/populate-specific-cativeiros.js
```

#### Exemplo de uso:
```
🔍 Adicionando parâmetros manualmente...
✅ Conexão com MongoDB estabelecida!
📋 Encontrados 3 cativeiros

🏠 Cativeiros disponíveis:
   1. Cativeiro A - Camarão Branco (Camarão Branco)
   2. Cativeiro B - Camarão Rosa (Camarão Rosa)
   3. Cativeiro C - Teste (Camarão Branco)

📝 Escolha o número do cativeiro: 1
✅ Cativeiro selecionado: Cativeiro A - Camarão Branco

📊 Insira os valores dos parâmetros:
🌡️ Temperatura (°C): 28.5
🧪 pH: 7.8
⚗️ Amônia (mg/L): 0.25

📋 Dados a serem inseridos:
   Cativeiro: Cativeiro A - Camarão Branco
   Temperatura: 28.5°C
   pH: 7.8
   Amônia: 0.25 mg/L
   Data/Hora: 15/12/2024, 14:30:25

❓ Confirmar inserção? (s/n): s
✅ Parâmetro inserido com sucesso!
📊 ID do registro: 507f1f77bcf86cd799439011

❓ Adicionar mais um registro? (s/n): n
🎉 Processo finalizado!
```

## 📊 Tipos de Teste

### 1. **Testes de Status e Conectividade**
Verificam se a infraestrutura está funcionando:
- Status dos endpoints da API
- Conexão com MongoDB
- Disponibilidade dos serviços

### 2. **Scripts de Dados Essenciais**
Geram e verificam dados necessários:
- Dados de parâmetros para o dashboard
- Configurações de condições ideais
- Visualização de dados no banco

### 3. **Testes de Funcionalidade Core**
Testam funcionalidades principais:
- Relacionamento sensor-cativeiro
- Status dos cativeiros
- Funcionamento básico do sistema

## 🔧 Pré-requisitos

Antes de executar os testes:

1. **API rodando**: `npm start`
2. **MongoDB conectado**: Verificar conexão no `.env`
3. **Dados básicos**: Sensores e cativeiros cadastrados

## 📝 Logs e Debug

Todos os testes geram logs detalhados no console:
- ✅ Sucessos
- ❌ Erros
- 🔍 Informações de debug
- 📊 Estatísticas

## 🚨 Troubleshooting

Se um teste falhar:

1. **Verifique se a API está rodando**
2. **Confirme a conexão com MongoDB**
3. **Verifique se há dados básicos**
4. **Consulte os logs de erro**
5. **Execute o debug completo**: `npm run debug`

## 📈 Ordem Recomendada de Testes

1. **`npm run test-api`** - Verificar se a API está funcionando
2. **`npm run debug`** - Diagnóstico completo
3. **`npm run test-sensor`** - Teste básico de relacionamento
4. **`npm run test-cativeiros`** - Teste de status dos cativeiros

## 🔄 Manutenção

Para adicionar novos testes:

1. Crie o arquivo na pasta `tests/`
2. Adicione o script no `package.json`
3. Documente neste `README.md`
4. Teste a funcionalidade

## 📞 Suporte

Se encontrar problemas:
1. Execute `npm run debug` para diagnóstico
2. Verifique os logs no console
3. Consulte a documentação específica
4. Teste via interface manual 