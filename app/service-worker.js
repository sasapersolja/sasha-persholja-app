const CACHE_NAME = 'sasha-persholja-app-v18';
const APP_SHELL = [
  '/',
  '/styles.css',
  '/app.js',
  '/update-notification.js',
  '/manifest.webmanifest',
  '/app/Novi Logo - App Install 192x192.png',
  '/app/Novi Logo - App Install 512x512.png',
  '/app/Novi Logo - Apple Touch Icon 180x180.png',
  '/app/Novi Logo - Favicon 16x16.png',
  '/app/Novi Logo - Favicon 32x32.png',
  '/app/Novi Logo - Favicon 48x48.png',
  '/app/Novi Logo - Favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.headers.has('range')) return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
      }
      return response;
    }).catch((error) => {
      if (event.request.mode === 'navigate') return caches.match('/');
      throw error;
    }))
  );
});
