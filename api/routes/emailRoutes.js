import express from 'express';
import notificationController from '../controllers/notificationController.js';
import Auth from '../middleware/Auth.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(Auth.Authorization);

// Rota para obter configurações de email do usuário
router.get('/settings', notificationController.getEmailSettings);

// Rota para atualizar configurações de email
router.put('/settings', notificationController.updateEmailSettings);

// Rota para enviar email de teste
router.post('/test', notificationController.sendTestEmail);

// Rota para verificar status do serviço de email
router.get('/status', notificationController.checkEmailServiceStatus);

// Rota para validar email
router.post('/validate', notificationController.validateEmail);

export default router;
