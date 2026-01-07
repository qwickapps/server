# Auth Plugin API Routes

This document describes the API routes needed to support the AuthStatusWidget and AuthManagementPage UI components.

## Routes to Implement

### 1. GET /api/auth/stats

Returns authentication statistics for the status widget.

**Response:**
```typescript
{
  totalProviders: number;
  activeProviders: number;
  totalSessions: number;
  activeSessions: number;
  recentLogins: number;  // Last 7 days
  health: 'healthy' | 'warning' | 'error';
}
```

### 2. GET /api/auth/providers

Returns list of configured authentication providers.

**Response:**
```typescript
{
  providers: Array<{
    id: string;
    name: string;
    type: 'oauth2' | 'saml' | 'local' | 'ldap';
    status: 'active' | 'inactive';
    userCount: number;
    lastUsed?: string;
    config?: Record<string, unknown>;
  }>;
}
```

### 3. GET /api/auth/sessions

Returns list of active authentication sessions.

**Query Parameters:**
- `limit` - Max sessions to return (default: 100)
- `offset` - Pagination offset
- `userId` - Filter by user ID

**Response:**
```typescript
{
  sessions: Array<{
    id: string;
    userId: string;
    userEmail: string;
    provider: string;
    createdAt: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
  total: number;
}
```

### 4. DELETE /api/auth/sessions/:id

Revoke a specific authentication session.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 5. POST /api/auth/sessions/revoke

Revoke multiple sessions (bulk operation).

**Request Body:**
```typescript
{
  sessionIds: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  revokedCount: number;
}
```

## Security Considerations

1. **Authentication**: All endpoints require admin authentication
2. **Authorization**: Only admin roles can manage auth providers and sessions
3. **Rate Limiting**: Apply strict rate limits to prevent abuse
4. **Audit Logging**: Log all session revocations and provider changes
5. **Session Security**: Ensure secure session token storage and transmission
6. **Provider Secrets**: Never expose provider secrets in API responses

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
