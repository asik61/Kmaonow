// =========================================================================
// KamaoNow / Real Money App — Smart Auto-Updating Service Worker
// Version: 2.5.0-live
// =========================================================================

const CACHE_NAME = 'realmoney-cache-v10-live';
const ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Install: Immediately skip waiting so new service worker replaces old one
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE).catch((err) => {
        console.warn('Precache partial fail (non-fatal):', err);
      });
    })
  );
});

// Activate: Delete ANY old cache versions and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notify all clients that a fresh version has activated
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: '2.5.0' });
        });
      });
    })
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'PURGE_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      self.skipWaiting();
    });
  }
});

// Fetch Strategy:
// 1. API calls (/api/*) & /sw.js -> Direct Network Only (Bypass Cache completely)
// 2. HTML Navigation -> Network-First (Always fetch latest; Fallback to cache only if offline)
// 3. Static Assets -> Network-First with Cache Fallback for offline support
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 1. Never intercept /api/* or /sw.js or non-http protocols
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js' || !url.protocol.startsWith('http')) {
    return;
  }

  // 2. Navigation / HTML requests: ALWAYS fetch fresh from server
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', copy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html').then((cached) => {
            return cached || new Response('Offline. Please check your internet connection.', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain' },
            });
          });
        })
    );
    return;
  }

  // 3. Static assets: Network-First with Cache Fallback
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, copy);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          return new Response('Asset unavailable offline', { status: 404 });
        });
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'KamaoNow — Real Money App',
    body: 'Daily Spin & Scratch unlocked! Spin now to earn real cash.',
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/pwa-192x192.png',
      badge: payload.badge || '/icon.svg',
      data: payload.data || { url: '/' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
