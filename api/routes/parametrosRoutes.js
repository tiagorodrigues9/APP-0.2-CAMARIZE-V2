import express from "express";
import { cadastrarParametros, getParametrosAtuais, getParametrosHistoricos, getDadosDashboard } from "../controllers/parametrosController.js";
import Auth from "../middleware/Auth.js";

const router = express.Router();

// POST - Cadastrar dados dos sensores do ESP32
router.post("/cadastrar", cadastrarParametros);

// GET - Buscar dados atuais de um cativeiro
router.get("/atuais/:cativeiroId", Auth.Authorization, getParametrosAtuais);

// GET - Buscar dados históricos de um cativeiro
router.get("/historicos/:cativeiroId", Auth.Authorization, getParametrosHistoricos);

// GET - Buscar dados completos do dashboard
router.get("/dashboard/:cativeiroId", Auth.Authorization, getDadosDashboard);

export default router; 