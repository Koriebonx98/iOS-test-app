# iOS-test-app

Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
- 🔍 YouTube video search functionality

## Setup Instructions

### YouTube Search API Configuration

To enable the YouTube search functionality:

1. **Get a YouTube Data API v3 key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API key)
   - Copy your API key

2. **Add your API key to the app:**
   - Open `app.js`
   - Find the line: `const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key
   - Save the file

3. **Test the functionality:**
   - Open `index.html` in a web browser
   - Use the YouTube search bar to search for videos
   - Click on any result to open it in YouTube

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
- Search for YouTube videos by keyword
- View video thumbnails, titles, channels, and publish dates
- Click results to open videos in YouTube
- Cached results for offline viewing
- Responsive design for mobile and desktop

### Interactive Counter
- Click tracking with localStorage persistence
- Haptic feedback on iOS devices

### Device Information
- Real-time display of user agent, screen size, and time
- Responsive to orientation changes

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser with ES6+ support

## Security Notes

- **Never commit your actual API key to public repositories**
- Consider using environment variables for production deployments
- The YouTube Data API key should be restricted to your domain in Google Cloud Console 
