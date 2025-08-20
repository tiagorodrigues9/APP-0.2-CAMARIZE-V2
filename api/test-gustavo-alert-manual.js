import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos e serviços
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import EmailSettings from './models/EmailSettings.js';
import monitoringService from './services/monitoringService.js';

async function testGustavoAlertManual() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário Gustavo
    const userEmail = 'gustavo.marques@planoangelus.com.br';
    const user = await Users.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuário Gustavo não encontrado:', userEmail);
      return;
    }

    console.log('👤 Usuário encontrado:', user.nome);
    console.log('📧 Email:', user.email);

    // Verificar configurações de email
    const emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (!emailSettings) {
      console.log('❌ Configurações de email não encontradas para o Gustavo');
      console.log('📧 Criando configurações de email...');
      
      const newEmailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: userEmail,
        emailEnabled: true
      });
      await newEmailSettings.save();
      console.log('✅ Configurações de email criadas');
    } else {
      console.log('📧 Configurações de email encontradas:');
      console.log('   - Email configurado:', emailSettings.emailAddress);
      console.log('   - Alertas habilitados:', emailSettings.emailEnabled);
    }

    // Buscar cativeiros do Gustavo
    const cativeiros = await Cativeiros.find({ user: user._id });
    console.log(`🏠 Cativeiros do Gustavo encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado para o Gustavo');
      return;
    }

    // Testar envio de alerta para o primeiro cativeiro
    const cativeiro = cativeiros[0];
    console.log(`\n📊 Testando alerta para: ${cativeiro.nome}`);

    // Criar dados de alerta de teste
    const alertData = {
      tipo: 'temperatura',
      cativeiro: cativeiro._id,
      cativeiroNome: cativeiro.nome,
      valorAtual: '35°C',
      valorIdeal: '26°C',
      diferenca: 9,
      mensagem: 'Temperatura em estado crítico! Atual: 35°C, Ideal: 26°C',
      datahora: new Date(),
      severidade: 'alta'
    };

    console.log('📧 Enviando alerta de teste...');
    console.log('   - Tipo:', alertData.tipo);
    console.log('   - Cativeiro:', alertData.cativeiroNome);
    console.log('   - Valor atual:', alertData.valorAtual);
    console.log('   - Valor ideal:', alertData.valorIdeal);
    console.log('   - Severidade:', alertData.severidade);

    // Enviar alerta
    await monitoringService.sendAlert(alertData);
    
    console.log('✅ Alerta enviado com sucesso!');
    console.log('📧 Verifique se o email chegou para:', userEmail);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

testGustavoAlertManual();
