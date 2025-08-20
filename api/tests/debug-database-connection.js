import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/Users.js";

// Carrega as variáveis de ambiente
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

async function debugDatabaseConnection() {
  try {
    console.log("🔍 Debugando conexão com o banco...");
    console.log("📡 URL do MongoDB:", mongoUrl);
    
    await mongoose.connect(mongoUrl);
    console.log("✅ Conexão com MongoDB estabelecida!");
    
    // Verificar informações da conexão
    console.log("📊 Informações da conexão:");
    console.log(`  - Database: ${mongoose.connection.name}`);
    console.log(`  - Host: ${mongoose.connection.host}`);
    console.log(`  - Port: ${mongoose.connection.port}`);
    console.log(`  - Ready State: ${mongoose.connection.readyState}`);
    
    // Listar todas as coleções
    console.log("\n📚 Coleções no banco:");
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Contar usuários na coleção
    console.log("\n👥 Contagem de usuários:");
    const userCount = await User.countDocuments();
    console.log(`  - Total de usuários: ${userCount}`);
    
    // Listar todos os usuários
    console.log("\n📋 Todos os usuários no banco:");
    const allUsers = await User.find();
    
    if (allUsers.length === 0) {
      console.log("  ❌ Nenhum usuário encontrado!");
    } else {
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user._id}`);
        console.log(`     Nome: ${user.nome}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Senha: ${user.senha}`);
        console.log(`     Foto: ${user.foto_perfil}`);
        console.log(`     Fazenda: ${user.fazenda}`);
        console.log(`     ---`);
      });
    }
    
    // Verificar se há usuários com email específico
    const testEmails = ["gusta@gusta", "teste@teste.com", "joao@joao.com"];
    console.log("\n🔍 Verificando emails específicos:");
    
    for (const email of testEmails) {
      const user = await User.findOne({ email });
      console.log(`  "${email}": ${user ? "ENCONTRADO" : "não encontrado"}`);
    }
    
  } catch (error) {
    console.error("❌ Erro durante o debug:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão com MongoDB fechada.");
  }
}

debugDatabaseConnection(); 