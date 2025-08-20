import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixEmailSettings() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado!');

    // Importar modelos
    const Users = (await import('./models/Users.js')).default;
    const EmailSettings = (await import('./models/EmailSettings.js')).default;

    // Buscar usuário
    const user = await Users.findOne({ email: 'joaooficialkusaka@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.nome} (${user._id})`);

    // Verificar se já tem configurações
    let emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (!emailSettings) {
      console.log('📧 Criando configurações de email...');
      emailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: 'joaooficialkusaka@gmail.com',
        emailEnabled: true,
        alertTypes: {
          temperatura: { enabled: true, severity: { baixa: false, media: true, alta: true } },
          ph: { enabled: true, severity: { baixa: false, media: true, alta: true } },
          amonia: { enabled: true, severity: { baixa: false, media: true, alta: true } }
        },
        quietHours: { enabled: false, startTime: '22:00', endTime: '07:00' },
        frequency: { maxEmailsPerHour: 5, maxEmailsPerDay: 20 }
      });
      await emailSettings.save();
      console.log('✅ Configurações criadas!');
    } else {
      console.log('📧 Configurações já existem, atualizando...');
      emailSettings.emailEnabled = true;
      await emailSettings.save();
      console.log('✅ Configurações atualizadas!');
    }

    console.log('🎉 Email configurado com sucesso!');
    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixEmailSettings();


