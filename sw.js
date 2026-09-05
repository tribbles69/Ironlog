/* Ironlog service worker.
   Bump VERSION whenever the app files change — that's what triggers the
   "Update ready" prompt on the next launch. */
const VERSION = 'ironlog-v21';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './program.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* version.json is how a running app notices a new build. Serving it from the
     cache would mean the app could never learn it was stale — the one file that
     must always come from the network. */
  if (url.pathname.endsWith('/version.json')) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });

    // Refresh in the background; the cached copy is what gets shown now.
    const fromNet = fetch(req).then(res => {
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    }).catch(() => null);

    if (cached) return cached;

    const res = await fromNet;
    if (res) return res;

    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html') || await cache.match('./');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  })());
});
