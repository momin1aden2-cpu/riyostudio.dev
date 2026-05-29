const CACHE_NAME = 'riyo-studio-v2';

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
      // 1. If we have it in cache, return it immediately (no background fetching to avoid navigate bugs)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Not in cache, fetch from network safely
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid responses
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[ServiceWorker] Network error on fetch', err);
        return new Response('<h1 style="color:white;font-family:sans-serif;text-align:center;margin-top:20%">Offline. Please connect to internet.</h1>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});
