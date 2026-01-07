# Devices Plugin API Routes

## Routes

### GET /api/devices/stats
Returns device statistics for the status widget.

**Response:** `{ totalDevices, activeDevices, registeredToday, pendingApproval, health }`

### GET /api/devices
Returns paginated list of devices with optional filtering by status.

**Query:** `limit, offset, status`

**Response:** `{ devices: Array<{ id, userId, userEmail, deviceName, deviceType, platform, status, registeredAt, lastActiveAt }>, total }`

### POST /api/devices
Register a new device.

### PATCH /api/devices/:id
Update device (approve, deactivate).

### DELETE /api/devices/:id
Remove a device.

---
Copyright (c) 2025 QwickApps.com. All rights reserved.
