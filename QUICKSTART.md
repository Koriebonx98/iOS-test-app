# Live Audience Counter - Quick Start Guide

This guide will help you get the audience counter up and running quickly.

## What Was Added

✅ **Frontend Components:**
- `audience-counter.js` - Main tracking module with encryption
- Updated `index.html` - Added CryptoJS library and audience counter display
- Updated `styles.css` - Beautiful purple gradient UI for the counter
- Updated `app.js` - Integration with "Check for Updates" button

✅ **Backend Server:**
- Complete Node.js/Express server in `server/` directory
- API key authentication
- AES-256 encryption
- Three secure endpoints (track, count, data)
- JSON file-based storage

✅ **Documentation:**
- `CONFIGURATION.md` - Complete deployment guide
- `server/README.md` - Server API documentation
- Updated main `README.md` with feature description

## Quick Setup (Development)

### 1. Test Locally

```bash
# Start the backend server
cd server
npm install
cp .env.example .env
# Edit .env with your keys (see below)
npm start

# In another terminal, start the frontend
cd ..
python3 -m http.server 8000

# Open http://localhost:8000
```

### 2. Generate Security Keys

```bash
# Generate API key
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 24
```

### 3. Configure Environment

Edit `server/.env`:
```env
PORT=3000
NODE_ENV=development
API_KEY=<your-generated-api-key>
ENCRYPTION_KEY=<your-generated-encryption-key>
ALLOWED_ORIGINS=http://localhost:8000
```

### 4. Update Frontend Config

Edit `audience-counter.js` (lines 20-42):
```javascript
const AUDIENCE_CONFIG = {
    API_URL: 'http://localhost:3000/api/audience',
    API_KEY: '<same-as-server>',
    ENCRYPTION_KEY: '<same-as-server>',
    UPDATE_INTERVAL: 5 * 60 * 1000
};
```

## Production Deployment

### Option 1: Deploy Server to Heroku (Recommended)

```bash
# Install Heroku CLI
# Navigate to server directory
cd server

# Create Heroku app
heroku create your-audience-tracker

# Set environment variables
heroku config:set API_KEY=your-production-api-key
heroku config:set ENCRYPTION_KEY=your-production-encryption-key
heroku config:set ALLOWED_ORIGINS=https://yourusername.github.io
heroku config:set NODE_ENV=production

# Create a package.json in root if needed, or deploy from server/
git subtree push --prefix server heroku main

# Your server will be at: https://your-audience-tracker.herokuapp.com
```

### Option 2: Deploy Server to Railway

1. Visit https://railway.app
2. Connect your GitHub repository
3. Create new project from `server/` directory
4. Add environment variables in Railway dashboard
5. Deploy automatically

### Option 3: Deploy Server to Render

1. Visit https://render.com
2. Create new Web Service
3. Connect your GitHub repository
4. Set root directory to `server`
5. Add environment variables
6. Deploy

### Update Frontend for Production

After deploying your server:

1. Get your server URL (e.g., `https://your-app.herokuapp.com`)
2. Edit `audience-counter.js`:
   ```javascript
   const AUDIENCE_CONFIG = {
       API_URL: 'https://your-app.herokuapp.com/api/audience',
       API_KEY: 'your-production-api-key',
       ENCRYPTION_KEY: 'your-production-encryption-key',
       UPDATE_INTERVAL: 5 * 60 * 1000
   };
   ```
3. Commit and push to GitHub
4. GitHub Pages will automatically update

## Verification

### 1. Test the Server Health

```bash
curl https://your-server-url/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-20T19:00:00.000Z","service":"audience-tracker"}
```

### 2. Test Your Frontend

1. Open your GitHub Pages site
2. Open browser console (F12)
3. Look for these messages:
   ```
   [Audience] Initializing audience tracking...
   [Audience] New user ID generated: <uuid>
   [Audience] Visitor tracked successfully
   [Audience] Display updated with count: 1
   ```

### 3. Verify Data Storage

On your server, check the audience data file:
```bash
# If on Heroku
heroku run cat data/audience.json

# If on your own server
cat server/data/audience.json
```

## Troubleshooting

### Frontend shows "0" and console shows errors

**Check:**
1. Is the server running? Test `/health` endpoint
2. Do the API_KEY and ENCRYPTION_KEY match between frontend and server?
3. Is ALLOWED_ORIGINS set correctly on the server?
4. Is CryptoJS loaded? Check for script tag in HTML

### "Failed to fetch" or CORS errors

**Solution:**
- Add your GitHub Pages URL to ALLOWED_ORIGINS in server .env
- Ensure server is using HTTPS in production
- Check that API_URL in frontend is correct

### "Failed to decrypt payload"

**Solution:**
- ENCRYPTION_KEY must match exactly between frontend and server
- Must be exactly 32 characters (if using random bytes, base64 encoding adds length)
- No extra whitespace or newlines

## Security Notes

✅ **What's Secure:**
- All data encrypted with AES-256 before transmission
- API key authentication on all protected endpoints
- HTTPS/TLS in production (via Heroku/Railway/etc.)
- CORS protection
- No personal data collected

⚠️ **Important:**
- API keys are visible in client-side code (this is acceptable for this use case)
- Security relies on server-side validation and encryption
- Rate limiting recommended for production (add to server)
- Consider adding request signing for extra security

## Monitoring

### View Audience Data

Create a simple admin page or use curl:

```bash
curl -H "X-API-Key: your-api-key" https://your-server/api/audience/data
```

You'll get encrypted data. Decrypt with your encryption key to see:
- List of all unique user IDs
- First visit timestamp
- Last visit timestamp  
- Visit count per user

### Server Logs

```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Your own server
pm2 logs audience-tracker
```

## Next Steps

1. ✅ Deploy the server to your chosen platform
2. ✅ Update frontend configuration
3. ✅ Test thoroughly
4. ✅ Monitor for a few days
5. ✅ Consider adding analytics dashboard
6. ✅ Optional: Add rate limiting for production

## Support

For issues or questions:
1. Check `CONFIGURATION.md` for detailed setup
2. Check `server/README.md` for API documentation
3. Review console logs in browser and server

## Success Indicators

You'll know it's working when:
- ✅ Browser console shows successful tracking messages
- ✅ Audience count displays and updates
- ✅ Server logs show successful requests
- ✅ audience.json file contains user data
- ✅ Different devices show incrementing count
- ✅ Same device keeps same UUID (localStorage)
- ✅ "Check for Updates" button refreshes count

Congratulations! Your live audience counter is now operational! 🎉
