import mongoose from 'mongoose';

const emailSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Configurações gerais
  emailEnabled: {
    type: Boolean,
    default: true
  },
  
  emailAddress: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Configurações por tipo de alerta
  alertTypes: {
    temperatura: {
      enabled: { type: Boolean, default: true },
      severity: {
        baixa: { type: Boolean, default: false },
        media: { type: Boolean, default: true },
        alta: { type: Boolean, default: true }
      }
    },
    ph: {
      enabled: { type: Boolean, default: true },
      severity: {
        baixa: { type: Boolean, default: false },
        media: { type: Boolean, default: true },
        alta: { type: Boolean, default: true }
      }
    },
    amonia: {
      enabled: { type: Boolean, default: true },
      severity: {
        baixa: { type: Boolean, default: false },
        media: { type: Boolean, default: true },
        alta: { type: Boolean, default: true }
      }
    }
  },
  
  // Configurações de horário
  quietHours: {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' }, // HH:MM
    endTime: { type: String, default: '07:00' }    // HH:MM
  },
  
  // Configurações de frequência
  frequency: {
    maxEmailsPerHour: { type: Number, default: 5 },
    maxEmailsPerDay: { type: Number, default: 20 },
    // Intervalo mínimo entre e-mails (em minutos)
    minIntervalMinutes: { type: Number, default: 10, min: 0 }
  },
  
  // Histórico de envios (para controle de frequência)
  lastEmailSent: {
    timestamp: { type: Date },
    count: { type: Number, default: 0 }
  },
  
  // Configurações de template
  template: {
    language: { type: String, default: 'pt-BR' },
    includeCharts: { type: Boolean, default: true },
    includeActions: { type: Boolean, default: true }
  },
  
  // Configurações de teste
  testEmailSent: {
    type: Boolean,
    default: false
  },
  
  lastTestEmail: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para melhor performance
emailSettingsSchema.index({ userId: 1 });
emailSettingsSchema.index({ emailAddress: 1 });

// Método para verificar se deve enviar email baseado na severidade
emailSettingsSchema.methods.shouldSendEmail = function(tipo, severidade) {
  if (!this.emailEnabled) return false;
  
  const alertType = this.alertTypes[tipo];
  if (!alertType || !alertType.enabled) return false;
  
  return alertType.severity[severidade] || false;
};

// Método para verificar se está em horário de silêncio
emailSettingsSchema.methods.isInQuietHours = function() {
  if (!this.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const startTime = this.quietHours.startTime.split(':').map(Number);
  const endTime = this.quietHours.endTime.split(':').map(Number);
  
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  // Se o horário de silêncio cruza a meia-noite
  if (startMinutes > endMinutes) {
    return currentTime >= startMinutes || currentTime <= endMinutes;
  } else {
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }
};

// Método para verificar limite de frequência
emailSettingsSchema.methods.canSendEmail = function() {
  if (!this.lastEmailSent) return true;
  
  const now = new Date();
  const lastSent = new Date(this.lastEmailSent.timestamp);
  
  // Respeitar intervalo mínimo entre e-mails
  const minInterval = Math.max(0, this.frequency?.minIntervalMinutes ?? 0);
  if (minInterval > 0) {
    const minIntervalAgo = new Date(now.getTime() - minInterval * 60 * 1000);
    if (lastSent > minIntervalAgo) {
      this._lastBlockReason = 'min_interval';
      return false;
    }
  }
  
  // Verificar limite por hora
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  if (lastSent > oneHourAgo && this.lastEmailSent.count >= this.frequency.maxEmailsPerHour) {
    this._lastBlockReason = 'hour_limit';
    return false;
  }
  
  // Verificar limite por dia
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (lastSent > oneDayAgo && this.lastEmailSent.count >= this.frequency.maxEmailsPerDay) {
    this._lastBlockReason = 'day_limit';
    return false;
  }
  
  this._lastBlockReason = undefined;
  return true;
};

// Motivo do último bloqueio (volátil, não persistido)
emailSettingsSchema.methods.getLastBlockReason = function() {
  return this._lastBlockReason;
};

// Método para registrar envio de email
emailSettingsSchema.methods.recordEmailSent = function() {
  const now = new Date();
  
  if (!this.lastEmailSent || !this.lastEmailSent.timestamp) {
    this.lastEmailSent = {
      timestamp: now,
      count: 1
    };
  } else {
    const lastSent = new Date(this.lastEmailSent.timestamp);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    if (lastSent > oneHourAgo) {
      // Mesma hora, incrementar contador
      this.lastEmailSent.count += 1;
    } else {
      // Nova hora, resetar contador
      this.lastEmailSent = {
        timestamp: now,
        count: 1
      };
    }
  }
};

const EmailSettings = mongoose.model('EmailSettings', emailSettingsSchema);

export default EmailSettings;
