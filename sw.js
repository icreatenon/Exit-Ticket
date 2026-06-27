const CACHE_NAME = 'exit-ticket-v2'; // Changed version to force an update
const ASSETS = [
  './',
  './index.html'
];

// Install Service Worker and force it to cache immediately
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forces the waiting service worker to become active immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate and take control of the app right away
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(), // Forces the service worker to take control of the page immediately
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Network-first, fallback to cache strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request).then((response) => {
        if (response) {
          return response;
        }
        // Fallback for root path matching
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
