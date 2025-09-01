import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  try {
    console.log('🔍 Verificando conexão...');
    
    // Mostrar a URL que está sendo usada
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/camarize';
    console.log(`📡 URL de conexão: ${mongoUrl}`);
    
    // Conectar
    await mongoose.connect(mongoUrl);
    console.log('✅ Conectado!');
    
    // Mostrar informações do banco
    const dbName = mongoose.connection.db.databaseName;
    const dbHost = mongoose.connection.host;
    const dbPort = mongoose.connection.port;
    
    console.log(`\n📊 Informações do banco:`);
    console.log(`   Nome: ${dbName}`);
    console.log(`   Host: ${dbHost}`);
    console.log(`   Porta: ${dbPort}`);
    
    // Verificar Tipos_sensor especificamente
    console.log('\n📋 Verificando Tipos_sensor...');
    const count = await mongoose.connection.db.collection('Tipos_sensor').countDocuments();
    console.log(`   Documentos em Tipos_sensor: ${count}`);
    
    if (count > 0) {
      const docs = await mongoose.connection.db.collection('Tipos_sensor').find({}).toArray();
      console.log('\n📄 Documentos encontrados:');
      docs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc._id}, Descrição: ${doc.descricao}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkConnection();
