// Service Worker for Furqaan PWA
const CACHE_NAME = 'furqaan-v1.1.0';
const STATIC_CACHE = 'furqaan-static-v1.1.0';
const DYNAMIC_CACHE = 'furqaan-dynamic-v1.1.0';
const API_CACHE = 'furqaan-api-v1.1.0';

// Static assets to cache immediately
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/404.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/assets/images/logo.png',
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - implement cache-first strategy for static assets, network-first for dynamic content
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different types of requests
    if (request.method !== 'GET') {
        return;
    }

    // Cache-first strategy for static assets
    if (STATIC_CACHE_URLS.some(staticUrl => request.url.includes(staticUrl))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Network-first strategy for HTML pages (for fresh content)
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Cache-first for other requests
    event.respondWith(cacheFirst(request));
});

// Cache-first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Cache-first failed:', error);
        // Return offline fallback for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('/404.html');
        }
        throw error;
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network-first failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline fallback for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('/404.html');
        }
        throw error;
    }
}

// Background sync for offline actions (if implemented later)
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync logic here if needed
    console.log('Performing background sync...');
}

// Push notifications (if implemented later)
self.addEventListener('push', event => {
    console.log('Service Worker: Push received', event);

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/logo.png',
            badge: '/assets/images/logo.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification click', event);
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});