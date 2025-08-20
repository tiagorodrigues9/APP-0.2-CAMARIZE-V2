import notificationController from '../controllers/notificationController.js';
import ParametrosAtuais from '../models/Parametros_atuais.js';
import Cativeiros from '../models/Cativeiros.js';
import EmailSettings from '../models/EmailSettings.js';
import TiposCamaroes from '../models/Tipos_sensores.js';
import CondicoesIdeais from '../models/Condicoes_ideais.js';
import emailService from './emailService.js';

class MonitoringService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
    this.lastCheck = null;
  }

  // Iniciar monitoramento automático
  startMonitoring(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('⚠️ Monitoramento já está rodando');
      return;
    }

    console.log(`🚀 Iniciando monitoramento automático a cada ${intervalMinutes} minutos`);
    
    this.isRunning = true;
    this.checkInterval = setInterval(async () => {
      await this.performCheck();
    }, intervalMinutes * 60 * 1000);

    // Fazer primeira verificação imediatamente
    this.performCheck();
  }

  // Parar monitoramento
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Monitoramento parado');
  }

  // Verificar status do monitoramento
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      nextCheck: this.lastCheck ? new Date(this.lastCheck.getTime() + (5 * 60 * 1000)) : null
    };
  }

  // Realizar verificação de parâmetros
  async performCheck() {
    try {
      console.log('🔍 Iniciando verificação automática de parâmetros...');
      this.lastCheck = new Date();

      // Buscar todos os cativeiros com condições ideais
      const cativeiros = await Cativeiros.find()
        .populate('condicoes_ideais')
        .populate('id_tipo_camarao');

      let totalAlerts = 0;

      for (const cativeiro of cativeiros) {
        // Buscar parâmetro mais recente
        const parametroAtual = await ParametrosAtuais.findOne({ 
          id_cativeiro: cativeiro._id 
        }).sort({ datahora: -1 });

        if (!parametroAtual || !cativeiro.condicoes_ideais) {
          continue;
        }

        const alerts = await this.checkCativeiroParameters(cativeiro, parametroAtual);
        totalAlerts += alerts.length;

        // Enviar alertas se houver
        for (const alert of alerts) {
          await this.sendAlert(alert);
        }
      }

      console.log(`✅ Verificação concluída: ${totalAlerts} alertas gerados`);
      
    } catch (error) {
      console.error('❌ Erro na verificação automática:', error);
    }
  }

  // Verificar parâmetros de um cativeiro específico
  async checkCativeiroParameters(cativeiro, parametroAtual) {
    const alerts = [];
    const condicaoIdeal = cativeiro.condicoes_ideais;

    // Tolerâncias
    const toleranciaTemp = 0.15; // 15%
    const toleranciaPh = 0.2;    // 20%
    const toleranciaAmonia = 0.25; // 25%

    // Verificar temperatura
    if (condicaoIdeal.temp_ideal && parametroAtual.temp_atual !== undefined) {
      const diffTemp = Math.abs(parametroAtual.temp_atual - condicaoIdeal.temp_ideal);
      const toleranciaTempValor = condicaoIdeal.temp_ideal * toleranciaTemp;

      if (diffTemp > toleranciaTempValor) {
        const tipo = parametroAtual.temp_atual > condicaoIdeal.temp_ideal ? 'aumento' : 'diminuição';
        const severidade = diffTemp > toleranciaTempValor * 2 ? 'alta' : 'media';

        alerts.push({
          id: `temp_${cativeiro._id}_${parametroAtual._id}`,
          tipo: 'temperatura',
          cativeiro: cativeiro._id,
          cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
          valorAtual: parametroAtual.temp_atual,
          valorIdeal: condicaoIdeal.temp_ideal,
          diferenca: diffTemp,
          mensagem: `Temperatura com ${tipo}! Atual: ${parametroAtual.temp_atual}°C, Ideal: ${condicaoIdeal.temp_ideal}°C`,
          datahora: parametroAtual.datahora,
          severidade: severidade
        });
      }
    }

    // Verificar pH
    if (condicaoIdeal.ph_ideal && parametroAtual.ph_atual !== undefined) {
      const diffPh = Math.abs(parametroAtual.ph_atual - condicaoIdeal.ph_ideal);
      const toleranciaPhValor = condicaoIdeal.ph_ideal * toleranciaPh;

      if (diffPh > toleranciaPhValor) {
        const tipo = parametroAtual.ph_atual > condicaoIdeal.ph_ideal ? 'aumento' : 'diminuição';
        const severidade = diffPh > toleranciaPhValor * 2 ? 'alta' : 'media';

        alerts.push({
          id: `ph_${cativeiro._id}_${parametroAtual._id}`,
          tipo: 'ph',
          cativeiro: cativeiro._id,
          cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
          valorAtual: parametroAtual.ph_atual,
          valorIdeal: condicaoIdeal.ph_ideal,
          diferenca: diffPh,
          mensagem: `pH com ${tipo}! Atual: ${parametroAtual.ph_atual}, Ideal: ${condicaoIdeal.ph_ideal}`,
          datahora: parametroAtual.datahora,
          severidade: severidade
        });
      }
    }

    // Verificar amônia
    if (condicaoIdeal.amonia_ideal && parametroAtual.amonia_atual !== undefined) {
      const diffAmonia = Math.abs(parametroAtual.amonia_atual - condicaoIdeal.amonia_ideal);
      const toleranciaAmoniaValor = condicaoIdeal.amonia_ideal * toleranciaAmonia;

      if (diffAmonia > toleranciaAmoniaValor) {
        const tipo = parametroAtual.amonia_atual > condicaoIdeal.amonia_ideal ? 'aumento' : 'diminuição';
        const severidade = diffAmonia > toleranciaAmoniaValor * 2 ? 'alta' : 'media';

        alerts.push({
          id: `amonia_${cativeiro._id}_${parametroAtual._id}`,
          tipo: 'amonia',
          cativeiro: cativeiro._id,
          cativeiroNome: cativeiro.nome || `Cativeiro ${cativeiro._id}`,
          valorAtual: parametroAtual.amonia_atual,
          valorIdeal: condicaoIdeal.amonia_ideal,
          diferenca: diffAmonia,
          mensagem: `Nível de amônia com ${tipo}! Atual: ${parametroAtual.amonia_atual}mg/L, Ideal: ${condicaoIdeal.amonia_ideal}mg/L`,
          datahora: parametroAtual.datahora,
          severidade: severidade
        });
      }
    }

    return alerts;
  }

  // Enviar alerta (email + push)
  async sendAlert(alertData) {
    try {
      console.log(`🚨 Enviando alerta: ${alertData.tipo} - ${alertData.cativeiroNome}`);

      // Buscar o cativeiro para identificar o usuário proprietário
      const Cativeiros = (await import('../models/Cativeiros.js')).default;
      const cativeiro = await Cativeiros.findById(alertData.cativeiro);
      
      if (!cativeiro) {
        console.log(`❌ Cativeiro não encontrado: ${alertData.cativeiro}`);
        return;
      }

      // Se o cativeiro não tem usuário associado, tentar encontrar através das relações
      let userId = cativeiro.user;
      
      if (!userId) {
        console.log(`🔍 Cativeiro sem usuário direto, buscando através das relações...`);
        
        // Buscar através da relação fazenda-cativeiro -> usuário-fazenda
        const FazendasxCativeiros = (await import('../models/FazendasxCativeiros.js')).default;
        const UsuariosxFazendas = (await import('../models/UsuariosxFazendas.js')).default;
        
        const fazendaRel = await FazendasxCativeiros.findOne({ cativeiro: cativeiro._id });
        if (fazendaRel) {
          const userFazendaRel = await UsuariosxFazendas.findOne({ fazenda: fazendaRel.fazenda });
          if (userFazendaRel) {
            userId = userFazendaRel.usuario;
            console.log(`✅ Usuário encontrado através das relações: ${userId}`);
          }
        }
      }

      if (!userId) {
        console.log(`❌ Não foi possível identificar o usuário proprietário do cativeiro: ${cativeiro.nome}`);
        return;
      }

      // Buscar configurações de email do usuário proprietário
      const emailSettings = await EmailSettings.findOne({ 
        userId: userId,
        emailEnabled: true 
      }).populate('userId', 'nome email');

      if (!emailSettings) {
        console.log(`❌ Configurações de email não encontradas para o usuário: ${userId}`);
        return;
      }

      console.log(`📧 Enviando alerta para: ${emailSettings.emailAddress} (${emailSettings.userId.nome})`);

      try {
        const forceSend = process.env.EMAIL_FORCE_SEND === 'true';

        // Verificar se deve enviar baseado nas configurações
        if (!forceSend && !emailSettings.shouldSendEmail(alertData.tipo, alertData.severidade)) {
          console.log(`⏭️ Email pulado para ${emailSettings.emailAddress} - configurações não atendidas`);
          return;
        } else if (forceSend) {
          console.log(`⚙️  Forçando envio ignorando preferências do usuário (EMAIL_FORCE_SEND=true)`);
        }

        // Verificar horário de silêncio
        if (!forceSend && emailSettings.isInQuietHours()) {
          console.log(`🌙 Email pulado para ${emailSettings.emailAddress} - horário de silêncio`);
          return;
        }

        // Verificar limite de frequência (desabilitável por ENV)
        const disableRateLimit = process.env.EMAIL_DISABLE_RATE_LIMIT === 'true';
        if (!disableRateLimit && !emailSettings.canSendEmail()) {
          const reason = emailSettings.getLastBlockReason?.() || 'rate_limit';
          const reasonText = {
            min_interval: `intervalo mínimo de ${emailSettings.frequency?.minIntervalMinutes ?? '?'} min não cumprido`,
            hour_limit: `máximo por hora (${emailSettings.frequency?.maxEmailsPerHour ?? '?'}) atingido`,
            day_limit: `máximo por dia (${emailSettings.frequency?.maxEmailsPerDay ?? '?'}) atingido`,
            rate_limit: 'limite de frequência atingido'
          }[reason];
          console.log(`⏰ Email pulado para ${emailSettings.emailAddress} - ${reasonText}`);
          return;
        } else if (disableRateLimit) {
          console.log(`⚙️  Rate limit de email desabilitado por ENV para ${emailSettings.emailAddress}`);
        }

        // Enviar email
        const result = await emailService.sendAlertEmail(emailSettings.emailAddress, alertData);
        
        if (result.success) {
          // Registrar envio bem-sucedido
          emailSettings.recordEmailSent();
          await emailSettings.save();
          
          console.log(`✅ Email enviado para ${emailSettings.emailAddress}:`, result.messageId);
        } else {
          console.error(`❌ Erro ao enviar email para ${emailSettings.emailAddress}:`, result.error);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar email para ${emailSettings.emailAddress}:`, error);
      }

      // TODO: Implementar notificações push aqui
      // await sendPushNotifications(alertData);

    } catch (error) {
      console.error('❌ Erro ao enviar alerta:', error);
    }
  }

  // Verificação manual (para testes)
  async manualCheck() {
    console.log('🔍 Executando verificação manual...');
    await this.performCheck();
  }
}

export default new MonitoringService();


