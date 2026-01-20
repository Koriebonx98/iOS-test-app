# Visitor Tracking and Version 1.1.0 Implementation

## Overview
This document describes the visitor tracking functionality and version update implemented in version 1.1.0 of the iOS-test-app.

## Changes Made

### 1. Version Update
- **version.json**: Updated from 1.0.9 to 1.1.0
- **manifest.json**: Updated from 1.0.9 to 1.1.0
- **Build Date**: 2026-01-20
- **Description**: Enhanced visitor tracking with real-time UDID-based tracking, automatic duplicate prevention, and seamless GitHub API integration for persistent visitor data storage.

### 2. Visitor Tracking Features

#### UDID-Based Tracking
The system automatically generates and tracks unique device identifiers (UDIDs) for each visitor:
- Format: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- Stored in localStorage for returning visitor recognition
- Persisted to `visitors.json` via GitHub API

#### Data Collected
For each visitor, the following data is tracked:
- `udid`: Unique Device Identifier
- `firstVisit`: ISO 8601 timestamp of first visit
- `lastVisit`: ISO 8601 timestamp of most recent visit
- `visitCount`: Total number of visits
- `userAgent`: Browser user agent string
- `screenSize`: Screen dimensions (e.g., "1920x1080")
- `language`: Browser language preference
- `platform`: Operating system/platform
- `timeZone`: Visitor's timezone
- `lastUpdated`: Timestamp of last data update

#### Duplicate Prevention
The system prevents duplicate visitor entries by:
1. Checking for existing UDID in the visitors array using `findIndex()`
2. If found, updating the existing record instead of creating a new one
3. Incrementing `visitCount` for returning visitors
4. Updating `lastVisit` timestamp

**Code Reference** (visitor-tracker.js, line 365):
```javascript
const existingVisitorIndex = visitors.findIndex(v => v.udid === udid);
```

#### GitHub API Integration
Visitor data is persisted to the repository using GitHub's Contents API:
- **File**: `visitors.json` in repository root
- **API Method**: `updateVisitorInGitHub()` in `github-api-helper.js`
- **Concurrency Safety**: Uses SHA-based updates to prevent conflicts
- **Retry Logic**: Automatic retry with exponential backoff on failures
- **Offline Support**: Failed requests are queued in localStorage

### 3. Test Data
Added three sample visitors to `visitors.json`:
1. iPhone user (3 visits)
2. iPad user (1 visit)
3. Mac user (5 visits)

## Testing

### Manual Testing
Use the test dashboard at `test-visitor-tracker.html` to:
1. Simulate new visitors with random UDIDs
2. Test returning visitor updates
3. Verify duplicate prevention
4. View visitor statistics
5. Inspect visitor data

### Test Scenarios
1. **New Visitor**: System generates UDID, creates new entry, `visitCount = 1`
2. **Returning Visitor**: System recognizes UDID, updates `lastVisit`, increments `visitCount`
3. **Duplicate Prevention**: System prevents duplicate UDID entries

## Privacy & Security
- Only anonymous UDIDs are tracked (no personal information)
- All tracking is transparent (logged to console)
- Users are notified about tracking
- Data can be cleared at any time
- GitHub API requires authentication token for updates

## Technical Implementation

### Key Files
- `visitor-tracker.js`: Main visitor tracking logic
- `github-api-helper.js`: GitHub API integration
- `visitors.json`: Visitor data storage
- `version.json`: Version metadata
- `test-visitor-tracker.html`: Testing dashboard (not committed to repo)

### Workflow
1. Page loads → `initVisitorTracking()` called
2. UDID retrieved/generated → `getOrCreateUDID()`
3. Visitor data loaded → `loadVisitorsData()`
4. Existing visitor check → `findIndex(v => v.udid === udid)`
5. Data updated → `saveVisitorsData()` (localStorage)
6. API update → `sendVisitorDataToGitHub()` (repository)

## Compatibility
- Works in all modern browsers
- iOS Safari optimized
- Progressive Web App (PWA) support
- Offline-first architecture with online sync

## Future Enhancements
- Analytics dashboard
- Visitor engagement metrics
- Geographic location tracking (with consent)
- Custom event tracking
- Export functionality for visitor data

---

**Version**: 1.1.0  
**Date**: 2026-01-20  
**Status**: ✅ Fully Implemented and Tested
