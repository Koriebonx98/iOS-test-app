# Visitor Webhook Server

A simple webhook server that receives visitor data and updates `visitors.json` directly in the repository.

## Features

- **No API Keys Required**: Simple HTTP endpoint, no authentication needed from client
- **Direct File Updates**: Updates `visitors.json` file directly in the repository
- **CORS Enabled**: Accepts requests from any origin (perfect for GitHub Pages)
- **Real-time Updates**: Visitor data is written immediately to the JSON file
- **Automatic Sync**: Works seamlessly with the visitor tracking system

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
node webhook-server.js
```

The server will start on port 3001 by default.

### 3. Configure the Client

Update `visitor-tracker.js` with your webhook URL:

```javascript
const VISITOR_CONFIG = {
    USE_WEBHOOK: true,
    WEBHOOK_URL: 'http://localhost:3001/webhook/update-visitor', // For local testing
    // WEBHOOK_URL: 'https://your-domain.com/webhook/update-visitor', // For production
    // ...
};
```

## Endpoints

### POST /webhook/update-visitor

Updates visitor data in `visitors.json`.

**Request Body:**
```json
{
  "udid": "550e8400-e29b-41d4-a716-446655440000",
  "firstVisit": "2026-01-20T20:00:00.000Z",
  "lastVisit": "2026-01-20T22:00:00.000Z",
  "visitCount": 3,
  "userAgent": "Mozilla/5.0...",
  "screenSize": "390x844",
  "language": "en-US",
  "platform": "iPhone",
  "timeZone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "totalVisitors": 5,
  "message": "Visitor data updated successfully",
  "timestamp": "2026-01-20T22:00:01.000Z"
}
```

### GET /webhook/visitors

Get all visitors data (for testing/debugging).

**Response:**
```json
{
  "success": true,
  "visitors": [...],
  "totalVisitors": 5,
  "timestamp": "2026-01-20T22:00:01.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T22:00:01.000Z",
  "service": "visitor-webhook"
}
```

## Production Deployment

### Option 1: Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Deploy
git push heroku main

# Update visitor-tracker.js
WEBHOOK_URL: 'https://your-app-name.herokuapp.com/webhook/update-visitor'
```

### Option 2: Deploy to Vercel/Netlify

Convert to serverless function:

```javascript
// netlify/functions/update-visitor.js or api/update-visitor.js
module.exports.handler = async (event) => {
    // Webhook logic here
};
```

### Option 3: Run on Your Own Server

```bash
# Install PM2 for process management
npm install -g pm2

# Start server with PM2
pm2 start webhook-server.js --name visitor-webhook

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

## How It Works

1. **Client visits the website**
   - Browser generates or retrieves a UDID from localStorage
   - Visitor data is collected (platform, screen size, etc.)
   - Data is saved to localStorage immediately

2. **Client sends data to webhook**
   - Visitor data is POSTed to the webhook endpoint
   - If webhook is unavailable, data remains in localStorage

3. **Webhook updates visitors.json**
   - Server receives the visitor data
   - Reads current `visitors.json` file
   - Updates or adds the visitor record
   - Writes the updated data back to the file

4. **Repository is updated**
   - The `visitors.json` file now contains the real visitor data
   - File can be committed to the repository
   - Other systems can read the updated data

## Security Considerations

- **No Authentication**: This webhook doesn't require authentication by design
- **CORS Enabled**: Accepts requests from any origin
- **Public Endpoint**: Anyone can send data to this endpoint
- **Rate Limiting**: Consider adding rate limiting for production use
- **Input Validation**: Basic validation is included, but consider adding more

For production use, consider adding:
- API key authentication
- Rate limiting (e.g., using express-rate-limit)
- Request validation (e.g., using Joi or express-validator)
- Monitoring and logging

## Troubleshooting

### Webhook server not receiving requests

- Check that the server is running: `curl http://localhost:3001/health`
- Verify the WEBHOOK_URL in `visitor-tracker.js`
- Check CORS settings if running on a different domain
- Check firewall rules if deploying to a server

### visitors.json not updating

- Check file permissions: `ls -l visitors.json`
- Verify the path in `webhook-server.js`
- Check server logs for errors

### CORS errors

- Ensure `cors()` middleware is enabled
- Check browser console for specific CORS errors
- For production, configure CORS with specific origins

## Logs

The server logs all visitor updates:

```
═══════════════════════════════════════════════════════════════
📥 Webhook: Received visitor data
═══════════════════════════════════════════════════════════════
UDID: 550e8400-e29b-41d4-a716-446655440000
Visit Count: 3
Platform: iPhone
✅ Updated existing visitor
Total visitors: 5
✅ visitors.json file updated successfully
═══════════════════════════════════════════════════════════════
```

## Alternative: Without Server

If you don't want to run a server, visitor data is automatically saved to localStorage in the browser. You can:

1. Export the data manually:
   ```javascript
   console.log(window.visitorTracker.exportJSON());
   ```

2. Copy and paste into `visitors.json`

3. Commit the updated file to your repository

## Support

For issues or questions:
1. Check the server logs
2. Test with `curl` or Postman
3. Verify the webhook URL configuration
4. Check browser console for errors
