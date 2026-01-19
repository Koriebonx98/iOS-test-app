const CACHE_NAME = 'ios-test-app-cache-v4';
const VERSION_FILE = './version.json';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json'
];

// Check for updates every 5 minutes
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;

// Periodic update checking timer
let updateCheckTimer = null;

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing new version');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pre-caching offline data');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Use network-first strategy for version.json to always check for updates
    if (event.request.url.includes(VERSION_FILE)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response to store it in cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try to return cached version
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle navigation requests specially to avoid 404 errors
    if (event.request.mode === 'navigate') {
        event.respondWith(
            // Try network first for navigation to get latest content
            fetch(event.request)
                .then((response) => {
                    // Clone the response to store it in cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, fallback to cached index.html
                    return caches.match('index.html');
                })
        );
    } else {
        // For non-navigation requests, use network-first strategy for static assets
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Clone the response to store it in cache
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                })
                .catch((error) => {
                    console.log('[Service Worker] Network fetch failed for:', event.request.url, error);
                    // If network fails, fallback to cache
                    return caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[Service Worker] Serving from cache:', event.request.url);
                            return cachedResponse;
                        }
                        // If cache also fails, throw error with resource info
                        const errorMsg = `Failed to fetch resource: ${event.request.url}. No cached version available.`;
                        console.error('[Service Worker]', errorMsg);
                        throw new Error(errorMsg);
                    });
                })
        );
    }
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating new version');
    event.waitUntil(
        (async () => {
            // Delete old caches
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
            
            // Claim all clients immediately
            await self.clients.claim();
            
            // Clear old timer if exists
            if (updateCheckTimer) {
                clearInterval(updateCheckTimer);
            }
            
            // Check for updates immediately on activation
            await checkForUpdates();
            
            // Set up periodic checks
            updateCheckTimer = setInterval(() => {
                checkForUpdates();
            }, UPDATE_CHECK_INTERVAL);
            
            console.log('[Service Worker] Update checker initialized');
        })()
    );
});

// Message handler for communication with the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] Received SKIP_WAITING message');
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'CHECK_FOR_UPDATES') {
        console.log('[Service Worker] Manually checking for updates');
        checkForUpdates();
    }
});

// Check for updates by fetching version.json
async function checkForUpdates() {
    try {
        const response = await fetch(VERSION_FILE, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            console.log('[Service Worker] Failed to fetch version info');
            return;
        }
        
        const newVersion = await response.json();
        
        // Get cached version
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(VERSION_FILE);
        
        if (cachedResponse) {
            const cachedVersion = await cachedResponse.json();
            
            // Compare versions
            if (newVersion.version !== cachedVersion.version) {
                console.log('[Service Worker] New version available:', newVersion.version);
                
                // Notify all clients about the update
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'UPDATE_AVAILABLE',
                        version: newVersion.version,
                        oldVersion: cachedVersion.version
                    });
                });
            } else {
                console.log('[Service Worker] App is up to date:', cachedVersion.version);
            }
        }
        
        // Update cached version
        await cache.put(VERSION_FILE, new Response(JSON.stringify(newVersion)));
    } catch (error) {
        console.error('[Service Worker] Error checking for updates:', error);
    }
}
