# Preferences Plugin API Routes

This document describes the API routes needed to support the PreferencesStatusWidget and PreferencesManagementPage UI components.

## Routes to Implement

### 1. GET /api/preferences/stats

Returns preference statistics for the status widget.

**Response:**
```typescript
{
  totalPreferences: number;
  activeUsers: number;
  preferenceSets: number;
  recentUpdates: number;  // Last 7 days
  health: 'healthy' | 'warning' | 'error';
}
```

### 2. GET /api/preferences

Returns user preferences.

**Query Parameters:**
- `userId` - Filter by user ID (admins only)
- `scope` - Filter by scope ('user', 'global', 'app')
- `key` - Filter by preference key pattern

**Response:**
```typescript
{
  preferences: Array<{
    key: string;
    value: unknown;
    type: 'string' | 'number' | 'boolean' | 'json';
    scope: 'user' | 'global' | 'app';
    updatedAt: string;
    userId?: string;
  }>;
}
```

### 3. GET /api/preferences/sets

Returns list of preference sets (admin).

**Response:**
```typescript
{
  sets: Array<{
    id: string;
    userId?: string;
    userEmail?: string;
    scope: 'user' | 'global' | 'app';
    preferenceCount: number;
    updatedAt: string;
    createdAt: string;
  }>;
}
```

### 4. GET /api/preferences/:key

Returns a specific preference value.

**Response:**
```typescript
{
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  scope: 'user' | 'global' | 'app';
  updatedAt: string;
}
```

### 5. PUT /api/preferences/:key

Sets or updates a preference value.

**Request Body:**
```typescript
{
  value: unknown;
  scope?: 'user' | 'global' | 'app';
}
```

**Response:**
```typescript
{
  key: string;
  value: unknown;
  updatedAt: string;
}
```

### 6. DELETE /api/preferences/:key

Deletes a preference.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

### 7. POST /api/preferences/bulk

Bulk update multiple preferences.

**Request Body:**
```typescript
{
  preferences: Array<{
    key: string;
    value: unknown;
    scope?: 'user' | 'global' | 'app';
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  updatedCount: number;
}
```

### 8. DELETE /api/preferences/user/:userId

Delete all preferences for a user (admin only).

**Response:**
```typescript
{
  success: boolean;
  deletedCount: number;
}
```

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**:
   - Users can only access their own preferences
   - Admins can access all preferences
   - Global preferences require admin to modify
3. **Validation**: Validate preference values against schema
4. **Type Safety**: Enforce type constraints on preference values
5. **Privacy**: Handle preference data according to privacy regulations
6. **Audit Logging**: Log preference changes for compliance
7. **Rate Limiting**: Prevent abuse of bulk operations

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
