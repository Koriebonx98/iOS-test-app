# iOS-test-app

Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
- 📧 **Contact Me Button** - Easy email contact functionality using mailto: protocol
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

### Contact Me Button
- Prominent "Contact Me" button in the "Get in Touch" section
- Uses mailto: protocol to open default email client
- Pre-configured to send email to koriegrant@icloud.com
- Styled with blue gradient to match the app's design
- Works on all major browsers and email clients (Gmail, Outlook, Apple Mail, etc.)

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

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser 
