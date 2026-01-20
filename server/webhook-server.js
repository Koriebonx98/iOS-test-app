#!/usr/bin/env node

/**
 * Simple Webhook Server for Updating visitors.json
 * 
 * This server provides a webhook endpoint that receives visitor data
 * and updates the visitors.json file directly in the repository.
 * 
 * No API keys or authentication required from the client!
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Path to visitors.json in the repository root (parent directory)
const VISITORS_FILE = path.join(__dirname, '..', 'visitors.json');

// Enable CORS for all origins (since this is a public webhook)
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'visitor-webhook'
    });
});

/**
 * POST /webhook/update-visitor
 * Webhook endpoint to update visitor data in visitors.json
 * 
 * Expected payload:
 * {
 *   udid: string,
 *   firstVisit: string (ISO 8601),
 *   lastVisit: string (ISO 8601),
 *   visitCount: number,
 *   userAgent: string,
 *   screenSize: string,
 *   language: string,
 *   platform: string,
 *   timeZone: string
 * }
 */
app.post('/webhook/update-visitor', async (req, res) => {
    try {
        const visitorData = req.body;
        
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📥 Webhook: Received visitor data');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('UDID:', visitorData.udid);
        console.log('Visit Count:', visitorData.visitCount);
        console.log('Platform:', visitorData.platform);
        
        // Validate required fields
        if (!visitorData.udid || !visitorData.firstVisit || !visitorData.lastVisit) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: udid, firstVisit, lastVisit' 
            });
        }
        
        // Read existing visitors data
        let visitors = [];
        try {
            const data = await fs.readFile(VISITORS_FILE, 'utf8');
            visitors = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, start with empty array
            console.log('Creating new visitors.json file');
        }
        
        // Find existing visitor or add new one
        const existingIndex = visitors.findIndex(v => v.udid === visitorData.udid);
        
        // Add lastUpdated timestamp
        const updatedVisitorData = {
            ...visitorData,
            lastUpdated: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            // Update existing visitor
            visitors[existingIndex] = { ...visitors[existingIndex], ...updatedVisitorData };
            console.log('✅ Updated existing visitor');
        } else {
            // Add new visitor
            visitors.push(updatedVisitorData);
            console.log('✅ Added new visitor');
        }
        
        // Write updated data back to file
        await fs.writeFile(VISITORS_FILE, JSON.stringify(visitors, null, 2), 'utf8');
        
        console.log('Total visitors:', visitors.length);
        console.log('✅ visitors.json file updated successfully');
        console.log('═══════════════════════════════════════════════════════════════');
        
        // Return success response
        res.json({
            success: true,
            totalVisitors: visitors.length,
            message: 'Visitor data updated successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error updating visitor data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update visitor data',
            message: error.message 
        });
    }
});

/**
 * GET /webhook/visitors
 * Get all visitors data (for testing/debugging)
 */
app.get('/webhook/visitors', async (req, res) => {
    try {
        const data = await fs.readFile(VISITORS_FILE, 'utf8');
        const visitors = JSON.parse(data);
        
        res.json({
            success: true,
            visitors: visitors,
            totalVisitors: visitors.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error reading visitors data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to read visitors data' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Internal Server Error', 
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Not Found', 
        message: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 Visitor Webhook Server');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/update-visitor`);
    console.log(`Visitors endpoint: http://localhost:${PORT}/webhook/visitors`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('═══════════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
