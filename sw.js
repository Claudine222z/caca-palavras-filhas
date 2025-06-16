const CACHE_NAME = 'caca-palavras-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Arquivos para cache estático (sempre em cache)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Adicionar outros ícones quando criados
];

// Arquivos para cache dinâmico
const DYNAMIC_FILES = [
  '/icon-72x72.png',
  '/icon-96x96.png', 
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-384x384.png',
  '/screenshot1.png',
  '/screenshot2.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Fazendo cache dos arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      }),
      // Cache dinâmico
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Service Worker: Preparando cache dinâmico');
        return Promise.allSettled(
          DYNAMIC_FILES.map(file => 
            cache.add(file).catch(err => 
              console.log(`Arquivo ${file} não encontrado, será cacheado quando acessado`)
            )
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Instalação concluída');
      return self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Ativado e pronto!');
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Estratégia: Cache First para arquivos estáticos
  if (STATIC_FILES.includes(new URL(event.request.url).pathname)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(STATIC_CACHE).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Fallback para página offline se disponível
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
    );
    return;
  }

  // Estratégia: Network First para conteúdo dinâmico
  event.respondWith(
    fetch(event.request).then(response => {
      // Se a resposta for válida, cache ela
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Se falhar, tenta buscar no cache
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        
        // Fallback para página principal se for uma navegação
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        
        // Fallback para imagem padrão se for uma imagem
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">🎮</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// Sincronização em background
self.addEventListener('sync', event => {
  console.log('Service Worker: Sincronização em background');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode sincronizar dados salvos offline
      syncGameData()
    );
  }
});

// Notificações push
self.addEventListener('push', event => {
  console.log('Service Worker: Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Jogar Agora',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Caça Palavras', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Clique na notificação');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
    return;
  } else {
    // Clique na notificação (não em uma ação)
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Função para sincronizar dados do jogo
async function syncGameData() {
  try {
    // Aqui você pode implementar sincronização com servidor
    console.log('Sincronizando dados do jogo...');
    
    // Exemplo: enviar pontuação para servidor
    const gameData = await getStoredGameData();
    if (gameData) {
      // await sendToServer(gameData);
      console.log('Dados sincronizados com sucesso');
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Função auxiliar para obter dados armazenados
async function getStoredGameData() {
  // Implementar lógica para obter dados do IndexedDB ou localStorage
  return null;
}

// Limpeza periódica do cache
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      cleanOldCache().then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

async function cleanOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  // Remove itens mais antigos que 7 dias
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (responseDate < oneWeekAgo) {
        await cache.delete(request);
        console.log('Cache limpo:', request.url);
      }
    }
  }
}

// Log de erros
self.addEventListener('error', event => {
  console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});

console.log('Service Worker: Script carregado');
