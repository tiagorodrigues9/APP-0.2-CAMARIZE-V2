import express from "express";
import SensoresxCativeiros from "../models/SensoresxCativeiros.js";

const router = express.Router();

// GET - Listar todas as relações sensores-cativeiros
router.get("/", async (req, res) => {
  try {
    const sensoresxCativeiros = await SensoresxCativeiros.find()
      .populate('id_sensor')
      .populate('id_cativeiro');
    
    res.json(sensoresxCativeiros);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Criar nova relação sensor-cativeiro
router.post("/", async (req, res) => {
  try {
    const { id_sensor, id_cativeiro } = req.body;
    
    const novaRelacao = new SensoresxCativeiros({
      id_sensor,
      id_cativeiro
    });
    
    const relacaoSalva = await novaRelacao.save();
    res.status(201).json(relacaoSalva);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 