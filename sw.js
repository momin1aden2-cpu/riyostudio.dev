const CACHE_NAME = 'riyo-studio-v36';
// Use the canonical clean URLs only. Requesting the .html form 308-redirects to
// the clean URL, and caching that redirected response makes iOS WebKit refuse
// to render it ("Response served by service worker has redirections").
const PRECACHE_ASSETS = [
  '/',
  '/logo',
  '/forge',
  '/scanner',
  '/qr',
  '/invoice',
  '/video',
  '/style.css',
  '/script.js',
  '/bg.js',
  '/logo.js',
  '/forge.js',
  '/scanner.js',
  '/qr.js',
  '/invoice.js',
  '/video.js',
  '/assets/icon.svg?v=2',
  '/assets/fonts/Inter-Bold.ttf',
  '/assets/fonts/Anton.ttf',
  '/assets/fonts/Montserrat-Bold.ttf'
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
  const request = event.request;

  // Ignore non-GET and cross-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(request.url);
  const isVersioned = url.search.indexOf('v=') !== -1;

  // Safari refuses a redirected response served from a service worker
  // ("Response served by service worker has redirections"), which breaks
  // navigations. Rebuild any redirected response as a plain, non-redirected one.
  const clean = (resp) => {
    if (!resp || !resp.redirected) return resp;
    return resp.blob().then((body) => new Response(body, {
      status: resp.status, statusText: resp.statusText, headers: resp.headers
    }));
  };

  // Page navigations → network-first, so the latest page always loads and the
  // worker never serves a stale layout. Falls back to cache only when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(clean)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return resp;
        })
        .catch(() => caches.match(request).then((c) => clean(c) || caches.match('/').then(clean)))
    );
    return;
  }

  // Versioned assets (?v=...) are content-addressed and immutable.
  // Serve cache-first for instant loads; only hit the network on a miss.
  if (isVersioned) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Other unversioned assets: stale-while-revalidate.
  // Render instantly from cache, refresh the copy in the background.
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});






