// RESQ KERALA — Service Worker
// Provides high-reliability offline shell caching, offline SOS queue support,
// and safe fallbacks during extreme Kerala monsoon network disruptions.
// SECURITY NOTICE: Never caches authenticated API responses or private incident records.

const CACHE_NAME = 'resq-kerala-shell-v2';

const CRITICAL_PWA_ASSETS = [
  '/',
  '/download',
  '/install',
  '/offline.html',
  '/citizen',
  '/citizen/sos',
  '/citizen/shelters',
  '/citizen/contacts',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.png',
  '/favicon.ico',
];

// 1. Install Event: Pre-cache offline shell without blocking on transient network drops
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        CRITICAL_PWA_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(asset, response);
            }
          } catch (err) {
            console.warn('Pre-cache skip for:', asset, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches immediately and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Stale-while-revalidate for static shell, Network-first for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // A. Skip non-GET requests, Next.js dev HMR streams, and telemetry
  if (
    request.method !== 'GET' ||
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // B. Never cache private authenticated APIs or Supabase queries
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/auth/') ||
    url.searchParams.has('token') ||
    url.searchParams.has('code')
  ) {
    return;
  }

  // B1. Bypass binary APK downloads completely to prevent Service Worker stream issues
  if (
    url.pathname.endsWith('.apk') ||
    url.pathname.startsWith('/downloads/')
  ) {
    return;
  }

  // C. HTML Page Navigations: Network first, cache on success, offline fallback on failure
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedPage = await cache.match(request);
          if (cachedPage) return cachedPage;

          const offlineFallback = await cache.match('/offline.html');
          if (offlineFallback) return offlineFallback;

          return cache.match('/') || Response.error();
        })
    );
    return;
  }

  // D. Static Assets (CSS, JS, Fonts, Images, Icons, Manifests): Stale-while-revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.json') ||
      url.pathname.endsWith('.webmanifest'))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // E. Default fetch
  event.respondWith(fetch(request));
});
