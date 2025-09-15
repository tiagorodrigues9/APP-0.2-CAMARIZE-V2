#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config({ path: './api/.env' });

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

async function testConnection() {
  try {
    console.log("🔍 Testando conexão com MongoDB...");
    console.log("URL:", mongoUrl);
    
    // Configurar timeout maior para conexão
    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
    });
    console.log("✅ Conexão com MongoDB estabelecida!");
    
    // Testar uma operação simples
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📋 Coleções disponíveis:", collections.map(c => c.name));
    
  } catch (error) {
    console.error("❌ Erro durante a conexão:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão com MongoDB fechada.");
  }
}

testConnection();

