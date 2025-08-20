import express from 'express';
import notificationController from '../controllers/notificationController.js';
import Auth from '../middleware/Auth.js';
import monitoringService from '../services/monitoringService.js';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(Auth.Authorization);

// Rota para buscar notificações
router.get('/', notificationController.getNotifications);

// Rota para buscar notificações de um cativeiro específico
router.get('/cativeiro/:cativeiroId', notificationController.getNotificationsByCativeiro);

// Rota para inscrever em notificações push
router.post('/push/subscribe', notificationController.subscribeToPush);

// Rota para cancelar inscrição em notificações push
router.post('/push/unsubscribe', notificationController.unsubscribeFromPush);

// Rotas para controlar monitoramento automático
router.get('/monitoring/status', (req, res) => {
  try {
    const status = monitoringService.getStatus();
    res.status(200).json({
      success: true,
      monitoring: status
    });
  } catch (error) {
    console.error('Erro ao obter status do monitoramento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

router.post('/monitoring/start', (req, res) => {
  try {
    const { intervalMinutes = 5 } = req.body;
    monitoringService.startMonitoring(intervalMinutes);
    
    res.status(200).json({
      success: true,
      message: `Monitoramento iniciado a cada ${intervalMinutes} minutos`
    });
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

router.post('/monitoring/stop', (req, res) => {
  try {
    monitoringService.stopMonitoring();
    
    res.status(200).json({
      success: true,
      message: 'Monitoramento parado'
    });
  } catch (error) {
    console.error('Erro ao parar monitoramento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

router.post('/monitoring/check', async (req, res) => {
  try {
    await monitoringService.manualCheck();
    
    res.status(200).json({
      success: true,
      message: 'Verificação manual executada'
    });
  } catch (error) {
    console.error('Erro na verificação manual:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router; 