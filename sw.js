/* ═══════════════════════════════════════════════════════
   A Vita Serena — Service Worker (PWA Espace Clientes)
   Stratégie :
   - Pages HTML : réseau d'abord (contenu toujours à jour),
     cache en secours si hors-ligne
   - Assets (icônes, images, polices) : cache d'abord
   - Jamais de cache sur les appels Supabase / GTM / GA
   ═══════════════════════════════════════════════════════ */

var CACHE_VERSION = 'avs-v1';
var PRECACHE = [
  '/espace-clientes.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/fiche-fodmap.html',
  '/fiche-spm.html',
  '/fiche-coherence-cardiaque.html'
];

/* ── Installation : pré-cache du cœur de l'app ── */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // addAll échoue en bloc si un fichier manque → on ajoute un par un
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(url).catch(function () { /* fichier absent : on ignore */ });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

/* ── Activation : purge des anciens caches ── */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

/* ── Interception des requêtes ── */
self.addEventListener('fetch', function (event) {
  var req = event.request;
  var url = new URL(req.url);

  // Uniquement les GET
  if (req.method !== 'GET') return;

  // Jamais d'interception : Supabase, analytics, API externes
  if (url.hostname.indexOf('supabase.co') > -1 ||
      url.hostname.indexOf('googletagmanager.com') > -1 ||
      url.hostname.indexOf('google-analytics.com') > -1 ||
      url.hostname.indexOf('anthropic.com') > -1) {
    return;
  }

  // Pages HTML → réseau d'abord, cache en secours
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (cached) {
          return cached || caches.match('/espace-clientes.html');
        });
      })
    );
    return;
  }

  // Assets → cache d'abord, réseau en secours (et mise en cache au passage)
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        // On ne met en cache que les réponses valides de notre domaine ou des polices Google
        if (res.ok && (url.origin === self.location.origin ||
                       url.hostname.indexOf('fonts.g') > -1)) {
          var copy = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
