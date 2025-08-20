import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import EmailSettings from './models/EmailSettings.js';

async function setupEmailSettings() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário pelo email
    const userEmail = 'joaooficialkusaka@gmail.com';
    const user = await Users.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', userEmail);
      return;
    }

    console.log('👤 Usuário encontrado:', user.nome);

    // Verificar se já existem configurações
    let emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (emailSettings) {
      console.log('📧 Configurações já existem, atualizando...');
      emailSettings.emailAddress = userEmail;
      emailSettings.emailEnabled = true;
    } else {
      console.log('📧 Criando novas configurações de email...');
      emailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: userEmail,
        emailEnabled: true
      });
    }

    await emailSettings.save();
    console.log('✅ Configurações de email salvas com sucesso!');
    console.log('   - Email:', emailSettings.emailAddress);
    console.log('   - Alertas habilitados:', emailSettings.emailEnabled);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

setupEmailSettings();
