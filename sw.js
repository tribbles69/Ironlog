/* Ironlog service worker.
   Bump VERSION whenever the app files change — that's what triggers the
   "Update ready" prompt on the next launch. */
const VERSION = 'ironlog-v164';

const ASSETS = [
  './',
  './index.html',
  './js/app.js',   // the app's code (module split, r&d/notes/module-split.md): every js/ file must be listed, check-version.cjs checks
  './CHANGELOG.md',
  './manifest.webmanifest',
  './program.json',
  './slew-core.js',
  './slew-video.js',   // bar path from video (04a) — loaded on first use, cached so it works offline in the gym
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './skins/template.png',
  './skins/goblin-strip.webp',   // the welcome sheet's picture (00-D2), 6 small figures
  './audio/intervals.mp3',   // recorded interval-timer cues (00-D2), 171 KB
];

self.addEventListener('install', e => {
  /* cache: 'reload' — straight from the server, past the browser's own HTTP
     cache. Cached files are no longer refreshed after install (see fetch), so
     a stale copy picked up here would stay until the next version. */
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // the optional pose download (04b) lives in its own cache and survives app updates
    await Promise.all(keys.filter(k => k !== VERSION && !k.startsWith('ironlog-pose-')).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* The rest timer's "Rest over" notification: tapping it brings the app back. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.length) return wins[0].focus();
    return self.clients.openWindow('./');
  })());
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

  /* pose/ — the optional squat-depth download (roadmap 04b). Never precached.
     The app puts the files in an 'ironlog-pose-<version>' cache when the
     lifter turns depth judging on; serve them from there, network otherwise.
     Not stored here on a miss: only the app's own download decides what's kept. */
  if (url.pathname.includes('/pose/')) {
    e.respondWith((async () => {
      for (const k of await caches.keys()) {
        if (!k.startsWith('ironlog-pose-')) continue;
        const hit = await (await caches.open(k)).match(req, { ignoreSearch: true });
        if (hit) return hit;
      }
      return fetch(req);
    })());
    return;
  }

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = await cache.match(req, { ignoreSearch: true });

    /* A cached file is never refreshed in place. It used to be re-fetched on
       every launch and written back into this same cache, so a new index.html
       was in use on the second launch whether or not the update had been
       accepted — mid-workout included — and on a patchy signal one file
       could be new while another was old. New files arrive with a new worker
       (a new VERSION), which the app applies when it's safe to. */
    if (cached) return cached;

    // not precached: fetch it, and keep it so it works offline next time
    const res = await fetch(req).then(r => {
      if (r && r.ok && r.type === 'basic') cache.put(req, r.clone());
      return r;
    }).catch(() => null);
    if (res) return res;

    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html') || await cache.match('./');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  })());
});
