import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviços
import monitoringService from './services/monitoringService.js';

async function startMonitoring() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    console.log('\n🔧 Verificando configurações:');
    console.log('   - ENABLE_AUTO_MONITORING:', process.env.ENABLE_AUTO_MONITORING);
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

    if (!process.env.ENABLE_AUTO_MONITORING) {
      console.log('\n⚠️ Monitoramento automático não está habilitado');
      console.log('   Adicione ENABLE_AUTO_MONITORING=true no arquivo .env');
    }

    console.log('\n🚀 Iniciando monitoramento automático...');
    
    // Iniciar monitoramento
    monitoringService.startMonitoring(5); // Verificar a cada 5 minutos
    
    console.log('✅ Monitoramento iniciado!');
    console.log('   - Verificando a cada 5 minutos');
    console.log('   - Alertas serão enviados para: joaooficialkusaka@gmail.com');
    
    // Fazer uma verificação manual imediata
    console.log('\n🔍 Executando verificação manual...');
    await monitoringService.manualCheck();
    
    console.log('\n📊 Status do monitoramento:');
    const status = monitoringService.getStatus();
    console.log('   - Rodando:', status.isRunning);
    console.log('   - Última verificação:', status.lastCheck);
    console.log('   - Próxima verificação:', status.nextCheck);

    console.log('\n💡 O monitoramento está ativo!');
    console.log('   - Quando detectar estados críticos, enviará emails automaticamente');
    console.log('   - Para parar: Ctrl+C');

    // Manter o processo rodando
    process.on('SIGINT', () => {
      console.log('\n⏹️ Parando monitoramento...');
      monitoringService.stopMonitoring();
      mongoose.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    await mongoose.disconnect();
  }
}

startMonitoring();
