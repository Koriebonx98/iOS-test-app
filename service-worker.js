// Increment this version number whenever you make changes to force cache updates
const CACHE_VERSION = 'v3';
const CACHE_NAME = 'ios-test-app-cache-' + CACHE_VERSION;
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pre-caching offline data with version:', CACHE_VERSION);
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Use network-first strategy for HTML, CSS, and JS files to ensure updates are fetched
    const url = new URL(event.request.url);
    const isStaticAsset = STATIC_ASSETS.some(asset => {
        const assetPath = asset.replace('./', '/');
        return url.pathname === assetPath || url.pathname === '/' + asset || url.pathname.endsWith(asset);
    });
    
    if (isStaticAsset || event.request.mode === 'navigate') {
        // Network-first strategy: try to fetch from network, fall back to cache
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response before caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(event.request).then((response) => {
                        return response || caches.match('index.html');
                    });
                })
        );
    } else {
        // For other requests (images, fonts, etc.), use cache-first strategy
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

self.addEventListener('activate', (event) => {
    // Take control of all pages immediately
    event.waitUntil(
        clients.claim().then(() => {
            return caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            });
        })
    );
});
