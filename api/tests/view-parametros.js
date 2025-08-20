#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

console.log('👀 Visualizando dados de parâmetros atuais no banco...');
console.log('==================================================\n');

async function viewParametros() {
  try {
    // Conecta ao MongoDB
    const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";
    console.log('📡 Conectando ao MongoDB...');
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Conectado ao MongoDB Atlas!');
    
    // Importa os modelos
    await import('../models/Parametros_atuais.js');
    await import('../models/Cativeiros.js');
    
    const ParametrosAtuais = mongoose.model('ParametrosAtuais');
    const Cativeiros = mongoose.model('Cativeiros');
    
    // Busca todos os registros ordenados por data
    const parametros = await ParametrosAtuais.find()
      .sort({ datahora: 1 })
      .populate('id_cativeiro');
    
    console.log(`📊 Total de registros encontrados: ${parametros.length}\n`);
    
    if (parametros.length === 0) {
      console.log('❌ Nenhum registro encontrado.');
      return;
    }
    
    // Mostra cada registro
    parametros.forEach((parametro, index) => {
      console.log(`📋 REGISTRO ${index + 1}:`);
      console.log(`   ID: ${parametro._id}`);
      console.log(`   Cativeiro: ${parametro.id_cativeiro?._id || 'N/A'}`);
      console.log(`   Temperatura: ${parametro.temp_atual}°C`);
      console.log(`   pH: ${parametro.ph_atual}`);
      console.log(`   Amônia: ${parametro.amonia_atual}mg/L`);
      console.log(`   Data/Hora: ${parametro.datahora.toLocaleString()}`);
      console.log(`   Criado em: ${parametro.createdAt?.toLocaleString() || 'N/A'}`);
      console.log('');
    });
    
    // Mostra estatísticas
    console.log('📈 ESTATÍSTICAS:');
    console.log(`   Total de registros: ${parametros.length}`);
    console.log(`   Primeiro registro: ${parametros[0]?.datahora.toLocaleString()}`);
    console.log(`   Último registro: ${parametros[parametros.length - 1]?.datahora.toLocaleString()}`);
    
    // Agrupa por cativeiro
    const porCativeiro = {};
    parametros.forEach(parametro => {
      const cativeiroId = parametro.id_cativeiro?._id || 'Desconhecido';
      if (!porCativeiro[cativeiroId]) {
        porCativeiro[cativeiroId] = [];
      }
      porCativeiro[cativeiroId].push(parametro);
    });
    
    console.log('\n📊 REGISTROS POR CATIVEIRO:');
    Object.keys(porCativeiro).forEach(cativeiroId => {
      console.log(`   Cativeiro ${cativeiroId}: ${porCativeiro[cativeiroId].length} registros`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao visualizar dados:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Conexão fechada');
  }
}

viewParametros(); 