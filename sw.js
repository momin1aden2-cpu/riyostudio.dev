const CACHE_NAME = 'riyo-studio-v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/forge.html',
  '/invoice.html',
  '/qr.html',
  '/scanner.html',
  '/privacy.html',
  '/terms.html',
  '/disclaimer.html',
  '/style.css?v=11',
  '/scanner.css',
  '/script.js?v=2',
  '/forge.js?v=7',
  '/invoice.js',
  '/qr.js',
  '/assets/icon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets');
      return Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache immediately
        // Update cache in the background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[ServiceWorker] Network error on fetch', err);
        // Prevent browser throwing a blank page
        return new Response('<h1 style="color:white;font-family:sans-serif;text-align:center;margin-top:20%">Network Error. Try refreshing.</h1>', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});
