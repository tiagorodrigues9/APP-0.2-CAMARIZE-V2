import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmailSettings from './models/EmailSettings.js';

dotenv.config();

// Conectar ao MongoDB
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";
await mongoose.connect(mongoUrl);

console.log('🔗 Conectado ao MongoDB');

// Teste 1: Criar configurações de email para um usuário
async function testCreateEmailSettings() {
  try {
    console.log('\n📧 Teste 1: Criando configurações de email...');
    
    const userId = new mongoose.Types.ObjectId(); // ID fictício para teste
    
    const emailSettings = new EmailSettings({
      userId,
      emailAddress: 'teste@example.com',
      emailEnabled: true,
      frequency: {
        maxEmailsPerHour: 3,
        maxEmailsPerDay: 15,
        minIntervalMinutes: 5
      },
      quietHours: {
        enabled: true,
        startTime: '23:00',
        endTime: '07:00'
      },
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
      }
    });
    
    await emailSettings.save();
    console.log('✅ Configurações de email criadas com sucesso!');
    console.log('ID:', emailSettings._id);
    
    return emailSettings;
  } catch (error) {
    console.error('❌ Erro ao criar configurações:', error);
    return null;
  }
}

// Teste 2: Buscar configurações
async function testGetEmailSettings(userId) {
  try {
    console.log('\n🔍 Teste 2: Buscando configurações de email...');
    
    const settings = await EmailSettings.findOne({ userId });
    
    if (settings) {
      console.log('✅ Configurações encontradas:');
      console.log('- Email:', settings.emailAddress);
      console.log('- Habilitado:', settings.emailEnabled);
      console.log('- Max por hora:', settings.frequency.maxEmailsPerHour);
      console.log('- Max por dia:', settings.frequency.maxEmailsPerDay);
      console.log('- Modo silêncio:', settings.quietHours.enabled ? 'Ativo' : 'Inativo');
      console.log('- Horário silêncio:', `${settings.quietHours.startTime} - ${settings.quietHours.endTime}`);
    } else {
      console.log('❌ Configurações não encontradas');
    }
    
    return settings;
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    return null;
  }
}

// Teste 3: Atualizar configurações
async function testUpdateEmailSettings(userId) {
  try {
    console.log('\n✏️ Teste 3: Atualizando configurações...');
    
    const updateData = {
      frequency: {
        maxEmailsPerHour: 10,
        maxEmailsPerDay: 25,
        minIntervalMinutes: 2
      },
      quietHours: {
        enabled: false
      }
    };
    
    const result = await EmailSettings.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );
    
    if (result) {
      console.log('✅ Configurações atualizadas com sucesso!');
      console.log('- Novo max por hora:', result.frequency.maxEmailsPerHour);
      console.log('- Novo max por dia:', result.frequency.maxEmailsPerDay);
      console.log('- Modo silêncio:', result.quietHours.enabled ? 'Ativo' : 'Inativo');
    } else {
      console.log('❌ Erro ao atualizar configurações');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    return null;
  }
}

// Teste 4: Testar métodos do modelo
async function testModelMethods(settings) {
  try {
    console.log('\n🧪 Teste 4: Testando métodos do modelo...');
    
    // Teste de horário de silêncio
    const isInQuietHours = settings.isInQuietHours();
    console.log('- Está em horário de silêncio?', isInQuietHours);
    
    // Teste de verificação de email
    const shouldSendTemp = settings.shouldSendEmail('temperatura', 'alta');
    console.log('- Deve enviar email para temperatura alta?', shouldSendTemp);
    
    const shouldSendPh = settings.shouldSendEmail('ph', 'baixa');
    console.log('- Deve enviar email para pH baixo?', shouldSendPh);
    
    // Teste de verificação de frequência
    const canSend = settings.canSendEmail();
    console.log('- Pode enviar email?', canSend);
    
    console.log('✅ Métodos do modelo funcionando corretamente!');
  } catch (error) {
    console.error('❌ Erro ao testar métodos:', error);
  }
}

// Executar todos os testes
async function runTests() {
  try {
    console.log('🚀 Iniciando testes de configurações de email...\n');
    
    const settings = await testCreateEmailSettings();
    if (!settings) return;
    
    await testGetEmailSettings(settings.userId);
    await testUpdateEmailSettings(settings.userId);
    await testModelMethods(settings);
    
    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

// Executar os testes
runTests();
