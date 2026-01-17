// Counter functionality
let clickCount = 0;
const actionButton = document.getElementById('actionButton');
const clickCountDisplay = document.getElementById('clickCount');

actionButton.addEventListener('click', () => {
    clickCount++;
    clickCountDisplay.textContent = `Clicks: ${clickCount}`;
    
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
    
    userAgent.textContent = navigator.userAgent;
    screenSize.textContent = `${window.innerWidth} x ${window.innerHeight}px`;
    
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
    screenSize.textContent = `${window.innerWidth} x ${window.innerHeight}px`;
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDeviceInfo();
    
    // Log to console that app is ready
    console.log('iOS Test App loaded successfully!');
    
    // Prevent bounce/overscroll on iOS
    document.body.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/service-worker.js')
        //     .then(reg => console.log('Service Worker registered', reg))
        //     .catch(err => console.log('Service Worker registration failed', err));
    });
}
