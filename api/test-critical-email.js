import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviço de email
import emailService from './services/emailService.js';

async function sendCriticalTestEmail() {
  try {
    const to = process.env.TEST_EMAIL_TO || 'joaooficialkusaka@gmail.com';

    const alertData = {
      id: `test_critical_${Date.now()}`,
      tipo: 'amonia',
      cativeiro: 'TEST',
      cativeiroNome: 'Cativeiro de Teste',
      valorAtual: '0.2mg/L',
      valorIdeal: '0.5mg/L',
      diferenca: 0.3,
      mensagem: 'Nível de amônia em estado crítico! Atual: 0.2mg/L, Ideal: 0.5mg/L',
      datahora: new Date(),
      severidade: 'alta'
    };

    console.log('📧 Enviando e-mail crítico de teste para:', to);
    const result = await emailService.sendAlertEmail(to, alertData);

    if (result.success) {
      console.log('✅ Email crítico enviado com sucesso!');
      console.log('   - Message ID:', result.messageId);
    } else {
      console.error('❌ Falha ao enviar email crítico:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro inesperado no teste crítico:', error);
    process.exit(1);
  }
}

sendCriticalTestEmail();


