# Bans Plugin API Routes

This document describes the API routes needed to support the BansStatusWidget and BansManagementPage UI components.

## Routes to Implement

### 1. GET /api/bans/stats

Returns ban statistics for the status widget.

**Response:**
```typescript
{
  totalBans: number;
  activeBans: number;
  permanentBans: number;
  temporaryBans: number;
  recentBans: number;  // Last 7 days
  health: 'healthy' | 'warning' | 'error';
}
```

### 2. GET /api/bans

Returns paginated list of bans.

**Query Parameters:**
- `limit` - Max bans to return (default: 100)
- `offset` - Pagination offset
- `status` - Filter by status ('active', 'expired', 'lifted')
- `type` - Filter by type ('permanent', 'temporary')
- `userId` - Filter by user ID

**Response:**
```typescript
{
  bans: Array<{
    id: string;
    userId: string;
    userEmail: string;
    reason: string;
    type: 'permanent' | 'temporary';
    status: 'active' | 'expired' | 'lifted';
    createdAt: string;
    expiresAt?: string;
    createdBy?: string;
    metadata?: Record<string, unknown>;
  }>;
  total: number;
}
```

### 3. GET /api/bans/:id

Returns detailed information for a specific ban.

**Response:**
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  reason: string;
  type: 'permanent' | 'temporary';
  status: 'active' | 'expired' | 'lifted';
  createdAt: string;
  expiresAt?: string;
  liftedAt?: string;
  createdBy?: string;
  liftedBy?: string;
  metadata?: Record<string, unknown>;
}
```

### 4. POST /api/bans

Creates a new ban.

**Request Body:**
```typescript
{
  userId: string;
  reason: string;
  type: 'permanent' | 'temporary';
  expiresAt?: string;  // Required for temporary bans
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  id: string;
  userId: string;
  status: 'active';
  createdAt: string;
}
```

### 5. PATCH /api/bans/:id

Updates a ban (lift, extend, modify reason).

**Request Body:**
```typescript
{
  status?: 'lifted';
  reason?: string;
  expiresAt?: string;
}
```

**Response:**
```typescript
{
  id: string;
  status: string;
  updatedAt: string;
}
```

### 6. DELETE /api/bans/:id

Permanently removes a ban record (admin only).

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 7. POST /api/bans/lift

Bulk lift multiple bans.

**Request Body:**
```typescript
{
  banIds: string[];
  reason?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  liftedCount: number;
}
```

### 8. GET /api/bans/check/:userId

Check if a user is currently banned.

**Response:**
```typescript
{
  isBanned: boolean;
  ban?: {
    id: string;
    reason: string;
    type: 'permanent' | 'temporary';
    expiresAt?: string;
  };
}
```

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Only admin roles can create and manage bans
3. **Audit Logging**: Log all ban operations (create, lift, delete)
4. **User Notification**: Notify users when banned or unbanned
5. **Appeal Process**: Consider implementing ban appeal workflow
6. **Escalation**: Track repeated ban violations
7. **Privacy**: Handle ban reasons according to privacy regulations

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
