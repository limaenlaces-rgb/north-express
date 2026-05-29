// North Express · Service Worker v2.0
const CACHE = 'nx-repartidor-v2';

// Archivos que se cachean para funcionar sin señal
const PRECACHE = [
  '/north-express-motorizado.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalar: pre-cachea lo esencial
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        '/north-express-motorizado.html',
        '/manifest.json'
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activar: limpia caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network first, cache como fallback
self.addEventListener('fetch', e => {
  // Firebase y APIs externas: siempre red (datos en tiempo real)
  if (
    e.request.url.includes('firebaseio.com') ||
    e.request.url.includes('googleapis.com/identitytoolkit') ||
    e.request.url.includes('firebaseapp.com')
  ) {
    return;
  }

  // Para el HTML principal: Network first, cache fallback
  if (e.request.url.includes('north-express-motorizado.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Para fuentes y libs estáticas: Cache first
  if (
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('cdnjs.cloudflare.com') ||
    e.request.url.includes('gstatic.com/firebasejs')
  ) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }
});
