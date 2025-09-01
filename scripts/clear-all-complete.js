import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Importar todos os modelos para garantir que as coleções sejam reconhecidas
import '../models/Users.js';
import '../models/Fazendas.js';
import '../models/Cativeiros.js';
import '../models/UsuariosxFazendas.js';
import '../models/FazendasxCativeiros.js';
import '../models/SensoresxCativeiros.js';
import '../models/Sensores.js';
import '../models/Parametros_atuais.js';
import '../models/Condicoes_ideais.js';
import '../models/EmailSettings.js';
import '../models/PushSubscriptions.js';
import '../models/Tipos_sensores.js';
import '../models/Especif_camaroes.js';
import '../models/Dietas.js';
import '../models/Camaroes.js';

dotenv.config();

async function clearAllComplete() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    // Lista de TODAS as coleções que queremos limpar
    const collections = [
      'users',
      'Fazendas', 
      'cativeiros',
      'usuariosxfazendas',
      'fazendasxcativeiros',
      'SensoresxCativeiros',
      'sensores',
      'parametros_atuais',
      'condicoesideais',
      'emailsettings',
      'pushsubscriptions',
      'Tipos_sensor',
      'especif_camarao',
      'Dietas',
      'camaroes',
      'tiposcamaroes',
      'tipos_sensores',
      'especif_camaroes'
    ];

    console.log('\n📊 Verificando dados atuais...\n');

    // Contar documentos em cada coleção
    const counts = {};
    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        counts[collectionName] = count;
        console.log(`📋 ${collectionName}: ${count} documentos`);
      } catch (error) {
        console.log(`📋 ${collectionName}: coleção não existe ou erro ao contar`);
        counts[collectionName] = 0;
      }
    }

    const totalDocuments = Object.values(counts).reduce((sum, count) => sum + count, 0);
    console.log(`\n📊 Total de documentos: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('\n✅ Banco já está vazio!');
      await mongoose.disconnect();
      return;
    }

    // Confirmação do usuário
    console.log('\n⚠️  ⚠️  ⚠️  ATENÇÃO EXTREMA ⚠️  ⚠️  ⚠️');
    console.log('   Isso irá REMOVER TODOS os dados do banco!');
    console.log('   Esta ação é COMPLETAMENTE IRREVERSÍVEL!');
    console.log('   Todos os usuários, fazendas, cativeiros e sensores serão DELETADOS!');
    console.log('\n   Para confirmar, digite "LIMPAR_TUDO" (em maiúsculas):');
    
    const confirmation = process.argv[2];
    
    if (confirmation !== 'LIMPAR_TUDO') {
      console.log('\n❌ Operação cancelada. Para executar, use:');
      console.log('   node tests/clear-all-complete.js LIMPAR_TUDO');
      console.log('\n💡 Este comando limpa TUDO do banco!');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🧹 Iniciando limpeza COMPLETA do banco...\n');

    // Limpar cada coleção
    let removedTotal = 0;
    for (const collectionName of collections) {
      try {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`🗑️  ${collectionName}: ${result.deletedCount} documentos removidos`);
        removedTotal += result.deletedCount;
      } catch (error) {
        console.log(`❌ Erro ao limpar ${collectionName}:`, error.message);
      }
    }

    console.log(`\n✅ Limpeza COMPLETA concluída!`);
    console.log(`📊 Total de documentos removidos: ${removedTotal}`);

    // Verificar se ficou vazio
    console.log('\n🔍 Verificando se o banco ficou vazio...');
    let remainingTotal = 0;
    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`⚠️  ${collectionName}: ainda tem ${count} documentos`);
          remainingTotal += count;
        }
      } catch (error) {
        // Coleção pode não existir, isso é normal
      }
    }

    if (remainingTotal === 0) {
      console.log('✅ Banco COMPLETAMENTE limpo!');
      console.log('🎯 Todos os dados foram removidos com sucesso!');
    } else {
      console.log(`⚠️  Ainda restam ${remainingTotal} documentos no banco`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
    console.log('\n🚨 Banco limpo com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

clearAllComplete();
