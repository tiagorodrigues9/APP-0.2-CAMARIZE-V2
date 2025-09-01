# 📚 Documentação da API Camarize

## 🌐 Base URL
```
http://localhost:3000
```

## 🔐 Autenticação
A maioria dos endpoints requer autenticação via JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

---

## 👤 Usuários (`/users`)

### POST `/users/user` - Cadastrar Usuário
**Descrição:** Cadastra um novo usuário no sistema.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "foto_perfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fazenda": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso"
}
```

### POST `/users/auth` - Login
**Descrição:** Autentica um usuário e retorna um token JWT.

**Body:**
```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "nome": "João Silva",
    "email": "joao@email.com",
    "foto_perfil": "data:image/jpeg;base64,..."
  }
}
```

### POST `/users/register` - Cadastro Completo
**Descrição:** Cadastra usuário e fazenda em uma única requisição.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "foto_perfil": "data:image/jpeg;base64,...",
  "fazenda": {
    "nome": "Fazenda Camarão Dourado",
    "endereco": "Rua das Palmeiras, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "telefone": "(11) 99999-9999",
    "area_total": 5000,
    "foto_fazenda": "data:image/jpeg;base64,..."
  }
}
```

### GET `/users/me` - Usuário Atual
**Descrição:** Retorna dados do usuário autenticado.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "nome": "João Silva",
  "email": "joao@email.com",
  "foto_perfil": "data:image/jpeg;base64,...",
  "fazenda": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

### GET `/users/:id` - Buscar Usuário por ID
**Descrição:** Retorna dados de um usuário específico.

**Resposta (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "nome": "João Silva",
  "email": "joao@email.com",
  "foto_perfil": "data:image/jpeg;base64,..."
}
```

### PATCH `/users/:id/photo` - Atualizar Foto do Usuário
**Descrição:** Atualiza a foto de perfil do usuário.

**Body:**
```json
{
  "foto_perfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

---

## 🏭 Fazendas (`/fazendas`)

### POST `/fazendas/` - Cadastrar Fazenda
**Descrição:** Cadastra uma nova fazenda.
**Autenticação:** Obrigatória

**Body:**
```json
{
  "nome": "Fazenda Camarão Dourado",
  "endereco": "Rua das Palmeiras, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "telefone": "(11) 99999-9999",
  "area_total": 5000,
  "foto_fazenda": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### GET `/fazendas/` - Listar Todas as Fazendas
**Descrição:** Retorna todas as fazendas cadastradas.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "nome": "Fazenda Camarão Dourado",
    "endereco": "Rua das Palmeiras, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "telefone": "(11) 99999-9999",
    "area_total": 5000
  }
]
```

### GET `/fazendas/:id` - Buscar Fazenda por ID
**Descrição:** Retorna dados de uma fazenda específica.

**Resposta (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "nome": "Fazenda Camarão Dourado",
  "endereco": "Rua das Palmeiras, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "telefone": "(11) 99999-9999",
  "area_total": 5000
}
```

### PATCH `/fazendas/:id/foto` - Atualizar Foto da Fazenda
**Descrição:** Atualiza a foto da fazenda.

**Body:**
```json
{
  "foto_fazenda": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### GET `/fazendas/:id/foto` - Buscar Foto da Fazenda
**Descrição:** Retorna a foto da fazenda.

**Resposta (200):**
```json
{
  "foto_fazenda": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

---

## 🦐 Cativeiros (`/`)

### POST `/cativeiros` - Cadastrar Cativeiro
**Descrição:** Cadastra um novo cativeiro.
**Autenticação:** Obrigatória
**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
nome: "Cativeiro A1"
descricao: "Cativeiro principal para camarões"
capacidade: 10000
fazendaId: "64f8a1b2c3d4e5f6a7b8c9d1"
id_tipo_camarao: "64f8a1b2c3d4e5f6a7b8c9d2"
temp_media_diaria: 26
ph_medio_diario: 7.5
amonia_media_diaria: 0.05
sensorIds: ["64f8a1b2c3d4e5f6a7b8c9d3", "64f8a1b2c3d4e5f6a7b8c9d4"]
foto_cativeiro: [arquivo]
```

### GET `/cativeiros` - Listar Cativeiros
**Descrição:** Retorna todos os cativeiros do usuário autenticado.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "nome": "Cativeiro A1",
    "descricao": "Cativeiro principal para camarões",
    "capacidade": 10000,
    "fazenda": "64f8a1b2c3d4e5f6a7b8c9d1",
    "tipo_camarao": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "nome": "Camarão Branco"
    },
    "condicoes_ideais": {
      "temp_ideal": 26,
      "ph_ideal": 7.5,
      "amonia_ideal": 0.05
    }
  }
]
```

### GET `/cativeiros-status` - Status dos Cativeiros
**Descrição:** Retorna o status geral dos cativeiros.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "total_cativeiros": 5,
  "cativeiros_ativos": 3,
  "cativeiros_inativos": 2,
  "alertas": [
    {
      "cativeiro_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "tipo": "temperatura_alta",
      "mensagem": "Temperatura acima do ideal"
    }
  ]
}
```

### GET `/cativeiros/:id` - Buscar Cativeiro por ID
**Descrição:** Retorna dados de um cativeiro específico.

**Resposta (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
  "nome": "Cativeiro A1",
  "descricao": "Cativeiro principal para camarões",
  "capacidade": 10000,
  "fazenda": "64f8a1b2c3d4e5f6a7b8c9d1",
  "tipo_camarao": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "nome": "Camarão Branco"
  },
  "condicoes_ideais": {
    "temp_ideal": 26,
    "ph_ideal": 7.5,
    "amonia_ideal": 0.05
  },
  "sensores": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "nome": "Sensor de Temperatura",
      "tipo": "temperatura"
    }
  ]
}
```

### GET `/cativeiros/:cativeiroId/sensores` - Sensores do Cativeiro
**Descrição:** Retorna todos os sensores associados a um cativeiro.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "nome": "Sensor de Temperatura",
    "tipo": "temperatura",
    "marca": "Sensortech",
    "modelo": "ST-100"
  }
]
```

### GET `/tipos-camarao` - Tipos de Camarão
**Descrição:** Retorna todos os tipos de camarão disponíveis.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "nome": "Camarão Branco",
    "nome_cientifico": "Litopenaeus vannamei",
    "descricao": "Espécie mais cultivada no Brasil"
  }
]
```

### GET `/condicoes-ideais` - Condições Ideais
**Descrição:** Retorna todas as condições ideais cadastradas.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d6",
    "id_tipo_camarao": "64f8a1b2c3d4e5f6a7b8c9d2",
    "temp_ideal": 26,
    "ph_ideal": 7.5,
    "amonia_ideal": 0.05
  }
]
```

### PUT `/cativeiros/:id` - Atualizar Cativeiro
**Descrição:** Atualiza dados de um cativeiro.
**Autenticação:** Obrigatória
**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
nome: "Cativeiro A1 Atualizado"
descricao: "Cativeiro principal atualizado"
capacidade: 12000
temp_media_diaria: 27
ph_medio_diario: 7.8
amonia_media_diaria: 0.03
foto_cativeiro: [arquivo]
```

### DELETE `/cativeiros/:id` - Deletar Cativeiro
**Descrição:** Remove um cativeiro do sistema.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "message": "Cativeiro removido com sucesso"
}
```

---

## 📡 Sensores (`/`)

### POST `/sensores` - Cadastrar Sensor
**Descrição:** Cadastra um novo sensor.
**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
nome: "Sensor de Temperatura"
tipo: "temperatura"
marca: "Sensortech"
modelo: "ST-100"
descricao: "Sensor para monitoramento de temperatura"
foto_sensor: [arquivo]
```

### GET `/sensores` - Listar Sensores
**Descrição:** Retorna todos os sensores cadastrados.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
    "nome": "Sensor de Temperatura",
    "tipo": "temperatura",
    "marca": "Sensortech",
    "modelo": "ST-100",
    "descricao": "Sensor para monitoramento de temperatura"
  }
]
```

### GET `/sensores/:id` - Buscar Sensor por ID
**Descrição:** Retorna dados de um sensor específico.

**Resposta (200):**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
  "nome": "Sensor de Temperatura",
  "tipo": "temperatura",
  "marca": "Sensortech",
  "modelo": "ST-100",
  "descricao": "Sensor para monitoramento de temperatura"
}
```

### PUT `/sensores/:id` - Atualizar Sensor
**Descrição:** Atualiza dados de um sensor.
**Content-Type:** `multipart/form-data`

**Body (FormData):**
```
nome: "Sensor de Temperatura Atualizado"
tipo: "temperatura"
marca: "Sensortech"
modelo: "ST-200"
descricao: "Sensor atualizado para monitoramento"
foto_sensor: [arquivo]
```

### DELETE `/sensores/:id` - Deletar Sensor
**Descrição:** Remove um sensor do sistema.

**Resposta (200):**
```json
{
  "message": "Sensor removido com sucesso"
}
```

---

## 🔗 Relações Sensores-Cativeiros (`/sensoresxcativeiros`)

### GET `/sensoresxcativeiros/` - Listar Relações
**Descrição:** Retorna todas as relações entre sensores e cativeiros.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
    "id_sensor": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "nome": "Sensor de Temperatura",
      "tipo": "temperatura"
    },
    "id_cativeiro": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
      "nome": "Cativeiro A1"
    }
  }
]
```

### POST `/sensoresxcativeiros/` - Criar Relação
**Descrição:** Cria uma nova relação entre sensor e cativeiro.

**Body:**
```json
{
  "id_sensor": "64f8a1b2c3d4e5f6a7b8c9d3",
  "id_cativeiro": "64f8a1b2c3d4e5f6a7b8c9d5"
}
```

---

## 📊 Parâmetros (`/parametros`)

### POST `/parametros/cadastrar` - Cadastrar Dados dos Sensores
**Descrição:** Endpoint para o ESP32 cadastrar dados dos sensores.

**Body:**
```json
{
  "cativeiroId": "64f8a1b2c3d4e5f6a7b8c9d5",
  "temperatura": 26.5,
  "ph": 7.2,
  "amonia": 0.03,
  "oxigenio": 6.8,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### GET `/parametros/atuais/:cativeiroId` - Dados Atuais
**Descrição:** Retorna os dados atuais de um cativeiro.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "cativeiro": "64f8a1b2c3d4e5f6a7b8c9d5",
  "temperatura": 26.5,
  "ph": 7.2,
  "amonia": 0.03,
  "oxigenio": 6.8,
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "normal"
}
```

### GET `/parametros/historicos/:cativeiroId` - Dados Históricos
**Descrição:** Retorna dados históricos de um cativeiro.
**Autenticação:** Obrigatória

**Query Parameters:**
- `inicio`: Data de início (YYYY-MM-DD)
- `fim`: Data de fim (YYYY-MM-DD)
- `limite`: Número máximo de registros (padrão: 100)

**Resposta (200):**
```json
[
  {
    "temperatura": 26.5,
    "ph": 7.2,
    "amonia": 0.03,
    "oxigenio": 6.8,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  {
    "temperatura": 26.8,
    "ph": 7.1,
    "amonia": 0.04,
    "oxigenio": 6.9,
    "timestamp": "2024-01-15T10:00:00Z"
  }
]
```

### GET `/parametros/dashboard/:cativeiroId` - Dados do Dashboard
**Descrição:** Retorna dados completos para o dashboard.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "cativeiro": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
    "nome": "Cativeiro A1",
    "capacidade": 10000
  },
  "dados_atuais": {
    "temperatura": 26.5,
    "ph": 7.2,
    "amonia": 0.03,
    "oxigenio": 6.8,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "condicoes_ideais": {
    "temp_ideal": 26,
    "ph_ideal": 7.5,
    "amonia_ideal": 0.05
  },
  "status": "normal",
  "alertas": []
}
```

---

## 🔔 Notificações (`/notifications`)

### GET `/notifications/` - Listar Notificações
**Descrição:** Retorna todas as notificações do usuário.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
    "titulo": "Alerta de Temperatura",
    "mensagem": "Temperatura acima do ideal no Cativeiro A1",
    "tipo": "alerta",
    "cativeiro": "64f8a1b2c3d4e5f6a7b8c9d5",
    "timestamp": "2024-01-15T10:30:00Z",
    "lida": false
  }
]
```

### GET `/notifications/cativeiro/:cativeiroId` - Notificações por Cativeiro
**Descrição:** Retorna notificações de um cativeiro específico.
**Autenticação:** Obrigatória

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d8",
    "titulo": "Alerta de Temperatura",
    "mensagem": "Temperatura acima do ideal no Cativeiro A1",
    "tipo": "alerta",
    "cativeiro": "64f8a1b2c3d4e5f6a7b8c9d5",
    "timestamp": "2024-01-15T10:30:00Z",
    "lida": false
  }
]
```

---

## 🦐 Camarões (`/`)

### POST `/camaroes` - Cadastrar Camarão
**Descrição:** Cadastra um novo tipo de camarão.

**Body:**
```json
{
  "nome": "Camarão Branco",
  "nome_cientifico": "Litopenaeus vannamei",
  "descricao": "Espécie mais cultivada no Brasil",
  "tempo_crescimento": 120,
  "peso_medio": 15
}
```

### GET `/camaroes` - Listar Camarões
**Descrição:** Retorna todos os tipos de camarão.

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "nome": "Camarão Branco",
    "nome_cientifico": "Litopenaeus vannamei",
    "descricao": "Espécie mais cultivada no Brasil",
    "tempo_crescimento": 120,
    "peso_medio": 15
  }
]
```

---

## 👥 Relações Usuários-Fazendas (`/usuariosxfazendas`)

### GET `/usuariosxfazendas/` - Listar Relações
**Descrição:** Retorna relações entre usuários e fazendas.

**Query Parameters:**
- `usuario`: ID do usuário (opcional)

**Resposta (200):**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d9",
    "usuario": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fazenda": "64f8a1b2c3d4e5f6a7b8c9d1",
    "tipo_acesso": "proprietario"
  }
]
```

---

## 🧪 Testes (`/test`)

### GET `/test/` - Status da API
**Descrição:** Verifica se a API está funcionando.

**Resposta (200):**
```json
{
  "message": "✅ API funcionando!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "online"
}
```

### POST `/test/test-relacao` - Testar Criação de Relação
**Descrição:** Testa a criação de relação sensor-cativeiro.

**Body:**
```json
{
  "sensorId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "cativeiroId": "64f8a1b2c3d4e5f6a7b8c9d5"
}
```

### GET `/test/test-relacoes` - Listar Relações de Teste
**Descrição:** Lista todas as relações sensor-cativeiro.

**Resposta (200):**
```json
{
  "total": 5,
  "relacoes": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d7",
      "id_sensor": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "nome": "Sensor de Temperatura"
      },
      "id_cativeiro": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "nome": "Cativeiro A1"
      }
    }
  ]
}
```

### GET `/test/test-sensores` - Listar Sensores de Teste
**Descrição:** Lista todos os sensores disponíveis.

### GET `/test/test-cativeiros` - Listar Cativeiros de Teste
**Descrição:** Lista todos os cativeiros disponíveis.

### DELETE `/test/limpar-relacoes/:cativeiroId` - Limpar Relações
**Descrição:** Remove todas as relações de um cativeiro específico.

**Resposta (200):**
```json
{
  "message": "3 relações removidas",
  "deletedCount": 3
}
```

---

## 📝 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro na requisição
- **401**: Não autorizado
- **404**: Não encontrado
- **500**: Erro interno do servidor

---

## 🔧 Exemplos de Uso com cURL

### Login
```bash
curl -X POST https://api-camarize.vercel.app/users/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

### Cadastrar Cativeiro (com autenticação)
```bash
curl -X POST https://api-camarize.vercel.app/cativeiros \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -F "nome=Cativeiro A1" \
  -F "descricao=Cativeiro principal" \
  -F "capacidade=10000" \
  -F "fazendaId=64f8a1b2c3d4e5f6a7b8c9d1" \
  -F "id_tipo_camarao=64f8a1b2c3d4e5f6a7b8c9d2" \
  -F "temp_media_diaria=26" \
  -F "ph_medio_diario=7.5" \
  -F "amonia_media_diaria=0.05" \
  -F "sensorIds=64f8a1b2c3d4e5f6a7b8c9d3" \
  -F "foto_cativeiro=@/caminho/para/foto.jpg"
```

### Buscar Cativeiros
```bash
curl -X GET https://api-camarize.vercel.app/cativeiros \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

### Cadastrar Dados dos Sensores (ESP32)
```bash
curl -X POST https://api-camarize.vercel.app/parametros/cadastrar \
  -H "Content-Type: application/json" \
  -d '{
    "cativeiroId": "64f8a1b2c3d4e5f6a7b8c9d5",
    "temperatura": 26.5,
    "ph": 7.2,
    "amonia": 0.03,
    "oxigenio": 6.8,
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

---

## 📋 Notas Importantes

1. **Autenticação**: A maioria dos endpoints requer autenticação via JWT
2. **Upload de Arquivos**: Use `multipart/form-data` para upload de imagens
3. **CORS**: A API aceita requisições de origens específicas configuradas
4. **Limite de Dados**: O limite para JSON é de 10MB
5. **Timestamps**: Todos os timestamps estão no formato ISO 8601
6. **IDs**: Todos os IDs são ObjectIds do MongoDB

---

## 🚀 Deploy

A API está hospedada no Vercel e pode ser acessada em:
```
https://api-camarize.vercel.app
```

Para desenvolvimento local, a API roda na porta 4000:
```
http://localhost:4000
```
