import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './EmailSettings.module.css';
import TimePicker from '../TimePicker';

export default function EmailSettings() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const [emailSettings, setEmailSettings] = useState({
    emailEnabled: true,
    emailAddress: '',
    frequency: {
      maxEmailsPerHour: 5,
      maxEmailsPerDay: 20,
      minIntervalMinutes: 10
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00'
    },
    alertTypes: {
      temperatura: {
        enabled: true,
        severity: { baixa: false, media: true, alta: true }
      },
      ph: {
        enabled: true,
        severity: { baixa: false, media: true, alta: true }
      },
      amonia: {
        enabled: true,
        severity: { baixa: false, media: true, alta: true }
      }
    }
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  // Buscar configurações de email
  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/email/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setEmailSettings(response.data.emailSettings);
        }
      } catch (error) {
        console.error('Erro ao buscar configurações de email:', error);
        showNotification('Erro ao carregar configurações', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEmailSettings();
  }, [apiUrl]);

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${apiUrl}/email/settings`, emailSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showNotification('Configurações salvas com sucesso!', 'success');
        // Redirecionar para /settings após 1 segundo
        setTimeout(() => {
          router.push('/settings');
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      // Verificar se é erro de validação de email
      if (error.response?.data?.error === 'Email inválido') {
        showNotification(`Erro: ${error.response.data.details}`, 'error');
      } else {
        showNotification('Erro ao salvar configurações', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Enviar email de teste
  const handleTestEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiUrl}/email/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showNotification('Email de teste enviado!', 'success');
      }
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
      showNotification('Erro ao enviar email de teste', 'error');
    }
  };

  // Atualizar configurações
  const updateSettings = (path, value) => {
    setEmailSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📧 Configurações de Email</h2>
        <p>Configure como e quando receber alertas por email</p>
      </div>

      {/* Configuração Geral */}
      <div className={styles.section}>
        <h3>Configuração Geral</h3>
        
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={emailSettings.emailEnabled}
              onChange={(e) => updateSettings('emailEnabled', e.target.checked)}
            />
            Ativar notificações por email
          </label>
        </div>

        <div className={styles.field}>
          <label>Email para receber alertas</label>
          <input
            type="email"
            value={emailSettings.emailAddress}
            onChange={(e) => updateSettings('emailAddress', e.target.value)}
            placeholder="seu@email.com"
            disabled={!emailSettings.emailEnabled}
          />
        </div>
      </div>

      {/* Frequência de Emails */}
      <div className={styles.section}>
        <h3>Frequência de Emails</h3>
        
        <div className={styles.field}>
          <label>Máximo de emails por hora</label>
          <input
            type="number"
            min="0"
            max="60"
            value={emailSettings.frequency.maxEmailsPerHour}
            onChange={(e) => updateSettings('frequency.maxEmailsPerHour', parseInt(e.target.value) || 0)}
            disabled={!emailSettings.emailEnabled}
          />
        </div>

        <div className={styles.field}>
          <label>Máximo de emails por dia</label>
          <input
            type="number"
            min="0"
            max="100"
            value={emailSettings.frequency.maxEmailsPerDay}
            onChange={(e) => updateSettings('frequency.maxEmailsPerDay', parseInt(e.target.value) || 0)}
            disabled={!emailSettings.emailEnabled}
          />
        </div>

        <div className={styles.field}>
          <label>Intervalo mínimo entre emails (minutos)</label>
          <input
            type="number"
            min="0"
            max="60"
            value={emailSettings.frequency.minIntervalMinutes}
            onChange={(e) => updateSettings('frequency.minIntervalMinutes', parseInt(e.target.value) || 0)}
            disabled={!emailSettings.emailEnabled}
          />
        </div>
      </div>

      {/* Modo Silêncio */}
      <div className={styles.section}>
        <h3>🌙 Modo Silêncio</h3>
        
        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={emailSettings.quietHours.enabled}
              onChange={(e) => updateSettings('quietHours.enabled', e.target.checked)}
              disabled={!emailSettings.emailEnabled}
            />
            Ativar modo silêncio
          </label>
        </div>

                 {emailSettings.quietHours.enabled && (
           <div className={styles.quietHours}>
             <div className={styles.field}>
               <label>Início do silêncio</label>
               <TimePicker
                 value={emailSettings.quietHours.startTime}
                 onChange={(value) => updateSettings('quietHours.startTime', value)}
                 disabled={!emailSettings.emailEnabled}
               />
             </div>

             <div className={styles.field}>
               <label>Fim do silêncio</label>
               <TimePicker
                 value={emailSettings.quietHours.endTime}
                 onChange={(value) => updateSettings('quietHours.endTime', value)}
                 disabled={!emailSettings.emailEnabled}
               />
             </div>
           </div>
         )}
      </div>

      {/* Tipos de Alerta */}
      <div className={styles.section}>
        <h3>Tipos de Alerta</h3>
        
        {Object.entries(emailSettings.alertTypes).map(([tipo, config]) => (
          <div key={tipo} className={styles.alertType}>
            <div className={styles.field}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => updateSettings(`alertTypes.${tipo}.enabled`, e.target.checked)}
                  disabled={!emailSettings.emailEnabled}
                />
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </label>
            </div>

            {config.enabled && (
              <div className={styles.severity}>
                <label>Severidade:</label>
                <div className={styles.severityOptions}>
                  {Object.entries(config.severity).map(([severidade, enabled]) => (
                    <label key={severidade} className={styles.severityOption}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => updateSettings(`alertTypes.${tipo}.severity.${severidade}`, e.target.checked)}
                        disabled={!emailSettings.emailEnabled}
                      />
                      {severidade.charAt(0).toUpperCase() + severidade.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de Ação */}
      <div className={styles.actions}>
        <button
          onClick={handleTestEmail}
          disabled={!emailSettings.emailEnabled || saving}
          className={styles.testButton}
        >
          📧 Enviar Email de Teste
        </button>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Salvando...' : '💾 Salvar Configurações'}
        </button>
      </div>

      {/* Notificação */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
