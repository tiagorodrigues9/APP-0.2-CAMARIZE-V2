import styles from "./ErrorDisplay.module.css";

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  onLogin, 
  title = "Erro ao carregar dados",
  showRetry = true,
  showLogin = false 
}) {
  const shouldShowLogin = showLogin || 
    error?.includes('Token não encontrado') || 
    error?.includes('Sessão expirada');

  return (
    <div className={styles.container}>
      <img src="/images/logo_camarize1.png" alt="Logo" className={styles.logo} />
      <div className={styles.errorContent}>
        <div className={styles.errorTitle}>{title}</div>
        <div className={styles.errorMessage}>{error}</div>
        
        <div className={styles.buttonContainer}>
          {showRetry && (
            <button 
              onClick={onRetry}
              className={styles.retryButton}
            >
              Tentar Novamente
            </button>
          )}
          
          {shouldShowLogin && (
            <button 
              onClick={onLogin}
              className={styles.loginButton}
            >
              Fazer Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 