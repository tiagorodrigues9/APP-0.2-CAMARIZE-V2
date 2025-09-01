import mongoose from 'mongoose';

// URL do MongoDB Atlas
const ATLAS_URL = 'mongodb+srv://joaokusaka27:Oi2cWcwnYEzBXL7X@joaocluster.t5exvmz.mongodb.net/camarize?retryWrites=true&w=majority&appName=JoaoCluster';

async function checkAtlasStatus() {
  try {
    console.log('🔍 Conectando ao MongoDB Atlas...');
    await mongoose.connect(ATLAS_URL);
    console.log('✅ Conectado ao Atlas!');

    console.log('\n📊 Verificando TODAS as coleções no Atlas...\n');

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
        
        // Se tem documentos, mostrar alguns exemplos
        if (count > 0) {
          const docs = await mongoose.connection.db.collection(collectionName).find({}).limit(3).toArray();
          docs.forEach((doc, index) => {
            console.log(`     ${index + 1}. ID: ${doc._id}`);
            if (doc.descricao) console.log(`        Descrição: ${doc.descricao}`);
            if (doc.nome) console.log(`        Nome: ${doc.nome}`);
            if (doc.email) console.log(`        Email: ${doc.email}`);
          });
          if (count > 3) {
            console.log(`     ... e mais ${count - 3} documentos`);
          }
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: erro ao contar - ${error.message}`);
      }
    }

    console.log(`\n📊 Total de documentos no Atlas: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('\n✅ Atlas completamente vazio!');
    } else {
      console.log('\n📋 Coleções com dados:');
      Object.entries(collectionCounts)
        .filter(([name, count]) => count > 0)
        .forEach(([name, count]) => {
          console.log(`   - ${name}: ${count} documentos`);
        });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do Atlas');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkAtlasStatus();
