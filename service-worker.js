const VERSION = '1.3.1';
const scope = new URL(self.registration.scope);
const prefix = `kartstart:${scope.pathname}:`;
const cacheName = prefix + VERSION;

const shell = [
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/appearance.js',
  'js/app.js',
  'js/i18n.js',
  'js/install.js',
  'js/ui.js',
  'js/guide.js',
  'js/journal.js',
  'js/views.js',
  'js/training.js',
  'js/partner.js',
  'js/partner-config.js',
  'js/center-rules.js',
  'js/locales/ru.js',
  'js/locales/en.js',
  'js/locales/az.js',
  'assets/mark.svg',
  'assets/icon-180.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable.png',
  'assets/noto-sans-regular.woff',
  'assets/noto-sans-bold.woff',
  'assets/kart-hero.webp',
  'assets/kart-hero-mobile.webp',
  'assets/baku-center-logo.png',
  'assets/baku-booking.webp',
  'assets/baku-track.webp',
  'assets/baku-track.pdf'
].map(path => new URL(path, scope).href);

const assets = new Set(shell);
const entryUrl = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(
    shell.map(url => new Request(url, { cache: 'reload' }))
  )));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;

  if (request.mode === 'navigate' &&
      (url.pathname === scope.pathname || url.pathname === new URL(entryUrl).pathname)) {
    event.respondWith(caches.match(entryUrl, { cacheName }).then(response => response ?? fetch(request)));
    return;
  }

  url.search = '';
  if (assets.has(url.href)) {
    event.respondWith(caches.match(url.href, { cacheName }).then(response => response ?? fetch(request)));
  }
});
