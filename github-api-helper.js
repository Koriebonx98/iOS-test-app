/**
 * GitHub API Helper Module
 * 
 * Provides utilities for interacting with GitHub's Contents API
 * to read and update files in the repository.
 * 
 * Features:
 * - Fetch file content from repository
 * - Update file content with concurrency safety
 * - SHA-based conflict detection
 * - Automatic retry logic
 */

/**
 * GitHub API Configuration
 * IMPORTANT: Update these values for your deployment
 */
const GITHUB_CONFIG = {
    // Repository details (format: "owner/repo")
    // Example: "Koriebonx98/iOS-test-app"
    REPO_OWNER: 'Koriebonx98',
    REPO_NAME: 'iOS-test-app',
    
    // Branch to update (usually 'main' or 'master')
    BRANCH: 'main',
    
    // GitHub Personal Access Token (PAT)
    // SECURITY NOTE: For production, this should be stored securely
    // Options:
    // 1. Use GitHub Actions secrets and inject at build time
    // 2. Use a serverless function as a proxy
    // 3. For public repos with read-only access, can be empty for GET requests
    // 
    // To create a PAT:
    // 1. Go to GitHub Settings → Developer settings → Personal access tokens
    // 2. Generate new token (classic)
    // 3. Select scopes: 'repo' (for private repos) or 'public_repo' (for public repos)
    // 4. Copy the token here
    GITHUB_TOKEN: '',
    
    // File path to visitors.json in the repository
    VISITORS_FILE_PATH: 'visitors.json',
    
    // API settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000, // 2 seconds
    REQUEST_TIMEOUT: 15000 // 15 seconds
};

/**
 * GitHub API Helper State
 */
const githubState = {
    currentSHA: null,
    lastFetchTime: null,
    isUpdating: false
};

/**
 * Make an authenticated GitHub API request
 * 
 * @param {string} endpoint - API endpoint (e.g., '/repos/owner/repo/contents/path')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function githubAPIRequest(endpoint, options = {}) {
    const url = `https://api.github.com${endpoint}`;
    
    // Add authentication header if token is provided
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        ...options.headers
    };
    
    if (GITHUB_CONFIG.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_CONFIG.GITHUB_TOKEN}`;
    }
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GITHUB_CONFIG.REQUEST_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetch file content from GitHub repository
 * 
 * @param {string} filePath - Path to file in repository
 * @param {string} branch - Branch name (optional, defaults to config)
 * @returns {Promise<{content: string, sha: string}>} File content and SHA
 */
async function fetchFileFromGitHub(filePath, branch = GITHUB_CONFIG.BRANCH) {
    try {
        console.log(`[GitHub API] Fetching file: ${filePath} from branch: ${branch}`);
        
        const endpoint = `/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${filePath}?ref=${branch}`;
        const response = await githubAPIRequest(endpoint);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`[GitHub API] File not found: ${filePath} - will create new file`);
                return { content: '[]', sha: null };
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Decode base64 content
        const content = atob(data.content);
        const sha = data.sha;
        
        // Store SHA for later updates
        githubState.currentSHA = sha;
        githubState.lastFetchTime = new Date().toISOString();
        
        console.log(`[GitHub API] File fetched successfully. SHA: ${sha.substring(0, 7)}...`);
        
        return { content, sha };
        
    } catch (error) {
        console.error(`[GitHub API] Error fetching file:`, error);
        throw error;
    }
}

/**
 * Update file content in GitHub repository
 * 
 * @param {string} filePath - Path to file in repository
 * @param {string} content - New file content
 * @param {string} commitMessage - Commit message
 * @param {string} sha - Current file SHA (for concurrency safety)
 * @param {string} branch - Branch name (optional, defaults to config)
 * @returns {Promise<{success: boolean, sha: string}>} Update result
 */
async function updateFileInGitHub(filePath, content, commitMessage, sha, branch = GITHUB_CONFIG.BRANCH) {
    try {
        // Check if token is available
        if (!GITHUB_CONFIG.GITHUB_TOKEN) {
            throw new Error('GitHub token not configured. Cannot update repository files.');
        }
        
        // Prevent concurrent updates with proper waiting
        if (githubState.isUpdating) {
            console.warn('[GitHub API] Update already in progress. Waiting...');
            // Wait for current update to complete (max 10 seconds)
            const maxWaitTime = 10000;
            const waitInterval = 500;
            let waitedTime = 0;
            
            while (githubState.isUpdating && waitedTime < maxWaitTime) {
                await new Promise(resolve => setTimeout(resolve, waitInterval));
                waitedTime += waitInterval;
            }
            
            if (githubState.isUpdating) {
                throw new Error('Another update is in progress. Please try again.');
            }
        }
        
        githubState.isUpdating = true;
        
        console.log(`[GitHub API] Updating file: ${filePath} with SHA: ${sha ? sha.substring(0, 7) + '...' : 'null (new file)'}`);
        
        // Encode content to base64 using modern approach
        let base64Content;
        if (typeof TextEncoder !== 'undefined') {
            // Modern browsers - use TextEncoder
            const encoder = new TextEncoder();
            const bytes = encoder.encode(content);
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
            base64Content = btoa(binString);
        } else {
            // Fallback for older browsers
            base64Content = btoa(decodeURIComponent(encodeURIComponent(content)));
        }
        
        // Prepare request payload
        const payload = {
            message: commitMessage,
            content: base64Content,
            branch: branch
        };
        
        // Include SHA if file exists (for update)
        if (sha) {
            payload.sha = sha;
        }
        
        const endpoint = `/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${filePath}`;
        const response = await githubAPIRequest(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[GitHub API] Update failed:', errorData);
            
            // Create error with status code for better handling
            const error = new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
            error.status = response.status;
            throw error;
        }
        
        const data = await response.json();
        const newSHA = data.content.sha;
        
        // Update stored SHA
        githubState.currentSHA = newSHA;
        githubState.lastFetchTime = new Date().toISOString();
        
        console.log(`[GitHub API] File updated successfully. New SHA: ${newSHA.substring(0, 7)}...`);
        
        githubState.isUpdating = false;
        
        return { success: true, sha: newSHA };
        
    } catch (error) {
        githubState.isUpdating = false;
        console.error(`[GitHub API] Error updating file:`, error);
        throw error;
    }
}

/**
 * Update file with retry logic and conflict resolution
 * 
 * @param {string} filePath - Path to file in repository
 * @param {Function} updateFn - Function that takes current content and returns new content
 * @param {string} commitMessage - Commit message
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {Promise<{success: boolean, sha: string}>} Update result
 */
async function updateFileWithRetry(filePath, updateFn, commitMessage, retryCount = 0) {
    try {
        console.log(`[GitHub API] Update attempt ${retryCount + 1}/${GITHUB_CONFIG.MAX_RETRIES + 1}`);
        
        // Fetch current file content and SHA
        const { content: currentContent, sha: currentSHA } = await fetchFileFromGitHub(filePath);
        
        // Parse current content
        let currentData;
        try {
            currentData = JSON.parse(currentContent);
        } catch (error) {
            console.warn('[GitHub API] Invalid JSON in file, using empty array');
            currentData = [];
        }
        
        // Apply update function to get new content
        const newData = updateFn(currentData);
        const newContent = JSON.stringify(newData, null, 2);
        
        // Update file in GitHub
        const result = await updateFileInGitHub(filePath, newContent, commitMessage, currentSHA);
        
        console.log('[GitHub API] Update successful');
        return result;
        
    } catch (error) {
        console.error(`[GitHub API] Update attempt ${retryCount + 1} failed:`, error.message);
        
        // Check if this is a conflict error (409) using status code only
        const isConflict = error.status === 409;
        
        // Retry logic
        if (retryCount < GITHUB_CONFIG.MAX_RETRIES && isConflict) {
            const delay = GITHUB_CONFIG.RETRY_DELAY * (retryCount + 1); // Exponential backoff
            console.log(`[GitHub API] Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return await updateFileWithRetry(filePath, updateFn, commitMessage, retryCount + 1);
        } else {
            console.error('[GitHub API] Max retries reached or unrecoverable error');
            throw error;
        }
    }
}

/**
 * Fetch visitors data from GitHub repository
 * 
 * @returns {Promise<Array>} Array of visitor objects
 */
async function fetchVisitorsFromGitHub() {
    try {
        const { content } = await fetchFileFromGitHub(GITHUB_CONFIG.VISITORS_FILE_PATH);
        const visitors = JSON.parse(content);
        
        console.log(`[GitHub API] Fetched ${visitors.length} visitors from repository`);
        return visitors;
        
    } catch (error) {
        console.error('[GitHub API] Error fetching visitors:', error);
        return [];
    }
}

/**
 * Update visitor data in GitHub repository
 * 
 * @param {object} visitorData - Visitor data to add/update
 * @returns {Promise<{success: boolean, totalVisitors: number}>} Update result
 */
async function updateVisitorInGitHub(visitorData) {
    try {
        const updateFn = (visitors) => {
            // Find existing visitor by UDID
            const existingIndex = visitors.findIndex(v => v.udid === visitorData.udid);
            
            if (existingIndex !== -1) {
                // Update existing visitor
                visitors[existingIndex] = {
                    ...visitors[existingIndex],
                    ...visitorData,
                    lastUpdated: new Date().toISOString()
                };
                console.log(`[GitHub API] Updated existing visitor: ${visitorData.udid}`);
            } else {
                // Add new visitor
                visitors.push({
                    ...visitorData,
                    lastUpdated: new Date().toISOString()
                });
                console.log(`[GitHub API] Added new visitor: ${visitorData.udid}`);
            }
            
            return visitors;
        };
        
        const commitMessage = `Update visitor: ${visitorData.udid.substring(0, 8)}... (visit #${visitorData.visitCount})`;
        
        const result = await updateFileWithRetry(
            GITHUB_CONFIG.VISITORS_FILE_PATH,
            updateFn,
            commitMessage
        );
        
        // Fetch updated visitors to get total count
        const visitors = await fetchVisitorsFromGitHub();
        
        return {
            success: result.success,
            totalVisitors: visitors.length
        };
        
    } catch (error) {
        console.error('[GitHub API] Error updating visitor:', error);
        throw error;
    }
}

/**
 * Get total visitor count from GitHub repository
 * 
 * @returns {Promise<number>} Total number of unique visitors
 */
async function getVisitorCountFromGitHub() {
    try {
        const visitors = await fetchVisitorsFromGitHub();
        return visitors.length;
    } catch (error) {
        console.error('[GitHub API] Error getting visitor count:', error);
        return 0;
    }
}

// Export functions for use in other modules
window.githubAPI = {
    fetchFile: fetchFileFromGitHub,
    updateFile: updateFileInGitHub,
    updateFileWithRetry: updateFileWithRetry,
    fetchVisitors: fetchVisitorsFromGitHub,
    updateVisitor: updateVisitorInGitHub,
    getVisitorCount: getVisitorCountFromGitHub,
    config: GITHUB_CONFIG
};

// Add CSS styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
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
