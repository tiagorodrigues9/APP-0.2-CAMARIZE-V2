import { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './PushNotificationManager.module.css';

export default function PushNotificationManager() {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification
  } = useNotifications();

  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubscribe = async () => {
    try {
      setError(null);
      setSuccess(null);
      await subscribeToPush();
      setSuccess('✅ Notificações push ativadas com sucesso!');
    } catch (err) {
      setError(`❌ Erro ao ativar notificações: ${err.message}`);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setError(null);
      setSuccess(null);
      await unsubscribeFromPush();
      setSuccess('✅ Notificações push desativadas');
    } catch (err) {
      setError(`❌ Erro ao desativar notificações: ${err.message}`);
    }
  };

  const handleTestNotification = async () => {
    try {
      setError(null);
      setSuccess(null);
      await testNotification();
      setSuccess('📱 Notificação de teste enviada!');
    } catch (err) {
      setError(`❌ Erro ao enviar notificação de teste: ${err.message}`);
    }
  };

  // Se não é suportado, mostrar mensagem
  if (!isSupported) {
    return (
      <div className={styles.container}>
        <div className={styles.notSupported}>
          <div className={styles.icon}>📱</div>
          <h3>Notificações Push Não Suportadas</h3>
          <p>
            Seu navegador não suporta notificações push. 
            Para receber notificações, use um navegador moderno como Chrome, Firefox ou Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.icon}>🔔</div>
          <div>
            <h3>Notificações Push</h3>
            <p>Receba alertas importantes no seu celular</p>
          </div>
        </div>
        
        <button
          className={styles.detailsButton}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Ocultar' : 'Detalhes'}
        </button>
      </div>

      {showDetails && (
        <div className={styles.details}>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.label}>Suporte:</span>
              <span className={`${styles.value} ${styles.supported}`}>
                ✅ Suportado
              </span>
            </div>
            
            <div className={styles.statusItem}>
              <span className={styles.label}>Permissão:</span>
              <span className={`${styles.value} ${
                permission === 'granted' ? styles.granted : 
                permission === 'denied' ? styles.denied : 
                styles.default
              }`}>
                {permission === 'granted' ? '✅ Concedida' :
                 permission === 'denied' ? '❌ Negada' :
                 '⏳ Pendente'}
              </span>
            </div>
            
            <div className={styles.statusItem}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.value} ${
                isSubscribed ? styles.active : styles.inactive
              }`}>
                {isSubscribed ? '🟢 Ativo' : '🔴 Inativo'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        {!isSubscribed ? (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleSubscribe}
            disabled={isLoading || permission === 'denied'}
          >
            {isLoading ? '⏳ Ativando...' : '🔔 Ativar Notificações'}
          </button>
        ) : (
          <div className={styles.subscribedActions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleTestNotification}
              disabled={isLoading}
            >
              📱 Testar Notificação
            </button>
            
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={handleUnsubscribe}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Desativando...' : '🔕 Desativar'}
            </button>
          </div>
        )}
      </div>

      {permission === 'denied' && (
        <div className={styles.warning}>
          <div className={styles.warningIcon}>⚠️</div>
          <div>
            <h4>Permissão Negada</h4>
            <p>
              Para receber notificações, você precisa permitir notificações nas configurações do seu navegador.
            </p>
            <button
              className={styles.helpButton}
              onClick={() => {
                // Abrir guia de ajuda
                window.open('https://support.google.com/chrome/answer/3220216', '_blank');
              }}
            >
              Como Permitir Notificações
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.message} style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.message} style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
          {success}
        </div>
      )}

      <div className={styles.info}>
        <h4>📋 Sobre as Notificações</h4>
        <ul>
          <li>Receba alertas quando parâmetros saírem do ideal</li>
          <li>Notificações funcionam mesmo com o app fechado</li>
          <li>Você pode desativar a qualquer momento</li>
          <li>Dados são enviados de forma segura e criptografada</li>
        </ul>
      </div>
    </div>
  );
} 