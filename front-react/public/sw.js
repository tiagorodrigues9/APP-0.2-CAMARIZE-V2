// Service Worker para Camarize - Notificações Push e Cache Offline
const CACHE_NAME = 'camarize-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se disponível
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Receber notificações push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Camarize!',
    icon: '/images/logo_camarize1.png',
    badge: '/images/logo_camarize2.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/images/info-icon.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/images/close-icon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Camarize', options)
  );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
    event.notification.close();
  } else {
    // Clique padrão - abrir a aplicação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Fechar notificação
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event);
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Sync em background:', event);
}); 