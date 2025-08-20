# 📧 Configurações de Email - Camarize

## Visão Geral

Implementamos um sistema completo de configurações de email que permite aos usuários personalizar como e quando receber notificações por email sobre alertas dos cativeiros.

## 🚀 Funcionalidades Implementadas

### 1. **Configurações de Frequência**
- **Máximo de emails por hora**: Controla quantos emails podem ser enviados em uma hora
- **Máximo de emails por dia**: Define o limite diário de emails
- **Intervalo mínimo entre emails**: Tempo mínimo (em minutos) entre dois emails consecutivos

### 2. **Modo Silêncio (Quiet Hours)**
- **Ativar/Desativar**: Habilita ou desabilita o modo silêncio
- **Horário de início**: Define quando o modo silêncio começa (formato HH:MM)
- **Horário de fim**: Define quando o modo silêncio termina (formato HH:MM)
- **Suporte a horário noturno**: Funciona corretamente quando o horário cruza a meia-noite

### 3. **Tipos de Alerta**
- **Temperatura**: Configurar alertas para temperatura
- **pH**: Configurar alertas para pH
- **Amônia**: Configurar alertas para amônia
- **Severidade**: Para cada tipo, configurar quais severidades (baixa, média, alta) devem gerar emails

### 4. **Configurações Gerais**
- **Ativar/Desativar emails**: Habilita ou desabilita todas as notificações por email
- **Email de destino**: Endereço de email para receber os alertas
- **Validação de email**: Verifica se o email é válido antes de salvar

## 🛠️ Como Usar

### Frontend

1. **Acessar configurações**:
   - Vá para `/settings`
   - Clique em "Configurações de Email"

2. **Configurar frequência**:
   - Defina o máximo de emails por hora (0-60)
   - Defina o máximo de emails por dia (0-100)
   - Configure o intervalo mínimo entre emails (0-60 minutos)

3. **Configurar modo silêncio**:
   - Ative o modo silêncio
   - Defina o horário de início (ex: 22:00)
   - Defina o horário de fim (ex: 07:00)

4. **Configurar tipos de alerta**:
   - Para cada tipo (temperatura, pH, amônia):
     - Ative/desative o tipo
     - Configure quais severidades devem gerar emails

5. **Testar configurações**:
   - Use o botão "Enviar Email de Teste" para verificar se tudo está funcionando

### Backend

#### Rotas da API

```javascript
// GET /email/settings - Buscar configurações do usuário
GET /api/email/settings

// PUT /email/settings - Atualizar configurações
PUT /api/email/settings

// POST /email/test - Enviar email de teste
POST /api/email/test

// GET /email/status - Verificar status do serviço
GET /api/email/status
```

#### Exemplo de uso da API

```javascript
// Buscar configurações
const response = await fetch('/api/email/settings', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Atualizar configurações
const updateData = {
  emailEnabled: true,
  emailAddress: 'usuario@email.com',
  frequency: {
    maxEmailsPerHour: 5,
    maxEmailsPerDay: 20,
    minIntervalMinutes: 10
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  },
  alertTypes: {
    temperatura: {
      enabled: true,
      severity: { baixa: false, media: true, alta: true }
    }
  }
};

const response = await fetch('/api/email/settings', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});
```

## 📊 Estrutura do Banco de Dados

### Modelo EmailSettings

```javascript
{
  userId: ObjectId,           // Referência ao usuário
  emailEnabled: Boolean,      // Se emails estão habilitados
  emailAddress: String,       // Email de destino
  
  frequency: {
    maxEmailsPerHour: Number,    // Máximo por hora
    maxEmailsPerDay: Number,     // Máximo por dia
    minIntervalMinutes: Number   // Intervalo mínimo
  },
  
  quietHours: {
    enabled: Boolean,         // Se modo silêncio está ativo
    startTime: String,        // Horário de início (HH:MM)
    endTime: String           // Horário de fim (HH:MM)
  },
  
  alertTypes: {
    temperatura: {
      enabled: Boolean,
      severity: {
        baixa: Boolean,
        media: Boolean,
        alta: Boolean
      }
    },
    ph: { /* mesma estrutura */ },
    amonia: { /* mesma estrutura */ }
  },
  
  lastEmailSent: {
    timestamp: Date,
    count: Number
  },
  
  template: {
    language: String,
    includeCharts: Boolean,
    includeActions: Boolean
  }
}
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente

```env
# Configurações de Email
EMAIL_USER=camarize.alertas@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail

# URL do Frontend (para links nos emails)
FRONTEND_URL=https://camarize.vercel.app
```

### Dependências

```json
{
  "nodemailer": "^6.9.0",
  "mongoose": "^7.0.0"
}
```

## 🧪 Testes

Execute o script de teste para verificar se tudo está funcionando:

```bash
cd api
node test-email-settings.js
```

## 🎯 Benefícios

1. **Controle de Spam**: Evita que o usuário receba muitos emails
2. **Respeito ao Horário**: Não envia emails durante o horário de silêncio
3. **Personalização**: Cada usuário pode configurar suas preferências
4. **Flexibilidade**: Pode ativar/desativar tipos específicos de alerta
5. **Validação**: Verifica se o email é válido antes de salvar

## 🔄 Fluxo de Funcionamento

1. **Monitoramento**: O sistema monitora os parâmetros dos cativeiros
2. **Verificação**: Quando há um alerta, verifica as configurações do usuário
3. **Validação**: Verifica se deve enviar email baseado em:
   - Email habilitado
   - Tipo de alerta habilitado
   - Severidade configurada
   - Horário de silêncio
   - Limites de frequência
4. **Envio**: Se todas as condições forem atendidas, envia o email
5. **Registro**: Registra o envio para controle de frequência

## 🚨 Limitações e Considerações

- **Gmail**: Requer senha de app para autenticação
- **Rate Limiting**: Respeita os limites do provedor de email
- **Timezone**: Horários são baseados no timezone do servidor
- **Validação**: Validação de email é básica, não garante entrega

## 📝 Próximos Passos

- [ ] Adicionar suporte a múltiplos emails por usuário
- [ ] Implementar templates personalizados
- [ ] Adicionar relatórios de envio
- [ ] Implementar notificações por SMS
- [ ] Adicionar configurações por cativeiro específico
