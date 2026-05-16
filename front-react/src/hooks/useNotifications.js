import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkSupport = () => {
      const hasSW   = 'serviceWorker' in navigator;
      const hasPush = 'PushManager' in window;
      const supported = hasSW && hasPush;

      console.log('[Camarize Push] Diagnóstico de suporte:', {
        serviceWorker: hasSW,
        PushManager: hasPush,
        supported,
        protocol: window.location.protocol,
        host: window.location.host,
      });

      setIsSupported(supported);
      if (supported) {
        checkPermission();
        checkSubscription();
      }
    };

    checkSupport();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;

      const isProduction = process.env.NODE_ENV === 'production';
      const devPushEnabled = process.env.NEXT_PUBLIC_ENABLE_PUSH_DEV === 'true';

      if (!isProduction && !devPushEnabled) {
        console.warn(
          '[Camarize] Push notifications desabilitado em desenvolvimento. ' +
          'Para testar localmente, adicione NEXT_PUBLIC_ENABLE_PUSH_DEV=true ao seu .env.local'
        );
        throw new Error(
          'Push não disponível em desenvolvimento. ' +
          'Adicione NEXT_PUBLIC_ENABLE_PUSH_DEV=true ao .env.local para habilitar.'
        );
      }

      // aguarda a página carregar para não competir com o Next em hot reload
      await new Promise((resolve) => {
        if (document.readyState === 'complete') return resolve();
        window.addEventListener('load', () => resolve(), { once: true });
      });

      await navigator.serviceWorker.register('/sw.js');
      // Aguarda o SW passar para o estado "active" antes de retornar
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ativo:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      throw error;
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!('Notification' in window)) {
        throw new Error('Notificações não são suportadas neste navegador');
      }

      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        console.log('Permissão concedida!');
        return true;
      } else {
        throw new Error('Permissão negada para notificações');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Registrar Service Worker
      const registration = await registerServiceWorker();

      if (!registration) {
        throw new Error('Service Worker não pôde ser registrado');
      }

      // Solicitar permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Permissão necessária para notificações');
      }

      // Converter VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa1l9aPvV0xXl3qzSxScyPRN-2M9ZAX4h6yJV9RqOEPf84jGrd0n3_2OlAi7Rg';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Inscrever para push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log('Inscrito para notificações push:', subscription);

      // Enviar subscription para o servidor
      await sendSubscriptionToServer(subscription);

      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('Erro ao inscrever para notificações:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromServer(subscription);
        setIsSubscribed(false);
        console.log('Inscrição cancelada');
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Enviar notificação de teste através do Service Worker
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Camarize - Teste', {
        body: 'Esta é uma notificação de teste!',
        icon: '/images/logo_camarize1.png',
        badge: '/images/logo_camarize2.png',
        vibrate: [100, 50, 100],
        data: { type: 'test' }
      });

      console.log('Notificação de teste enviada');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      setError(error.message);
    }
  };

  const getStoredAuth = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    try {
      const u = JSON.parse(sessionStorage.getItem('usuarioCamarize') || localStorage.getItem('usuarioCamarize'));
      return { token, userId: u?._id || u?.id || null };
    } catch {
      return { token, userId: null };
    }
  };

  const sendSubscriptionToServer = async (subscription) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const { token, userId } = getStoredAuth();

      const response = await fetch(`${apiUrl}/notifications/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar subscription para o servidor');
      }

      console.log('Subscription enviada para o servidor');
    } catch (error) {
      console.error('Erro ao enviar subscription:', error);
      throw error;
    }
  };

  const removeSubscriptionFromServer = async (subscription) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const { token, userId } = getStoredAuth();

      const response = await fetch(`${apiUrl}/notifications/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao remover subscription do servidor');
      }

      console.log('Subscription removida do servidor');
    } catch (error) {
      console.error('Erro ao remover subscription:', error);
      throw error;
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification,
    checkSubscriptionStatus: checkSubscription,
    registerServiceWorker
  };
}; 