// service-worker.js
const CACHE_VERSION = 'v1';
const CACHE_NAME = `english-app-${CACHE_VERSION}`;

// 📦 Tous les fichiers statiques à mettre en cache dès l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/data/lessons.json',
  '/manifest.json',
  '/bg.png' // ← Image de fond ajoutée
];

// 🔽 INSTALLATION : mise en cache des fichiers statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Mise en cache des assets statiques');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Force l'activation immédiate du nouveau SW
});

// 🗑️ ACTIVATION : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('english-app-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Suppression de l\'ancien cache :', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim(); // Prend le contrôle des pages ouvertes immédiatement
});

// 🌐 FETCH : stratégie Cache-First + Fallback Hors Ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1️⃣ Si présent dans le cache → on le retourne
      if (cachedResponse) return cachedResponse;

      // 2️⃣ Sinon → requête réseau + mise en cache pour la prochaine fois
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // 🆘 Fallback hors ligne pour la navigation HTML
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});----+6
