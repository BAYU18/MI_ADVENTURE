/**
 * public/sw.js
 * Service Worker — Petualangan Pelajar PWA
 * Menyediakan caching asset statis untuk kecepatan & kesiapan offline
 */

const CACHE_NAME = 'pp-v7.2.0-20261105v1';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/css/style.css',
  '/js/monsters.js',
  '/js/avatar.js',
  '/js/audio.js',
  '/js/app.js',
  '/js/admin.js',
  '/js/friends.js',
  '/js/duel.js',
  '/js/dexcards.js',
  '/shared/bossskills.js',
  '/shared/progression.js',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install Event: Precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up old caches & take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan tangani skema selain http dan https (misal chrome-extension:// atau moz-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Jangan cache request non-GET
  if (req.method !== 'GET') {
    return;
  }

  // 1. API Endpoints: Network-Only dengan fallback offline response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'OFFLINE',
            message: 'Perangkat sedang offline. Sambungkan internet untuk melanjutkan petualangan.',
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // 2. Navigasi HTML: Network-First dengan fallback cache
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (response.status === 200 && req.url.startsWith('http')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Static Assets: Network-First dengan fallback cache
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && req.url.startsWith('http')) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
      })
  );
});
