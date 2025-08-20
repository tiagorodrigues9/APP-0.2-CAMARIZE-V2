import React, { useState, useEffect } from "react";
import NavBottom from "../components/NavBottom";
import axios from "axios";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${apiUrl}/notifications`, { headers });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
      } else {
        setError('Erro ao carregar notificações');
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'temperatura':
        return '🌡️';
      case 'ph':
        return '🧪';
      case 'amonia':
        return '⚗️';
      default:
        return '🔔';
    }
  };

  const getSeverityColor = (severidade) => {
    switch (severidade) {
      case 'alta':
        return '#ff4444';
      case 'media':
        return '#ff8800';
      default:
        return '#ffaa00';
    }
  };

  const formatTime = (datahora) => {
    const date = new Date(datahora);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (datahora) => {
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
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '80px' // Espaço para o NavBottom
    }}>
      <div style={{ 
        maxWidth: 600, 
        margin: '0 auto', 
        padding: '24px 16px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <button 
            style={{ 
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', 
              border: 'none', 
              fontSize: 24, 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
              zIndex: 1
            }} 
            onClick={() => window.history.back()}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Voltar"
          >
            &larr;
          </button>
          <h2 style={{ textAlign: 'center', margin: 0, fontWeight: 600, fontSize: '1.35rem', padding: '8px 0' }}>Notificações</h2>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 24px 0' }}>
          <button style={{
            background: '#f5f5f5',
            border: 'none',
            borderRadius: 16,
            padding: '8px 24px',
            fontWeight: 600,
            fontSize: 16,
            color: '#333',
            cursor: 'default'
          }}>Hoje</button>
        </div>
        
        {loading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px 24px',
            color: '#888',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Carregando notificações...</div>
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '48px 24px',
            color: '#ff4444',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Erro ao carregar</div>
            <div style={{ fontSize: '14px' }}>{error}</div>
            <button 
              onClick={fetchNotifications}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#007bff',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((notification, i) => (
                <div key={notification.id || i} style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  background: '#fff', 
                  borderRadius: 12,
                  border: `2px solid ${getSeverityColor(notification.severidade)}`,
                  padding: 16, 
                  gap: 16,
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 8, 
                    background: getSeverityColor(notification.severidade),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: '#000'
                  }}>
                    {getIcon(notification.tipo)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16, color: '#333' }}>
                      {notification.mensagem}
                    </div>
                    <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>
                      {notification.cativeiroNome}
                    </div>
                    <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                      {formatDate(notification.datahora)} às {formatTime(notification.datahora)}
                    </div>
                  </div>
                  <div style={{ 
                    color: getSeverityColor(notification.severidade), 
                    fontWeight: 600, 
                    fontSize: 12,
                    textTransform: 'uppercase'
                  }}>
                    {notification.severidade}
                  </div>
                </div>
              ))}
            </div>
            
            {notifications.length === 0 && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '48px 24px',
                color: '#888',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Nenhuma notificação</div>
                <div style={{ fontSize: '14px' }}>Você está em dia com suas notificações</div>
              </div>
            )}
          </>
        )}
      </div>
      
      <NavBottom />
    </div>
  );
} 