import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';

async function addTestParameters() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar cativeiros "do joao"
    const cativeiros = await Cativeiros.find({ nome: { $regex: /joao/i } });
    console.log(`🏠 Cativeiros encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado');
      return; 
    }

    for (const cativeiro of cativeiros) {
      console.log(`\n📊 Adicionando dados de teste para: ${cativeiro.nome}`);
      
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
        },
        {
          id_cativeiro: cativeiro._id,
          temp_atual: 25, // NORMAL
          ph_atual: 7.5,  // NORMAL
          amonia_atual: 0.3,
          datahora: new Date(Date.now() - 10 * 60 * 1000) // 10 minutos atrás
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

    console.log('\n🎯 Dados de teste adicionados com sucesso!');
    console.log('💡 Agora você pode testar o sistema de alertas');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

addTestParameters();
