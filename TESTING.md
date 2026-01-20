# Testing the GitHub API Visitor Tracking Implementation

## Overview
This document provides instructions for testing the GitHub API-based visitor tracking feature.

## Prerequisites
- GitHub Personal Access Token (PAT) with `repo` or `public_repo` scope
- Web browser with JavaScript enabled
- Internet connection

## Setup for Testing

### 1. Configure GitHub Token

Edit `github-api-helper.js` and update the configuration:

```javascript
const GITHUB_CONFIG = {
    REPO_OWNER: 'Koriebonx98',
    REPO_NAME: 'iOS-test-app',
    BRANCH: 'main',
    GITHUB_TOKEN: 'ghp_YOUR_TOKEN_HERE', // Add your token here
    // ... rest of config
};
```

### 2. Test Without Token (Read-Only)

Even without a token, you can test reading visitor data:

1. Open the app in a browser
2. Open browser console (F12)
3. Run:
   ```javascript
   await window.githubAPI.fetchVisitors()
   await window.githubAPI.getVisitorCount()
   ```

This will fetch the current `visitors.json` from the repository (no token needed for public repos).

### 3. Test With Token (Full Functionality)

With a token configured:

1. Open the app in a browser
2. Check console for initialization messages:
   ```
   [Visitor Tracker] Initializing visitor tracking...
   [GitHub API] Fetching file: visitors.json
   [Visitor Tracker] New visitor detected. Generated UDID: xxx
   [GitHub API] Updating file: visitors.json
   [Visitor Tracker] Successfully updated visitor data in GitHub repository
   ```

3. Verify in GitHub:
   - Go to your repository
   - Open `visitors.json`
   - Check the commit history
   - You should see a new commit with your visitor data

### 4. Test Concurrent Updates

To test concurrency handling:

1. Open the app in multiple browser tabs simultaneously
2. Check console logs for conflict resolution:
   ```
   [GitHub API] Update attempt 1/4
   [GitHub API] Update attempt 2/4 (retry after conflict)
   [GitHub API] Update successful
   ```

### 5. Test Audience Counter

1. Open the app
2. Look for the "Live Audience" counter on the page
3. It should display the total number of unique visitors
4. Click "Check for Updates" button to manually refresh the count

### 6. Test Offline Behavior

1. Open the app online
2. Go offline (disable network in DevTools)
3. Reload the page
4. Check console:
   ```
   [Visitor Tracker] Falling back to localStorage storage
   [Visitor Tracker] Added visitor data to pending queue
   ```
5. Go back online
6. The queue should process automatically:
   ```
   [Visitor Tracker] Auto-processing pending queue...
   [Visitor Tracker] Processed queue: 1 sent, 0 remaining
   ```

## Expected Behavior

### First Visit
1. UDID is generated and stored in localStorage
2. New visitor record is created in `visitors.json`
3. Notification appears: "Welcome! Your visit will be tracked anonymously..."
4. Visitor count increments by 1

### Returning Visit
1. UDID is retrieved from localStorage
2. Existing visitor record is updated in `visitors.json`
3. Visit count increments
4. Last visit timestamp updates
5. Notification appears: "Welcome back! This is visit #X..."

### Concurrency
1. Multiple simultaneous visitors
2. Each update fetches the latest `visitors.json`
3. SHA-based conflict detection
4. Automatic retry with exponential backoff
5. All visitors successfully recorded

## Verification Checklist

- [ ] GitHub token configured
- [ ] App loads without JavaScript errors
- [ ] UDID generated and stored in localStorage
- [ ] `visitors.json` created/updated in repository
- [ ] Commit appears in repository history
- [ ] Visitor count displays correctly
- [ ] Returning visitor recognized correctly
- [ ] Visit count increments on each visit
- [ ] Offline mode queues data
- [ ] Queue processes when back online
- [ ] Concurrent updates handled correctly
- [ ] Error handling works gracefully

## Browser Console Commands

Useful commands for testing:

```javascript
// Get visitor stats
window.visitorTracker.getStats()

// Export all visitor data
window.visitorTracker.exportJSON()

// Clear visitor data (for testing)
window.visitorTracker.clearData()

// Check pending queue
window.visitorTracker.getPendingQueue()

// Process pending queue manually
await window.visitorTracker.processPendingQueue()

// Fetch visitors from GitHub
await window.githubAPI.fetchVisitors()

// Get visitor count
await window.githubAPI.getVisitorCount()

// Check GitHub API config
window.githubAPI.config
```

## Common Issues

### Issue: "GitHub token not configured"
- **Solution**: Add your GitHub token to `GITHUB_TOKEN` in `github-api-helper.js`

### Issue: "403 Forbidden"
- **Solution**: Verify token has correct permissions (`repo` or `public_repo`)

### Issue: "409 Conflict"
- **Solution**: This is normal for concurrent updates. The retry mechanism will handle it.

### Issue: Visitor count shows 0
- **Solution**: 
  1. Check if `visitors.json` exists in the repository
  2. Verify GitHub token is configured
  3. Check browser console for errors

## Success Indicators

✅ **Implementation Successful If:**
1. New visitors are automatically tracked
2. `visitors.json` updates in the repository
3. Visitor count displays correctly
4. Returning visitors are recognized
5. Concurrent updates don't cause data loss
6. Offline queue works properly
7. No JavaScript errors in console

## Next Steps

After successful testing:
1. Review security considerations in `GITHUB_API_SETUP.md`
2. Consider implementing a serverless proxy for production
3. Monitor GitHub API rate limits
4. Document any custom configurations
5. Deploy to GitHub Pages

## Support

For issues or questions:
1. Check browser console for detailed error messages
2. Review `GITHUB_API_SETUP.md` for configuration help
3. Verify all prerequisites are met
4. Test with the test page at `/tmp/github-api-test.html`
