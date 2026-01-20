/**
 * iOS Test App - Audience Tracking Server
 * 
 * This server provides secure API endpoints for tracking unique audience members
 * Features:
 * - UUID-based unique user tracking
 * - Encrypted data transmission (AES)
 * - API key authentication
 * - HTTPS/TLS support
 * - Real-time audience count updates
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs').promises;
const path = require('path');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const AUDIENCE_FILE = path.join(__dirname, 'data', 'audience.json');

// Security middleware
app.use(helmet());

// CORS configuration - allow requests from GitHub Pages
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

/**
 * Middleware: API Key Authentication
 * Validates that requests include a valid API key in the Authorization header
 */
function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'API key is required' 
        });
    }
    
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Invalid API key' 
        });
    }
    
    next();
}

/**
 * Decrypt payload using AES encryption
 * @param {string} encryptedData - The encrypted data string
 * @returns {object|null} Decrypted data object or null if decryption fails
 */
function decryptPayload(encryptedData) {
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error('[Decrypt] Error decrypting payload:', error.message);
        return null;
    }
}

/**
 * Encrypt response using AES encryption
 * @param {object} data - The data object to encrypt
 * @returns {string} Encrypted data string
 */
function encryptResponse(data) {
    try {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, process.env.ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('[Encrypt] Error encrypting response:', error.message);
        throw error;
    }
}

/**
 * Load audience data from file
 * @returns {Promise<object>} Audience data object with users array
 */
async function loadAudienceData() {
    try {
        const data = await fs.readFile(AUDIENCE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is invalid, return empty structure
        console.log('[Load] Creating new audience data structure');
        return { users: [], lastUpdated: new Date().toISOString() };
    }
}

/**
 * Save audience data to file
 * @param {object} data - Audience data object to save
 */
async function saveAudienceData(data) {
    try {
        // Ensure data directory exists
        const dir = path.dirname(AUDIENCE_FILE);
        await fs.mkdir(dir, { recursive: true });
        
        // Save with pretty formatting for readability
        await fs.writeFile(AUDIENCE_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('[Save] Audience data saved successfully');
    } catch (error) {
        console.error('[Save] Error saving audience data:', error.message);
        throw error;
    }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'audience-tracker'
    });
});

/**
 * POST /api/audience/track
 * Track a unique visitor
 * 
 * Expected encrypted payload:
 * {
 *   userId: string (UUID),
 *   timestamp: string (ISO 8601)
 * }
 */
app.post('/api/audience/track', authenticateApiKey, async (req, res) => {
    try {
        const { encryptedData } = req.body;
        
        if (!encryptedData) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Encrypted data is required' 
            });
        }
        
        // Decrypt the payload
        const payload = decryptPayload(encryptedData);
        
        if (!payload) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Failed to decrypt payload' 
            });
        }
        
        const { userId, timestamp } = payload;
        
        if (!userId || !timestamp) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'userId and timestamp are required' 
            });
        }
        
        // Load current audience data
        const audienceData = await loadAudienceData();
        
        // Check if user already exists
        const existingUserIndex = audienceData.users.findIndex(u => u.id === userId);
        
        if (existingUserIndex !== -1) {
            // Update existing user's last visit
            audienceData.users[existingUserIndex].lastVisit = timestamp;
            audienceData.users[existingUserIndex].visitCount = (audienceData.users[existingUserIndex].visitCount || 1) + 1;
            console.log(`[Track] Updated existing user: ${userId}`);
        } else {
            // Add new user
            audienceData.users.push({
                id: userId,
                firstVisit: timestamp,
                lastVisit: timestamp,
                visitCount: 1
            });
            console.log(`[Track] Added new user: ${userId}`);
        }
        
        // Update last modified timestamp
        audienceData.lastUpdated = new Date().toISOString();
        
        // Save updated data
        await saveAudienceData(audienceData);
        
        // Return encrypted response with current count
        const response = {
            success: true,
            audienceCount: audienceData.users.length,
            timestamp: new Date().toISOString()
        };
        
        const encryptedResponse = encryptResponse(response);
        
        res.json({ encryptedData: encryptedResponse });
        
    } catch (error) {
        console.error('[Track] Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to track audience' 
        });
    }
});

/**
 * GET /api/audience/count
 * Get current audience count
 */
app.get('/api/audience/count', authenticateApiKey, async (req, res) => {
    try {
        const audienceData = await loadAudienceData();
        
        // Return encrypted response
        const response = {
            count: audienceData.users.length,
            lastUpdated: audienceData.lastUpdated,
            timestamp: new Date().toISOString()
        };
        
        const encryptedResponse = encryptResponse(response);
        
        res.json({ encryptedData: encryptedResponse });
        
    } catch (error) {
        console.error('[Count] Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to get audience count' 
        });
    }
});

/**
 * GET /api/audience/data
 * Get full audience data (for admin purposes)
 * Note: In production, this should have additional admin authentication
 */
app.get('/api/audience/data', authenticateApiKey, async (req, res) => {
    try {
        const audienceData = await loadAudienceData();
        
        // Return encrypted response
        const encryptedResponse = encryptResponse(audienceData);
        
        res.json({ encryptedData: encryptedResponse });
        
    } catch (error) {
        console.error('[Data] Error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Failed to get audience data' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found', 
        message: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[Server] Audience tracking server running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[Server] CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully');
    process.exit(0);
});
