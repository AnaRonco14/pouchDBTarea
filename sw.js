const CACHE_NAME = 'pwa-tareas-v1';
const PRECACHE_URLS = [
  '/', // importante si tu app se sirve en la raíz
  '/index.html',
  '/main.js',
  '/manifest.json',
  './images/192.png',
  './images/512.png',
  'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js'
];

// Instalación: cachear todo
self.addEventListener('install', event => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Activar inmediatamente para pruebas
      return self.skipWaiting();
    })
  );
});

// Activación
self.addEventListener('activate', event => {
  console.log('[SW] activate');
  event.waitUntil(self.clients.claim());
});

// Fetch: estrategia ONLY CACHE
// Responde sólo desde caché. Si no está en caché, intenta red/network como fallback
self.addEventListener('fetch', event => {
  // sólo manejamos GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) {
        return cachedResp;
      }
      // Si no está en cache, intentamos la red (esto permite registrar la app y cargar libs externas la primera vez)
      return fetch(event.request).catch(() => {
        // Fallback simple: podemos devolver index.html para navegación SPA (opcional)
        return caches.match('/index.html');
      });
    })
  );
});
