/**
 * RiYooIQ - Service Worker for PWA (Offline & Direct Installable App)
 */

const CACHE_NAME = 'riyoo-iq-v1.0.1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './js/audio.js',
    './js/questions.js',
    './js/canvas-arena.js',
    './js/game.js',
    './assets/banner.jpg',
    './assets/logo.jpg',
    './assets/logo.png',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/icon-maskable.png',
    './assets/favicon.png'
];

// Install event - Cache core game files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[RiYooIQ SW] Caching app assets for offline play');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activate event - Clear old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[RiYooIQ SW] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // If valid response, clone and cache
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Offline fallback
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
