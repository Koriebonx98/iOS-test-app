# iOS-test-app

https://koriebonx98.github.io/iOS-test-app/


Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
- 👥 **Live Audience Counter** - Real-time tracking of unique visitors:
  - UUID-based unique user identification
  - localStorage persistence (same device counted once)
  - Encrypted data transmission (AES encryption)
  - Secure API with authentication
  - Real-time count updates every 5 minutes
  - Manual refresh with "Check for Updates" button
  - Privacy-focused (only anonymous UUID tracked)
- 🔄 **Auto-Update System** - Automatic detection and installation of new versions:
  - Version tracking with `version.json`
  - Automatic update checks every 5 minutes when online
  - User-friendly update notifications
  - Manual update check button
  - Network-first strategy for critical files
  - Stale-while-revalidate caching for optimal performance
  - Offline-first Progressive Web App (PWA) support
- 🔍 YouTube video search (redirects to YouTube search results)
- 🎵 **Enhanced Media Player** with comprehensive format support:
  - **Audio formats:** MP3, WAV, OGG, AAC, FLAC, M4A, WebM Audio, Opus, and more
  - **Video formats:** MP4, WebM, OGG, AVI, MKV, MOV, WMV, FLV, MPEG, 3GP, and more
  - Automatic format detection and validation
  - Dynamic switching between audio and video players
  - File format indicators in playlist
  - User-friendly error handling for unsupported formats
  - Full playback controls (Play, Pause, Stop, Next, Previous)
  - Progress bar with time display
  - Playlist management with visual indicators

## Setup Instructions

No setup required! Just open `index.html` in a web browser or deploy to GitHub Pages.

## Local Development

To run the app locally:

```bash
# Using Python 3
python3 -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## GitHub Pages Deployment

This app is designed to work with GitHub Pages:

1. Push your code to the `main` branch
2. Go to repository Settings → Pages
3. Select `main` branch as the source
4. Your app will be available at `https://[username].github.io/iOS-test-app/`

## Features Detail

### Auto-Update System
The app includes an intelligent auto-update mechanism that keeps all users on the latest version:

**How it works:**
- **Version Tracking**: App version is stored in `version.json` and checked regularly
- **Automatic Checks**: Every 5 minutes, the service worker checks for updates when online
- **Smart Caching**: Uses network-first strategy for version checks and stale-while-revalidate for other resources
- **User Notifications**: When an update is detected, users see a friendly notification with option to update immediately or later
- **Manual Check**: Users can manually check for updates via the "Check for Updates" button
- **Seamless Updates**: Service worker handles cache updates automatically in the background

**Updating the app:**
1. Increment the version number in `version.json` (e.g., from "1.0.0" to "1.1.0")
2. Push changes to your repository/server
3. Connected users will automatically receive update notifications within 5 minutes
4. Users click "Update Now" to reload with the latest version
5. Offline capability is maintained throughout the update process

**For developers:**
- Update `version.json` with each release
- The service worker cache name is `ios-test-app-cache-v2`
- Periodic checks happen every 5 minutes (configurable in `service-worker.js`)

### YouTube Search
- Simple search bar that redirects to YouTube search results
- Opens results in a new tab, just like YouTube's search
- No API key required - works immediately
- Supports keyboard Enter key for quick searches

### Interactive Counter
- Click tracking with localStorage persistence
- Haptic feedback on iOS devices

### Media Player
- Supports all common audio formats: MP3, WAV, OGG, AAC, FLAC, M4A, Opus, WebM Audio
- Supports all common video formats: MP4, WebM, OGG, AVI, MKV, MOV, WMV, FLV, MPEG, 3GP
- Automatic format detection and MIME type validation
- Dynamic player switching (audio/video based on file type)
- Playlist with file format indicators (e.g., "AUDIO • MP3", "VIDEO • MP4")
- Comprehensive error handling with user-friendly messages
- Full playback controls and progress tracking
- Cross-browser compatible (Chrome, Firefox, Safari, Edge)

### Device Information
- Real-time display of user agent, screen size, and time
- Responsive to orientation changes

### Live Audience Counter
The app includes a sophisticated audience tracking system that demonstrates modern web development practices:

**How it works:**
- **Unique Identification**: Each visitor receives a UUID (Universally Unique Identifier) on their first visit, stored in localStorage
- **Privacy First**: Only anonymous UUIDs are tracked - no personal information is collected
- **Encrypted Communication**: All data transmitted between client and server is encrypted using AES-256 encryption
- **Secure API**: Backend API requires authentication via API key to prevent unauthorized access
- **Real-time Updates**: Audience count refreshes automatically every 5 minutes and can be manually refreshed
- **Offline Support**: Gracefully handles offline scenarios without errors

**Technical Implementation:**
- Frontend: Pure JavaScript with CryptoJS for encryption
- Backend: Node.js with Express, featuring:
  - HTTPS/TLS support for secure connections
  - API key authentication
  - AES encryption for request/response payloads
  - CORS configuration for cross-origin requests
  - JSON file-based storage for audience data

**For Developers:**
See the `server/` directory for the backend implementation. The server is optional - the app works without it, but the audience counter will show 0. To set up your own tracking server:

1. Navigate to the `server` directory
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.example` to `.env`)
4. Update `audience-counter.js` with your server URL and keys
5. Start the server: `npm start`

For detailed setup instructions, see `server/README.md`.

**Security Features:**
- ✅ AES-256 encryption for all data transmission
- ✅ API key authentication
- ✅ HTTPS/TLS support
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ No personal data collection

This feature showcases skills in:
- API development and integration
- Encryption and security best practices
- Real-time data handling
- Privacy-focused design
- Full-stack development

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser
