#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import ParametrosAtuais from "../models/Parametros_atuais.js";

// Carrega as variáveis de ambiente
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

async function clearMockParametros() {
  try {
    console.log("🧹 Limpando dados de parâmetros mockados...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Conexão com MongoDB estabelecida!");
    
    // Contar registros antes da limpeza
    const totalAntes = await ParametrosAtuais.countDocuments();
    console.log(`📊 Total de registros antes da limpeza: ${totalAntes}`);
    
    if (totalAntes === 0) {
      console.log("ℹ️ Nenhum registro encontrado para limpar.");
      return;
    }
    
    // Limpar todos os dados de parâmetros
    const resultado = await ParametrosAtuais.deleteMany({});
    console.log(`🗑️ ${resultado.deletedCount} registros removidos com sucesso!`);
    
    // Verificar se a limpeza foi bem-sucedida
    const totalDepois = await ParametrosAtuais.countDocuments();
    console.log(`📊 Total de registros após a limpeza: ${totalDepois}`);
    
    if (totalDepois === 0) {
      console.log("✅ Limpeza concluída com sucesso! Todos os dados foram removidos.");
    } else {
      console.log("⚠️ Ainda existem registros no banco. Verifique se há dados importantes.");
    }
    
    console.log("\n🎉 Processo de limpeza finalizado!");
    
  } catch (error) {
    console.error("❌ Erro durante a limpeza:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão com MongoDB fechada.");
  }
}

clearMockParametros(); 