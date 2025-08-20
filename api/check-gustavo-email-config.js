import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos e serviços
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import EmailSettings from './models/EmailSettings.js';
import emailService from './services/emailService.js';

async function checkGustavoEmailConfig() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Verificar configurações de email do sistema
    console.log('\n📧 Configurações do sistema:');
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('   - FRONTEND_URL:', process.env.FRONTEND_URL);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Configurações de email não encontradas no .env');
      return;
    }

    // Buscar usuário Gustavo
    const userEmail = 'gustavo.marques@planoangelus.com.br';
    const user = await Users.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuário Gustavo não encontrado:', userEmail);
      return;
    }

    console.log('\n👤 Usuário encontrado:', user.nome);
    console.log('📧 Email:', user.email);

    // Verificar configurações de email
    let emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (!emailSettings) {
      console.log('\n❌ Configurações de email não encontradas');
      console.log('📧 Criando configurações de email para o Gustavo...');
      
      emailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: userEmail,
        emailEnabled: true
      });
      await emailSettings.save();
      console.log('✅ Configurações de email criadas');
    } else {
      console.log('\n📧 Configurações de email encontradas:');
      console.log('   - Email configurado:', emailSettings.emailAddress);
      console.log('   - Alertas habilitados:', emailSettings.emailEnabled);
      console.log('   - Tipos de alerta habilitados:', Object.keys(emailSettings.alertTypes).filter(tipo => emailSettings.alertTypes[tipo].enabled));
    }

    // Buscar cativeiros do Gustavo
    const cativeiros = await Cativeiros.find({ user: user._id });
    console.log(`\n🏠 Cativeiros do Gustavo encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado para o Gustavo');
      return;
    }

    for (const cativeiro of cativeiros) {
      console.log(`   - ${cativeiro.nome} (ID: ${cativeiro._id})`);
    }

    // Testar envio de email diretamente
    console.log('\n📧 Testando envio de email diretamente...');
    
    const testEmailData = {
      tipo: 'temperatura',
      cativeiro: cativeiros[0]._id,
      cativeiroNome: cativeiros[0].nome,
      valorAtual: '35°C',
      valorIdeal: '26°C',
      diferenca: 9,
      mensagem: 'Temperatura em estado crítico! Atual: 35°C, Ideal: 26°C',
      datahora: new Date(),
      severidade: 'alta'
    };

    const result = await emailService.sendAlertEmail(userEmail, testEmailData);
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
      console.log('   - Message ID:', result.messageId);
      console.log('   - Email:', result.email);
    } else {
      console.log('❌ Erro ao enviar email:', result.error);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

checkGustavoEmailConfig();
