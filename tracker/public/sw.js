const CACHE_NAME = 'inimovil-v7';
const urlsToCache = [
    '/manifest.json'
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
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
