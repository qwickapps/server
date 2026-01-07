# Usage Plugin API Routes

## Routes

### GET /api/usage/stats
Returns usage statistics for the status widget.

**Response:** `{ totalEvents, activeUsers, eventsToday, topFeature, health }`

### GET /api/usage/events
Returns paginated list of usage events.

**Query:** `limit, offset, userId, eventType`

**Response:** `{ events: Array<{ id, userId, userEmail, eventType, featureName, timestamp, metadata }>, total }`

### POST /api/usage/events
Log a new usage event.

### GET /api/usage/analytics
Returns usage analytics and trends.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
