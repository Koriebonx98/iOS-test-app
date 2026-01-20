/**
 * Visitor Tracker Module
 * 
 * Tracks unique visitors using UDIDs (Unique Device Identifiers)
 * Features:
 * - UDID-based unique visitor identification
 * - localStorage persistence for returning visitors
 * - Visitor data tracking (first visit, last visit, visit count)
 * - Privacy-focused anonymous tracking
 * - Client-side storage simulation
 * 
 * Note: Since browsers cannot directly write to JSON files for security reasons,
 * this module stores visitor data in localStorage. For server-side persistence,
 * integrate with a backend API (see server/server.js for an example).
 */

/**
 * Configuration
 */
const VISITOR_CONFIG = {
    // Storage keys for localStorage
    STORAGE_KEY_UDID: 'visitor_udid',
    STORAGE_KEY_VISITORS: 'visitors_data',
    STORAGE_KEY_FIRST_VISIT: 'visitor_first_visit',
    STORAGE_KEY_LAST_VISIT: 'visitor_last_visit',
    STORAGE_KEY_VISIT_COUNT: 'visitor_visit_count',
    
    // Notification settings
    SHOW_NOTIFICATION: true,
    NOTIFICATION_DURATION: 5000 // 5 seconds
};

/**
 * Visitor Tracker State
 */
const visitorState = {
    udid: null,
    isNewVisitor: false,
    visitCount: 0,
    firstVisit: null,
    lastVisit: null
};

/**
 * Generate a UDID (Unique Device Identifier)
 * Uses UUID v4 format for uniqueness
 * 
 * @returns {string} UDID string in UUID format
 */
function generateUDID() {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get or create UDID for the current visitor
 * If the visitor is returning, their existing UDID is retrieved from localStorage
 * If the visitor is new, a new UDID is generated and stored
 * 
 * @returns {string} UDID for the current visitor
 */
function getOrCreateUDID() {
    try {
        // Check if UDID exists in localStorage
        let udid = localStorage.getItem(VISITOR_CONFIG.STORAGE_KEY_UDID);
        
        if (!udid) {
            // Generate new UDID for first-time visitor
            udid = generateUDID();
            localStorage.setItem(VISITOR_CONFIG.STORAGE_KEY_UDID, udid);
            visitorState.isNewVisitor = true;
            console.log('[Visitor Tracker] New visitor detected. Generated UDID:', udid);
        } else {
            visitorState.isNewVisitor = false;
            console.log('[Visitor Tracker] Returning visitor detected. UDID:', udid);
        }
        
        return udid;
    } catch (error) {
        console.error('[Visitor Tracker] Error getting/creating UDID:', error);
        // Fallback: generate temporary UDID if localStorage is not available
        return generateUDID();
    }
}

/**
 * Load visitors data from localStorage
 * This simulates reading from visitors.json
 * 
 * @returns {Array} Array of visitor objects
 */
function loadVisitorsData() {
    try {
        const data = localStorage.getItem(VISITOR_CONFIG.STORAGE_KEY_VISITORS);
        if (!data) {
            console.log('[Visitor Tracker] No existing visitors data found. Creating new structure.');
            return [];
        }
        
        const visitors = JSON.parse(data);
        console.log('[Visitor Tracker] Loaded', visitors.length, 'visitor records from storage');
        return visitors;
    } catch (error) {
        console.error('[Visitor Tracker] Error loading visitors data:', error);
        return [];
    }
}

/**
 * Save visitors data to localStorage
 * This simulates writing to visitors.json
 * 
 * @param {Array} visitors - Array of visitor objects to save
 */
function saveVisitorsData(visitors) {
    try {
        const data = JSON.stringify(visitors, null, 2);
        localStorage.setItem(VISITOR_CONFIG.STORAGE_KEY_VISITORS, data);
        console.log('[Visitor Tracker] Saved', visitors.length, 'visitor records to storage');
        
        // Also log the data structure for debugging
        console.log('[Visitor Tracker] Current visitors.json structure:', visitors);
    } catch (error) {
        console.error('[Visitor Tracker] Error saving visitors data:', error);
    }
}

/**
 * Track the current visitor
 * Updates or creates a visitor record with visit information
 * 
 * @returns {Object} Visitor data object
 */
function trackVisitor() {
    try {
        // Get or create UDID
        const udid = getOrCreateUDID();
        visitorState.udid = udid;
        
        // Load existing visitors data
        const visitors = loadVisitorsData();
        
        // Current timestamp
        const now = new Date().toISOString();
        
        // Check if visitor already exists
        const existingVisitorIndex = visitors.findIndex(v => v.udid === udid);
        
        if (existingVisitorIndex !== -1) {
            // Update existing visitor record
            const visitor = visitors[existingVisitorIndex];
            visitor.lastVisit = now;
            visitor.visitCount = (visitor.visitCount || 1) + 1;
            
            // Update state
            visitorState.visitCount = visitor.visitCount;
            visitorState.firstVisit = visitor.firstVisit;
            visitorState.lastVisit = visitor.lastVisit;
            
            console.log('[Visitor Tracker] Updated existing visitor:', {
                udid: visitor.udid,
                visitCount: visitor.visitCount,
                firstVisit: visitor.firstVisit,
                lastVisit: visitor.lastVisit
            });
        } else {
            // Create new visitor record
            const newVisitor = {
                udid: udid,
                firstVisit: now,
                lastVisit: now,
                visitCount: 1,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language || navigator.userLanguage,
                platform: navigator.platform,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            
            visitors.push(newVisitor);
            
            // Update state
            visitorState.visitCount = 1;
            visitorState.firstVisit = now;
            visitorState.lastVisit = now;
            
            console.log('[Visitor Tracker] Added new visitor:', newVisitor);
        }
        
        // Save updated visitors data
        saveVisitorsData(visitors);
        
        // Store individual visitor data in localStorage for quick access
        localStorage.setItem(VISITOR_CONFIG.STORAGE_KEY_FIRST_VISIT, visitorState.firstVisit);
        localStorage.setItem(VISITOR_CONFIG.STORAGE_KEY_LAST_VISIT, visitorState.lastVisit);
        localStorage.setItem(VISITOR_CONFIG.STORAGE_KEY_VISIT_COUNT, visitorState.visitCount.toString());
        
        return {
            udid: visitorState.udid,
            isNewVisitor: visitorState.isNewVisitor,
            visitCount: visitorState.visitCount,
            firstVisit: visitorState.firstVisit,
            lastVisit: visitorState.lastVisit,
            totalVisitors: visitors.length
        };
        
    } catch (error) {
        console.error('[Visitor Tracker] Error tracking visitor:', error);
        return null;
    }
}

/**
 * Show visitor tracking notification to the user
 * Notifies visitors that their visit is being tracked anonymously
 * 
 * @param {Object} visitorData - Visitor data to display in notification
 */
function showVisitorNotification(visitorData) {
    if (!VISITOR_CONFIG.SHOW_NOTIFICATION || !visitorData) {
        return;
    }
    
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'visitor-tracking-notification';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        // Build notification content
        const icon = visitorData.isNewVisitor ? '👋' : '🔄';
        const title = visitorData.isNewVisitor ? 'Welcome!' : 'Welcome back!';
        const message = visitorData.isNewVisitor 
            ? 'Your visit will be tracked anonymously using a unique identifier (UDID).'
            : `This is visit #${visitorData.visitCount}. Your previous visit was tracked.`;
        
        notification.innerHTML = `
            <div class="visitor-notification-content">
                <div class="visitor-notification-icon">${icon}</div>
                <div class="visitor-notification-text">
                    <strong>${title}</strong>
                    <p>${message}</p>
                    <p class="visitor-notification-privacy">
                        🔒 Privacy: We only track anonymous UDIDs. No personal information is collected.
                    </p>
                </div>
                <button class="visitor-notification-close" aria-label="Close notification">✕</button>
            </div>
        `;
        
        // Apply styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            max-width: 500px;
            width: 90%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease;
            opacity: 0;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Trigger animation after a small delay
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Handle close button click
        const closeButton = notification.querySelector('.visitor-notification-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                hideNotification(notification);
            });
        }
        
        // Auto-hide after duration
        setTimeout(() => {
            hideNotification(notification);
        }, VISITOR_CONFIG.NOTIFICATION_DURATION);
        
        // Log to console as well
        console.log('[Visitor Tracker] Notification shown:', {
            title,
            message,
            visitorData
        });
        
    } catch (error) {
        console.error('[Visitor Tracker] Error showing notification:', error);
    }
}

/**
 * Hide visitor notification with animation
 * 
 * @param {HTMLElement} notification - Notification element to hide
 */
function hideNotification(notification) {
    if (!notification) return;
    
    notification.style.transform = 'translateX(-50%) translateY(-100px)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 400);
}

/**
 * Initialize visitor tracking
 * Called when the page loads
 */
function initVisitorTracking() {
    try {
        console.log('[Visitor Tracker] Initializing visitor tracking...');
        
        // Track the current visitor
        const visitorData = trackVisitor();
        
        if (visitorData) {
            console.log('[Visitor Tracker] Visitor tracked successfully:', visitorData);
            
            // Show notification to user
            showVisitorNotification(visitorData);
            
            // Log visitor summary
            console.log('[Visitor Tracker] Summary:', {
                'Your UDID': visitorData.udid,
                'Visit Count': visitorData.visitCount,
                'First Visit': new Date(visitorData.firstVisit).toLocaleString(),
                'Last Visit': new Date(visitorData.lastVisit).toLocaleString(),
                'Total Unique Visitors': visitorData.totalVisitors,
                'Status': visitorData.isNewVisitor ? 'New Visitor' : 'Returning Visitor'
            });
        }
        
    } catch (error) {
        console.error('[Visitor Tracker] Error initializing tracking:', error);
    }
}

/**
 * Get current visitor statistics
 * 
 * @returns {Object} Visitor statistics
 */
function getVisitorStats() {
    const visitors = loadVisitorsData();
    return {
        totalVisitors: visitors.length,
        currentUDID: visitorState.udid,
        visitCount: visitorState.visitCount,
        firstVisit: visitorState.firstVisit,
        lastVisit: visitorState.lastVisit,
        isNewVisitor: visitorState.isNewVisitor
    };
}

/**
 * Export visitors data as JSON
 * Useful for downloading or inspecting the data
 * 
 * @returns {string} JSON string of all visitors
 */
function exportVisitorsJSON() {
    const visitors = loadVisitorsData();
    return JSON.stringify(visitors, null, 2);
}

/**
 * Clear visitor tracking data (for testing or privacy purposes)
 * WARNING: This will remove all visitor data
 */
function clearVisitorData() {
    if (confirm('Are you sure you want to clear all visitor tracking data? This action cannot be undone.')) {
        try {
            // Clear all visitor-related data from localStorage
            localStorage.removeItem(VISITOR_CONFIG.STORAGE_KEY_UDID);
            localStorage.removeItem(VISITOR_CONFIG.STORAGE_KEY_VISITORS);
            localStorage.removeItem(VISITOR_CONFIG.STORAGE_KEY_FIRST_VISIT);
            localStorage.removeItem(VISITOR_CONFIG.STORAGE_KEY_LAST_VISIT);
            localStorage.removeItem(VISITOR_CONFIG.STORAGE_KEY_VISIT_COUNT);
            
            // Reset state
            visitorState.udid = null;
            visitorState.isNewVisitor = false;
            visitorState.visitCount = 0;
            visitorState.firstVisit = null;
            visitorState.lastVisit = null;
            
            console.log('[Visitor Tracker] All visitor data cleared');
            alert('Visitor data has been cleared. Refresh the page to be tracked as a new visitor.');
        } catch (error) {
            console.error('[Visitor Tracker] Error clearing visitor data:', error);
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorTracking);
} else {
    // DOM is already ready
    initVisitorTracking();
}

// Export functions for external use
window.visitorTracker = {
    getStats: getVisitorStats,
    exportJSON: exportVisitorsJSON,
    clearData: clearVisitorData,
    trackVisitor: trackVisitor
};

// Add CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
    .visitor-tracking-notification {
        font-size: 14px;
        line-height: 1.5;
    }
    
    .visitor-notification-content {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }
    
    .visitor-notification-icon {
        font-size: 32px;
        flex-shrink: 0;
    }
    
    .visitor-notification-text {
        flex: 1;
    }
    
    .visitor-notification-text strong {
        display: block;
        font-size: 16px;
        margin-bottom: 8px;
    }
    
    .visitor-notification-text p {
        margin: 0 0 8px 0;
        opacity: 0.95;
    }
    
    .visitor-notification-privacy {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 12px !important;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .visitor-notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: background 0.2s ease;
    }
    
    .visitor-notification-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .visitor-notification-close:active {
        transform: scale(0.95);
    }
    
    @media (max-width: 600px) {
        .visitor-tracking-notification {
            top: 10px;
            width: 95%;
            padding: 15px;
        }
        
        .visitor-notification-icon {
            font-size: 24px;
        }
        
        .visitor-notification-text strong {
            font-size: 14px;
        }
        
        .visitor-notification-text p {
            font-size: 12px;
        }
    }
`;

// Add styles to document
if (document.head) {
    document.head.appendChild(style);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        document.head.appendChild(style);
    });
}
