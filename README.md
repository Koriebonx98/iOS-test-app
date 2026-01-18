# iOS-test-app

Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
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

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser 
