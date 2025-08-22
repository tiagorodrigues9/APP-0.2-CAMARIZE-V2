import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sensores from '../models/Sensores.js';
import Cativeiros from '../models/Cativeiros.js';
import SensoresxCativeiros from '../models/SensoresxCativeiros.js';

dotenv.config();

const migrateSensorsToUsers = async () => {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os sensores sem campo user
    const sensoresSemUser = await Sensores.find({ user: { $exists: false } });
    console.log(`📊 Encontrados ${sensoresSemUser.length} sensores sem campo user`);

    if (sensoresSemUser.length === 0) {
      console.log('✅ Todos os sensores já têm campo user');
      return;
    }

    // Para cada sensor, encontrar o usuário através dos relacionamentos
    for (const sensor of sensoresSemUser) {
      console.log(`🔍 Processando sensor: ${sensor.apelido || sensor._id}`);
      
      // Buscar cativeiros que usam este sensor
      const relacoes = await SensoresxCativeiros.find({ id_sensor: sensor._id });
      
      if (relacoes.length > 0) {
        // Pegar o primeiro cativeiro relacionado
        const cativeiroId = relacoes[0].id_cativeiro;
        const cativeiro = await Cativeiros.findById(cativeiroId);
        
        if (cativeiro && cativeiro.user) {
          // Atualizar o sensor com o user do cativeiro
          await Sensores.findByIdAndUpdate(sensor._id, { user: cativeiro.user });
          console.log(`✅ Sensor ${sensor.apelido || sensor._id} associado ao usuário ${cativeiro.user}`);
        } else {
          console.log(`⚠️  Cativeiro ${cativeiroId} não encontrado ou sem usuário`);
        }
      } else {
        console.log(`⚠️  Sensor ${sensor.apelido || sensor._id} não tem relacionamentos`);
      }
    }

    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
};

migrateSensorsToUsers();
