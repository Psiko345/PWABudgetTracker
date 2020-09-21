const { response } = require("express");

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
});

self.addEventListener("fetch", event => {

    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
    ) {
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.url.includes("/api")) {

        event.respondWith(
            caches.open(RUNTIME_CACHE)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            cache.put(event.request, response.clone());
                            return response;
                        })
                        .catch(() => caches.match(event.request));
                })
        )
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME_CACHE)
                    .then(cache => {
                        return fetch(event.request)
                            .then(response => {
                                return cache.put(event.request, response.clone()
                                    .then(() => {
                                        return response;
                                    }))
                            })
                    })
            })
    )
})