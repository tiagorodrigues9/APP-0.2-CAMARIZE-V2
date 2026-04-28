import express from "express";
const requestRoutes = express.Router();
import requestController from "../controllers/requestController.js";
import Auth from "../middleware/Auth.js";

/**
 * @swagger
 * tags:
 *   name: Solicitações
 *   description: |
 *     Fluxo de aprovação para ações que requerem autorização hierárquica.
 *
 *     **Tipos:**
 *     - `leve`: aprovada pelo admin da fazenda
 *     - `pesada`: aprovada pelo master
 *
 *     **Casos de uso comuns:**
 *     - Cadastro de proprietário (membro → master)
 *     - Cadastro de funcionário (membro → admin)
 *     - Alterações em recursos da fazenda (admin → master)
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Criar nova solicitação
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestCreate'
 *     responses:
 *       201:
 *         description: Solicitação criada e aguardando aprovação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       403:
 *         description: Sem permissão para criar este tipo de solicitação
 *   get:
 *     summary: Listar solicitações destinadas ao papel do usuário autenticado
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitações pendentes para aprovação
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */
requestRoutes.post('/', Auth.Authorization, Auth.RequireRole(['membro', 'admin', 'master']), requestController.create);
requestRoutes.get('/', Auth.Authorization, requestController.listForTarget);

/**
 * @swagger
 * /requests/mine:
 *   get:
 *     summary: Listar solicitações criadas pelo usuário autenticado (histórico pessoal)
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico de solicitações do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */
requestRoutes.get('/mine', Auth.Authorization, requestController.listMine);

/**
 * @swagger
 * /requests/all:
 *   get:
 *     summary: Listar todas as solicitações do sistema — requer role master
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as solicitações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *       403:
 *         description: Sem permissão
 */
requestRoutes.get('/all', Auth.Authorization, Auth.RequireRole(['master']), requestController.listAll);

/**
 * @swagger
 * /requests/all-admin:
 *   get:
 *     summary: Listar solicitações de funcionários — requer role admin ou master
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitações de funcionários da fazenda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */
requestRoutes.get('/all-admin', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.listAllForAdmin);

/**
 * @swagger
 * /requests/{id}/approve:
 *   post:
 *     summary: Aprovar solicitação — requer role admin ou master
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da solicitação
 *     responses:
 *       200:
 *         description: Solicitação aprovada e ação executada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Sem permissão para aprovar este tipo de solicitação
 *       404:
 *         description: Solicitação não encontrada
 */
requestRoutes.post('/:id/approve', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.approve);

/**
 * @swagger
 * /requests/{id}/reject:
 *   post:
 *     summary: Recusar solicitação — requer role admin ou master
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitação recusada
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Solicitação não encontrada
 */
requestRoutes.post('/:id/reject', Auth.Authorization, Auth.RequireRole(['admin', 'master']), requestController.reject);

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Excluir própria solicitação pendente
 *     tags: [Solicitações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Solicitação excluída
 *       403:
 *         description: Só é possível excluir solicitações próprias
 *       404:
 *         description: Solicitação não encontrada
 */
requestRoutes.delete('/:id', Auth.Authorization, requestController.removeMine);

export default requestRoutes;
