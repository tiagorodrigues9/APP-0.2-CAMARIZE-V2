import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviços
import emailService from './services/emailService.js';
import monitoringService from './services/monitoringService.js';

async function testEmail() {
  try {
    if (process.env.MONGO_URL) {
      console.log('🔌 Conectando ao MongoDB...');
      await mongoose.connect(process.env.MONGO_URL);
      console.log('✅ Conectado ao MongoDB');
    } else {
      console.log('ℹ️  MONGO_URL não definido. Pulando conexão com o MongoDB para o teste de email.');
    }

    console.log('\n🔧 Verificando configurações:');
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('   - ENABLE_AUTO_MONITORING:', process.env.ENABLE_AUTO_MONITORING);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n❌ Configurações de email não encontradas no .env');
      console.log('   Adicione ao arquivo .env:');
      console.log('   EMAIL_USER=camarize.alertas@gmail.com');
      console.log('   EMAIL_PASS=sua_senha_de_app_do_gmail');
      return;
    }

    console.log('\n📧 Testando envio de email...');
    const result = await emailService.sendTestEmail('joaooficialkusaka@gmail.com');
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
      console.log('   - Message ID:', result.messageId);
    } else {
      console.log('❌ Falha ao enviar email:', result.error);
    }

    console.log('\n🔍 Testando monitoramento...');
    const status = monitoringService.getStatus();
    console.log('   - Status do monitoramento:', status);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Dica: Verifique se a senha de app do Gmail está correta');
      console.log('   - Acesse: https://myaccount.google.com/apppasswords');
      console.log('   - Gere uma senha de app para o email camarize.alertas@gmail.com');
    }
  } finally {
    if (mongoose.connection?.readyState === 1) {
      await mongoose.disconnect();
      console.log('\n🔌 Desconectado do MongoDB');
    }
  }
}

testEmail();
