const VERSION = 'quiet-bridge-v5';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = [
  '/', '/index.html', '/privacy/', '/terms/', '/offline.html',
  '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png',
  '/icon-maskable-512.png', '/art/quiet-desk.webp', '/art/quiet-desk-768.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(PRECACHE);
    const pages = await Promise.all(['/', '/privacy/', '/terms/'].map((url) => cache.match(url)));
    const assets = new Set();
    for (const response of pages) {
      if (!response) continue;
      const html = await response.text();
      for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) assets.add(match[1]);
    }
    await cache.addAll([...assets]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => ![SHELL, RUNTIME].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(RUNTIME);
        cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await caches.match(event.request)) || (await caches.match('/')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/art/') || url.pathname.startsWith('/icon')) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      const cache = await caches.open(RUNTIME);
      cache.put(event.request, response.clone());
      return response;
    })());
  }
});
