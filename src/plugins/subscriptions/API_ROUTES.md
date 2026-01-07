# Subscriptions Plugin API Routes

## Routes

### GET /api/subscriptions/stats
Returns subscription statistics for the status widget.

**Response:** `{ totalSubscriptions, activeSubscriptions, expiringSoon, cancelledToday, health }`

### GET /api/subscriptions
Returns paginated list of subscriptions with optional filtering.

**Query:** `limit, offset, filter`

**Response:** `{ subscriptions: Array<{ id, userId, userEmail, planName, status, startDate, endDate, autoRenew, amount }>, total }`

### POST /api/subscriptions
Create a new subscription.

### PATCH /api/subscriptions/:id
Update subscription (cancel, renew).

### DELETE /api/subscriptions/:id
Delete a subscription.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
