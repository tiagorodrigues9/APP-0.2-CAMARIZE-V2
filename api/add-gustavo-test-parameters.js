import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';
import Users from './models/Users.js';

async function addGustavoTestParameters() {
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

    // Buscar cativeiros do Gustavo
    const cativeiros = await Cativeiros.find({ user: user._id });
    console.log(`🏠 Cativeiros do Gustavo encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado para o Gustavo');
      return;
    }

    for (const cativeiro of cativeiros) {
      console.log(`\n📊 Adicionando dados críticos para: ${cativeiro.nome}`);
      
      // Criar parâmetros com valores críticos
      const parametrosCriticos = [
        {
          id_cativeiro: cativeiro._id,
          temp_atual: 35, // CRÍTICO (acima de 30)
          ph_atual: 9.0,  // CRÍTICO (acima de 8.5)
          amonia_atual: 0.8,
          datahora: new Date()
        },
        {
          id_cativeiro: cativeiro._id,
          temp_atual: 18, // CRÍTICO (abaixo de 20)
          ph_atual: 6.0,  // CRÍTICO (abaixo de 6.5)
          amonia_atual: 0.5,
          datahora: new Date(Date.now() - 5 * 60 * 1000) // 5 minutos atrás
        }
      ];

      for (const parametro of parametrosCriticos) {
        const novoParametro = new ParametrosAtuais(parametro);
        await novoParametro.save();
        
        const isCritical = 
          parametro.temp_atual > 30 || parametro.temp_atual < 20 ||
          parametro.ph_atual > 8.5 || parametro.ph_atual < 6.5;
        
        console.log(`   ✅ Parâmetro adicionado: ${parametro.datahora.toLocaleString('pt-BR')}`);
        console.log(`      - Temperatura: ${parametro.temp_atual}°C`);
        console.log(`      - pH: ${parametro.ph_atual}`);
        console.log(`      - Amônia: ${parametro.amonia_atual}mg/L`);
        console.log(`      - Estado: ${isCritical ? '🔴 CRÍTICO' : '🟢 NORMAL'}`);
      }
    }

    console.log('\n🎯 Dados críticos adicionados com sucesso!');
    console.log('💡 Agora você pode testar o sistema de alertas');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

addGustavoTestParameters();
