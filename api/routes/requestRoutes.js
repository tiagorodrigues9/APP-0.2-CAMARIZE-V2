import express from "express";
const requestRoutes = express.Router();
import requestController from "../controllers/requestController.js";
import Auth from "../middleware/Auth.js";

// Criar solicitação (membro, admin, ou master)
requestRoutes.post('/', Auth.Authorization, Auth.RequireRole(['membro', 'admin', 'master']), requestController.create);

// Listar solicitações destinadas ao papel do usuário logado
requestRoutes.get('/', Auth.Authorization, requestController.listForTarget);

// Listar solicitações do próprio usuário (histórico pessoal)
requestRoutes.get('/mine', Auth.Authorization, requestController.listMine);

// Listar todas as solicitações (apenas para master)
requestRoutes.get('/all', Auth.Authorization, Auth.RequireRole(['master']), requestController.listAll);

// Listar histórico de solicitações dos funcionários (apenas para admin/master)
requestRoutes.get('/all-admin', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.listAllForAdmin);

// Aprovar/Recusar (apenas admin aprova leves; master aprova pesadas)
requestRoutes.post('/:id/approve', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.approve);
requestRoutes.post('/:id/reject', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.reject);

// Excluir solicitação do próprio usuário
requestRoutes.delete('/:id', Auth.Authorization, requestController.removeMine);

export default requestRoutes;

