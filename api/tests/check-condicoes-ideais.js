#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import CondicoesIdeais from "./models/Condicoes_ideais.js";
import Cativeiros from "./models/Cativeiros.js";
import ParametrosAtuais from "./models/Parametros_atuais.js";
import TiposCamarao from "./models/Camaroes.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

async function checkCondicoesIdeais() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("✅ Conectado ao MongoDB");

    console.log("\n📊 Verificando Condições Ideais:");
    const condicoes = await CondicoesIdeais.find().populate('id_tipo_camarao');
    console.log(`Total de condições ideais: ${condicoes.length}`);
    
    condicoes.forEach((condicao, index) => {
      console.log(`\n${index + 1}. Condição Ideal:`);
      console.log(`   Tipo de Camarão: ${condicao.id_tipo_camarao?.nome || 'N/A'}`);
      console.log(`   Temperatura Ideal: ${condicao.temp_ideal}°C`);
      console.log(`   pH Ideal: ${condicao.ph_ideal}`);
      console.log(`   Amônia Ideal: ${condicao.amonia_ideal}mg/L`);
    });

    console.log("\n📊 Verificando Cativeiros:");
    const cativeiros = await Cativeiros.find().populate('id_tipo_camarao').populate('condicoes_ideais');
    console.log(`Total de cativeiros: ${cativeiros.length}`);
    
    cativeiros.forEach((cativeiro, index) => {
      console.log(`\n${index + 1}. Cativeiro: ${cativeiro.nome}`);
      console.log(`   Tipo: ${cativeiro.id_tipo_camarao?.nome || 'N/A'}`);
      console.log(`   Condições Ideais: ${cativeiro.condicoes_ideais ? 'Sim' : 'Não'}`);
      if (cativeiro.condicoes_ideais) {
        console.log(`   - Temp Ideal: ${cativeiro.condicoes_ideais.temp_ideal}°C`);
        console.log(`   - pH Ideal: ${cativeiro.condicoes_ideais.ph_ideal}`);
        console.log(`   - Amônia Ideal: ${cativeiro.condicoes_ideais.amonia_ideal}mg/L`);
      }
    });

    console.log("\n📊 Verificando Parâmetros Atuais:");
    const parametros = await ParametrosAtuais.find().populate('id_cativeiro');
    console.log(`Total de parâmetros: ${parametros.length}`);
    
    parametros.forEach((parametro, index) => {
      console.log(`\n${index + 1}. Parâmetro Atual:`);
      console.log(`   Cativeiro: ${parametro.id_cativeiro?.nome || 'N/A'}`);
      console.log(`   Data/Hora: ${parametro.datahora}`);
      console.log(`   Temperatura: ${parametro.temp_atual}°C`);
      console.log(`   pH: ${parametro.ph_atual}`);
      console.log(`   Amônia: ${parametro.amonia_atual}mg/L`);
    });

  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Desconectado do MongoDB");
  }
}

checkCondicoesIdeais(); 