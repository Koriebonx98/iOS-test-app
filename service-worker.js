// Cache name will be set dynamically based on version.json
let CACHE_NAME = 'ios-test-app-cache-v1.0.8'; // Initial default, will be updated
const VERSION_FILE = './version.json';
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './visitor-tracker.js',
    './audience-counter.js',
    './github-api-helper.js',
    './manifest.json',
    './version.json',
    './cv.txt',
    './cover letter.txt'
];

// Check for updates every 2 minutes (more aggressive)
const UPDATE_CHECK_INTERVAL = 2 * 60 * 1000;

// Periodic update checking timer
let updateCheckTimer = null;

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing new version');
    event.waitUntil(
        (async () => {
            // Fetch version.json to get the current version
            try {
                const response = await fetch(VERSION_FILE, { cache: 'no-cache' });
                if (response.ok) {
                    const versionData = await response.json();
                    CACHE_NAME = `ios-test-app-cache-v${versionData.version}`;
                    console.log('[Service Worker] Using cache name:', CACHE_NAME);
                }
            } catch (error) {
                console.warn('[Service Worker] Failed to fetch version, using default cache name:', error);
            }
            
            const cache = await caches.open(CACHE_NAME);
            console.log('[Service Worker] Pre-caching offline data');
            await cache.addAll(STATIC_ASSETS);
        })()
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
                    // Note: Cache update is intentionally not awaited (fire-and-forget pattern)
                    // to avoid delaying the response. This is standard practice in service workers.
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

    // Use network-first strategy for cv.txt and cover letter.txt to ensure latest content
    if (event.request.url.includes('cv.txt') || event.request.url.includes('cover letter.txt')) {
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

    // Use network-first strategy for manifest.json to ensure latest version
    if (event.request.url.includes('manifest.json')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response to store it in cache
                    const responseToCache = response.clone();
                    // Note: Cache update is intentionally not awaited (fire-and-forget pattern)
                    // to avoid delaying the response. This is standard practice in service workers.
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
        console.log('[Service Worker] Checking for updates...');
        
        const response = await fetch(VERSION_FILE, {
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
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
                console.log('[Service Worker] 🎉 New version available:', newVersion.version);
                console.log('[Service Worker] 📦 Current version:', cachedVersion.version);
                
                // Clear all old caches when version changes
                const cacheNames = await caches.keys();
                const newCacheName = `ios-test-app-cache-v${newVersion.version}`;
                
                await Promise.all(
                    cacheNames
                        .filter((cacheName) => cacheName !== newCacheName)
                        .map((cacheName) => {
                            console.log('[Service Worker] 🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
                
                // Update cache name for future operations
                CACHE_NAME = newCacheName;
                
                // Pre-cache all assets with new version
                const newCache = await caches.open(CACHE_NAME);
                console.log('[Service Worker] 📥 Pre-caching assets for new version');
                try {
                    await newCache.addAll(STATIC_ASSETS);
                } catch (cacheError) {
                    console.warn('[Service Worker] Some assets failed to cache, will retry on demand:', cacheError);
                }
                
                // Update manifest.json with new version
                await updateManifestVersion(newVersion.version);
                
                // Notify all clients about the update
                const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
                console.log(`[Service Worker] 📢 Notifying ${clients.length} client(s) about update`);
                
                clients.forEach(client => {
                    client.postMessage({
                        type: 'UPDATE_AVAILABLE',
                        version: newVersion.version,
                        oldVersion: cachedVersion.version,
                        description: newVersion.description || 'New version available'
                    });
                });
                
                // Note: Auto-reload is handled by client-side app.js to ensure proper timing
                // Service worker skipWaiting() is called when user clicks "Update Now" or after timer
            } else {
                console.log('[Service Worker] ✅ App is up to date:', cachedVersion.version);
            }
        } else {
            // No cached version, this is first run
            console.log('[Service Worker] 📝 First run, caching version:', newVersion.version);
        }
        
        // Update cached version
        await cache.put(VERSION_FILE, new Response(JSON.stringify(newVersion)));
    } catch (error) {
        console.error('[Service Worker] ❌ Error checking for updates:', error);
    }
}

// Update manifest.json cached version to match version.json
// This function fetches the latest manifest from the server (to get all current fields),
// updates only the version field to match version.json, and caches the result.
// This ensures the cached manifest (used by the PWA at runtime) has a consistent version.
// Note: The server-side manifest.json should also be updated manually or via deployment
// to keep the source of truth in sync, but this function ensures runtime consistency.
async function updateManifestVersion(version) {
    try {
        // Fetch the latest manifest from server to use as base
        const manifestResponse = await fetch('./manifest.json', {
            cache: 'no-cache'
        });
        
        if (!manifestResponse.ok) {
            console.log('[Service Worker] Failed to fetch manifest');
            return;
        }
        
        const manifest = await manifestResponse.json();
        
        // Update only the version field to match version.json
        manifest.version = version;
        
        // Store the updated manifest in cache using consistent URL format
        const cache = await caches.open(CACHE_NAME);
        await cache.put('./manifest.json', new Response(JSON.stringify(manifest), {
            headers: {
                'Content-Type': 'application/json'
            }
        }));
        
        console.log('[Service Worker] Updated cached manifest.json to version:', version);
    } catch (error) {
        console.error('[Service Worker] Error updating manifest:', error);
    }
}
