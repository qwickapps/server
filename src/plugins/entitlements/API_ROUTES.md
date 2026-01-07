# Entitlements Plugin API Routes

## Routes

### GET /api/entitlements/stats
Returns entitlement statistics for the status widget.

**Response:** `{ totalEntitlements, activeEntitlements, expiredEntitlements, recentGrants, health }`

### GET /api/entitlements
Returns paginated list of entitlements with optional filtering.

**Query:** `limit, offset, status`

**Response:** `{ entitlements: Array<{ id, userId, userEmail, featureName, status, grantedAt, expiresAt, grantedBy }>, total }`

### POST /api/entitlements
Grant a new entitlement.

### PATCH /api/entitlements/:id
Update entitlement (extend, revoke).

### DELETE /api/entitlements/:id
Delete an entitlement.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
