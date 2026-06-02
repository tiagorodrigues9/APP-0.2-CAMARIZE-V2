import ParametrosAtuais from '../models/Parametros_atuais.js';
import Cativeiros from '../models/Cativeiros.js';
import alertService from './alertService.js';

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

  // Enviar alerta (email + push) delegando ao alertService centralizado
  async sendAlert(alertData) {
    await alertService.sendAlert(alertData);
  }

  // Verificação manual (para testes)
  async manualCheck() {
    console.log('🔍 Executando verificação manual...');
    await this.performCheck();
  }
}

export default new MonitoringService();


