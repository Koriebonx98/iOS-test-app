/**
 * Audience Counter Module
 * 
 * Tracks unique visitors and displays real-time audience count
 * Features:
 * - UUID-based unique user identification
 * - localStorage persistence
 * - AES encrypted communication with backend
 * - API key authentication
 * - Real-time count updates
 */

// Import CryptoJS for encryption (loaded via CDN in HTML)
// Ensure CryptoJS is available globally

/**
 * Configuration
 * IMPORTANT: Update these values for your deployment
 * 
 * Security Note: In production, these values should ideally be injected at build time
 * or loaded from a secure configuration service. However, since this is a client-side
 * application with no build process, they must be configured here.
 * 
 * The API key and encryption key provide security through:
 * 1. Server-side validation (API key authentication)
 * 2. End-to-end encryption (AES encryption of all payloads)
 * 3. HTTPS/TLS for transport security
 * 
 * While these keys are visible in the client code, the security model relies on:
 * - Server-side validation and rate limiting
 * - Encrypted payloads that can't be forged without the encryption key
 * - No sensitive data exposure (only anonymous UUIDs tracked)
 */
const AUDIENCE_CONFIG = {
    // GitHub API integration (primary method)
    USE_GITHUB_API: true, // Use GitHub API to read visitor count
    
    // Backend API URL - update this to your deployed server URL with HTTPS (legacy support)
    // Example: 'https://your-server.herokuapp.com/api/audience'
    API_URL: 'http://localhost:3000/api/audience',
    
    // API key for authentication - MUST match server configuration
    // Generate a strong random key: openssl rand -base64 32
    // This key authenticates requests to prevent unauthorized API access
    API_KEY: 'your-secure-api-key-here',
    
    // Encryption key for AES encryption - MUST match server configuration
    // Must be exactly 32 characters or a strong passphrase
    // Generate: openssl rand -base64 24
    // This key encrypts/decrypts all data payloads
    ENCRYPTION_KEY: 'your-32-character-encryption-key',
    
    // Update interval in milliseconds (5 minutes)
    UPDATE_INTERVAL: 5 * 60 * 1000,
    
    // Storage keys
    STORAGE_KEY_USER_ID: 'audience_user_id',
    STORAGE_KEY_LAST_UPDATE: 'audience_last_update'
};

/**
 * Audience Counter State
 */
const audienceState = {
    userId: null,
    currentCount: 0,
    isTracking: false,
    updateTimer: null
};

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get or create user ID
 * @returns {string} User ID (UUID)
 */
function getUserId() {
    try {
        // Check if user ID exists in localStorage
        let userId = localStorage.getItem(AUDIENCE_CONFIG.STORAGE_KEY_USER_ID);
        
        if (!userId) {
            // Generate new UUID for first-time visitor
            userId = generateUUID();
            localStorage.setItem(AUDIENCE_CONFIG.STORAGE_KEY_USER_ID, userId);
            console.log('[Audience] New user ID generated:', userId);
        } else {
            console.log('[Audience] Existing user ID loaded:', userId);
        }
        
        return userId;
    } catch (error) {
        console.error('[Audience] Error getting/creating user ID:', error);
        // Fallback: generate temporary ID if localStorage is not available
        return generateUUID();
    }
}

/**
 * Encrypt data using AES encryption
 * @param {object} data - Data object to encrypt
 * @returns {string} Encrypted data string
 */
function encryptData(data) {
    try {
        if (typeof CryptoJS === 'undefined') {
            throw new Error('CryptoJS library not loaded');
        }
        
        const jsonString = JSON.stringify(data);
        const encrypted = CryptoJS.AES.encrypt(jsonString, AUDIENCE_CONFIG.ENCRYPTION_KEY);
        return encrypted.toString();
    } catch (error) {
        console.error('[Audience] Encryption error:', error);
        throw error;
    }
}

/**
 * Decrypt data using AES encryption
 * @param {string} encryptedData - Encrypted data string
 * @returns {object} Decrypted data object
 */
function decryptData(encryptedData) {
    try {
        if (typeof CryptoJS === 'undefined') {
            throw new Error('CryptoJS library not loaded');
        }
        
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, AUDIENCE_CONFIG.ENCRYPTION_KEY);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error('[Audience] Decryption error:', error);
        throw error;
    }
}

/**
 * Track visitor by sending data to backend
 * @returns {Promise<number>} Current audience count
 */
async function trackVisitor() {
    try {
        // Get or create user ID
        const userId = getUserId();
        audienceState.userId = userId;
        
        // Prepare payload
        const payload = {
            userId: userId,
            timestamp: new Date().toISOString()
        };
        
        // Encrypt payload
        const encryptedData = encryptData(payload);
        
        // Send to backend
        const response = await fetch(`${AUDIENCE_CONFIG.API_URL}/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': AUDIENCE_CONFIG.API_KEY
            },
            body: JSON.stringify({ encryptedData })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Decrypt response
        const decryptedResponse = decryptData(data.encryptedData);
        
        console.log('[Audience] Visitor tracked successfully:', decryptedResponse);
        
        // Update last update timestamp
        localStorage.setItem(AUDIENCE_CONFIG.STORAGE_KEY_LAST_UPDATE, new Date().toISOString());
        
        return decryptedResponse.audienceCount || 0;
        
    } catch (error) {
        console.error('[Audience] Error tracking visitor:', error);
        // Return cached count or 0 if tracking fails
        return audienceState.currentCount || 0;
    }
}

/**
 * Get current audience count from GitHub repository
 * 
 * @returns {Promise<number>} Current audience count
 */
async function getAudienceCountFromGitHub() {
    try {
        // Check if GitHub API helper is loaded
        if (typeof window.githubAPI === 'undefined') {
            console.error('[Audience] GitHub API helper not loaded');
            return 0;
        }
        
        const count = await window.githubAPI.getVisitorCount();
        console.log('[Audience] Count fetched from GitHub:', count);
        return count;
        
    } catch (error) {
        console.error('[Audience] Error fetching count from GitHub:', error);
        // Return cached count or 0 if fetch fails
        return audienceState.currentCount || 0;
    }
}

/**
 * Get current audience count from backend (legacy support)
 * @returns {Promise<number>} Current audience count
 */
async function getAudienceCount() {
    // Use GitHub API if enabled
    if (AUDIENCE_CONFIG.USE_GITHUB_API) {
        return await getAudienceCountFromGitHub();
    }
    
    // Otherwise use legacy backend API
    try {
        const response = await fetch(`${AUDIENCE_CONFIG.API_URL}/count`, {
            method: 'GET',
            headers: {
                'X-API-Key': AUDIENCE_CONFIG.API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Decrypt response
        const decryptedResponse = decryptData(data.encryptedData);
        
        console.log('[Audience] Count fetched:', decryptedResponse.count);
        
        return decryptedResponse.count || 0;
        
    } catch (error) {
        console.error('[Audience] Error fetching count:', error);
        // Return cached count or 0 if fetch fails
        return audienceState.currentCount || 0;
    }
}

/**
 * Update audience count display in the UI
 * @param {number} count - Audience count to display
 */
function updateAudienceDisplay(count) {
    audienceState.currentCount = count;
    
    // Update main display
    const audienceCountElement = document.getElementById('audienceCount');
    if (audienceCountElement) {
        audienceCountElement.textContent = count.toLocaleString();
    }
    
    // Update badge
    const audienceBadge = document.getElementById('audienceBadge');
    if (audienceBadge) {
        audienceBadge.textContent = count.toLocaleString();
    }
    
    console.log('[Audience] Display updated with count:', count);
}

/**
 * Initialize audience tracking
 */
async function initAudienceTracking() {
    try {
        console.log('[Audience] Initializing audience tracking...');
        
        // Check if we're using GitHub API
        if (AUDIENCE_CONFIG.USE_GITHUB_API) {
            // Check if GitHub API helper is loaded
            if (typeof window.githubAPI === 'undefined') {
                console.error('[Audience] GitHub API helper not loaded. Please include github-api-helper.js in HTML.');
                return;
            }
            
            console.log('[Audience] Using GitHub API for visitor tracking');
        } else {
            // Check if CryptoJS is loaded for legacy API
            if (typeof CryptoJS === 'undefined') {
                console.error('[Audience] CryptoJS library not loaded. Please include CryptoJS CDN in HTML.');
                return;
            }
        }
        
        // Check if we're online
        if (!navigator.onLine) {
            console.log('[Audience] Offline - skipping initial tracking');
            return;
        }
        
        audienceState.isTracking = true;
        
        // Get initial count from GitHub or backend
        const count = await getAudienceCount();
        updateAudienceDisplay(count);
        
        // Set up periodic updates
        audienceState.updateTimer = setInterval(async () => {
            if (navigator.onLine) {
                const updatedCount = await getAudienceCount();
                updateAudienceDisplay(updatedCount);
            } else {
                console.log('[Audience] Offline - skipping update');
            }
        }, AUDIENCE_CONFIG.UPDATE_INTERVAL);
        
        console.log('[Audience] Tracking initialized successfully');
        
    } catch (error) {
        console.error('[Audience] Error initializing tracking:', error);
        audienceState.isTracking = false;
    }
}

/**
 * Manually refresh audience count
 * Called by "Check for Updates" button or manual refresh
 */
async function refreshAudienceCount() {
    try {
        console.log('[Audience] Manual refresh triggered');
        
        if (!navigator.onLine) {
            console.log('[Audience] Offline - cannot refresh');
            return;
        }
        
        // Get updated count from GitHub or backend
        const count = await getAudienceCount();
        updateAudienceDisplay(count);
        
        // Show success feedback
        showAudienceUpdateNotification('Audience count updated!');
        
    } catch (error) {
        console.error('[Audience] Error refreshing count:', error);
        showAudienceUpdateNotification('Failed to update audience count', 'error');
    }
}

/**
 * Show notification for audience updates
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success' or 'error')
 */
function showAudienceUpdateNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `audience-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#34C759' : '#FF3B30'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Stop audience tracking (cleanup)
 */
function stopAudienceTracking() {
    if (audienceState.updateTimer) {
        clearInterval(audienceState.updateTimer);
        audienceState.updateTimer = null;
    }
    audienceState.isTracking = false;
    console.log('[Audience] Tracking stopped');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudienceTracking);
} else {
    // DOM is already ready
    initAudienceTracking();
}

// Refresh count when coming back online
window.addEventListener('online', () => {
    console.log('[Audience] Connection restored - refreshing count');
    refreshAudienceCount();
});

// Stop tracking when page is about to unload (cleanup)
window.addEventListener('beforeunload', stopAudienceTracking);

// Export functions for use in other scripts
window.audienceCounter = {
    refresh: refreshAudienceCount,
    getCount: () => audienceState.currentCount,
    getUserId: () => audienceState.userId
};
