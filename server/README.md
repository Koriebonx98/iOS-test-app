# Audience Tracking Server

This server provides secure API endpoints for tracking unique audience members on the iOS Test App.

## Features

- **UUID-based Tracking**: Each user gets a unique identifier stored in localStorage
- **Encrypted Communication**: All data is encrypted using AES encryption
- **API Key Authentication**: Protects endpoints from unauthorized access
- **HTTPS/TLS Support**: Secure data transmission
- **Real-time Updates**: Audience count updates in real-time

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `API_KEY`: A secure API key for authentication
- `ENCRYPTION_KEY`: A 32-character key for AES encryption
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/audience/track
Track a unique visitor. Requires encrypted payload.

**Headers:**
- `X-API-Key`: Your API key
- `Content-Type`: application/json

**Request Body:**
```json
{
  "encryptedData": "encrypted_payload_here"
}
```

**Encrypted Payload:**
```json
{
  "userId": "uuid-v4-string",
  "timestamp": "2026-01-20T19:15:00.000Z"
}
```

**Response:**
```json
{
  "encryptedData": "encrypted_response_here"
}
```

**Decrypted Response:**
```json
{
  "success": true,
  "audienceCount": 42,
  "timestamp": "2026-01-20T19:15:00.000Z"
}
```

### GET /api/audience/count
Get current audience count.

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "encryptedData": "encrypted_response_here"
}
```

**Decrypted Response:**
```json
{
  "count": 42,
  "lastUpdated": "2026-01-20T19:15:00.000Z",
  "timestamp": "2026-01-20T19:15:00.000Z"
}
```

### GET /api/audience/data
Get full audience data (admin only).

**Headers:**
- `X-API-Key`: Your API key

**Response:**
```json
{
  "encryptedData": "encrypted_response_here"
}
```

**Decrypted Response:**
```json
{
  "users": [
    {
      "id": "uuid-v4-string",
      "firstVisit": "2026-01-20T19:00:00.000Z",
      "lastVisit": "2026-01-20T19:15:00.000Z",
      "visitCount": 5
    }
  ],
  "lastUpdated": "2026-01-20T19:15:00.000Z"
}
```

### GET /health
Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T19:15:00.000Z",
  "service": "audience-tracker"
}
```

## Deployment

### Using Node.js

1. Set up a server with Node.js installed
2. Clone the repository and navigate to the server directory
3. Install dependencies: `npm install`
4. Configure `.env` file with production settings
5. Start the server: `npm start`

### Using a Platform (Heroku, Railway, etc.)

1. Deploy the `server` directory to your platform
2. Set environment variables in the platform dashboard
3. The server will automatically start on the platform's assigned port

### HTTPS/TLS

For production, use a reverse proxy like nginx or deploy to a platform that provides HTTPS automatically (Heroku, Railway, Vercel, etc.).

Example nginx configuration:
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

1. **API Key**: Use a strong, randomly generated API key
2. **Encryption Key**: Use a 32-character random string
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Limit ALLOWED_ORIGINS to your domain only
5. **Rate Limiting**: Consider adding rate limiting in production
6. **Environment Variables**: Never commit `.env` file to version control

## Data Storage

Audience data is stored in `server/data/audience.json`. This file contains:
- Unique user IDs
- First visit timestamp
- Last visit timestamp
- Visit count

The file is created automatically on first use.

## Monitoring

Check server health at `/health` endpoint. Monitor logs for errors and track audience growth over time.
