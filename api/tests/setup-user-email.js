import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar modelos
import './models/Users.js';
import './models/EmailSettings.js';

dotenv.config();

async function setupUserEmail() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    const userEmail = 'joaooficialkusaka@gmail.com';
    
    console.log(`\n🔍 Procurando usuário: ${userEmail}`);

    // Importar modelos após conexão
    const Users = (await import('./models/Users.js')).default;
    const EmailSettings = (await import('./models/EmailSettings.js')).default;

    // Buscar o usuário
    const user = await Users.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.nome} (ID: ${user._id})`);

    // Verificar se já tem configurações de email
    let emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (emailSettings) {
      console.log('📧 Configurações de email já existem');
      console.log('   - Email configurado:', emailSettings.emailAddress);
      console.log('   - Alertas habilitados:', emailSettings.emailEnabled);
      
      // Atualizar para garantir que está correto
      emailSettings.emailAddress = userEmail;
      emailSettings.emailEnabled = true;
      await emailSettings.save();
      console.log('✅ Configurações atualizadas');
    } else {
      console.log('📧 Criando configurações de email...');
      
      // Criar configurações padrão
      emailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: userEmail,
        emailEnabled: true,
        alertTypes: {
          temperatura: {
            enabled: true,
            severity: { baixa: false, media: true, alta: true }
          },
          ph: {
            enabled: true,
            severity: { baixa: false, media: true, alta: true }
          },
          amonia: {
            enabled: true,
            severity: { baixa: false, media: true, alta: true }
          }
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '07:00'
        },
        frequency: {
          maxEmailsPerHour: 5,
          maxEmailsPerDay: 20
        }
      });
      
      await emailSettings.save();
      console.log('✅ Configurações de email criadas com sucesso!');
    }

    console.log('\n📊 Resumo das configurações:');
    console.log('   - Usuário:', user.nome);
    console.log('   - Email:', emailSettings.emailAddress);
    console.log('   - Alertas habilitados:', emailSettings.emailEnabled);
    console.log('   - Tipos de alerta:', Object.keys(emailSettings.alertTypes).join(', '));

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

setupUserEmail();


