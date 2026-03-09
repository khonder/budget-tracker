const CACHE = 'budget-tracker-v5';
const STATIC = [
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch index.html and API calls fresh — never cache them
  if (url.pathname === '/' ||
      url.pathname.endsWith('/') ||
      url.pathname.endsWith('index.html') ||
      url.hostname.includes('script.google.com') ||
      url.hostname.includes('googleusercontent.com')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).catch(() => caches.match('./index.html')));
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
