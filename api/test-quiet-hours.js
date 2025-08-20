import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EmailSettings from './models/EmailSettings.js';

dotenv.config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/camarize');

async function testQuietHours() {
  try {
    console.log('🧪 Testando Modo Silêncio...\n');

    // Buscar configurações de email (substitua pelo userId real)
    const settings = await EmailSettings.findOne({ emailEnabled: true });
    
    if (!settings) {
      console.log('❌ Nenhuma configuração de email encontrada');
      return;
    }

    console.log('📋 Configurações encontradas:');
    console.log('- Email:', settings.emailAddress);
    console.log('- Modo silêncio ativado:', settings.quietHours.enabled);
    console.log('- Horário início:', settings.quietHours.startTime);
    console.log('- Horário fim:', settings.quietHours.endTime);
    console.log('');

    // Testar diferentes horários
    const testTimes = [
      { time: '08:00', description: 'Manhã' },
      { time: '12:00', description: 'Meio-dia' },
      { time: '18:00', description: 'Tarde' },
      { time: '22:00', description: 'Noite' },
      { time: '02:00', description: 'Madrugada' },
      { time: '06:00', description: 'Amanhecer' }
    ];

    console.log('🕐 Testando diferentes horários:');
    
    for (const test of testTimes) {
      // Simular horário atual
      const [hours, minutes] = test.time.split(':').map(Number);
      const mockDate = new Date();
      mockDate.setHours(hours, minutes, 0, 0);
      
      // Substituir temporariamente o método para testar
      const originalIsInQuietHours = settings.isInQuietHours;
      settings.isInQuietHours = function() {
        if (!this.quietHours.enabled) return false;
        
        const currentTime = mockDate.getHours() * 60 + mockDate.getMinutes();
        
        const startTime = this.quietHours.startTime.split(':').map(Number);
        const endTime = this.quietHours.endTime.split(':').map(Number);
        
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];
        
        // Se o horário de silêncio cruza a meia-noite
        if (startMinutes > endMinutes) {
          return currentTime >= startMinutes || currentTime <= endMinutes;
        } else {
          return currentTime >= startMinutes && currentTime <= endMinutes;
        }
      };
      
      const isQuiet = settings.isInQuietHours();
      const status = isQuiet ? '🌙 SILÊNCIO' : '📢 ATIVO';
      
      console.log(`  ${test.time} (${test.description}): ${status}`);
      
      // Restaurar método original
      settings.isInQuietHours = originalIsInQuietHours;
    }

    console.log('\n✅ Teste concluído!');
    
    // Mostrar lógica do modo silêncio
    console.log('\n📖 Lógica do modo silêncio:');
    console.log('- Se startTime > endTime: cruza a meia-noite');
    console.log('- Se startTime < endTime: mesmo dia');
    console.log('- Exemplo: 22:00 → 07:00 (cruza meia-noite)');
    console.log('- Exemplo: 09:00 → 18:00 (mesmo dia)');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Executar teste
testQuietHours();
