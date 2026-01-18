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
            
            // Optional: Haptic feedback for iOS devices
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
