# 📧 Sistema de Alertas por Email - Camarize

## 🚀 Funcionalidade Implementada

O Camarize agora suporta **alertas por email** além das notificações push, permitindo que os usuários recebam alertas importantes diretamente no seu email quando parâmetros saírem do ideal!

## ✨ Recursos Implementados

### 🔔 **Alertas Automáticos**
- ✅ Envio automático de emails quando parâmetros saem do ideal
- ✅ Templates HTML responsivos e profissionais
- ✅ Diferentes níveis de severidade (baixa, média, alta)
- ✅ Informações detalhadas do cativeiro e parâmetros

### ⚙️ **Configurações Personalizáveis**
- ✅ Ativar/desativar alertas por email
- ✅ Configurar tipos de alerta (temperatura, pH, amônia)
- ✅ Definir níveis de severidade por tipo
- ✅ Horários de silêncio (não enviar emails em horários específicos)
- ✅ Limite de frequência (máximo de emails por hora/dia)

### 📧 **Templates Profissionais**
- ✅ Design responsivo e moderno
- ✅ Cores diferentes por severidade
- ✅ Informações detalhadas do alerta
- ✅ Botão de ação direta para o sistema
- ✅ Versão texto para compatibilidade

### 🛡️ **Controles de Segurança**
- ✅ Verificação de frequência para evitar spam
- ✅ Horários de silêncio configuráveis
- ✅ Validação de configurações
- ✅ Logs detalhados de envio

## 📋 Como Configurar

### 1. **Configuração do Email (Gmail)**

#### Criar Conta de App Gmail:
1. Acesse [Google Account Settings](https://myaccount.google.com/)
2. Vá em "Segurança" → "Verificação em duas etapas"
3. Ative a verificação em duas etapas
4. Vá em "Senhas de app"
5. Crie uma nova senha para "Camarize"
6. Use essa senha no arquivo `.env`

#### Configurar Variáveis de Ambiente:
```env
# Email Configuration
EMAIL_USER=camarize.alertas@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail
FRONTEND_URL=http://localhost:3000
```

### 2. **Instalar Dependências**
```bash
cd api
npm install nodemailer
```

### 3. **Verificar Configuração**
```bash
# Testar conexão com serviço de email
curl -X GET http://localhost:4000/email/status
```

## 🔧 Endpoints da API

### **Configurações de Email**

#### GET `/email/settings`
**Descrição:** Obter configurações de email do usuário
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "success": true,
  "emailSettings": {
    "emailEnabled": true,
    "emailAddress": "usuario@email.com",
    "alertTypes": {
      "temperatura": {
        "enabled": true,
        "severity": {
          "baixa": false,
          "media": true,
          "alta": true
        }
      }
    },
    "quietHours": {
      "enabled": false,
      "startTime": "22:00",
      "endTime": "07:00"
    },
    "frequency": {
      "maxEmailsPerHour": 5,
      "maxEmailsPerDay": 20
    }
  }
}
```

#### PUT `/email/settings`
**Descrição:** Atualizar configurações de email
**Autenticação:** Obrigatória

**Body:**
```json
{
  "emailEnabled": true,
  "emailAddress": "novo@email.com",
  "alertTypes": {
    "temperatura": {
      "enabled": true,
      "severity": {
        "baixa": false,
        "media": true,
        "alta": true
      }
    }
  },
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00"
  }
}
```

### **Testes e Status**

#### POST `/email/test`
**Descrição:** Enviar email de teste
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "success": true,
  "message": "Email de teste enviado com sucesso",
  "messageId": "abc123..."
}
```

#### GET `/email/status`
**Descrição:** Verificar status do serviço de email
**Autenticação:** Obrigatória

**Resposta (200):**
```json
{
  "success": true,
  "emailServiceStatus": "connected",
  "message": "Serviço de email funcionando"
}
```

## 📧 Template de Email

### **Estrutura do Email:**
- 🦐 **Header** com logo do Camarize
- 🚨 **Alerta** com cor e ícone baseado na severidade
- 📊 **Parâmetros** atuais vs ideais
- 💬 **Mensagem** detalhada do problema
- 🔗 **Botão de ação** para acessar o sistema
- 📅 **Data/hora** do alerta
- 📝 **Footer** com informações do sistema

### **Cores por Severidade:**
- 🔴 **Alta:** Vermelho (#dc2626)
- 🟡 **Média:** Amarelo (#f59e0b)
- 🟢 **Baixa:** Verde (#10b981)

## ⚙️ Configurações Avançadas

### **Horários de Silêncio**
```json
{
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "07:00"
  }
}
```

### **Limites de Frequência**
```json
{
  "frequency": {
    "maxEmailsPerHour": 5,
    "maxEmailsPerDay": 20
  }
}
```

### **Tipos de Alerta**
```json
{
  "alertTypes": {
    "temperatura": {
      "enabled": true,
      "severity": {
        "baixa": false,
        "media": true,
        "alta": true
      }
    },
    "ph": {
      "enabled": true,
      "severity": {
        "baixa": false,
        "media": true,
        "alta": true
      }
    },
    "amonia": {
      "enabled": true,
      "severity": {
        "baixa": false,
        "media": true,
        "alta": true
      }
    }
  }
}
```

## 🔍 Logs e Monitoramento

### **Logs de Envio:**
```
✅ Email de alerta enviado para usuario@email.com: abc123...
⏭️ Email pulado para usuario@email.com - configurações não atendidas
🌙 Email pulado para usuario@email.com - horário de silêncio
⏰ Email pulado para usuario@email.com - limite de frequência atingido
❌ Erro ao enviar email para usuario@email.com: Invalid credentials
```

### **Métricas:**
- 📊 Total de emails enviados
- 📈 Taxa de entrega
- ⏱️ Tempo médio de envio
- 🚫 Emails bloqueados por configurações

## 🚨 Troubleshooting

### **Problemas Comuns:**

#### "Erro de autenticação Gmail"
1. Verifique se a verificação em duas etapas está ativa
2. Confirme se a senha de app está correta
3. Verifique se o email está correto

#### "Emails não chegam"
1. Verifique a pasta de spam
2. Confirme as configurações de email
3. Teste com email de teste

#### "Muitos emails sendo enviados"
1. Ajuste os limites de frequência
2. Configure horários de silêncio
3. Revise as configurações de severidade

### **Debug:**
```bash
# Verificar status do serviço
curl -X GET http://localhost:4000/email/status

# Enviar email de teste
curl -X POST http://localhost:4000/email/test \
  -H "Authorization: Bearer SEU_TOKEN"

# Verificar logs do servidor
tail -f api/logs/app.log
```

## 🎯 Próximos Passos

### **Melhorias Futuras:**
- [ ] Suporte a outros provedores de email (Outlook, Yahoo)
- [ ] Templates personalizáveis
- [ ] Relatórios de email
- [ ] Integração com SMS
- [ ] Alertas por WhatsApp
- [ ] Dashboard de métricas de email

### **Integração com Frontend:**
- [ ] Interface de configuração de email
- [ ] Teste de email na interface
- [ ] Histórico de emails enviados
- [ ] Configurações avançadas

---

## 📞 Suporte

Para problemas ou dúvidas sobre o sistema de alertas por email:
- 📧 Email: suporte@camarize.com
- 📱 WhatsApp: (XX) XXXXX-XXXX
- 🌐 Site: www.camarize.com/suporte

---

**🎉 Resultado:** Agora o Camarize envia alertas profissionais por email, mantendo os produtores sempre informados sobre o status dos seus cativeiros! 🚀
