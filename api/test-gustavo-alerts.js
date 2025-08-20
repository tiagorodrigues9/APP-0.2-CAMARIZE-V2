import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';
import EmailSettings from './models/EmailSettings.js';
import monitoringService from './services/monitoringService.js';

async function testGustavoAlerts() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário Gustavo
    const userEmail = 'gustavo.marques@planoangelus.com.br';
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
      console.log('❌ Configurações de email não encontradas');
      console.log('📧 Criando configurações de email para o Gustavo...');
      
      const newEmailSettings = new EmailSettings({
        userId: user._id,
        emailAddress: userEmail,
        emailEnabled: true
      });
      await newEmailSettings.save();
      console.log('✅ Configurações de email criadas');
    } else {
      console.log('📧 Configurações de email encontradas:');
      console.log('   - Email configurado:', emailSettings.emailAddress);
      console.log('   - Alertas habilitados:', emailSettings.emailEnabled);
    }

    // Buscar cativeiros do Gustavo
    const cativeiros = await Cativeiros.find({ user: user._id });
    console.log(`🏠 Cativeiros encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado para o Gustavo');
      return;
    }

    for (const cativeiro of cativeiros) {
      console.log(`\n📊 Verificando cativeiro: ${cativeiro.nome}`);
      
      // Buscar último parâmetro
      const ultimoParametro = await ParametrosAtuais.findOne({ 
        id_cativeiro: cativeiro._id 
      }).sort({ datahora: -1 });

      if (!ultimoParametro) {
        console.log('   ❌ Nenhum parâmetro encontrado');
        continue;
      }

      console.log(`   📈 Último parâmetro: ${ultimoParametro.datahora.toLocaleString('pt-BR')}`);
      console.log(`      - Temperatura: ${ultimoParametro.temp_atual}°C`);
      console.log(`      - pH: ${ultimoParametro.ph_atual}`);
      console.log(`      - Amônia: ${ultimoParametro.amonia_atual}mg/L`);

      // Verificar se está crítico
      const isCritical = 
        ultimoParametro.temp_atual > 30 || ultimoParametro.temp_atual < 20 ||
        ultimoParametro.ph_atual > 8.5 || ultimoParametro.ph_atual < 6.5;

      if (isCritical) {
        console.log('   🔴 ESTADO CRÍTICO DETECTADO!');
        
        // Determinar qual parâmetro está crítico
        let tipoAlerta = '';
        let valorAtual = '';
        let valorIdeal = '';
        let severidade = 'alta';

        if (ultimoParametro.temp_atual > 30) {
          tipoAlerta = 'temperatura';
          valorAtual = `${ultimoParametro.temp_atual}°C`;
          valorIdeal = '30°C';
        } else if (ultimoParametro.temp_atual < 20) {
          tipoAlerta = 'temperatura';
          valorAtual = `${ultimoParametro.temp_atual}°C`;
          valorIdeal = '20°C';
        } else if (ultimoParametro.ph_atual > 8.5) {
          tipoAlerta = 'ph';
          valorAtual = ultimoParametro.ph_atual.toString();
          valorIdeal = '8.5';
        } else if (ultimoParametro.ph_atual < 6.5) {
          tipoAlerta = 'ph';
          valorAtual = ultimoParametro.ph_atual.toString();
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
          datahora: ultimoParametro.datahora,
          severidade: severidade
        };

        const result = await monitoringService.sendAlert(alertData);
        
        if (result) {
          console.log(`   ✅ Alerta enviado com sucesso!`);
        } else {
          console.log(`   ❌ Erro ao enviar alerta`);
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

testGustavoAlerts();
