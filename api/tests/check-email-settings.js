import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';
import EmailSettings from './models/EmailSettings.js';

async function checkEmailSettings() {
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
    console.log('📧 Email:', user.email);

    // Verificar configurações de email
    const emailSettings = await EmailSettings.findOne({ userId: user._id });
    
    if (!emailSettings) {
      console.log('❌ Configurações de email não encontradas para o usuário');
      return;
    }

    console.log('📧 Configurações de email encontradas:');
    console.log('   - Email configurado:', emailSettings.emailAddress);
    console.log('   - Alertas habilitados:', emailSettings.emailEnabled);

    // Verificar cativeiros do usuário
    const cativeiros = await Cativeiros.find({ user: user._id });
    console.log(`🏠 Cativeiros encontrados: ${cativeiros.length}`);

    cativeiros.forEach(cativeiro => {
      console.log(`   - ${cativeiro.nome} (ID: ${cativeiro._id})`);
    });

    // Verificar parâmetros mais recentes
    for (const cativeiro of cativeiros) {
      const latestParam = await ParametrosAtuais.findOne({ 
        cativeiro: cativeiro._id 
      }).sort({ timestamp: -1 });

      if (latestParam) {
        console.log(`📊 Último parâmetro de ${cativeiro.nome}:`);
        console.log(`   - Temperatura: ${latestParam.temperatura}°C`);
        console.log(`   - pH: ${latestParam.ph}`);
        console.log(`   - Oxigênio: ${latestParam.oxigenio}mg/L`);
        console.log(`   - Timestamp: ${latestParam.timestamp}`);
        
        // Verificar se está em estado crítico
        const isCritical = 
          latestParam.temperatura > 30 || latestParam.temperatura < 20 ||
          latestParam.ph > 8.5 || latestParam.ph < 6.5 ||
          latestParam.oxigenio < 4;
        
        console.log(`   - Estado crítico: ${isCritical ? 'SIM' : 'NÃO'}`);
      } else {
        console.log(`❌ Nenhum parâmetro encontrado para ${cativeiro.nome}`);
      }
    }

    // Verificar variáveis de ambiente
    console.log('\n🔧 Variáveis de ambiente:');
    console.log('   - ENABLE_AUTO_MONITORING:', process.env.ENABLE_AUTO_MONITORING);
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

checkEmailSettings();
