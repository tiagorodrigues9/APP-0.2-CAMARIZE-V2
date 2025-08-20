import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import NavBottom from "../components/NavBottom";
import Loading from "../components/Loading";
import styles from "./status-cativeiros.module.css";

export default function StatusCativeirosPage() {
  const router = useRouter();
  const [cativeirosStatus, setCativeirosStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCativeirosStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await axios.get(`${apiUrl}/cativeiros-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCativeirosStatus(response.data.cativeiros || []);
      } else {
        setError('Erro ao carregar status dos cativeiros');
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Erro ao carregar status dos cativeiros');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCativeirosStatus();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return '✅';
      case 'alerta':
        return '⚠️';
      case 'critico':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return '#10b981';
      case 'alerta':
        return '#f59e0b';
      case 'critico':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusBackground = (status) => {
    switch (status) {
      case 'ok':
        return '#f0fdf4';
      case 'alerta':
        return '#fffbeb';
      case 'critico':
        return '#fef2f2';
      default:
        return '#f9fafb';
    }
  };

  const formatarDiferenca = (diferenca) => {
    if (typeof diferenca === 'number') {
      return diferenca.toFixed(2);
    }
    return '#';
  };

  const getAlertasText = (alertas) => {
    if (alertas.length === 0) return 'Sem alertas';
    
    const alertasText = alertas.map(alerta => {
      switch (alerta) {
        case 'alta':
          return 'altos';
        case 'media':
          return 'médios';
        default:
          return alerta;
      }
    });
    
    if (alertasText.length === 1) {
      return `Alerta ${alertasText[0]}`;
    } else {
      return `Alertas ${alertasText.join(' e ')}`;
    }
  };

  const formatTime = (datahora) => {
    if (!datahora) return 'N/A';
    const date = new Date(datahora);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (datahora) => {
    if (!datahora) return 'N/A';
    const date = new Date(datahora);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getCativeirosByStatus = (status) => {
    return cativeirosStatus.filter(cativeiro => cativeiro.status === status);
  };

  const criticoCativeiros = getCativeirosByStatus('critico');
  const alertaCativeiros = getCativeirosByStatus('alerta');
  const okCativeiros = getCativeirosByStatus('ok');

  if (loading) {
    return <Loading message="Carregando status dos cativeiros..." />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Erro ao carregar</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchCativeirosStatus}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.back()}
        >
          ← Voltar
        </button>
        <h1>Status dos Cativeiros</h1>
      </div>

      <div className={styles.content}>
        {/* Resumo */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNumber}>{cativeirosStatus.length}</span>
            <span className={styles.summaryLabel}>Total</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNumber} style={{ color: '#ef4444' }}>
              {criticoCativeiros.length}
            </span>
            <span className={styles.summaryLabel}>Críticos</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNumber} style={{ color: '#f59e0b' }}>
              {alertaCativeiros.length}
            </span>
            <span className={styles.summaryLabel}>Alertas</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryNumber} style={{ color: '#10b981' }}>
              {okCativeiros.length}
            </span>
            <span className={styles.summaryLabel}>OK</span>
          </div>
        </div>

        {/* Cativeiros Críticos */}
        {criticoCativeiros.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🚨</span>
              Cativeiros Críticos ({criticoCativeiros.length})
            </h2>
            <div className={styles.cativeirosList}>
              {criticoCativeiros.map((cativeiro) => (
                <div 
                  key={cativeiro.id} 
                  className={styles.cativeiroCard}
                  style={{ 
                    borderLeftColor: getStatusColor(cativeiro.status),
                    backgroundColor: getStatusBackground(cativeiro.status)
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cativeiroInfo}>
                      <h3>{cativeiro.nome}</h3>
                      <p>Tipo: {cativeiro.tipo_camarao}</p>
                    </div>
                    <div className={styles.statusBadge}>
                      <span style={{ color: getStatusColor(cativeiro.status) }}>
                        {cativeiro.statusText}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardDetails}>
                    <div className={styles.alertasInfo}>
                      <strong>Alertas ativos:</strong> {getAlertasText(cativeiro.alertas)}
                      {cativeiro.totalAlertas > 0 && (
                        <span className={styles.totalAlertas}>
                          ({cativeiro.totalAlertas} alerta{cativeiro.totalAlertas > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    
                    {/* Detalhes específicos dos alertas */}
                    {cativeiro.alertasDetalhados && cativeiro.alertasDetalhados.length > 0 && (
                      <div className={styles.alertasDetalhados}>
                        <strong>Detalhes dos alertas:</strong>
                        {cativeiro.alertasDetalhados.map((alerta, index) => (
                          <div key={index} className={styles.alertaItem}>
                            <div className={styles.alertaHeader}>
                              <span className={styles.alertaTipo}>
                                {alerta.tipo === 'temperatura' ? '🌡️' : 
                                 alerta.tipo === 'ph' ? '🧪' : 
                                 alerta.tipo === 'amonia' ? '⚗️' : '🔔'} {alerta.tipo}
                              </span>
                              <span className={styles.alertaSeveridade} style={{ 
                                color: alerta.severidade === 'alta' ? '#ef4444' : '#f59e0b' 
                              }}>
                                {alerta.severidade.toUpperCase()}
                              </span>
                            </div>
                            <div className={styles.alertaMensagem}>
                              {alerta.mensagem}
                            </div>
                            <div className={styles.alertaValores}>
                              <span>Atual: {alerta.valorAtual}</span>
                              <span>Ideal: {alerta.valorIdeal}</span>
                              <span>Diferença: {formatarDiferenca(alerta.diferenca)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {cativeiro.ultimaAtualizacao && (
                      <div className={styles.lastUpdate}>
                        <strong>Última atualização:</strong> {formatDate(cativeiro.ultimaAtualizacao)} às {formatTime(cativeiro.ultimaAtualizacao)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cativeiros em Alerta */}
        {alertaCativeiros.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚠️</span>
              Cativeiros em Alerta ({alertaCativeiros.length})
            </h2>
            <div className={styles.cativeirosList}>
              {alertaCativeiros.map((cativeiro) => (
                <div 
                  key={cativeiro.id} 
                  className={styles.cativeiroCard}
                  style={{ 
                    borderLeftColor: getStatusColor(cativeiro.status),
                    backgroundColor: getStatusBackground(cativeiro.status)
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cativeiroInfo}>
                      <h3>{cativeiro.nome}</h3>
                      <p>Tipo: {cativeiro.tipo_camarao}</p>
                    </div>
                    <div className={styles.statusBadge}>
                      <span style={{ color: getStatusColor(cativeiro.status) }}>
                        {cativeiro.statusText}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardDetails}>
                    <div className={styles.alertasInfo}>
                      <strong>Alertas ativos:</strong> {getAlertasText(cativeiro.alertas)}
                      {cativeiro.totalAlertas > 0 && (
                        <span className={styles.totalAlertas}>
                          ({cativeiro.totalAlertas} alerta{cativeiro.totalAlertas > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    
                    {/* Detalhes específicos dos alertas */}
                    {cativeiro.alertasDetalhados && cativeiro.alertasDetalhados.length > 0 && (
                      <div className={styles.alertasDetalhados}>
                        <strong>Detalhes dos alertas:</strong>
                        {cativeiro.alertasDetalhados.map((alerta, index) => (
                          <div key={index} className={styles.alertaItem}>
                            <div className={styles.alertaHeader}>
                              <span className={styles.alertaTipo}>
                                {alerta.tipo === 'temperatura' ? '🌡️' : 
                                 alerta.tipo === 'ph' ? '🧪' : 
                                 alerta.tipo === 'amonia' ? '⚗️' : '🔔'} {alerta.tipo}
                              </span>
                              <span className={styles.alertaSeveridade} style={{ 
                                color: alerta.severidade === 'alta' ? '#ef4444' : '#f59e0b' 
                              }}>
                                {alerta.severidade.toUpperCase()}
                              </span>
                            </div>
                            <div className={styles.alertaMensagem}>
                              {alerta.mensagem}
                            </div>
                            <div className={styles.alertaValores}>
                              <span>Atual: {alerta.valorAtual}</span>
                              <span>Ideal: {alerta.valorIdeal}</span>
                              <span>Diferença: {formatarDiferenca(alerta.diferenca)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {cativeiro.ultimaAtualizacao && (
                      <div className={styles.lastUpdate}>
                        <strong>Última atualização:</strong> {formatDate(cativeiro.ultimaAtualizacao)} às {formatTime(cativeiro.ultimaAtualizacao)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cativeiros OK */}
        {okCativeiros.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>✅</span>
              Cativeiros OK ({okCativeiros.length})
            </h2>
            <div className={styles.cativeirosList}>
              {okCativeiros.map((cativeiro) => (
                <div 
                  key={cativeiro.id} 
                  className={styles.cativeiroCard}
                  style={{ 
                    borderLeftColor: getStatusColor(cativeiro.status),
                    backgroundColor: getStatusBackground(cativeiro.status)
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cativeiroInfo}>
                      <h3>{cativeiro.nome}</h3>
                      <p>Tipo: {cativeiro.tipo_camarao}</p>
                    </div>
                    <div className={styles.statusBadge}>
                      <span style={{ color: getStatusColor(cativeiro.status) }}>
                        {cativeiro.statusText}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardDetails}>
                    <div className={styles.alertasInfo}>
                      <strong>Status:</strong> Sem alertas ativos
                    </div>
                    
                    {cativeiro.ultimaAtualizacao && (
                      <div className={styles.lastUpdate}>
                        <strong>Última atualização:</strong> {formatDate(cativeiro.ultimaAtualizacao)} às {formatTime(cativeiro.ultimaAtualizacao)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {cativeirosStatus.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h2>Nenhum cativeiro encontrado</h2>
            <p>Não há cativeiros cadastrados no sistema.</p>
          </div>
        )}
      </div>
      <NavBottom />
    </div>
  );
} 