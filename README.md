# iOS-test-app

https://koriebonx98.github.io/iOS-test-app/


Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
- 🔖 **Visitor Tracking** - Anonymous visitor tracking using UDIDs:
  - UDID-based unique visitor identification
  - localStorage persistence for returning visitors
  - Automatic tracking on every page visit
  - Privacy-focused (only anonymous UDIDs tracked)
  - Client-side data storage (no server required)
  - Visit count and timestamp tracking
  - User notification about tracking
  - Detailed visitor statistics in console
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

### Visitor Tracking
The app includes a client-side visitor tracking system that monitors unique visitors anonymously and stores data directly in the GitHub repository (no backend server required):

**How it works:**
- **GitHub API Integration**: Visitor data is stored in `visitors.json` directly in the repository using GitHub's Contents API
- **Unique Identification**: Each visitor receives a UDID (Unique Device Identifier) on their first visit, stored in localStorage
- **Privacy First**: Only anonymous UDIDs are tracked - no personal information is collected
- **Automatic Tracking**: Every page visit is automatically tracked and logged to the repository
- **Concurrency Safe**: Uses GitHub's SHA-based updates to prevent conflicts when multiple visitors access simultaneously
- **Retry Logic**: Failed updates are retried automatically with exponential backoff
- **Offline Queue**: When offline or GitHub API is unavailable, data is queued in localStorage and synced later
- **Returning Visitors**: Returning visitors are recognized by their stored UDID, and their visit count is updated
- **User Notification**: Visitors are notified about tracking via a friendly notification message
- **Detailed Logging**: All tracking activity is logged to the browser console for transparency

**Visitor Data Tracked:**
- UDID (Unique Device Identifier)
- First visit timestamp
- Last visit timestamp
- Visit count
- User agent
- Screen size
- Language preference
- Platform
- Time zone

**GitHub API Integration:**
The visitor tracker uses GitHub's Contents API to update `visitors.json` in the repository:
- **Read**: GET `/repos/:owner/:repo/contents/visitors.json` - Fetches current visitor data
- **Write**: PUT `/repos/:owner/:repo/contents/visitors.json` - Updates visitor data with new/updated records
- **Concurrency Safety**: Uses file SHA to detect and prevent conflicts
- **Automatic Retry**: Up to 3 retry attempts with exponential backoff on conflicts
- **Offline Support**: Failed requests are queued and processed when connection is restored

For GitHub API configuration and setup, see [GITHUB_API_SETUP.md](GITHUB_API_SETUP.md)

**How `visitors.json` Works:**
Visitor data is stored both locally (in localStorage) and in the GitHub repository (in `visitors.json`). The repository file serves as the authoritative source and is updated via the GitHub Contents API:

```json
[
  {
    "udid": "550e8400-e29b-41d4-a716-446655440000",
    "firstVisit": "2026-01-20T20:00:00.000Z",
    "lastVisit": "2026-01-20T20:30:00.000Z",
    "visitCount": 3,
    "userAgent": "Mozilla/5.0...",
    "screenSize": "1920x1080",
    "language": "en-US",
    "platform": "MacIntel",
    "timeZone": "America/New_York",
    "lastUpdated": "2026-01-20T20:30:00.500Z"
  }
]
```

**For Developers:**
- Check the browser console to see detailed visitor tracking logs
- Use `window.visitorTracker.getStats()` in the console to get current visitor statistics
- Use `window.visitorTracker.exportJSON()` to export all visitor data as JSON
- Use `window.visitorTracker.clearData()` to clear all visitor tracking data
- Use `window.visitorTracker.getPendingQueue()` to see queued items waiting to be sent
- Use `window.visitorTracker.processPendingQueue()` to manually process the queue
- Use `window.githubAPI.fetchVisitors()` to fetch visitors from GitHub repository
- Use `window.githubAPI.getVisitorCount()` to get total visitor count
- The tracking module is in `visitor-tracker.js`
- The GitHub API helper is in `github-api-helper.js`
- Legacy backend API server is in `server/server.js` (optional, for backward compatibility)

**Security Considerations:**
- ⚠️ GitHub Personal Access Token is required for write access to the repository
- ⚠️ Token will be visible in client-side code - consider using a serverless proxy for production
- ✅ Uses SHA-based updates to prevent conflicts
- ✅ Automatic retry logic with exponential backoff
- ✅ Rate limiting handled by GitHub API (5,000 requests/hour with auth)
- See [GITHUB_API_SETUP.md](GITHUB_API_SETUP.md) for security best practices

**Privacy Features:**
- ✅ No personal information collected
- ✅ Anonymous UDID tracking only
- ✅ Transparent logging in console
- ✅ User notification about tracking
- ✅ Easy data clearing option
- ✅ Works without backend server (direct GitHub API integration)

### Live Audience Counter
The app includes a sophisticated audience tracking system that reads visitor count from the GitHub repository:

**How it works:**
- **GitHub Integration**: Fetches visitor count from `visitors.json` in the repository using GitHub API
- **Real-time Updates**: Audience count refreshes automatically every 5 minutes and can be manually refreshed
- **No Backend Required**: Works entirely with GitHub API (optional backend support available)
- **Offline Support**: Gracefully handles offline scenarios without errors
- **Privacy First**: Only displays count, no personal information is exposed

**Technical Implementation:**
- Frontend: Pure JavaScript with GitHub API integration
- Backend: Optional Node.js with Express (for legacy support), featuring:
  - HTTPS/TLS support for secure connections
  - API key authentication
  - AES encryption for request/response payloads
  - CORS configuration for cross-origin requests
  - JSON file-based storage for audience data

**For Developers:**
The GitHub API integration is the primary method. The backend server in the `server/` directory is optional for backward compatibility. To use GitHub API:

1. Configure `github-api-helper.js` with your repository details
2. Create a GitHub Personal Access Token (see [GITHUB_API_SETUP.md](GITHUB_API_SETUP.md))
3. Update `GITHUB_TOKEN` in the configuration
4. The app will automatically fetch visitor count from `visitors.json`

To use the legacy backend server:

1. Navigate to the `server` directory
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.example` to `.env`)
4. Update `audience-counter.js` with your server URL and keys
5. Start the server: `npm start`

For detailed setup instructions, see `server/README.md` or [GITHUB_API_SETUP.md](GITHUB_API_SETUP.md).

**Security Features:**
- ✅ GitHub API with SHA-based concurrency control
- ✅ Optional backend with AES-256 encryption
- ✅ API key authentication (for backend)
- ✅ HTTPS/TLS support
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ No personal data collection

This feature showcases skills in:
- API development and integration
- GitHub API usage and best practices
- Concurrency handling
- Real-time data handling
- Privacy-focused design
- Full-stack development

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser
