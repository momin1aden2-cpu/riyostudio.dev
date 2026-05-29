const CACHE_NAME = 'riyo-studio-v1';

// Pre-cache all major HTML, CSS, and JS routes so they load instantly offline.
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
      // We use a try-catch pattern to prevent one bad asset from failing the entire cache block
      return Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Clear old caches
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

// Stale-While-Revalidate Strategy for all GET requests (including external CDNs!)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fire off a network request to get the absolute latest version
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache the fresh response for the NEXT time they visit
        // Only cache valid responses (we check status 200 or opaque responses for CDNs with status 0)
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0) && networkResponse.type !== 'error') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[ServiceWorker] Network request failed, relying purely on offline cache.', err);
      });

      // If we have it in cache, return immediately (lightning fast!).
      // The fetchPromise will quietly update the cache in the background.
      return cachedResponse || fetchPromise;
    })
  );
});
