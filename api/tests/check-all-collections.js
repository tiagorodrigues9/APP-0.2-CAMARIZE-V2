import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllCollections() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    console.log('\n📊 Verificando TODAS as coleções no banco...\n');

    // Listar todas as coleções que realmente existem
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    let totalDocuments = 0;
    const collectionCounts = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        collectionCounts[collectionName] = count;
        totalDocuments += count;
        
        const status = count > 0 ? '📋' : '📭';
        console.log(`${status} ${collectionName}: ${count} documentos`);
      } catch (error) {
        console.log(`❌ ${collectionName}: erro ao contar - ${error.message}`);
      }
    }

    console.log(`\n📊 Total de documentos no banco: ${totalDocuments}`);
    
    if (totalDocuments === 0) {
      console.log('\n✅ Banco completamente vazio!');
    } else {
      console.log('\n📋 Coleções com dados:');
      Object.entries(collectionCounts)
        .filter(([name, count]) => count > 0)
        .forEach(([name, count]) => {
          console.log(`   - ${name}: ${count} documentos`);
        });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkAllCollections();
