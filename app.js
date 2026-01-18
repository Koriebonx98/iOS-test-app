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
    const currentTime = document.getElementById('currentTime');
    
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
        currentTime.textContent = now.toLocaleTimeString();
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
    
    // Load saved playlist
    loadSavedPlaylist();
    
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
    
    // Log to console that app is ready
    console.log('iOS Test App loaded successfully!');
    
    // Prevent bounce/overscroll on iOS
    document.body.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('[Service Worker] Registered successfully', reg))
            .catch(err => console.log('[Service Worker] Registration failed', err));
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

// Show notification message
function showNotification(message, type = 'success') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-message ${type}`;
    
    // Add icon based on type
    const icon = type === 'success' ? '✓' : 'ℹ';
    notificationDiv.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span><span>${message}</span>`;
    
    const container = document.querySelector('.media-player-section');
    if (container) {
        container.insertBefore(notificationDiv, container.children[1]);
        
        // Remove notification message after 3 seconds
        setTimeout(() => {
            notificationDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificationDiv.remove(), 300);
        }, 3000);
    }
}

/**
 * Get current playlist metadata for saving to localStorage.
 * Note: Due to browser security restrictions, only metadata (file names, types, formats)
 * can be saved. The actual file data, URLs, and File objects cannot be persisted.
 * Users will need to re-add their media files after reloading the page.
 * 
 * @returns {Array<{name: string, type: string, format: string}>} Array of playlist items with name, type, and format properties
 */
function getCurrentPlaylist() {
    return mediaPlaylist.map(media => ({
        name: media.name,
        type: media.type,
        format: media.format
    }));
}

// Save playlist to localStorage
function savePlaylist() {
    if (mediaPlaylist.length === 0) {
        showNotification('No items in the playlist to save.', 'info');
        return;
    }

    const playlist = getCurrentPlaylist();
    const timestamp = new Date().toISOString();
    const savedData = { playlist, timestamp };

    localStorage.setItem('savedPlaylist', JSON.stringify(savedData));
    showNotification('Playlist saved successfully!', 'success');
    console.log('[Playlist] Saved playlist with', playlist.length, 'items');
}

/**
 * Display saved playlist information.
 * Shows a notification with the timestamp when the playlist was last saved.
 * 
 * @param {Array<{name: string, type: string, format: string}>} playlistData - The playlist data to display
 * @param {string} timestamp - ISO 8601 timestamp when the playlist was saved
 */
function displayPlaylist(playlistData, timestamp) {
    if (!playlistData || playlistData.length === 0) return;

    // Show notification about the saved playlist
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    showNotification(`Playlist loaded from last session (${formattedDate})`, 'info');
    console.log('[Playlist] Found saved playlist with', playlistData.length, 'items');
    console.log('[Playlist] Note: Files need to be re-added by the user');
}

/**
 * Load saved playlist from localStorage on page load.
 * Parses the saved data and displays notification if a playlist is found.
 */
function loadSavedPlaylist() {
    const savedData = localStorage.getItem('savedPlaylist');
    if (savedData) {
        try {
            const { playlist, timestamp } = JSON.parse(savedData);
            displayPlaylist(playlist, timestamp);
        } catch (error) {
            console.error('[Playlist] Error loading saved playlist:', error);
        }
    }
}

// Bind save button event
if (savePlaylistButton) {
    savePlaylistButton.addEventListener('click', savePlaylist);
}

// Enable/disable save button based on playlist
function updateSaveButtonState() {
    if (savePlaylistButton) {
        savePlaylistButton.disabled = mediaPlaylist.length === 0;
    }
}
