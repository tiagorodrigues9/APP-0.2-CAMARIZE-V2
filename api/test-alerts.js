import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar serviços
import emailService from './services/emailService.js';
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';
import EmailSettings from './models/EmailSettings.js';

async function testAlerts() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await Users.findOne({ email: 'joaooficialkusaka@gmail.com' });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:', user.nome);

    // Buscar cativeiros do usuário
    const cativeiros = await Cativeiros.find({ nome: { $regex: /joao/i } });
    console.log(`🏠 Cativeiros encontrados: ${cativeiros.length}`);

    for (const cativeiro of cativeiros) {
      console.log(`\n📊 Verificando cativeiro: ${cativeiro.nome}`);
      
      // Buscar parâmetros mais recentes
      const parametros = await ParametrosAtuais.find({ 
        id_cativeiro: cativeiro._id 
      }).sort({ datahora: -1 }).limit(1);

      if (parametros.length === 0) {
        console.log('   ❌ Nenhum parâmetro encontrado');
        continue;
      }

      const parametro = parametros[0];
      console.log(`   📈 Último parâmetro: ${parametro.datahora.toLocaleString('pt-BR')}`);
      console.log(`      - Temperatura: ${parametro.temp_atual}°C`);
      console.log(`      - pH: ${parametro.ph_atual}`);
      console.log(`      - Amônia: ${parametro.amonia_atual}mg/L`);

      // Verificar se está crítico
      const isCritical = 
        parametro.temp_atual > 30 || parametro.temp_atual < 20 ||
        parametro.ph_atual > 8.5 || parametro.ph_atual < 6.5;

      if (isCritical) {
        console.log('   🔴 ESTADO CRÍTICO DETECTADO!');
        
        // Determinar qual parâmetro está crítico
        let tipoAlerta = '';
        let valorAtual = '';
        let valorIdeal = '';
        let severidade = 'alta';

        if (parametro.temp_atual > 30) {
          tipoAlerta = 'temperatura';
          valorAtual = `${parametro.temp_atual}°C`;
          valorIdeal = '30°C';
        } else if (parametro.temp_atual < 20) {
          tipoAlerta = 'temperatura';
          valorAtual = `${parametro.temp_atual}°C`;
          valorIdeal = '20°C';
        } else if (parametro.ph_atual > 8.5) {
          tipoAlerta = 'ph';
          valorAtual = parametro.ph_atual.toString();
          valorIdeal = '8.5';
        } else if (parametro.ph_atual < 6.5) {
          tipoAlerta = 'ph';
          valorAtual = parametro.ph_atual.toString();
          valorIdeal = '6.5';
        }

        // Enviar alerta
        console.log(`   📧 Enviando alerta de ${tipoAlerta}...`);
        
        const alertData = {
          tipo: tipoAlerta,
          cativeiro: cativeiro._id,
          cativeiroNome: cativeiro.nome,
          valorAtual: valorAtual,
          valorIdeal: valorIdeal,
          diferenca: Math.abs(parseFloat(valorAtual) - parseFloat(valorIdeal)),
          mensagem: `Parâmetro ${tipoAlerta.toUpperCase()} em estado crítico! Atual: ${valorAtual}, Ideal: ${valorIdeal}`,
          datahora: parametro.datahora,
          severidade: severidade
        };

        const result = await emailService.sendAlertEmail('joaooficialkusaka@gmail.com', alertData);
        
        if (result.success) {
          console.log(`   ✅ Alerta enviado com sucesso!`);
          console.log(`      - Message ID: ${result.messageId}`);
        } else {
          console.log(`   ❌ Erro ao enviar alerta: ${result.error}`);
        }
      } else {
        console.log('   🟢 Estado normal');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

testAlerts();
