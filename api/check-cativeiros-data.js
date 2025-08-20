import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import ParametrosAtuais from './models/Parametros_atuais.js';
import EmailSettings from './models/EmailSettings.js';
import UsuariosxFazendas from './models/UsuariosxFazendas.js';
import FazendasxCativeiros from './models/FazendasxCativeiros.js';

async function checkCativeirosData() {
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
      console.log('❌ Configurações de email não encontradas');
      return;
    }

    console.log('📧 Configurações de email:');
    console.log('   - Email configurado:', emailSettings.emailAddress);
    console.log('   - Alertas habilitados:', emailSettings.emailEnabled);

    // Buscar cativeiros através da relação correta
    console.log('\n🔍 Buscando cativeiros através das relações...');
    
    // 1. Buscar fazendas do usuário
    const userFazendas = await UsuariosxFazendas.find({ usuario: user._id });
    console.log(`🏭 Fazendas do usuário: ${userFazendas.length}`);

    if (userFazendas.length === 0) {
      console.log('❌ Usuário não tem fazendas associadas');
      return;
    }

    // 2. Buscar cativeiros das fazendas
    const cativeirosIds = [];
    for (const userFazenda of userFazendas) {
      const fazendaCativeiros = await FazendasxCativeiros.find({ fazenda: userFazenda.fazenda });
      console.log(`   - Fazenda ${userFazenda.fazenda}: ${fazendaCativeiros.length} cativeiros`);
      
      for (const fazendaCativeiro of fazendaCativeiros) {
        cativeirosIds.push(fazendaCativeiro.cativeiro);
      }
    }

    // 3. Buscar dados dos cativeiros
    const cativeiros = await Cativeiros.find({ _id: { $in: cativeirosIds } });
    console.log(`\n🏠 Cativeiros encontrados: ${cativeiros.length}`);

    if (cativeiros.length === 0) {
      console.log('❌ Nenhum cativeiro encontrado para o usuário');
      console.log('💡 Você precisa cadastrar cativeiros no sistema para receber alertas');
      return;
    }

    // Verificar dados de parâmetros para cada cativeiro
    for (const cativeiro of cativeiros) {
      console.log(`\n📊 Cativeiro: ${cativeiro.nome} (ID: ${cativeiro._id})`);
      
      const parametros = await ParametrosAtuais.find({ 
        id_cativeiro: cativeiro._id 
      }).sort({ datahora: -1 }).limit(5);

      console.log(`   - Parâmetros encontrados: ${parametros.length}`);

      if (parametros.length === 0) {
        console.log('   ❌ Nenhum parâmetro encontrado');
        console.log('   💡 Os sensores precisam estar enviando dados para gerar alertas');
      } else {
        console.log('   📈 Últimos parâmetros:');
        parametros.forEach((param, index) => {
          const isCritical = 
            param.temp_atual > 30 || param.temp_atual < 20 ||
            param.ph_atual > 8.5 || param.ph_atual < 6.5;
          
          console.log(`     ${index + 1}. ${param.datahora.toLocaleString('pt-BR')}`);
          console.log(`        - Temperatura: ${param.temp_atual}°C`);
          console.log(`        - pH: ${param.ph_atual}`);
          console.log(`        - Amônia: ${param.amonia_atual}mg/L`);
          console.log(`        - Estado: ${isCritical ? '🔴 CRÍTICO' : '🟢 NORMAL'}`);
        });
      }
    }

    // Verificar variáveis de ambiente
    console.log('\n🔧 Configurações do sistema:');
    console.log('   - ENABLE_AUTO_MONITORING:', process.env.ENABLE_AUTO_MONITORING);
    console.log('   - EMAIL_USER:', process.env.EMAIL_USER);
    console.log('   - EMAIL_PASS:', process.env.EMAIL_PASS ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n⚠️ ATENÇÃO: Configurações de email não encontradas!');
      console.log('   Adicione ao arquivo .env:');
      console.log('   EMAIL_USER=camarize.alertas@gmail.com');
      console.log('   EMAIL_PASS=sua_senha_de_app_do_gmail');
      console.log('   ENABLE_AUTO_MONITORING=true');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

checkCativeirosData();
