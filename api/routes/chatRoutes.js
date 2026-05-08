import express from 'express';
import Auth from '../middleware/Auth.js';
import chatController from '../controllers/chatController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Mensagens internas entre admin e master
 */

/**
 * @swagger
 * /chat/conversations:
 *   post:
 *     summary: Criar ou buscar conversa entre dois participantes
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participants]
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array com IDs dos dois participantes (admin e master)
 *                 example: ["664a1b2c3d4e5f6a7b8c9d0e", "664a1b2c3d4e5f6a7b8c9d0f"]
 *     responses:
 *       200:
 *         description: Conversa existente retornada ou nova criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conversation'
 */
router.post('/conversations', Auth.Authorization, chatController.upsertConversation);

/**
 * @swagger
 * /chat/conversations/mine:
 *   get:
 *     summary: Listar conversas do usuário autenticado
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversas com última mensagem e contagem de não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations/mine', Auth.Authorization, chatController.listMyConversations);

/**
 * @swagger
 * /chat/conversations/{id}/messages:
 *   get:
 *     summary: Buscar mensagens de uma conversa
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conversa
 *     responses:
 *       200:
 *         description: Lista de mensagens ordenadas por data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: Conversa não encontrada
 *   post:
 *     summary: Enviar mensagem em uma conversa
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Temperatura do viveiro A1 está acima do ideal!
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.get('/conversations/:id/messages', Auth.Authorization, chatController.getMessages);
router.post('/conversations/:id/messages', Auth.Authorization, chatController.sendMessage);

/**
 * @swagger
 * /chat/conversations/{id}/read:
 *   post:
 *     summary: Marcar conversa como lida (zera contador de não lidas)
 *     tags: [Chat]
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
 *         description: Conversa marcada como lida
 */
router.post('/conversations/:id/read', Auth.Authorization, chatController.markRead);

/**
 * @swagger
 * /chat/conversations/{id}:
 *   delete:
 *     summary: Excluir conversa
 *     tags: [Chat]
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
 *         description: Conversa excluída com sucesso
 *       404:
 *         description: Conversa não encontrada
 */
router.delete('/conversations/:id', Auth.Authorization, chatController.deleteConversation);

export default router;
