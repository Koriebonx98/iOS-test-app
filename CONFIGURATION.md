# Audience Counter Configuration Guide

This file explains how to configure the audience counter for your deployment.

## Configuration Steps

### 1. Backend Server Configuration

1. Navigate to the `server` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and set the following values:
   - `API_KEY`: Generate a strong random API key (e.g., using `openssl rand -base64 32`)
   - `ENCRYPTION_KEY`: Must be exactly 32 characters (e.g., use `openssl rand -base64 24`)
   - `ALLOWED_ORIGINS`: Set to your GitHub Pages URL (e.g., `https://yourusername.github.io`)
   - `PORT`: Default is 3000, change if needed

### 2. Frontend Configuration

Edit `audience-counter.js` and update the `AUDIENCE_CONFIG` object:

```javascript
const AUDIENCE_CONFIG = {
    API_URL: 'https://your-server-url.com/api/audience',  // Your deployed server URL
    API_KEY: 'your-api-key-here',                         // Same as server API_KEY
    ENCRYPTION_KEY: 'your-32-character-encryption-key',   // Same as server ENCRYPTION_KEY
    UPDATE_INTERVAL: 5 * 60 * 1000,                       // 5 minutes (adjust as needed)
};
```

**Important:** The `API_KEY` and `ENCRYPTION_KEY` in the frontend MUST match those in the server's `.env` file.

### 3. Deploy the Server

Choose one of the following deployment options:

#### Option A: Heroku
1. Install Heroku CLI
2. Navigate to the server directory
3. Create a new Heroku app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set API_KEY=your-api-key
   heroku config:set ENCRYPTION_KEY=your-32-char-key
   heroku config:set ALLOWED_ORIGINS=https://yourusername.github.io
   ```
5. Deploy: `git subtree push --prefix server heroku main`

#### Option B: Railway
1. Visit https://railway.app
2. Create a new project
3. Connect your GitHub repository
4. Set the root directory to `server`
5. Add environment variables in the Railway dashboard
6. Deploy automatically

#### Option C: DigitalOcean App Platform
1. Visit https://www.digitalocean.com/products/app-platform
2. Create a new app from your GitHub repository
3. Set the source directory to `server`
4. Add environment variables
5. Deploy

#### Option D: Your Own VPS
1. SSH into your server
2. Install Node.js 18+
3. Clone your repository
4. Navigate to the server directory
5. Install dependencies: `npm install`
6. Set up environment variables in `.env`
7. Use PM2 to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name audience-tracker
   pm2 save
   pm2 startup
   ```
8. Set up nginx as a reverse proxy with SSL (using Let's Encrypt)

### 4. Update Frontend Configuration

After deploying the server:
1. Copy the server URL (e.g., `https://your-app.herokuapp.com`)
2. Update `audience-counter.js` with:
   - `API_URL`: Your server URL + `/api/audience`
   - Same `API_KEY` and `ENCRYPTION_KEY` as the server

### 5. Test the Integration

1. Open your deployed frontend (GitHub Pages)
2. Open browser console (F12)
3. Look for messages like:
   - `[Audience] Initializing audience tracking...`
   - `[Audience] New user ID generated: [uuid]`
   - `[Audience] Visitor tracked successfully`
4. Verify the audience count displays correctly

### 6. Security Checklist

- [ ] Changed default API_KEY to a strong random value
- [ ] Changed default ENCRYPTION_KEY to a strong 32-character value
- [ ] Set ALLOWED_ORIGINS to only your domain
- [ ] Deployed server with HTTPS enabled
- [ ] Verified API endpoints require authentication
- [ ] Tested that encrypted data cannot be read without the key
- [ ] Added `.env` to `.gitignore` (already done)
- [ ] Never committed `.env` to version control

## Testing Locally

To test locally before deployment:

1. Start the server:
   ```bash
   cd server
   npm install
   npm start
   ```

2. In another terminal, start the frontend:
   ```bash
   cd ..
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000 in your browser
4. Check the browser console for audience tracking messages

## Troubleshooting

### Issue: "CryptoJS library not loaded"
**Solution:** Make sure the CryptoJS CDN script tag is in your HTML:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
```

### Issue: "Failed to fetch" or CORS errors
**Solution:** 
- Check that `ALLOWED_ORIGINS` in server `.env` includes your frontend URL
- Verify the server is running and accessible
- Check that the `API_URL` in frontend config is correct

### Issue: "Invalid API key" or authentication errors
**Solution:**
- Verify `API_KEY` matches between frontend and server
- Check that the `X-API-Key` header is being sent correctly

### Issue: "Failed to decrypt payload"
**Solution:**
- Verify `ENCRYPTION_KEY` matches exactly between frontend and server
- Ensure the key is exactly 32 characters
- Check for any extra whitespace or newlines

## Production Deployment Checklist

- [ ] Server deployed with HTTPS
- [ ] Environment variables set on server platform
- [ ] Frontend `audience-counter.js` updated with production URLs and keys
- [ ] Tested audience tracking in production
- [ ] Verified count updates correctly
- [ ] Checked browser console for errors
- [ ] Tested "Check for Updates" button refreshes count
- [ ] Verified localStorage stores user ID
- [ ] Tested that same user isn't counted twice
- [ ] Monitored server logs for any issues

## Monitoring

Check your audience data:
1. SSH into your server (or use your platform's console)
2. View the audience.json file:
   ```bash
   cd server/data
   cat audience.json
   ```

The file shows:
- Total unique users
- First visit timestamp for each user
- Last visit timestamp
- Visit count per user

You can also call the `/api/audience/data` endpoint (with authentication) to get the encrypted data programmatically.
