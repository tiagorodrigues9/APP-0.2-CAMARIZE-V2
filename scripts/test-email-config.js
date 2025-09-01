import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviços
import emailService from './services/emailService.js';

async function testEmailConfig() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    console.log('\n🔧 Verificando configurações atuais:');
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n❌ Configurações de email não encontradas');
      console.log('\n💡 SOLUÇÕES:');
      console.log('1. Ative 2-Step Verification na sua conta Google');
      console.log('2. Gere uma senha de app em: https://myaccount.google.com/apppasswords');
      console.log('3. Adicione no arquivo .env:');
      console.log('   EMAIL_USER=camarize.alertas@gmail.com');
      console.log('   EMAIL_PASS=sua_senha_de_app_gerada');
      console.log('   ENABLE_AUTO_MONITORING=true');
      return;
    }

    console.log('\n📧 Testando envio de email...');

    const result = await emailService.sendTestEmail('joaooficialkusaka@gmail.com');
    console.log('✅ Email enviado com sucesso!');
    console.log('   - Message ID:', result.messageId);
    console.log('   - Verifique sua caixa de entrada: joaooficialkusaka@gmail.com');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 ERRO DE AUTENTICAÇÃO:');
      console.log('   - Verifique se a senha de app está correta');
      console.log('   - Certifique-se de que 2-Step Verification está ativada');
      console.log('   - Acesse: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 ERRO DE CONEXÃO:');
      console.log('   - Verifique sua conexão com a internet');
      console.log('   - O Gmail pode estar temporariamente indisponível');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

testEmailConfig();
