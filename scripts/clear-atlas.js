import mongoose from 'mongoose';

// URL do MongoDB Atlas
const ATLAS_URL = 'mongodb+srv://joaokusaka27:Oi2cWcwnYEzBXL7X@joaocluster.t5exvmz.mongodb.net/camarize?retryWrites=true&w=majority&appName=JoaoCluster';

async function clearAtlasDatabase() {
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    console.log(`📡 URL: ${ATLAS_URL}`);
    
    await mongoose.connect(ATLAS_URL);
    console.log('✅ Conectado ao Atlas!');

    // Lista de todas as coleções que queremos limpar
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
      'camaroes'
    ];

    console.log('\n📊 Verificando dados atuais no Atlas...\n');

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
    console.log(`\n📊 Total de documentos no Atlas: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('\n✅ Atlas já está vazio!');
      await mongoose.disconnect();
      return;
    }

    // Confirmação do usuário
    console.log('\n⚠️  ATENÇÃO: Isso irá REMOVER TODOS os dados do Atlas!');
    console.log('   Esta ação é IRREVERSÍVEL!');
    console.log('\n   Para confirmar, digite "LIMPAR_ATLAS" (em maiúsculas):');
    
    const confirmation = process.argv[2];
    
    if (confirmation !== 'LIMPAR_ATLAS') {
      console.log('\n❌ Operação cancelada. Para executar, use:');
      console.log('   node clear-atlas.js LIMPAR_ATLAS');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🧹 Iniciando limpeza do Atlas...\n');

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

    console.log(`\n✅ Limpeza do Atlas concluída!`);
    console.log(`📊 Total de documentos removidos: ${removedTotal}`);

    // Verificar se ficou vazio
    console.log('\n🔍 Verificando se o Atlas ficou vazio...');
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
      console.log('✅ Atlas completamente limpo!');
    } else {
      console.log(`⚠️  Ainda restam ${remainingTotal} documentos no Atlas`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do Atlas');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

clearAtlasDatabase();
