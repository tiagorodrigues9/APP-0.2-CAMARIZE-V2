import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkRemainingData() {
  try {
    console.log('🔍 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/camarize');
    console.log('✅ Conectado!');

    console.log('\n📊 Verificando dados restantes...\n');

    // Listar todas as coleções no banco
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    let totalRemaining = 0;
    const collectionsWithData = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`📋 ${collectionName}: ${count} documentos`);
          collectionsWithData.push({ name: collectionName, count });
          totalRemaining += count;
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${collectionName}:`, error.message);
      }
    }

    console.log(`\n📊 Total de documentos restantes: ${totalRemaining}`);
    
    if (collectionsWithData.length > 0) {
      console.log('\n🔧 Para limpar as coleções restantes, execute:');
      console.log('node clear-remaining-data.js LIMPAR');
    } else {
      console.log('\n✅ Banco completamente limpo!');
    }

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkRemainingData();

