const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/db.js',
    '/manifest.webmanifest',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const RUNTIME_CACHE = "runtime-cache";
const STATIC_CACHE = "static-cache-1";

self.addEventListener("install", event => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then(cacheNames => {
                return cacheNames.filter(
                    cacheName => !currentCaches.includes(cacheName)
                )
            })
            .then(oldCaches => {
                return Promise.all(
                    oldCaches.map(oldCaches => {
                        return caches.delete(oldCaches);
                    })
                )
            })
            .then(() => self.clients.claim())
    )
})