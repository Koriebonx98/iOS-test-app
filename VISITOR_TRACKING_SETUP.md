# Visitor Tracking System - Setup Guide

This guide explains how to set up the visitor tracking system to update `visitors.json` with real device data.

## Overview

The visitor tracking system now uses a **webhook-based approach** that doesn't require API keys in the client code. Here's how it works:

1. **Client-side (Browser)**: 
   - Visitor data is collected and saved to localStorage immediately
   - Visitor data is sent to a webhook endpoint
   - If webhook fails, data remains safely in localStorage

2. **Server-side (Webhook)**:
   - Receives visitor data from the client
   - Updates `visitors.json` file directly
   - No API keys needed from the client!

## Quick Setup (3 Steps)

### Step 1: Start the Webhook Server

```bash
cd server
npm install
node webhook-server.js
```

The webhook server will start on port 3001 and display:
```
═══════════════════════════════════════════════════════════════
🚀 Visitor Webhook Server
═══════════════════════════════════════════════════════════════
Server running on port 3001
Webhook endpoint: http://localhost:3001/webhook/update-visitor
```

### Step 2: Configure the Webhook URL

The webhook URL is already configured in `visitor-tracker.js`:
```javascript
const VISITOR_CONFIG = {
    USE_WEBHOOK: true,
    WEBHOOK_URL: 'http://localhost:3001/webhook/update-visitor', // Local testing
    // ...
};
```

For production, update to your deployed webhook URL:
```javascript
WEBHOOK_URL: 'https://your-domain.com/webhook/update-visitor',
```

### Step 3: Test the App

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000 in your browser

3. Check the browser console - you'll see:
   ```
   ═══════════════════════════════════════════════════════════════
   🎉 REAL VISITOR DETECTED - NEW VISITOR
   ═══════════════════════════════════════════════════════════════
   [Visitor Tracker] Added new visitor: {...}
   ✅ Visitor data saved to localStorage
   ═══════════════════════════════════════════════════════════════
   [Visitor Tracker] ✅ Successfully sent visitor data to webhook
   [Visitor Tracker] visitors.json file has been updated in the repository
   ```

4. Check `visitors.json` - it will contain your real device data!

## How It Works

### When a Real Device Visits:

1. **UDID Generation**: A unique ID is generated and saved in localStorage
2. **Data Collection**: Device info is collected (user agent, screen size, etc.)
3. **Local Storage**: Data is immediately saved to localStorage
4. **Webhook Call**: Data is sent to the webhook server
5. **File Update**: Webhook server updates `visitors.json`

### Console Logging

The system provides detailed console logs to show when real visitors are detected:

**New Visitor:**
```
═══════════════════════════════════════════════════════════════
🎉 REAL VISITOR DETECTED - NEW VISITOR
═══════════════════════════════════════════════════════════════
[Visitor Tracker] Added new visitor:
  udid: abc123...
  visitCount: 1
  platform: iPhone
✅ Visitor data saved to localStorage
✅ Successfully sent visitor data to webhook
```

**Returning Visitor:**
```
═══════════════════════════════════════════════════════════════
🔄 REAL VISITOR DETECTED - RETURNING VISITOR
═══════════════════════════════════════════════════════════════
[Visitor Tracker] Updated existing visitor:
  visitCount: 3
✅ Visitor data saved to localStorage
✅ Successfully sent visitor data to webhook
```

## Production Deployment

### Option 1: Deploy Webhook Server

Deploy the webhook server to a hosting service:

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**Update webhook URL:**
```javascript
WEBHOOK_URL: 'https://your-app-name.herokuapp.com/webhook/update-visitor'
```

### Option 2: Use Serverless Function

Convert to a serverless function (Netlify/Vercel):

```javascript
// netlify/functions/update-visitor.js
exports.handler = async (event) => {
    // Webhook logic here
};
```

## Testing

### Manual Test

Send a test visitor:
```bash
curl -X POST http://localhost:3001/webhook/update-visitor \
  -H "Content-Type: application/json" \
  -d '{
    "udid": "test-123...",
    "firstVisit": "2026-01-20T22:00:00.000Z",
    "lastVisit": "2026-01-20T22:00:00.000Z",
    "visitCount": 1,
    "userAgent": "Test Device",
    "screenSize": "390x844",
    "language": "en-US",
    "platform": "iPhone",
    "timeZone": "America/New_York"
  }'
```

### Check visitors.json

```bash
cat visitors.json
```

You should see the new visitor added!

## Security

- ✅ No API keys exposed in client code
- ✅ Webhook server can be secured with API key (optional)
- ✅ Data always saved to localStorage (fallback)
- ✅ CORS enabled for cross-origin requests

## Troubleshooting

### Webhook server not running
**Error:** `Webhook update failed: Failed to fetch`

**Solution:** Start the webhook server:
```bash
cd server && node webhook-server.js
```

### Port already in use
**Error:** `EADDRINUSE`

**Solution:** Kill the process or use a different port:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill
```

### visitors.json not updating
**Check:**
1. Is the webhook server running?
2. Is the WEBHOOK_URL correct in visitor-tracker.js?
3. Check browser console for errors
4. Check webhook server logs

## Files Modified

- ✅ `visitor-tracker.js` - Enhanced logging, webhook integration
- ✅ `server/webhook-server.js` - Simple webhook server
- ✅ `.github/workflows/update-visitors.yml` - GitHub Actions alternative

## Key Features

✅ **No API Keys Required** - Webhook approach is secure  
✅ **Enhanced Console Logging** - See when real visitors are detected  
✅ **Automatic Updates** - visitors.json updates automatically  
✅ **Fallback Support** - Data always saved to localStorage  
✅ **Real Device Support** - Works with real phones, tablets, computers  

## Next Steps

1. ✅ Test locally with the webhook server
2. ✅ Verify visitors.json updates with real device data
3. ⏭️ Deploy webhook server to production
4. ⏭️ Update WEBHOOK_URL to production URL
5. ⏭️ Monitor visitor data in the repository

For more details, see:
- `server/WEBHOOK_README.md` - Webhook server documentation
- `visitor-tracker.js` - Implementation details
- `VISITOR_TRACKING_IMPLEMENTATION.md` - Full technical documentation
