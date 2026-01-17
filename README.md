# iOS-test-app

Test web app for iOS with YouTube search functionality.

## Features

- 📱 Mobile-first responsive design
- 🎨 Modern, clean interface  
- ⚡ Fast and lightweight
- ✨ iOS optimized
- 🔍 YouTube video search (redirects to YouTube search results)

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

### Device Information
- Real-time display of user agent, screen size, and time
- Responsive to orientation changes

## Browser Compatibility

- iOS Safari (optimized)
- Chrome/Edge
- Firefox
- Any modern web browser 
