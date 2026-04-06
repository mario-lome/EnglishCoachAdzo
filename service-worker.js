// service-worker.js - EnglishCoachAdzo PWA
// ✅ Version corrigée et optimisée

const CACHE_VERSION = 'v1';
const APP_NAME = 'english-coach-adzo'; // ✅ Nom technique cohérent avec le projet
const CACHE_NAME = `${APP_NAME}-${CACHE_VERSION}`;

// 📦 Assets statiques à mettre en cache (chemins absolus depuis la racine)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/engine.js',
  '/data/lessons.json',
  '/manifest.json',
  '/bg.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/audio/correct.mp3',  // ← AJOUTÉ
  '/assets/audio/wrong.mp3',    // ← AJOUTÉ
  '/assets/audio/victory.mp3'   // ← AJOUTÉ
];

// 🔽 INSTALLATION : pré-cache des fichiers essentiels
self.addEventListener('install', (event) => {
  console.log(`[SW] Installation de ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache des assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Pré-cache terminé ✅');
        return self.skipWaiting(); // Active immédiatement le nouveau SW
      })
      .catch((err) => {
        console.error('[SW] Erreur de pré-cache:', err);
      })
  );
});

// 🗑️ ACTIVATION : nettoyage des anciens caches + prise de contrôle
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activation de ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith(APP_NAME + '-') && name !== CACHE_NAME)
            .map((name) => {
              console.log(`[SW] Suppression de l'ancien cache : ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Anciens caches nettoyés 🧹');
        return self.clients.claim(); // Prend le contrôle des pages ouvertes
      })
  );
});

// 🌐 FETCH : stratégie Cache-First avec fallback réseau + hors ligne
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes externes (CDN, APIs tierces, analytics...)
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 1️⃣ Si trouvé dans le cache → retourne immédiatement
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2️⃣ Sinon → requête réseau
        return fetch(request)
          .then((networkResponse) => {
            // Vérifie que la réponse est valide
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone et met en cache pour la prochaine fois
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch((err) => {
                console.warn('[SW] Échec de mise en cache:', err);
              });

            return networkResponse;
          })
          .catch((error) => {
            // 🆘 Fallback hors ligne pour la navigation HTML
            if (request.mode === 'navigate') {
              console.log('[SW] Hors ligne → fallback sur index.html');
              return caches.match('/index.html');
            }
            // Pour les autres ressources, retourne une réponse d'erreur claire
            console.warn('[SW] Requête échouée:', error);
            return new Response('Offline - EnglishCoachAdzo', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// 🔄 Optionnel : Gestion des messages (pour forcer une mise à jour depuis l'app)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache vidé sur demande');
    });
  }
});
