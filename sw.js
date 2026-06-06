const CACHE_NAME = 'riyo-studio-v8';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.html',
  '/forge.html',
  '/scanner.html',
  '/qr.html',
  '/invoice.html',
  '/style.css',
  '/script.js',
  '/bg.js',
  '/logo.js',
  '/forge.js',
  '/scanner.js',
  '/qr.js',
  '/invoice.js',
  '/assets/icon.svg',
  '/assets/icon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Best effort precache, ignore failures
      return Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If it's a good response, save a copy in the cache!
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed (offline). Fallback to cache!
        return caches.match(event.request);
      })
  );
});
