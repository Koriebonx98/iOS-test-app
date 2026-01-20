# Visitor Tracker API Configuration

This guide explains how to configure the visitor tracking system to send data to your backend server.

## Configuration

The visitor tracker can be configured by editing the `VISITOR_CONFIG` object in `visitor-tracker.js`:

```javascript
const VISITOR_CONFIG = {
    // API settings
    API_ENABLED: true,                      // Enable/disable API integration
    API_URL: 'http://localhost:3000/track', // Your server endpoint URL
    MAX_RETRIES: 3,                         // Maximum retry attempts
    RETRY_DELAY: 2000,                      // Delay between retries (ms)
    REQUEST_TIMEOUT: 10000,                 // Request timeout (ms)
    
    // ... other settings
};
```

## Production Deployment

### 1. Update API URL

Change the `API_URL` to your production server:

```javascript
API_URL: 'https://your-domain.com/track'
```

### 2. Start the Backend Server

The backend server is located in the `server/` directory:

```bash
cd server
npm install
npm start
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-github-pages-url.com
```

## API Endpoints

### POST /track

Accepts visitor data and stores it in `visitors.json`.

**Request Body:**
```json
{
  "udid": "string",
  "firstVisit": "ISO 8601 timestamp",
  "lastVisit": "ISO 8601 timestamp",
  "visitCount": 1,
  "userAgent": "string",
  "screenSize": "string",
  "language": "string",
  "platform": "string",
  "timeZone": "string"
}
```

**Response:**
```json
{
  "success": true,
  "totalVisitors": 10,
  "timestamp": "2026-01-20T20:00:00.000Z"
}
```

### GET /visitors

Returns all visitor data.

**Response:**
```json
{
  "success": true,
  "visitors": [...],
  "totalVisitors": 10,
  "timestamp": "2026-01-20T20:00:00.000Z"
}
```

## Features

### ✅ Automatic API Integration
- Visitor data is automatically sent to the configured endpoint
- No additional code needed - just configure the URL

### ✅ Retry Logic
- Failed requests are retried up to 3 times (configurable)
- 2-second delay between retries (configurable)
- 10-second timeout for each request (configurable)

### ✅ Offline Queue
- When all retries fail, data is queued in localStorage
- Queue is automatically processed when the connection is restored
- Periodic queue processing every 5 minutes
- Manual queue processing via `window.visitorTracker.processPendingQueue()`

### ✅ Graceful Degradation
- Works offline - data is stored locally and synced later
- No errors shown to users if API is unavailable
- Transparent logging for debugging

## Testing

### Local Testing

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000 in your browser

4. Check the browser console for tracking logs

### Check Queue Status

Use the browser console:

```javascript
// Get pending queue
window.visitorTracker.getPendingQueue()

// Process pending queue manually
await window.visitorTracker.processPendingQueue()
```

## Troubleshooting

### Issue: API requests fail with CORS errors

**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in the server's `.env` file:

```env
ALLOWED_ORIGINS=https://your-github-pages-url.com,http://localhost:8000
```

### Issue: Data not being sent to API

**Solution:** Check the browser console for error messages. Verify:
- `API_ENABLED` is set to `true`
- `API_URL` is correct
- The server is running and accessible

### Issue: Queue keeps growing

**Solution:** 
- Check server logs for errors
- Verify CORS configuration
- Check network connectivity
- Manually process queue: `window.visitorTracker.processPendingQueue()`

## Disabling API Integration

To use only local storage without API calls:

```javascript
API_ENABLED: false
```

This will store all data locally in localStorage without making any network requests.
