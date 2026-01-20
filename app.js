// Counter functionality
let clickCount = 0;
const actionButton = document.getElementById('actionButton');
const clickCountDisplay = document.getElementById('clickCount');

// Load click count from localStorage
function loadClickCount() {
    const savedCount = localStorage.getItem('clickCount');
    if (savedCount) {
        clickCount = parseInt(savedCount, 10);
        clickCountDisplay.textContent = `Clicks: ${clickCount}`;
    }
}

// Save click count to localStorage
function saveClickCount() {
    localStorage.setItem('clickCount', clickCount);
}

actionButton.addEventListener('click', () => {
    clickCount++;
    clickCountDisplay.textContent = `Clicks: ${clickCount}`;
    saveClickCount();
    
    // Add a little animation feedback
    actionButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        actionButton.style.transform = 'scale(1)';
    }, 100);
    
    // Optional: Haptic feedback for iOS devices
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
});

// Display device information
function updateDeviceInfo() {
    const userAgent = document.getElementById('userAgent');
    const screenSize = document.getElementById('screenSize');
    const deviceCurrentTime = document.getElementById('deviceCurrentTime');
    
    // Load from localStorage if offline
    if (!navigator.onLine) {
        const savedDeviceInfo = localStorage.getItem('deviceInfo');
        if (savedDeviceInfo) {
            const deviceInfo = JSON.parse(savedDeviceInfo);
            userAgent.textContent = deviceInfo.userAgent || navigator.userAgent;
            screenSize.textContent = deviceInfo.screenSize || `${window.innerWidth} x ${window.innerHeight}px`;
            console.log('[App] Using cached device info (offline mode)');
        }
    } else {
        userAgent.textContent = navigator.userAgent;
        screenSize.textContent = `${window.innerWidth} x ${window.innerHeight}px`;
        
        // Save device info to localStorage
        const deviceInfo = {
            userAgent: navigator.userAgent,
            screenSize: `${window.innerWidth} x ${window.innerHeight}px`,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    }
    
    // Update time
    function updateTime() {
        const now = new Date();
        deviceCurrentTime.textContent = now.toLocaleTimeString();
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// Update screen size on orientation change
window.addEventListener('resize', () => {
    const screenSize = document.getElementById('screenSize');
    const newSize = `${window.innerWidth} x ${window.innerHeight}px`;
    screenSize.textContent = newSize;
    
    // Update localStorage with new screen size
    if (navigator.onLine) {
        const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo')) || {};
        deviceInfo.screenSize = newSize;
        deviceInfo.lastUpdated = new Date().toISOString();
        localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    }
});

// About dropdown toggle functionality
function initializeAboutDropdown() {
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutContent = document.getElementById('aboutContent');
    
    if (aboutToggle && aboutContent) {
        aboutToggle.addEventListener('click', () => {
            aboutToggle.classList.toggle('active');
            aboutContent.classList.toggle('active');
            
            // Optional: Haptic feedback for supported devices (primarily Android)
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load saved click count
    loadClickCount();
    
    // Update device info
    updateDeviceInfo();
    
    // Initialize About dropdown toggle
    initializeAboutDropdown();
    
    // Load and display version info
    loadVersionInfo();
    
    // Check online/offline status
    function updateOnlineStatus() {
        if (navigator.onLine) {
            console.log('[App] Online - Using live data');
        } else {
            console.log('[App] Offline - Using cached data from localStorage');
        }
    }
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('[App] Connection restored');
        updateDeviceInfo();
        // Check for updates when coming back online
        checkForAppUpdates();
    });
    
    window.addEventListener('offline', () => {
        console.log('[App] Connection lost - Switching to offline mode');
    });
    
    updateOnlineStatus();
    
    // Initialize Reset Data button
    const resetDataButton = document.getElementById('resetDataButton');
    if (resetDataButton) {
        resetDataButton.addEventListener('click', resetAppData);
    }
    
    // Initialize Check Update button
    const checkUpdateButton = document.getElementById('checkUpdateButton');
    if (checkUpdateButton) {
        checkUpdateButton.addEventListener('click', () => {
            checkUpdateButton.textContent = 'Checking...';
            checkUpdateButton.disabled = true;
            
            // Check for updates
            checkForAppUpdates();
            
            // Also refresh audience count if available
            if (window.audienceCounter && typeof window.audienceCounter.refresh === 'function') {
                window.audienceCounter.refresh();
            }
            
            // Re-enable button after a delay
            setTimeout(() => {
                checkUpdateButton.textContent = 'Check Now';
                checkUpdateButton.disabled = false;
            }, 2000);
        });
    }
    
    // Log to console that app is ready
    console.log('iOS Test App loaded successfully!');
    
    // Prevent bounce/overscroll on iOS
    document.body.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Load and display version information
async function loadVersionInfo() {
    try {
        // Fetch version from version.json
        const versionResponse = await fetch('./version.json');
        if (!versionResponse.ok) {
            throw new Error(`Failed to fetch version.json: ${versionResponse.status}`);
        }
        const versionData = await versionResponse.json();
        
        // Fetch version from manifest.json
        const manifestResponse = await fetch('./manifest.json');
        if (!manifestResponse.ok) {
            throw new Error(`Failed to fetch manifest.json: ${manifestResponse.status}`);
        }
        const manifestData = await manifestResponse.json();
        
        const versionInfo = document.getElementById('versionInfo');
        if (versionInfo) {
            // Display the version to users
            versionInfo.textContent = `Version: ${versionData.version}`;
            
            // Log version mismatch for debugging (if any)
            if (versionData.version !== manifestData.version) {
                console.warn('[App] Version mismatch detected:', {
                    versionJson: versionData.version,
                    manifestJson: manifestData.version
                });
            }
        }
        
        console.log('[App] Current version:', versionData.version);
        console.log('[App] Manifest version:', manifestData.version);
        
        // Store version in localStorage for offline use
        try {
            localStorage.setItem('appVersion', JSON.stringify({
                version: versionData.version,
                manifestVersion: manifestData.version,
                lastChecked: new Date().toISOString() // Useful for debugging and future cache expiration logic
            }));
        } catch (storageError) {
            console.warn('[App] Failed to cache version in localStorage:', storageError);
        }
    } catch (error) {
        console.error('[App] Failed to load version info:', error);
        const versionInfo = document.getElementById('versionInfo');
        if (versionInfo) {
            // Try to load from localStorage if offline
            try {
                const savedVersion = localStorage.getItem('appVersion');
                if (savedVersion) {
                    const versionObj = JSON.parse(savedVersion);
                    versionInfo.textContent = `Version: ${versionObj.version} (Offline)`;
                } else {
                    versionInfo.textContent = 'Version: Unknown';
                }
            } catch (storageError) {
                console.warn('[App] Failed to parse cached version from localStorage:', storageError);
                versionInfo.textContent = 'Version: Unknown';
            }
        }
    }
}

// Check for app updates manually
function checkForAppUpdates() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_FOR_UPDATES'
        });
    }
}

// App state management for notifications
const appNotificationState = {
    updateNotificationShown: false,
    versionUpdateNotificationShown: false
};

// Show update notification when new service worker is installed
function showUpdateNotification(newWorker) {
    // Prevent multiple notifications
    if (appNotificationState.updateNotificationShown) {
        return;
    }
    appNotificationState.updateNotificationShown = true;
    
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <div class="update-icon">🔄</div>
            <div class="update-text">
                <strong>Update Available!</strong>
                <p>A new version of the app is ready to install.</p>
            </div>
            <button class="update-button" id="updateButton">Update Now</button>
            <button class="update-dismiss" id="dismissUpdate">Later</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Handle update button click
    document.getElementById('updateButton').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
        
        // Tell the new service worker to skip waiting
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    });
    
    // Handle dismiss button click
    document.getElementById('dismissUpdate').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            appNotificationState.updateNotificationShown = false;
        }, 300);
    });
}

// Show version update notification when version.json changes
function showVersionUpdateNotification(newVersion, oldVersion, description) {
    // Prevent multiple notifications
    if (appNotificationState.versionUpdateNotificationShown) {
        return;
    }
    appNotificationState.versionUpdateNotificationShown = true;
    
    const notification = document.createElement('div');
    notification.className = 'update-notification urgent';
    notification.innerHTML = `
        <div class="update-content">
            <div class="update-icon">✨</div>
            <div class="update-text">
                <strong>🎉 New Version Available!</strong>
                <p>Version ${newVersion} is now available (current: ${oldVersion})</p>
                ${description ? `<p class="update-description">${description}</p>` : ''}
                <p class="update-hint">⏱️ Auto-reloading in 5 seconds to apply update...</p>
            </div>
            <button class="update-button" id="versionUpdateButton">Update Now</button>
            <button class="update-dismiss" id="dismissVersionUpdate">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    let autoReloadTimer;
    
    // Handle refresh button click
    document.getElementById('versionUpdateButton').addEventListener('click', () => {
        clearTimeout(autoReloadTimer);
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
        
        // Force reload with cache bypass
        console.log('[App] 🔄 User requested update - force reloading...');
        window.location.reload(true);
    });
    
    // Handle dismiss button click
    document.getElementById('dismissVersionUpdate').addEventListener('click', () => {
        clearTimeout(autoReloadTimer);
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            appNotificationState.versionUpdateNotificationShown = false;
        }, 300);
    });
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => {
                console.log('[Service Worker] Registered successfully', reg);
                
                // Check for updates on page load
                reg.update();
                
                // Listen for updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    console.log('[Service Worker] Update found, installing new version');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            console.log('[Service Worker] New version installed and ready');
                            showUpdateNotification(newWorker);
                        }
                    });
                });
                
                // Check for updates more frequently (every 2 minutes) to ensure all devices get updates quickly
                setInterval(() => {
                    console.log('[App] Auto-checking for updates...');
                    reg.update();
                }, 2 * 60 * 1000);
            })
            .catch(err => console.log('[Service Worker] Registration failed', err));
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                console.log('[App] 🎉 Update available:', event.data.version);
                console.log('[App] 📝 Update description:', event.data.description);
                
                // Show notification with auto-reload option
                showVersionUpdateNotification(
                    event.data.version, 
                    event.data.oldVersion,
                    event.data.description
                );
                
                // Auto-reload after showing notification for 5 seconds
                setTimeout(() => {
                    console.log('[App] 🔄 Auto-reloading to apply update...');
                    window.location.reload();
                }, 5000);
            }
        });
        
        // Handle controller change (when new service worker takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[App] 🔄 New service worker activated - reloading page');
            // Always reload when controller changes to ensure latest version
            window.location.reload();
        });
        
        // Check for updates when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
                console.log('[App] Page visible - checking for updates');
                navigator.serviceWorker.controller.postMessage({
                    type: 'CHECK_FOR_UPDATES'
                });
            }
        });
        
        // Check for updates when connection is restored
        window.addEventListener('online', () => {
            console.log('[App] Connection restored - checking for updates');
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CHECK_FOR_UPDATES'
                });
            }
        });
    });
}

// YouTube Search Functionality
// Simple search that redirects to YouTube search results
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// YouTube search function - redirects to YouTube
function searchYouTube(query) {
    if (!query.trim()) {
        return;
    }
    
    // Redirect to YouTube search results
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(youtubeSearchUrl, '_blank');
}

// Event listeners for YouTube search
if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        const query = searchInput.value;
        searchYouTube(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            searchYouTube(query);
        }
    });
}

// Media Player Functionality
let mediaPlaylist = [];
let currentMediaIndex = -1;
let isPlaying = false;

// Comprehensive format support definitions
const SUPPORTED_FORMATS = {
    audio: {
        // Common audio formats with MIME types
        'mp3': ['audio/mpeg', 'audio/mp3'],
        'wav': ['audio/wav', 'audio/wave', 'audio/x-wav'],
        'ogg': ['audio/ogg', 'application/ogg'],
        'aac': ['audio/aac', 'audio/x-aac'],
        'flac': ['audio/flac', 'audio/x-flac'],
        'm4a': ['audio/mp4', 'audio/x-m4a'],
        'weba': ['audio/webm'],
        'opus': ['audio/opus'],
        'oga': ['audio/ogg'],
        'webm': ['audio/webm']
    },
    video: {
        // Common video formats with MIME types
        'mp4': ['video/mp4'],
        'webm': ['video/webm'],
        'ogg': ['video/ogg'],
        'ogv': ['video/ogg'],
        'avi': ['video/x-msvideo', 'video/avi'],
        'mkv': ['video/x-matroska'],
        'mov': ['video/quicktime'],
        'wmv': ['video/x-ms-wmv'],
        'flv': ['video/x-flv'],
        'm4v': ['video/x-m4v'],
        'mpeg': ['video/mpeg'],
        'mpg': ['video/mpeg'],
        '3gp': ['video/3gpp']
    }
};

// Get file extension from filename
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// Determine media type from file extension and MIME type
function getMediaType(file) {
    const extension = getFileExtension(file.name);
    const mimeType = file.type.toLowerCase();
    
    // Check by MIME type first
    if (mimeType.startsWith('audio/')) {
        return 'audio';
    }
    if (mimeType.startsWith('video/')) {
        return 'video';
    }
    
    // Check by extension
    for (const [ext, mimes] of Object.entries(SUPPORTED_FORMATS.audio)) {
        if (extension === ext || mimes.includes(mimeType)) {
            return 'audio';
        }
    }
    
    for (const [ext, mimes] of Object.entries(SUPPORTED_FORMATS.video)) {
        if (extension === ext || mimes.includes(mimeType)) {
            return 'video';
        }
    }
    
    return null;
}

// Check if format is supported
function isFormatSupported(file) {
    const extension = getFileExtension(file.name);
    const mimeType = file.type.toLowerCase();
    
    // Check audio formats
    for (const [ext, mimes] of Object.entries(SUPPORTED_FORMATS.audio)) {
        if (extension === ext || mimes.includes(mimeType)) {
            return { supported: true, type: 'audio', format: extension ? extension.toUpperCase() : 'AUDIO' };
        }
    }
    
    // Fallback check for generic audio MIME types not in our list
    if (mimeType.startsWith('audio/') && !extension) {
        return { supported: true, type: 'audio', format: 'AUDIO' };
    }
    
    // Check video formats
    for (const [ext, mimes] of Object.entries(SUPPORTED_FORMATS.video)) {
        if (extension === ext || mimes.includes(mimeType)) {
            return { supported: true, type: 'video', format: extension ? extension.toUpperCase() : 'VIDEO' };
        }
    }
    
    // Fallback check for generic video MIME types not in our list
    if (mimeType.startsWith('video/') && !extension) {
        return { supported: true, type: 'video', format: 'VIDEO' };
    }
    
    return { supported: false, type: null, format: extension ? extension.toUpperCase() : 'UNKNOWN' };
}

// Show error message to user
function showMediaError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'media-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: #FF3B30;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    const container = document.querySelector('.media-player-section');
    if (container) {
        container.insertBefore(errorDiv, container.children[1]);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }
}

// Get media player elements
const appStoreButton = document.getElementById('appStoreButton');
const mediaPlayerButton = document.getElementById('mediaPlayerButton');
const mediaPlayerSection = document.getElementById('mediaPlayerSection');
const closeMediaPlayer = document.getElementById('closeMediaPlayer');
const mediaFileInput = document.getElementById('mediaFileInput');
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');
const playlist = document.getElementById('playlist');
const currentMediaDisplay = document.getElementById('currentMediaDisplay');

// Control buttons
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const progressBar = document.getElementById('progressBar');

// AppStore button - redirect to AppStore page
if (appStoreButton) {
    appStoreButton.addEventListener('click', () => {
        window.open('https://koriebonx98.github.io/AppStore-/', '_blank');
    });
}

// Media Player button - show/hide media player
if (mediaPlayerButton) {
    mediaPlayerButton.addEventListener('click', () => {
        mediaPlayerSection.style.display = 'block';
        // Scroll to media player section
        mediaPlayerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// Close media player
if (closeMediaPlayer) {
    closeMediaPlayer.addEventListener('click', () => {
        mediaPlayerSection.style.display = 'none';
    });
}

// File input handler
if (mediaFileInput) {
    mediaFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        let addedFiles = 0;
        let unsupportedFiles = [];
        
        files.forEach(file => {
            const formatInfo = isFormatSupported(file);
            
            if (formatInfo.supported) {
                const fileURL = URL.createObjectURL(file);
                mediaPlaylist.push({
                    name: file.name,
                    type: formatInfo.type,
                    format: formatInfo.format,
                    url: fileURL,
                    file: file
                });
                addedFiles++;
            } else {
                unsupportedFiles.push({
                    name: file.name,
                    format: formatInfo.format
                });
            }
        });
        
        // Show error for unsupported files
        if (unsupportedFiles.length > 0) {
            const fileList = unsupportedFiles.map(f => `${f.name} (${f.format})`).join(', ');
            showMediaError(`⚠️ Unsupported format: ${fileList}. Please use common audio/video formats (MP3, MP4, WAV, WebM, OGG, etc.)`);
        }
        
        // Show success message if files were added
        if (addedFiles > 0) {
            updatePlaylist();
            enableControls();
            
            // Auto-play first file if nothing is playing
            if (currentMediaIndex === -1 && mediaPlaylist.length > 0) {
                loadMedia(0);
            }
        }
        
        // Clear the input so the same file can be added again if needed
        mediaFileInput.value = '';
    });
}

// Update playlist display
function updatePlaylist() {
    if (!playlist) return;
    
    playlist.innerHTML = '';
    
    if (mediaPlaylist.length === 0) {
        return;
    }
    
    mediaPlaylist.forEach((media, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.dataset.index = index;
        if (index === currentMediaIndex) {
            li.classList.add('active');
        }
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'playlist-item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'playlist-item-name';
        itemName.textContent = media.name;
        
        const itemType = document.createElement('div');
        itemType.className = 'playlist-item-type';
        itemType.textContent = `${media.type.toUpperCase()} • ${media.format}`;
        
        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemType);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'playlist-item-remove';
        removeBtn.textContent = '✕';
        
        li.appendChild(itemInfo);
        li.appendChild(removeBtn);
        
        playlist.appendChild(li);
    });
    
    // Update save button state whenever playlist changes
    updateSaveButtonState();
}

// Event delegation for playlist items
if (playlist) {
    playlist.addEventListener('click', (e) => {
        const playlistItem = e.target.closest('.playlist-item');
        if (!playlistItem) return;
        
        const index = parseInt(playlistItem.dataset.index, 10);
        
        // Check if remove button was clicked
        if (e.target.classList.contains('playlist-item-remove')) {
            e.stopPropagation();
            removeFromPlaylist(index);
        } else {
            // Load the media
            loadMedia(index);
        }
    });
}

// Remove item from playlist
function removeFromPlaylist(index) {
    // Revoke URL to free memory
    URL.revokeObjectURL(mediaPlaylist[index].url);
    
    // If removing current media, stop playback
    if (index === currentMediaIndex) {
        stopMedia();
        currentMediaIndex = -1;
    } else if (index < currentMediaIndex) {
        currentMediaIndex--;
    }
    
    mediaPlaylist.splice(index, 1);
    updatePlaylist();
    
    if (mediaPlaylist.length === 0) {
        disableControls();
        updateCurrentMediaDisplay();
    }
}

// Load media file
function loadMedia(index) {
    if (index < 0 || index >= mediaPlaylist.length) return;
    
    const media = mediaPlaylist[index];
    currentMediaIndex = index;
    
    // Stop current playback
    stopMedia();
    
    // Hide both players first
    audioPlayer.style.display = 'none';
    videoPlayer.style.display = 'none';
    
    // Load the appropriate player
    if (media.type === 'audio') {
        audioPlayer.src = media.url;
        audioPlayer.style.display = 'block';
        audioPlayer.load();
        
        // Add error handler
        audioPlayer.onerror = function() {
            showMediaError(`❌ Failed to load ${media.name}. The file format may not be supported by your browser.`);
            console.error(`Audio load error for ${media.name}:`, audioPlayer.error);
        };
    } else if (media.type === 'video') {
        videoPlayer.src = media.url;
        videoPlayer.style.display = 'block';
        videoPlayer.load();
        
        // Add error handler
        videoPlayer.onerror = function() {
            showMediaError(`❌ Failed to load ${media.name}. The file format may not be supported by your browser.`);
            console.error(`Video load error for ${media.name}:`, videoPlayer.error);
        };
    }
    
    updatePlaylist();
    updateCurrentMediaDisplay(media);
    enableControls();
}

// Update current media display
function updateCurrentMediaDisplay(media = null) {
    if (!currentMediaDisplay) return;
    
    if (!media) {
        currentMediaDisplay.innerHTML = '<p class="no-media-text">No media loaded</p>';
        return;
    }
    
    currentMediaDisplay.innerHTML = `
        <div class="current-media-info">
            <div class="media-title">${media.name}</div>
            <div class="media-type">${media.type.toUpperCase()} • ${media.format}</div>
        </div>
    `;
}

// Get active player
function getActivePlayer() {
    const media = mediaPlaylist[currentMediaIndex];
    if (!media) return null;
    return media.type === 'audio' ? audioPlayer : videoPlayer;
}

// Play media
function playMedia() {
    const player = getActivePlayer();
    if (!player) return;
    
    player.play();
    isPlaying = true;
}

// Pause media
function pauseMedia() {
    const player = getActivePlayer();
    if (!player) return;
    
    player.pause();
    isPlaying = false;
}

// Stop media
function stopMedia() {
    const player = getActivePlayer();
    if (!player) return;
    
    player.pause();
    player.currentTime = 0;
    isPlaying = false;
}

// Next media
function nextMedia() {
    if (currentMediaIndex < mediaPlaylist.length - 1) {
        loadMedia(currentMediaIndex + 1);
        if (isPlaying) {
            playMedia();
        }
    }
}

// Previous media
function prevMedia() {
    if (currentMediaIndex > 0) {
        loadMedia(currentMediaIndex - 1);
        if (isPlaying) {
            playMedia();
        }
    }
}

// Enable controls
function enableControls() {
    if (playButton) playButton.disabled = false;
    if (pauseButton) pauseButton.disabled = false;
    if (stopButton) stopButton.disabled = false;
    if (nextButton) nextButton.disabled = false;
    if (prevButton) prevButton.disabled = false;
    if (progressBar) progressBar.disabled = false;
}

// Disable controls
function disableControls() {
    if (playButton) playButton.disabled = true;
    if (pauseButton) pauseButton.disabled = true;
    if (stopButton) stopButton.disabled = true;
    if (nextButton) nextButton.disabled = true;
    if (prevButton) prevButton.disabled = true;
    if (progressBar) progressBar.disabled = true;
}

// Control button event listeners
if (playButton) {
    playButton.addEventListener('click', playMedia);
}

if (pauseButton) {
    pauseButton.addEventListener('click', pauseMedia);
}

if (stopButton) {
    stopButton.addEventListener('click', stopMedia);
}

if (nextButton) {
    nextButton.addEventListener('click', nextMedia);
}

if (prevButton) {
    prevButton.addEventListener('click', prevMedia);
}

// Progress bar handler
if (progressBar) {
    progressBar.addEventListener('input', (e) => {
        const player = getActivePlayer();
        if (!player || !player.duration || isNaN(player.duration) || !isFinite(player.duration)) return;
        
        const time = (player.duration * e.target.value) / 100;
        if (isFinite(time)) {
            player.currentTime = time;
        }
    });
}

// Update progress bar and time display
function updateProgress() {
    const player = getActivePlayer();
    if (!player || !player.duration || isNaN(player.duration) || !isFinite(player.duration)) return;
    
    const progress = (player.currentTime / player.duration) * 100;
    if (isFinite(progress)) {
        progressBar.value = progress;
    }
    
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(player.currentTime);
    }
    
    if (durationDisplay) {
        durationDisplay.textContent = formatTime(player.duration);
    }
}

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Audio player event listeners
if (audioPlayer) {
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        // Auto-play next track if available
        if (currentMediaIndex < mediaPlaylist.length - 1) {
            nextMedia();
            playMedia();
        }
    });
}

// Video player event listeners
if (videoPlayer) {
    videoPlayer.addEventListener('timeupdate', updateProgress);
    videoPlayer.addEventListener('ended', () => {
        isPlaying = false;
        // Auto-play next track if available
        if (currentMediaIndex < mediaPlaylist.length - 1) {
            nextMedia();
            playMedia();
        }
    });
}

// Reset App Data Functionality
function resetAppData() {
    if (confirm('Are you sure you want to reset app data? This will clear all stored data and reload the page.')) {
        // Clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        console.log('[Reset] App data cleared');

        // Optionally delete IndexedDB databases
        if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
            window.indexedDB.databases().then((databases) => {
                const deletionPromises = databases.map((db) => {
                    console.log(`[Reset] Deleting IndexedDB database: ${db.name}`);
                    return indexedDB.deleteDatabase(db.name);
                });
                return Promise.all(deletionPromises);
            }).catch((err) => {
                console.warn('[Reset] Could not enumerate or delete IndexedDB databases:', err);
            }).finally(() => {
                // Reload the page to fetch newest data
                location.reload();
            });
        } else {
            // Reload the page immediately if IndexedDB is not available or databases() is not supported
            console.log('[Reset] IndexedDB.databases() not supported, skipping IndexedDB cleanup');
            location.reload();
        }
    }
}

// Playlist Save/Load Functionality
const savePlaylistButton = document.getElementById('savePlaylistButton');
const loadPlaylistInput = document.getElementById('loadPlaylistInput');

// Show notification message
function showNotification(message, type = 'success') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-message ${type}`;
    
    // Add icon based on type
    const iconMap = {
        'success': '✓',
        'error': '⚠',
        'info': 'ℹ'
    };
    const icon = iconMap[type] || 'ℹ';
    notificationDiv.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span><span>${message}</span>`;
    
    const container = document.querySelector('.media-player-section');
    if (container) {
        container.insertBefore(notificationDiv, container.children[1]);
        
        // Remove notification message after 5 seconds for errors, 3 seconds for others
        const timeout = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            notificationDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificationDiv.remove(), 300);
        }, timeout);
    }
}

/**
 * Save playlist to a JSON file and trigger download.
 * Creates a downloadable JSON file with the current playlist metadata.
 */
function savePlaylistToFile() {
    if (mediaPlaylist.length === 0) {
        showNotification('No items in the playlist to save.', 'info');
        return;
    }

    // Get current date for filename (format: MM-DD-YYYY)
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const filename = `playlist_${month}-${day}-${year}.json`;

    // Prepare playlist data (metadata only)
    const playlistData = mediaPlaylist.map(media => ({
        name: media.name,
        type: media.type,
        format: media.format
    }));

    const data = JSON.stringify(playlistData, null, 2);

    // Create blob and trigger download
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Playlist saved successfully!', 'success');
    console.log('[Playlist] Saved', playlistData.length, 'items to file:', filename);
}

/**
 * Load playlist from a JSON file.
 * Reads and validates the playlist file, then displays the playlist structure.
 * Note: Only metadata is loaded. Users must re-add the actual media files.
 * 
 * @param {File} file - The JSON file containing the playlist
 */
function loadPlaylistFromFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const playlist = JSON.parse(e.target.result);
            
            // Validate playlist structure
            if (!Array.isArray(playlist)) {
                throw new Error('Invalid playlist structure. Expected an array.');
            }

            // Validate each playlist item
            for (let i = 0; i < playlist.length; i++) {
                const item = playlist[i];
                if (!item.name || !item.type || !item.format) {
                    throw new Error(`Invalid item at index ${i}. Missing required fields (name, type, format).`);
                }
                if (item.type !== 'audio' && item.type !== 'video') {
                    throw new Error(`Invalid media type "${item.type}" at index ${i}. Expected "audio" or "video".`);
                }
            }

            // Display the loaded playlist structure
            displayLoadedPlaylist(playlist);
            
            showNotification('Playlist loaded successfully!', 'success');
            console.log('[Playlist] Loaded', playlist.length, 'items from file');
        } catch (error) {
            showNotification('Error loading playlist: ' + error.message, 'error');
            console.error('[Playlist] Load error:', error);
        }
    };

    reader.onerror = () => {
        showNotification('Error reading file. Please try again.', 'error');
        console.error('[Playlist] File read error');
    };

    reader.readAsText(file);
}

/**
 * Display loaded playlist information.
 * Shows the playlist structure to the user with instructions to add the actual files.
 * 
 * @param {Array<{name: string, type: string, format: string}>} playlistData - The loaded playlist data
 */
function displayLoadedPlaylist(playlistData) {
    if (!playlistData || playlistData.length === 0) {
        showNotification('Loaded playlist is empty.', 'info');
        return;
    }

    // Create a detailed message showing the loaded playlist
    const messageLines = [`Loaded ${playlistData.length} item(s):`];
    playlistData.forEach((item, index) => {
        messageLines.push(`${index + 1}. ${item.name} (${item.type.toUpperCase()} • ${item.format})`);
    });
    messageLines.push('\nNote: Please add the actual media files to play them.');
    const message = messageLines.join('\n');

    console.log('[Playlist]', message);
    
    // Show a more user-friendly notification
    const itemText = playlistData.length === 1 ? 'item' : 'items';
    showNotification(`Loaded ${playlistData.length} ${itemText}. Check console for details. Add your media files to play them.`, 'success');
}

// Bind save button event
if (savePlaylistButton) {
    savePlaylistButton.addEventListener('click', savePlaylistToFile);
}

// Bind load playlist input event
if (loadPlaylistInput) {
    loadPlaylistInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            loadPlaylistFromFile(file);
        }
        // Clear the input so the same file can be loaded again if needed
        e.target.value = '';
    });
}

/**
 * Update the save button state based on current playlist contents.
 * Enables the button when playlist has items, disables it when empty.
 */
function updateSaveButtonState() {
    if (savePlaylistButton) {
        savePlaylistButton.disabled = mediaPlaylist.length === 0;
    }
}

// CV and Cover Letter functionality
let currentDocument = null;
let currentDocumentType = null;

// Get document elements
const cvButton = document.getElementById('cvButton');
const coverLetterButton = document.getElementById('coverLetterButton');
const documentDisplay = document.getElementById('documentDisplay');
const documentTitle = document.getElementById('documentTitle');
const documentContent = document.getElementById('documentContent');
const downloadButton = document.getElementById('downloadButton');
const closeDocumentButton = document.getElementById('closeDocument');

/**
 * Fetch and display a document (CV or Cover Letter)
 * @param {string} type - The type of document ('cv' or 'coverLetter')
 */
async function displayDocument(type) {
    try {
        let filename, title;
        
        if (type === 'cv') {
            filename = 'cv.txt';
            title = 'Curriculum Vitae';
        } else if (type === 'coverLetter') {
            filename = 'cover letter.txt';
            title = 'Cover Letter';
        } else {
            return;
        }
        
        // Fetch the document content
        const response = await fetch(`./${filename}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.status}`);
        }
        
        const content = await response.text();
        
        // Store current document info
        currentDocument = content;
        currentDocumentType = type;
        
        // Update the display
        documentTitle.textContent = title;
        documentContent.textContent = content;
        
        // Show the document display with animation
        documentDisplay.style.display = 'block';
        
        // Scroll to document display
        setTimeout(() => {
            documentDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        console.log(`[Documents] Loaded ${title}`);
    } catch (error) {
        console.error(`[Documents] Error loading document:`, error);
        alert(`Failed to load document. Please try again.`);
    }
}

/**
 * Close the document display
 */
function closeDocument() {
    documentDisplay.style.display = 'none';
    currentDocument = null;
    currentDocumentType = null;
}

/**
 * Download the currently displayed document
 */
function downloadDocument() {
    if (!currentDocument || !currentDocumentType) {
        return;
    }
    
    let filename, mimeType;
    
    if (currentDocumentType === 'cv') {
        filename = 'CV.txt';
        mimeType = 'text/plain';
    } else if (currentDocumentType === 'coverLetter') {
        filename = 'Cover_Letter.txt';
        mimeType = 'text/plain';
    } else {
        return;
    }
    
    // Create a blob from the document content
    const blob = new Blob([currentDocument], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`[Documents] Downloaded ${filename}`);
}

// Event listeners for CV and Cover Letter buttons
if (cvButton) {
    cvButton.addEventListener('click', () => {
        displayDocument('cv');
        
        // Optional: Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    });
}

if (coverLetterButton) {
    coverLetterButton.addEventListener('click', () => {
        displayDocument('coverLetter');
        
        // Optional: Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    });
}

if (closeDocumentButton) {
    closeDocumentButton.addEventListener('click', closeDocument);
}

if (downloadButton) {
    downloadButton.addEventListener('click', downloadDocument);
}
