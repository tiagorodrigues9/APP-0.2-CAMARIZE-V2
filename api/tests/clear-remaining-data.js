import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function clearRemainingData() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    // Listar todas as coleções no banco
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n📊 Verificando dados atuais...\n');

    // Contar documentos em cada coleção
    const collectionsWithData = [];
    let totalDocuments = 0;

    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`📋 ${collectionName}: ${count} documentos`);
          collectionsWithData.push({ name: collectionName, count });
          totalDocuments += count;
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${collectionName}:`, error.message);
      }
    }

    console.log(`\n📊 Total de documentos: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('\n✅ Banco já está vazio!');
      await mongoose.disconnect();
      return;
    }

    // Confirmação do usuário
    console.log('\n⚠️  ATENÇÃO: Isso irá REMOVER TODOS os dados restantes do banco!');
    console.log('   Esta ação é IRREVERSÍVEL!');
    console.log('\n   Para confirmar, digite "LIMPAR" (em maiúsculas):');
    
    const confirmation = process.argv[2];
    
    if (confirmation !== 'LIMPAR') {
      console.log('\n❌ Operação cancelada. Para executar, use:');
      console.log('   node clear-remaining-data.js LIMPAR');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🧹 Iniciando limpeza das coleções restantes...\n');

    // Limpar cada coleção que tem dados
    let removedTotal = 0;
    for (const collectionData of collectionsWithData) {
      const collectionName = collectionData.name;
      try {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`🗑️  ${collectionName}: ${result.deletedCount} documentos removidos`);
        removedTotal += result.deletedCount;
      } catch (error) {
        console.log(`❌ Erro ao limpar ${collectionName}:`, error.message);
      }
    }

    console.log(`\n✅ Limpeza concluída!`);
    console.log(`📊 Total de documentos removidos: ${removedTotal}`);

    // Verificar se ficou vazio
    console.log('\n🔍 Verificando se o banco ficou vazio...');
    let remainingTotal = 0;
    
    for (const collection of collections) {
      const collectionName = collection.name;
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
      console.log('✅ Banco completamente limpo!');
    } else {
      console.log(`⚠️  Ainda restam ${remainingTotal} documentos no banco`);
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

clearRemainingData();

