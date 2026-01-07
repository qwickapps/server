# Users Plugin API Routes

This document describes the API routes needed to support the UsersStatusWidget and UsersManagementPage UI components.

## Routes to Implement

The users plugin should expose these API routes for the UI components.

### 1. GET /api/users/stats

Returns user statistics for the status widget.

**Response:**
```typescript
{
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  suspendedUsers: number;
  recentSignups: number;  // Last 7 days
  health: 'healthy' | 'warning' | 'error';
}
```

**Implementation:**
```typescript
app.get('/api/users/stats', async (req, res) => {
  const stats = await usersPlugin.getStats();
  res.json(stats);
});
```

### 2. GET /api/users

Returns paginated list of users with optional filtering.

**Query Parameters:**
- `limit` - Max users to return (default: 100, max: 1000)
- `offset` - Pagination offset (default: 0)
- `q` - Search query (searches email and name)
- `status` - Filter by status ('invited', 'active', 'suspended')
- `provider` - Filter by auth provider

**Response:**
```typescript
{
  users: Array<{
    id: string;
    email: string;
    name?: string;
    provider?: string;
    status: 'invited' | 'active' | 'suspended';
    created_at: string;
    last_login_at?: string;
    picture?: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

**Implementation:**
```typescript
app.get('/api/users', async (req, res) => {
  const { limit = 100, offset = 0, q, status, provider } = req.query;

  const users = await usersPlugin.listUsers({
    limit: Math.min(parseInt(limit as string), 1000),
    offset: parseInt(offset as string),
    search: q as string,
    status: status as UserStatus,
    provider: provider as string,
  });

  res.json(users);
});
```

### 3. GET /api/users/:id

Returns detailed information for a specific user.

**Response:**
```typescript
{
  id: string;
  email: string;
  name?: string;
  provider?: string;
  status: 'invited' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  picture?: string;
  metadata?: Record<string, unknown>;
}
```

**Implementation:**
```typescript
app.get('/api/users/:id', async (req, res) => {
  const user = await usersPlugin.getUser(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});
```

### 4. POST /api/users

Creates a new user (invite).

**Request Body:**
```typescript
{
  email: string;
  name?: string;
  status?: 'invited' | 'active';
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  id: string;
  email: string;
  name?: string;
  status: 'invited' | 'active';
  created_at: string;
}
```

**Implementation:**
```typescript
app.post('/api/users', async (req, res) => {
  const { email, name, status = 'invited', metadata } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await usersPlugin.createUser({
    email,
    name,
    status,
    metadata,
  });

  res.status(201).json(user);
});
```

### 5. PATCH /api/users/:id

Updates user information or status.

**Request Body:**
```typescript
{
  name?: string;
  status?: 'invited' | 'active' | 'suspended';
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  id: string;
  email: string;
  name?: string;
  status: 'invited' | 'active' | 'suspended';
  updated_at: string;
}
```

**Implementation:**
```typescript
app.patch('/api/users/:id', async (req, res) => {
  const { name, status, metadata } = req.body;

  const user = await usersPlugin.updateUser(req.params.id, {
    name,
    status,
    metadata,
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});
```

### 6. DELETE /api/users/:id

Deletes a user account.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Implementation:**
```typescript
app.delete('/api/users/:id', async (req, res) => {
  const deleted = await usersPlugin.deleteUser(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ success: true, message: 'User deleted' });
});
```

## Integration with Plugin

These routes should be registered in the users plugin's `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Stats endpoint
  app.get('/api/users/stats', async (req, res) => {
    const stats = await this.getStats();
    res.json(stats);
  });

  // List users
  app.get('/api/users', async (req, res) => {
    // Implementation
  });

  // Get user
  app.get('/api/users/:id', async (req, res) => {
    // Implementation
  });

  // Create user
  app.post('/api/users', async (req, res) => {
    // Implementation
  });

  // Update user
  app.patch('/api/users/:id', async (req, res) => {
    // Implementation
  });

  // Delete user
  app.delete('/api/users/:id', async (req, res) => {
    // Implementation
  });
}
```

## Widget Registration

The plugin should also register its UI components:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'users-status',
    title: 'User Management',
    component: 'UsersStatusWidget',
    props: { apiPrefix: '/api/users' },
    order: 20,
  });

  registry.registerPage({
    path: '/cpanel/plugins/users',
    title: 'User Management',
    component: 'UsersManagementPage',
    props: { apiPrefix: '/api/users' },
  });
}
```

## Security Considerations

1. **Authentication**: All user management endpoints require authentication
2. **Authorization**: Only admin users should access user management
3. **Rate Limiting**: Apply rate limits to prevent abuse
4. **Input Validation**: Validate all email addresses and user data
5. **Audit Logging**: Log all user management actions
6. **PII Protection**: Handle user data according to privacy regulations
7. **Deletion**: Implement soft delete or hard delete based on requirements

## Performance Considerations

1. **Pagination**: Always paginate user lists to avoid loading large datasets
2. **Indexing**: Index frequently queried fields (email, status, created_at)
3. **Caching**: Cache user statistics for the status widget
4. **Search**: Use database full-text search for better performance
5. **Bulk Operations**: Implement bulk suspend/activate for efficiency

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
