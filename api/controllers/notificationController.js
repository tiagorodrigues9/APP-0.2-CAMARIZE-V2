import ParametrosAtuais from "../models/Parametros_atuais.js";
import CondicoesIdeais from "../models/Condicoes_ideais.js";
import Cativeiros from "../models/Cativeiros.js";
import PushSubscription from "../models/PushSubscriptions.js";
import EmailSettings from "../models/EmailSettings.js";
import emailService from "../services/emailService.js";

// Configuração VAPID — obrigatório no .env, sem estas chaves push notifications não funcionam
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error(
    "VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY não definidos no .env. " +
    "Push notifications não funcionarão sem estas chaves."
  );
}

// Função para enviar notificações push
const sendPushNotification = async (subscription, notificationData) => {
  try {
    const webpush = await import('web-push');
    
    // Configurar VAPID
    webpush.default.setVapidDetails(
      'mailto:camarize@example.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    
    const payload = JSON.stringify({
      title: 'Camarize - Alerta',
      body: notificationData.mensagem,
      icon: '/images/logo_camarize1.png',
      badge: '/images/logo_camarize2.png',
      data: {
        url: `/rel-individual/${notificationData.cativeiro}`,
        cativeiroId: notificationData.cativeiro,
        tipo: notificationData.tipo,
        severidade: notificationData.severidade
      }
    });

    await webpush.default.sendNotification(subscription, payload);
    console.log('✅ Notificação push enviada:', notificationData.mensagem);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação push:', error);
  }
};

// Função para enviar notificações push para todos os usuários inscritos
const sendNotificationsToAllSubscribers = async (notificationData) => {
  try {
    console.log('📱 Enviando notificação push para todos os inscritos:', notificationData.mensagem);
    
    // Buscar todas as subscriptions ativas
    const subscriptions = await PushSubscription.find({ isActive: true });
    
    console.log(`📊 Encontradas ${subscriptions.length} subscriptions ativas`);
    
    // Enviar para cada subscription
    for (const sub of subscriptions) {
      try {
        await sendPushNotification(sub.subscription, notificationData);
      } catch (error) {
        console.error(`❌ Erro ao enviar para subscription ${sub._id}:`, error);
        
        // Se a subscription está inválida, marcar como inativa
        if (error.statusCode === 410) {
          await PushSubscription.findByIdAndUpdate(sub._id, { isActive: false });
          console.log(`🗑️ Subscription ${sub._id} marcada como inativa`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao enviar notificações push:', error);
  }
};

// Função para enviar alertas por email
const sendEmailAlerts = async (notificationData) => {
  try {
    console.log('📧 Enviando alertas por email:', notificationData.mensagem);
    
    // Buscar todas as configurações de email ativas
    const emailSettings = await EmailSettings.find({ 
      emailEnabled: true 
    }).populate('userId', 'nome email');
    
    console.log(`📊 Encontradas ${emailSettings.length} configurações de email ativas`);
    
    // Enviar para cada usuário que tem email configurado
    for (const settings of emailSettings) {
      try {
        const forceSend = process.env.EMAIL_FORCE_SEND === 'true';

        // Verificar se deve enviar email baseado nas configurações
        if (!forceSend && !settings.shouldSendEmail(notificationData.tipo, notificationData.severidade)) {
          console.log(`⏭️ Email pulado para ${settings.emailAddress} - configurações não atendidas`);
          continue;
        } else if (forceSend) {
          console.log(`⚙️  Forçando envio ignorando preferências do usuário (EMAIL_FORCE_SEND=true)`);
        }
        
        // Verificar horário de silêncio
        if (!forceSend && settings.isInQuietHours()) {
          console.log(`🌙 Email pulado para ${settings.emailAddress} - horário de silêncio`);
          continue;
        }
        
        // Verificar limite de frequência (pode ser desabilitado por env)
        const disableRateLimit = process.env.EMAIL_DISABLE_RATE_LIMIT === 'true';
        if (!disableRateLimit && !settings.canSendEmail()) {
          const reason = settings.getLastBlockReason?.() || 'rate_limit';
          const reasonText = {
            min_interval: `intervalo mínimo de ${settings.frequency?.minIntervalMinutes ?? '?'} min não cumprido`,
            hour_limit: `máximo por hora (${settings.frequency?.maxEmailsPerHour ?? '?'}) atingido`,
            day_limit: `máximo por dia (${settings.frequency?.maxEmailsPerDay ?? '?'}) atingido`,
            rate_limit: 'limite de frequência atingido'
          }[reason];
          console.log(`⏰ Email pulado para ${settings.emailAddress} - ${reasonText}`);
          continue;
        } else if (disableRateLimit) {
          console.log(`⚙️  Rate limit de email desabilitado por ENV para ${settings.emailAddress}`);
        }
        
        // Enviar email
        const result = await emailService.sendAlertEmail(settings.emailAddress, notificationData);
        
        if (result.success) {
          // Registrar envio bem-sucedido
          settings.recordEmailSent();
          await settings.save();
          
          console.log(`✅ Email enviado para ${settings.emailAddress}:`, result.messageId);
        } else {
          console.error(`❌ Erro ao enviar email para ${settings.emailAddress}:`, result.error);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar email para ${settings.emailAddress}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao enviar alertas por email:', error);
  }
};

// Função para gerar notificações baseadas na comparação de dados (OTIMIZADA)
const generateNotifications = async (usuarioId = null, limit = 50) => {
  try {
    const notifications = [];
    
    let cativeiros;
    
    if (usuarioId) {
      // Se um usuário foi especificado, busca apenas os cativeiros do usuário
      const cativeiroService = (await import('../services/cativeiroService.js')).default;
      cativeiros = await cativeiroService.getAllByUsuarioViaRelacionamentos(usuarioId);
    } else {
      // Se não, busca todos os cativeiros (comportamento original)
      cativeiros = await Cativeiros.find()
        .populate('condicoes_ideais')
        .populate('id_tipo_camarao')
        .lean(); // Usa lean() para melhor performance
    }
    
    if (!cativeiros || cativeiros.length === 0) {
      return [];
    }
    
    // Buscar todos os parâmetros atuais de uma vez usando agregação
    const cativeiroIds = cativeiros.map(c => c._id);
    
    // Buscar o parâmetro mais recente de cada cativeiro em uma única query
    const parametrosRecentes = await ParametrosAtuais.aggregate([
      { $match: { id_cativeiro: { $in: cativeiroIds } } },
      { $sort: { datahora: -1 } },
      {
        $group: {
          _id: '$id_cativeiro',
          temp_atual: { $first: '$temp_atual' },
          ph_atual: { $first: '$ph_atual' },
          amonia_atual: { $first: '$amonia_atual' },
          datahora: { $first: '$datahora' },
          parametroId: { $first: '$_id' }
        }
      }
    ]);
    
    // Criar um mapa para acesso rápido
    const parametrosMap = new Map();
    parametrosRecentes.forEach(p => {
      parametrosMap.set(p._id.toString(), p);
    });
    
    // Tolerâncias mais realistas por parâmetro
    const toleranciaTemp = 0.15; // 15% para temperatura
    const toleranciaPh = 0.2;    // 20% para pH
    const toleranciaAmonia = 0.25; // 25% para amônia
    
    for (const cativeiro of cativeiros) {
      const parametroAtual = parametrosMap.get(cativeiro._id.toString());
      
      if (!parametroAtual || !cativeiro.condicoes_ideais) {
        continue; // Pula se não há dados para comparar
      }
      
      const condicaoIdeal = cativeiro.condicoes_ideais;
      
      // Compara temperatura
      if (condicaoIdeal.temp_ideal) {
        const diffTemp = Math.abs(parametroAtual.temp_atual - condicaoIdeal.temp_ideal);
        const toleranciaTempValor = condicaoIdeal.temp_ideal * toleranciaTemp;
        
        if (diffTemp > toleranciaTempValor) {
          const tipo = parametroAtual.temp_atual > condicaoIdeal.temp_ideal ? 'aumento' : 'diminuição';
          const notificationData = {
            id: `temp_${cativeiro._id}_${parametroAtual.parametroId}`,
            tipo: 'temperatura',
            cativeiro: cativeiro._id,
            cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
            valorAtual: parametroAtual.temp_atual,
            valorIdeal: condicaoIdeal.temp_ideal,
            diferenca: diffTemp,
            mensagem: `Temperatura com ${tipo}! Atual: ${parametroAtual.temp_atual}°C, Ideal: ${condicaoIdeal.temp_ideal}°C`,
            datahora: parametroAtual.datahora,
            severidade: diffTemp > toleranciaTempValor * 2 ? 'alta' : 'media'
          };
          
          notifications.push(notificationData);
          
          // Enviar notificações em background (não bloqueia a resposta)
          sendNotificationsToAllSubscribers(notificationData).catch(err => console.error('Erro ao enviar push:', err));
          sendEmailAlerts(notificationData).catch(err => console.error('Erro ao enviar email:', err));
        }
      }
      
      // Compara pH
      if (condicaoIdeal.ph_ideal) {
        const diffPh = Math.abs(parametroAtual.ph_atual - condicaoIdeal.ph_ideal);
        const toleranciaPhValor = condicaoIdeal.ph_ideal * toleranciaPh;
        
        if (diffPh > toleranciaPhValor) {
          const tipo = parametroAtual.ph_atual > condicaoIdeal.ph_ideal ? 'aumento' : 'diminuição';
          const notificationData = {
            id: `ph_${cativeiro._id}_${parametroAtual.parametroId}`,
            tipo: 'ph',
            cativeiro: cativeiro._id,
            cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
            valorAtual: parametroAtual.ph_atual,
            valorIdeal: condicaoIdeal.ph_ideal,
            diferenca: diffPh,
            mensagem: `pH com ${tipo}! Atual: ${parametroAtual.ph_atual}, Ideal: ${condicaoIdeal.ph_ideal}`,
            datahora: parametroAtual.datahora,
            severidade: diffPh > toleranciaPhValor * 2 ? 'alta' : 'media'
          };
          
          notifications.push(notificationData);
          
          // Enviar notificações em background
          sendNotificationsToAllSubscribers(notificationData).catch(err => console.error('Erro ao enviar push:', err));
          sendEmailAlerts(notificationData).catch(err => console.error('Erro ao enviar email:', err));
        }
      }
      
      // Compara amônia
      if (condicaoIdeal.amonia_ideal) {
        const diffAmonia = Math.abs(parametroAtual.amonia_atual - condicaoIdeal.amonia_ideal);
        const toleranciaAmoniaValor = condicaoIdeal.amonia_ideal * toleranciaAmonia;
        
        if (diffAmonia > toleranciaAmoniaValor) {
          const tipo = parametroAtual.amonia_atual > condicaoIdeal.amonia_ideal ? 'aumento' : 'diminuição';
          const notificationData = {
            id: `amonia_${cativeiro._id}_${parametroAtual.parametroId}`,
            tipo: 'amonia',
            cativeiro: cativeiro._id,
            cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
            valorAtual: parametroAtual.amonia_atual,
            valorIdeal: condicaoIdeal.amonia_ideal,
            diferenca: diffAmonia,
            mensagem: `Nível de amônia com ${tipo}! Atual: ${parametroAtual.amonia_atual}mg/L, Ideal: ${condicaoIdeal.amonia_ideal}mg/L`,
            datahora: parametroAtual.datahora,
            severidade: diffAmonia > toleranciaAmoniaValor * 2 ? 'alta' : 'media'
          };
          
          notifications.push(notificationData);
          
          // Enviar notificações em background
          sendNotificationsToAllSubscribers(notificationData).catch(err => console.error('Erro ao enviar push:', err));
          sendEmailAlerts(notificationData).catch(err => console.error('Erro ao enviar email:', err));
        }
      }
    }
    
    // Ordena por data/hora (mais recentes primeiro)
    notifications.sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
    
    // Limitar resultados para melhor performance
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('Erro ao gerar notificações:', error);
    return [];
  }
};

// Controller para buscar notificações (OTIMIZADO)
const getNotifications = async (req, res) => {
  try {
    const usuarioId = req.loggedUser?.id;
    const limit = parseInt(req.query.limit) || 50; // Limite padrão de 50 notificações
    
    const notifications = await generateNotifications(usuarioId, limit);
    
    res.status(200).json({
      success: true,
      notifications: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Controller para buscar notificações de um cativeiro específico
const getNotificationsByCativeiro = async (req, res) => {
  try {
    const { cativeiroId } = req.params;
    const usuarioId = req.loggedUser?.id;
    
    const notifications = await generateNotifications(usuarioId);
    const filteredNotifications = notifications.filter(
      notification => notification.cativeiro.toString() === cativeiroId
    );
    
    res.status(200).json({
      success: true,
      notifications: filteredNotifications,
      total: filteredNotifications.length
    });
  } catch (error) {
    console.error('Erro ao buscar notificações do cativeiro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Controller para inscrever em notificações push
const subscribeToPush = async (req, res) => {
  try {
    const { subscription, userId, deviceInfo } = req.body;
    
    // Verificar se já existe uma subscription para este endpoint
    const existingSubscription = await PushSubscription.findOne({
      'subscription.endpoint': subscription.endpoint
    });
    
    if (existingSubscription) {
      // Atualizar subscription existente
      await PushSubscription.findByIdAndUpdate(existingSubscription._id, {
        userId: userId,
        subscription: subscription,
        deviceInfo: deviceInfo,
        isActive: true,
        createdAt: new Date()
      });
      console.log('✅ Subscription atualizada:', subscription.endpoint);
    } else {
      // Criar nova subscription
      await PushSubscription.create({
        userId: userId,
        subscription: subscription,
        deviceInfo: deviceInfo
      });
      console.log('✅ Nova subscription criada:', subscription.endpoint);
    }
    
    console.log('✅ Nova inscrição para notificações push:', {
      userId,
      deviceInfo,
      subscription: subscription.endpoint
    });
    
    res.status(200).json({
      success: true,
      message: 'Inscrito para notificações push com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao inscrever para notificações push:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para cancelar inscrição em notificações push
const unsubscribeFromPush = async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    
    // Marcar subscription como inativa
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      { isActive: false }
    );
    
    console.log('❌ Cancelamento de inscrição para notificações push:', {
      userId,
      subscription: subscription.endpoint
    });
    
    res.status(200).json({
      success: true,
      message: 'Inscrição cancelada com sucesso!'
    });
  } catch (error) {
    console.error('❌ Erro ao cancelar inscrição:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para obter configurações de email do usuário
const getEmailSettings = async (req, res) => {
  try {
    const userId = req.loggedUser?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }
    
    let emailSettings = await EmailSettings.findOne({ userId });
    
    if (!emailSettings) {
      // Criar configurações padrão se não existirem
      emailSettings = new EmailSettings({
        userId,
        emailAddress: req.loggedUser?.email || ''
      });
      await emailSettings.save();
    }
    
    res.status(200).json({
      success: true,
      emailSettings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para validar email
const validateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }
    
    const validation = await emailService.validateEmailForSettings(email);
    
    res.status(200).json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Erro ao validar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para atualizar configurações de email
const updateEmailSettings = async (req, res) => {
  try {
    const userId = req.loggedUser?.id;
    const updateData = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }
    
    // Se está atualizando o email, validar primeiro
    if (updateData.emailAddress) {
      console.log(`🔍 Validando novo email: ${updateData.emailAddress}`);
      
      const validation = await emailService.validateEmailForSettings(updateData.emailAddress);
      
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido',
          details: validation.message
        });
      }
      
      if (validation.warning) {
        console.log(`⚠️ Aviso na validação do email: ${validation.message}`);
      }
    }
    
    // Sanitizar/validar frequência se enviada
    if (updateData.frequency) {
      const freq = updateData.frequency;
      const sanitized = {};
      if (typeof freq.maxEmailsPerHour === 'number') {
        sanitized.maxEmailsPerHour = Math.max(0, Math.floor(freq.maxEmailsPerHour));
      }
      if (typeof freq.maxEmailsPerDay === 'number') {
        sanitized.maxEmailsPerDay = Math.max(0, Math.floor(freq.maxEmailsPerDay));
      }
      if (typeof freq.minIntervalMinutes === 'number') {
        sanitized.minIntervalMinutes = Math.max(0, Math.floor(freq.minIntervalMinutes));
      }
      updateData.frequency = { ...sanitized };
    }
    
    let emailSettings = await EmailSettings.findOne({ userId });
    
    if (!emailSettings) {
      emailSettings = new EmailSettings({
        userId,
        ...updateData
      });
    } else {
      Object.assign(emailSettings, updateData);
    }
    
    await emailSettings.save();
    
    res.status(200).json({
      success: true,
      message: 'Configurações de email atualizadas com sucesso',
      emailSettings
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para enviar email de teste
const sendTestEmail = async (req, res) => {
  try {
    const userId = req.loggedUser?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }
    
    const emailSettings = await EmailSettings.findOne({ userId });
    
    if (!emailSettings || !emailSettings.emailEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Configurações de email não encontradas ou desabilitadas'
      });
    }
    
    const result = await emailService.sendTestEmail(emailSettings.emailAddress);
    
    if (result.success) {
      // Atualizar status do teste
      emailSettings.testEmailSent = true;
      emailSettings.lastTestEmail = new Date();
      await emailSettings.save();
      
      res.status(200).json({
        success: true,
        message: 'Email de teste enviado com sucesso',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar email de teste',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Controller para verificar status do serviço de email
const checkEmailServiceStatus = async (req, res) => {
  try {
    const isConnected = await emailService.verifyConnection();
    
    res.status(200).json({
      success: true,
      emailServiceStatus: isConnected ? 'connected' : 'disconnected',
      message: isConnected ? 'Serviço de email funcionando' : 'Serviço de email indisponível'
    });
  } catch (error) {
    console.error('Erro ao verificar status do serviço de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export default {
  getNotifications,
  getNotificationsByCativeiro,
  generateNotifications,
  subscribeToPush,
  unsubscribeFromPush,
  getEmailSettings,
  updateEmailSettings,
  sendTestEmail,
  checkEmailServiceStatus,
  validateEmail
}; 