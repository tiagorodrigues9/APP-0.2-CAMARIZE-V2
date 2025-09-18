import express from "express";
const requestRoutes = express.Router();
import requestController from "../controllers/requestController.js";
import Auth from "../middleware/Auth.js";

// Criar solicitação (membro, admin, ou master)
requestRoutes.post('/', Auth.Authorization, Auth.RequireRole(['membro', 'admin', 'master']), requestController.create);

// Listar solicitações destinadas ao papel do usuário logado
requestRoutes.get('/', Auth.Authorization, requestController.listForTarget);

// Listar todas as solicitações (apenas para master)
requestRoutes.get('/all', Auth.Authorization, Auth.RequireRole(['master']), requestController.listAll);

// Aprovar/Recusar (apenas admin aprova leves; master aprova pesadas)
requestRoutes.post('/:id/approve', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.approve);
requestRoutes.post('/:id/reject', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.reject);

export default requestRoutes;

