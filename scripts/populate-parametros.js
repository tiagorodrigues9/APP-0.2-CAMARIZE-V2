import mongoose from "mongoose";
import dotenv from "dotenv";
import ParametrosAtuais from "../models/Parametros_atuais.js";
import Cativeiros from "../models/Cativeiros.js";

// Carrega as variáveis de ambiente
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/camarize";

async function populateParametros() {
  try {
    console.log("🔍 Populando dados de parâmetros...");
    await mongoose.connect(mongoUrl);
    console.log("✅ Conexão com MongoDB estabelecida!");
    
    // Buscar cativeiros existentes
    const cativeiros = await Cativeiros.find();
    console.log(`📋 Encontrados ${cativeiros.length} cativeiros`);
    
    if (cativeiros.length === 0) {
      console.log("❌ Nenhum cativeiro encontrado! Crie um cativeiro primeiro.");
      return;
    }
    
    // Limpar dados existentes
    await ParametrosAtuais.deleteMany({});
    console.log("🧹 Dados antigos removidos");
    
    // Gerar dados para os últimos 7 dias
    const dadosGerados = [];
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      
      // Gerar múltiplas leituras por dia (a cada 4 horas)
      for (let hora = 0; hora < 24; hora += 4) {
        const dataHora = new Date(data);
        dataHora.setHours(hora, 0, 0, 0);
        
        for (const cativeiro of cativeiros) {
          // Gerar valores realistas com variação
          const temperatura = 26 + Math.random() * 4; // 26-30°C
          const ph = 7.0 + Math.random() * 1.5; // 7.0-8.5
          const amonia = 0.1 + Math.random() * 0.3; // 0.1-0.4 mg/L
          
          dadosGerados.push({
            datahora: dataHora,
            temp_atual: parseFloat(temperatura.toFixed(1)),
            ph_atual: parseFloat(ph.toFixed(1)),
            amonia_atual: parseFloat(amonia.toFixed(2)),
            id_cativeiro: cativeiro._id
          });
        }
      }
    }
    
    // Inserir dados no banco
    await ParametrosAtuais.insertMany(dadosGerados);
    console.log(`✅ ${dadosGerados.length} registros inseridos com sucesso!`);
    
    // Verificar dados inseridos
    const totalParametros = await ParametrosAtuais.countDocuments();
    console.log(`📊 Total de parâmetros no banco: ${totalParametros}`);
    
    // Mostrar alguns exemplos
    const exemplos = await ParametrosAtuais.find().limit(5).sort({ datahora: -1 });
    console.log("\n📋 Exemplos de dados inseridos:");
    exemplos.forEach((parametro, index) => {
      console.log(`  ${index + 1}. Cativeiro: ${parametro.id_cativeiro}`);
      console.log(`     Temperatura: ${parametro.temp_atual}°C`);
      console.log(`     pH: ${parametro.ph_atual}`);
      console.log(`     Amônia: ${parametro.amonia_atual} mg/L`);
      console.log(`     Data/Hora: ${parametro.datahora}`);
      console.log(`     ---`);
    });
    
    console.log("\n🎉 Dados populados com sucesso! Agora o dashboard deve funcionar.");
    
  } catch (error) {
    console.error("❌ Erro durante a população:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Conexão com MongoDB fechada.");
  }
}

populateParametros(); 