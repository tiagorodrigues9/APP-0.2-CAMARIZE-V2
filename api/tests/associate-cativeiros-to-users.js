import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar modelos
import Users from './models/Users.js';
import Cativeiros from './models/Cativeiros.js';
import FazendasxCativeiros from './models/FazendasxCativeiros.js';
import UsuariosxFazendas from './models/UsuariosxFazendas.js';

async function associateCativeirosToUsers() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os cativeiros
    const allCativeiros = await Cativeiros.find();
    console.log(`🏠 Total de cativeiros encontrados: ${allCativeiros.length}`);

    let associados = 0;
    let naoAssociados = 0;

    for (const cativeiro of allCativeiros) {
      console.log(`\n🔍 Processando cativeiro: ${cativeiro.nome} (ID: ${cativeiro._id})`);
      
      // Verificar se já tem usuário associado
      if (cativeiro.user) {
        const user = await Users.findById(cativeiro.user);
        console.log(`   ✅ Já associado ao usuário: ${user?.nome || 'Usuário não encontrado'} (${user?.email})`);
        associados++;
        continue;
      }

      // Buscar relação fazenda-cativeiro
      const fazendaRel = await FazendasxCativeiros.findOne({ cativeiro: cativeiro._id });
      
      if (!fazendaRel) {
        console.log(`   ❌ Nenhuma relação fazenda-cativeiro encontrada`);
        naoAssociados++;
        continue;
      }

      // Buscar relação usuário-fazenda
      const userFazendaRel = await UsuariosxFazendas.findOne({ fazenda: fazendaRel.fazenda });
      
      if (!userFazendaRel) {
        console.log(`   ❌ Nenhuma relação usuário-fazenda encontrada para a fazenda: ${fazendaRel.fazenda}`);
        naoAssociados++;
        continue;
      }

      // Buscar dados do usuário
      const user = await Users.findById(userFazendaRel.usuario);
      
      if (!user) {
        console.log(`   ❌ Usuário não encontrado: ${userFazendaRel.usuario}`);
        naoAssociados++;
        continue;
      }

      // Associar cativeiro ao usuário
      cativeiro.user = user._id;
      await cativeiro.save();
      
      console.log(`   ✅ Associado ao usuário: ${user.nome} (${user.email})`);
      associados++;
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   - Cativeiros associados: ${associados}`);
    console.log(`   - Cativeiros não associados: ${naoAssociados}`);
    console.log(`   - Total processado: ${associados + naoAssociados}`);

    if (naoAssociados > 0) {
      console.log(`\n⚠️ ${naoAssociados} cativeiros não puderam ser associados automaticamente.`);
      console.log(`   Verifique se todos os cativeiros estão corretamente relacionados às fazendas.`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

associateCativeirosToUsers();
