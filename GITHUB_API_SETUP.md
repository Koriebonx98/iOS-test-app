# GitHub API Configuration Guide

This guide explains how to configure the GitHub API integration for visitor tracking.

## Overview

The visitor tracking feature now uses GitHub's Contents API to store visitor data directly in the repository's `visitors.json` file. This eliminates the need for a separate backend server.

## Prerequisites

- A GitHub account
- A GitHub repository (e.g., `Koriebonx98/iOS-test-app`)
- Basic knowledge of JavaScript

## Setup Instructions

### 1. Create a GitHub Personal Access Token (PAT)

To allow the app to update `visitors.json` in your repository, you need a GitHub Personal Access Token:

1. Go to GitHub Settings → [Developer settings](https://github.com/settings/tokens) → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "iOS Test App Visitor Tracker")
4. Set an expiration date (or select "No expiration" for testing)
5. Select the following scopes:
   - For **public repositories**: Select `public_repo`
   - For **private repositories**: Select the entire `repo` scope
6. Click "Generate token"
7. **Important**: Copy the token immediately! You won't be able to see it again.

### 2. Configure the GitHub API Helper

Open the `github-api-helper.js` file and update the configuration:

```javascript
const GITHUB_CONFIG = {
    // Repository details
    REPO_OWNER: 'Koriebonx98',        // Your GitHub username
    REPO_NAME: 'iOS-test-app',         // Your repository name
    BRANCH: 'main',                    // Branch to update (main or master)
    
    // GitHub Personal Access Token
    GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx', // Paste your token here
    
    // File path to visitors.json
    VISITORS_FILE_PATH: 'visitors.json',
    
    // ... other settings
};
```

### 3. Initialize visitors.json

If you don't already have a `visitors.json` file in your repository:

1. Create a new file named `visitors.json` in the root of your repository
2. Add an empty array as the initial content:
   ```json
   []
   ```
3. Commit and push the file

Alternatively, the system will automatically create the file on the first visitor.

## Security Considerations

### ⚠️ Token Security

**Important**: The GitHub token will be visible in the client-side JavaScript code. This poses a security risk:

1. **Rate Limiting**: GitHub API has rate limits. A malicious user could exhaust your limits.
2. **Unauthorized Updates**: Someone could use your token to make unauthorized changes.

### Recommended Security Practices

#### Option 1: Use a GitHub App (Most Secure)
Create a GitHub App with limited permissions and use installation tokens.

#### Option 2: Use a Serverless Proxy (Recommended for Production)
Instead of storing the token in the client code:

1. Create a serverless function (e.g., AWS Lambda, Vercel, Netlify Functions)
2. Store the GitHub token securely in environment variables
3. The client calls your serverless function
4. The serverless function calls GitHub API with the token

Example serverless function (Netlify):
```javascript
// netlify/functions/update-visitors.js
exports.handler = async (event) => {
    const visitorData = JSON.parse(event.body);
    const token = process.env.GITHUB_TOKEN; // Stored securely
    
    // Make GitHub API request with token
    // ... implementation
    
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

Update `github-api-helper.js`:
```javascript
// Instead of direct GitHub API calls
const response = await fetch('/.netlify/functions/update-visitors', {
    method: 'POST',
    body: JSON.stringify(visitorData)
});
```

#### Option 3: Read-Only Public Access
For public repositories, you can fetch visitor data without a token (read-only):

```javascript
GITHUB_TOKEN: '', // Empty for read-only access
```

However, this won't allow updating the file. You'd need the serverless proxy for writes.

## Testing

### Local Testing

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000 in your browser

3. Check the browser console for tracking logs:
   ```
   [Visitor Tracker] Initializing visitor tracking...
   [GitHub API] Fetching file: visitors.json
   [GitHub API] Updating file: visitors.json
   [Visitor Tracker] Successfully updated visitor data in GitHub repository
   ```

4. Verify the changes in your GitHub repository:
   - Go to your repository on GitHub
   - Open `visitors.json`
   - You should see your visitor data

### Debugging

Use the browser console to check status:

```javascript
// Check GitHub API configuration
console.log(window.githubAPI.config);

// Get current visitor stats
window.visitorTracker.getStats();

// Manually fetch visitors from GitHub
await window.githubAPI.fetchVisitors();

// Check pending queue
window.visitorTracker.getPendingQueue();
```

## Rate Limits

GitHub API has the following rate limits:

- **With authentication**: 5,000 requests per hour
- **Without authentication**: 60 requests per hour

Each visitor generates approximately:
- 1 request to fetch current `visitors.json`
- 1 request to update `visitors.json`
- Total: 2 requests per visitor

This means with authentication, you can handle ~2,500 unique visitors per hour.

## Troubleshooting

### Issue: "403 Forbidden" or "401 Unauthorized"

**Solution**: 
- Verify your GitHub token is correct
- Ensure the token has the right scopes (`public_repo` or `repo`)
- Check if the token has expired

### Issue: "404 Not Found"

**Solution**:
- Verify `REPO_OWNER` and `REPO_NAME` are correct
- Ensure the repository exists and is accessible
- For private repos, make sure the token has `repo` scope

### Issue: "409 Conflict" errors

**Solution**:
- This is expected during concurrent updates
- The retry mechanism should handle this automatically
- If it persists, check the console logs for details

### Issue: Rate limit exceeded

**Solution**:
- Implement caching to reduce API calls
- Use the serverless proxy approach
- Upgrade to a GitHub App for higher limits

## Fallback Behavior

If GitHub API fails, the app automatically falls back to localStorage:

1. Visitor data is stored locally in the browser
2. Data is queued for later synchronization
3. Queue is processed automatically every 5 minutes
4. Manual processing: `window.visitorTracker.processPendingQueue()`

## Production Deployment

For production deployment on GitHub Pages:

1. **Option A**: Use a serverless proxy (recommended)
   - Store the token securely in environment variables
   - Deploy a serverless function
   - Update the app to call the serverless function

2. **Option B**: Accept the security risk (not recommended)
   - Use a limited token with only repository access
   - Monitor your repository for unauthorized changes
   - Implement additional client-side validation

3. **Option C**: Hybrid approach
   - Use GitHub API for reading visitor count (no token needed for public repos)
   - Use a backend/serverless function for updates
   - Best of both worlds: fast reads, secure writes

## Additional Resources

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Serverless Functions Guide](https://www.netlify.com/products/functions/)

## Next Steps

1. ✅ Create GitHub Personal Access Token
2. ✅ Configure `github-api-helper.js` with your repository details and token
3. ✅ Test locally to ensure everything works
4. ✅ Deploy to GitHub Pages
5. ✅ Monitor for issues and adjust configuration as needed
6. 🔄 Consider implementing a serverless proxy for production security

## Support

If you encounter any issues, please check:
1. Browser console for error messages
2. GitHub repository for commit history
3. Network tab in DevTools for API requests
4. This guide for troubleshooting steps
