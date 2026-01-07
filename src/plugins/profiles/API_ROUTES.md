# Profiles Plugin API Routes

## Routes

### GET /api/profiles/stats
Returns profile statistics for the status widget.

**Response:** `{ totalProfiles, completeProfiles, incompleteProfiles, recentUpdates, health }`

### GET /api/profiles
Returns paginated list of user profiles with optional filtering.

**Query:** `limit, offset, status`

**Response:** `{ profiles: Array<{ id, userId, userEmail, displayName, avatarUrl, completionStatus, updatedAt, createdAt }>, total }`

### GET /api/profiles/:id
Returns detailed profile information.

### PATCH /api/profiles/:id
Update profile information.

### DELETE /api/profiles/:id
Delete a profile.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
