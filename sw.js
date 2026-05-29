// Service Worker Kill Switch
// This forces the browser to bypass the broken Service Worker and delete the bad caches.

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        console.log('[ServiceWorker Kill Switch] Deleting cache:', key);
        return caches.delete(key);
      }));
    })
  );
  e.waitUntil(self.clients.claim());
});

// Pass all requests directly to the network, doing nothing.
self.addEventListener('fetch', (e) => {
  // Bypassing cache completely to restore normal website functionality
});
