<<<<<<< HEAD
const CACHE_NAME = 'inimovil-v7';
const urlsToCache = [
    '/manifest.json'
=======
const CACHE_NAME = 'inimovil-v3';
const urlsToCache = [
    '/uber/',
    '/uber/index.html',
    '/uber/manifest.json'
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
];

self.addEventListener('install', event => {
    // Forzar activación inmediata
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    // Tomar control de los clientes inmediatamente
    event.waitUntil(clients.claim());
    // Limpiar caches viejas
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
<<<<<<< HEAD
    // Para peticiones de navegación (HTML), usar Network First
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Para otros recursos, Cache First (o el comportamiento previo)
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
