import express from "express";
import SensoresxCativeiros from "../models/SensoresxCativeiros.js";
import Sensores from "../models/Sensores.js";
import Cativeiros from "../models/Cativeiros.js";

const router = express.Router();

// Rota de teste simples
router.get("/", (req, res) => {
  res.json({ 
    message: "✅ API funcionando!",
    timestamp: new Date().toISOString(),
    status: "online"
  });
});

// Teste para criar relação manualmente
router.post("/test-relacao", async (req, res) => {
  try {
    const { sensorId, cativeiroId } = req.body;
    
    console.log('🧪 Teste de criação de relação:');
    console.log('Sensor ID:', sensorId);
    console.log('Cativeiro ID:', cativeiroId);
    
    // Verifica se o sensor existe
    const sensor = await Sensores.findById(sensorId);
    if (!sensor) {
      return res.status(400).json({ error: "Sensor não encontrado" });
    }
    console.log('✅ Sensor encontrado:', sensor.nome);
    
    // Verifica se o cativeiro existe
    const cativeiro = await Cativeiros.findById(cativeiroId);
    if (!cativeiro) {
      return res.status(400).json({ error: "Cativeiro não encontrado" });
    }
    console.log('✅ Cativeiro encontrado:', cativeiro._id);
    
    // Cria a relação
    const relacao = await SensoresxCativeiros.create({
      id_sensor: sensorId,
      id_cativeiro: cativeiroId
    });
    
    console.log('✅ Relação criada:', relacao);
    
    res.status(201).json({
      message: "Relação criada com sucesso!",
      relacao: relacao
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lista todas as relações
router.get("/test-relacoes", async (req, res) => {
  try {
    const relacoes = await SensoresxCativeiros.find()
      .populate('id_sensor')
      .populate('id_cativeiro');
    
    res.json({
      total: relacoes.length,
      relacoes: relacoes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista sensores disponíveis
router.get("/test-sensores", async (req, res) => {
  try {
    const sensores = await Sensores.find();
    res.json(sensores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista cativeiros disponíveis
router.get("/test-cativeiros", async (req, res) => {
  try {
    const cativeiros = await Cativeiros.find();
    res.json(cativeiros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove todas as relações de um cativeiro específico
router.delete("/limpar-relacoes/:cativeiroId", async (req, res) => {
  try {
    const { cativeiroId } = req.params;
    
    console.log('🧹 Limpando relações do cativeiro:', cativeiroId);
    
    const result = await SensoresxCativeiros.deleteMany({ id_cativeiro: cativeiroId });
    
    console.log(`🗑️  ${result.deletedCount} relações removidas`);
    
    res.json({
      message: `${result.deletedCount} relações removidas`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Erro ao limpar relações:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 