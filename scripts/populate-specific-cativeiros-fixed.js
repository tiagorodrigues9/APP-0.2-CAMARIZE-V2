#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from 'readline';

// Carrega as variáveis de ambiente
dotenv.config({ path: './api/.env' });

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

// Interface de leitura do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas ao usuário
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function populateSpecificCativeiros() {
  try {
    console.log("🔍 Adicionando parâmetros manualmente...");
    
    // Configurar timeout maior para conexão
    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000, // 45 segundos
    });
    console.log("✅ Conexão com MongoDB estabelecida!");
    
    // Aguardar um pouco para garantir que a conexão está estável
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Usar a conexão direta do MongoDB
    const db = mongoose.connection.db;
    
    // Buscar cativeiros existentes
    const cativeiros = await db.collection('cativeiros').find({}).toArray();
    console.log(`📋 Encontrados ${cativeiros.length} cativeiros`);
    
    if (cativeiros.length === 0) {
      console.log("❌ Nenhum cativeiro encontrado! Crie um cativeiro primeiro.");
      return;
    }
    
    // Buscar tipos de camarão para mostrar informações
    const tiposCamarao = await db.collection('especif_camarao').find({}).toArray();
    const tiposMap = {};
    tiposCamarao.forEach(tipo => {
      tiposMap[tipo._id.toString()] = tipo.nome;
    });
    
    // Mostrar cativeiros disponíveis
    console.log("\n🏠 Cativeiros disponíveis:");
    cativeiros.forEach((cativeiro, index) => {
      const tipoNome = tiposMap[cativeiro.id_tipo_camarao?.toString()] || 'Tipo não definido';
      console.log(`   ${index + 1}. ${cativeiro.nome} (${tipoNome})`);
    });
    
    // Escolher cativeiro
    const escolhaCativeiro = await question("\n📝 Escolha o número do cativeiro: ");
    const indiceCativeiro = parseInt(escolhaCativeiro) - 1;
    
    if (indiceCativeiro < 0 || indiceCativeiro >= cativeiros.length) {
      console.log("❌ Escolha inválida!");
      return;
    }
    
    const cativeiroEscolhido = cativeiros[indiceCativeiro];
    console.log(`\n✅ Cativeiro selecionado: ${cativeiroEscolhido.nome}`);
    
    // Coletar dados do usuário
    console.log("\n📊 Insira os valores dos parâmetros:");
    
    const temperatura = await question("🌡️ Temperatura (°C): ");
    const ph = await question("🧪 pH: ");
    const amonia = await question("⚗️ Amônia (mg/L): ");
    
    // Validar dados
    const temp = parseFloat(temperatura);
    const phValue = parseFloat(ph);
    const amoniaValue = parseFloat(amonia);
    
    if (isNaN(temp) || isNaN(phValue) || isNaN(amoniaValue)) {
      console.log("❌ Valores inválidos! Use apenas números.");
      return;
    }
    
    // Confirmar dados
    console.log("\n📋 Dados a serem inseridos:");
    console.log(`   Cativeiro: ${cativeiroEscolhido.nome}`);
    console.log(`   Temperatura: ${temp}°C`);
    console.log(`   pH: ${phValue}`);
    console.log(`   Amônia: ${amoniaValue} mg/L`);
    console.log(`   Data/Hora: ${new Date().toLocaleString()}`);
    
    const confirmacao = await question("\n❓ Confirmar inserção? (s/n): ");
    
    if (confirmacao.toLowerCase() !== 's' && confirmacao.toLowerCase() !== 'sim') {
      console.log("❌ Operação cancelada.");
      return;
    }
    
    // Criar registro usando a conexão direta
    const novoParametro = {
      datahora: new Date(),
      temp_atual: temp,
      ph_atual: phValue,
      amonia_atual: amoniaValue,
      id_cativeiro: cativeiroEscolhido._id
    };
    
    const result = await db.collection('parametros_atuais').insertOne(novoParametro);
    
    console.log("\n✅ Parâmetro inserido com sucesso!");
    console.log(`📊 ID do registro: ${result.insertedId}`);
    
    // Mostrar estatísticas
    const totalParametros = await db.collection('parametros_atuais').countDocuments();
    const parametrosCativeiro = await db.collection('parametros_atuais').countDocuments({ 
      id_cativeiro: cativeiroEscolhido._id 
    });
    
    console.log(`\n📈 Estatísticas:`);
    console.log(`   Total de parâmetros no banco: ${totalParametros}`);
    console.log(`   Parâmetros deste cativeiro: ${parametrosCativeiro}`);
    
    // Perguntar se quer adicionar mais
    const adicionarMais = await question("\n❓ Adicionar mais um registro? (s/n): ");
    
    if (adicionarMais.toLowerCase() === 's' || adicionarMais.toLowerCase() === 'sim') {
      console.log("\n" + "=".repeat(50));
      await populateSpecificCativeiros(); // Recursão para adicionar mais
    } else {
      console.log("\n🎉 Processo finalizado!");
    }
    
  } catch (error) {
    console.error("❌ Erro durante a inserção:", error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("🔌 Conexão com MongoDB fechada.");
  }
}

populateSpecificCativeiros();

