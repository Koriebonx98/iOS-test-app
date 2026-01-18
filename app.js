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
        
        files.forEach(file => {
            const fileType = file.type.startsWith('audio/') ? 'audio' : 
                           file.type.startsWith('video/') ? 'video' : null;
            
            if (fileType) {
                const fileURL = URL.createObjectURL(file);
                mediaPlaylist.push({
                    name: file.name,
                    type: fileType,
                    url: fileURL,
                    file: file
                });
            }
        });
        
        updatePlaylist();
        enableControls();
        
        // Auto-play first file if nothing is playing
        if (currentMediaIndex === -1 && mediaPlaylist.length > 0) {
            loadMedia(0);
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
        itemType.textContent = media.type.toUpperCase();
        
        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemType);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'playlist-item-remove';
        removeBtn.textContent = '✕';
        
        li.appendChild(itemInfo);
        li.appendChild(removeBtn);
        
        playlist.appendChild(li);
    });
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
    } else if (media.type === 'video') {
        videoPlayer.src = media.url;
        videoPlayer.style.display = 'block';
        videoPlayer.load();
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
            <div class="media-type">${media.type.toUpperCase()}</div>
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
