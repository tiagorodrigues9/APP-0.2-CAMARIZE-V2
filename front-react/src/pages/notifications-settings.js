import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBottom from '../components/NavBottom';
import AuthError from '../components/AuthError';
import Loading from '../components/Loading';
import PushNotificationManager from '../components/PushNotificationManager';
import { useAuth } from '../hooks/useAuth';

export default function NotificationsSettings() {
  const router = useRouter();
  const { user, loading, error } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loading message="Carregando..." />;
  }

  if (error) {
    return <AuthError error={error} onRetry={() => window.location.reload()} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#f3f4f6';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Configurações de Notificações
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Gerencie suas notificações push
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* PWA Install Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #f7b0b7 0%, #a3c7f7 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          color: '#000',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h2 style={{
            margin: '0 0 12px 0',
            fontSize: '24px',
            fontWeight: '600',
            color: '#000'
          }}>
            Instale o Camarize no seu Celular
          </h2>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '16px',
            opacity: 0.9,
            lineHeight: '1.5',
            color: '#000'
          }}>
            Transforme o Camarize em um app nativo e receba notificações push 
            mesmo com o navegador fechado!
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#000',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onClick={() => {
                // Mostrar instruções de instalação
                alert('Para instalar o Camarize:\n\n1. Abra o menu do navegador (⋮)\n2. Toque em "Adicionar à tela inicial"\n3. Confirme a instalação\n\nAgora o Camarize funcionará como um app nativo!');
              }}
            >
              📲 Como Instalar
            </button>
            <button
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              }}
              onClick={() => {
                // Tentar instalar PWA
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                  window.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('PWA instalado com sucesso!');
                    }
                    window.deferredPrompt = null;
                  });
                } else {
                  alert('Instalação automática não disponível. Use o botão "Como Instalar" para instruções manuais.');
                }
              }}
            >
              ⚡ Instalar Agora
            </button>
          </div>
        </div>

        {/* Push Notifications Manager */}
        <PushNotificationManager />

        {/* Features Info */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🚀 Recursos Avançados
          </h3>
          
          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
          }}>
            <div style={{
              padding: '20px',
              background: '#f0f9ff',
              borderRadius: '12px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔔</div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#0369a1'
              }}>
                Notificações Inteligentes
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#0369a1',
                lineHeight: '1.5'
              }}>
                Receba alertas quando temperatura, pH ou amônia saírem dos parâmetros ideais
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>📱</div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#166534'
              }}>
                Funciona Offline
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#166534',
                lineHeight: '1.5'
              }}>
                Acesse dados salvos mesmo sem conexão com a internet
              </p>
            </div>

            <div style={{
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fde68a'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#92400e'
              }}>
                App Nativo
              </h4>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#92400e',
                lineHeight: '1.5'
              }}>
                Instale no celular e use como um app normal, sem precisar do navegador
              </p>
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Precisa de Ajuda?
          </h3>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            Se você tiver problemas com as notificações ou instalação, 
            entre em contato com nosso suporte
          </p>
          <button
            style={{
              padding: '12px 24px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#2563eb';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#3B82F6';
            }}
            onClick={() => {
              // Abrir chat de suporte ou email
              window.open('mailto:suporte@camarize.com?subject=Suporte Notificações Push', '_blank');
            }}
          >
            📧 Contatar Suporte
          </button>
        </div>
      </div>

      <NavBottom />
    </div>
  );
} 