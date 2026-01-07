# API Keys Plugin API Routes

This document describes the API routes needed to support the ApiKeysStatusWidget and ApiKeysManagementPage UI components.

## Routes to Implement

### 1. GET /api/api-keys/stats

Returns API key statistics for the status widget.

**Response:**
```typescript
{
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  recentlyUsed: number;  // Last 7 days
  health: 'healthy' | 'warning' | 'error';
}
```

### 2. GET /api/api-keys

Returns paginated list of API keys.

**Query Parameters:**
- `limit` - Max keys to return (default: 100)
- `offset` - Pagination offset
- `status` - Filter by status ('active', 'expired', 'revoked')
- `userId` - Filter by user ID

**Response:**
```typescript
{
  keys: Array<{
    id: string;
    name: string;
    key: string;
    userId?: string;
    status: 'active' | 'expired' | 'revoked';
    permissions: string[];
    createdAt: string;
    expiresAt?: string;
    lastUsedAt?: string;
    usageCount: number;
  }>;
  total: number;
}
```

### 3. GET /api/api-keys/:id

Returns detailed information for a specific API key.

**Response:**
```typescript
{
  id: string;
  name: string;
  key: string;
  userId?: string;
  status: 'active' | 'expired' | 'revoked';
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  metadata?: Record<string, unknown>;
}
```

### 4. POST /api/api-keys

Creates a new API key.

**Request Body:**
```typescript
{
  name: string;
  userId?: string;
  permissions: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  key: string;  // Full key shown only once
  createdAt: string;
}
```

### 5. PATCH /api/api-keys/:id

Updates an API key (permissions, name, etc.).

**Request Body:**
```typescript
{
  name?: string;
  permissions?: string[];
  status?: 'active' | 'revoked';
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}
```

### 6. DELETE /api/api-keys/:id

Revokes (soft deletes) an API key.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 7. POST /api/api-keys/revoke

Bulk revoke multiple API keys.

**Request Body:**
```typescript
{
  keyIds: string[];
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

1. **Authentication**: All endpoints require authentication
2. **Authorization**: Only authorized users can manage API keys
3. **Key Storage**: Store hashed versions of keys, never plaintext
4. **Key Display**: Show full key only once at creation
5. **Rate Limiting**: Strict limits on key creation and usage
6. **Audit Logging**: Log all key operations (create, revoke, usage)
7. **Permissions**: Implement fine-grained permission checks
8. **Expiration**: Enforce key expiration policies

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
