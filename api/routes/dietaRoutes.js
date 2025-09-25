import express from "express";
import Auth from "../middleware/Auth.js";
import dietaController from "../controllers/dietaController.js";

const router = express.Router();

// Público: obter dieta atual para ESP32
router.get("/atual/:cativeiroId", dietaController.getDietaAtual);

// Master: listar e excluir; Admin/Master: criar/editar/atribuir
router.post("/", Auth.Authorization, Auth.RequireRole(['admin','master']), dietaController.createDieta);
router.get("/", Auth.Authorization, Auth.RequireRole(['master']), dietaController.listDietas);
router.put("/:id", Auth.Authorization, Auth.RequireRole(['admin','master']), dietaController.updateDieta);
router.delete("/:id", Auth.Authorization, Auth.RequireRole(['master']), dietaController.deleteDieta);

router.post("/assign/:cativeiroId", Auth.Authorization, Auth.RequireRole(['admin','master']), dietaController.assignDietaToCativeiro);

export default router;


