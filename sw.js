// North Express · Service Worker v3.0
const CACHE = 'nx-repartidor-v3';
const BASE = '/north-express/north-express';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll([
        BASE + '-motorizado.html',
        BASE + '-tienda.html',
        BASE + '-admin-almacen.html',
        '/north-express/north-express/manifest.json',
      ]).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (
    e.request.url.includes('firebaseio.com') ||
    e.request.url.includes('googleapis.com/identitytoolkit') ||
    e.request.url.includes('firebaseapp.com') ||
    e.request.url.includes('gstatic.com/firebasejs')
  ) return;

  if (
    e.request.url.includes('north-express-motorizado.html') ||
    e.request.url.includes('north-express-tienda.html') ||
    e.request.url.includes('north-express-admin-almacen.html')
  ) {
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

  if (
    e.request.url.includes('fonts.googleapis.com') ||
    e.request.url.includes('cdnjs.cloudflare.com')
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
