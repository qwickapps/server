# Parental Plugin API Routes

## Routes

### GET /api/parental/stats
Returns parental control statistics for the status widget.

**Response:** `{ totalControls, activeControls, protectedAccounts, recentViolations, health }`

### GET /api/parental
Returns paginated list of parental controls.

**Query:** `limit, offset, status`

**Response:** `{ controls: Array<{ id, childUserId, childEmail, parentUserId, parentEmail, restrictions, status, createdAt, updatedAt }>, total }`

### POST /api/parental
Create a new parental control.

### PATCH /api/parental/:id
Update parental control restrictions.

### DELETE /api/parental/:id
Remove parental control.

### GET /api/parental/violations
Returns list of policy violations.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
