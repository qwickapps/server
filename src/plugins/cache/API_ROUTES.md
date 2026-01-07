# Redis Cache Plugin API Routes

This document describes the API routes needed to support the CacheStatusWidget and CacheManagementPage UI components.

## Routes to Add

All routes should be registered in the `onGatewayReady` hook of the cache plugin.

### 1. GET /api/plugins/cache/stats

Returns current cache statistics and performance metrics.

**Response:**
```typescript
{
  connected: boolean;
  keyCount: number;
  usedMemory: string;      // e.g., "15.2 MB"
  hitRate: number;         // Percentage (0-100)
  missRate: number;        // Percentage (0-100)
  opsPerSec: number;       // Operations per second
  health: 'healthy' | 'warning' | 'error' | 'disabled';
}
```

**Implementation:**
```typescript
app.get('/api/plugins/cache/stats', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const stats = await instance.getStats();
    const client = instance.getClient();

    // Get hit/miss stats from Redis INFO
    const info = await client.info('stats');
    const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
    const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
    const total = keyspaceHits + keyspaceMisses;

    res.json({
      connected: stats.connected,
      keyCount: stats.keyCount,
      usedMemory: stats.usedMemory || '0 B',
      hitRate: total > 0 ? (keyspaceHits / total) * 100 : 0,
      missRate: total > 0 ? (keyspaceMisses / total) * 100 : 0,
      opsPerSec: 0, // TODO: Calculate from instantaneous_ops_per_sec
      health: stats.connected ? 'healthy' : 'error',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 2. GET /api/plugins/cache/info

Returns detailed cache information including performance metrics and uptime.

**Response:**
```typescript
{
  connected: boolean;
  keyCount: number;
  usedMemory: string;
  hitRate: number;
  missRate: number;
  opsPerSec: number;
  uptime: number;          // Uptime in seconds
}
```

**Implementation:**
```typescript
app.get('/api/plugins/cache/info', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const client = instance.getClient();

    const stats = await instance.getStats();
    const info = await client.info();

    const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
    const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
    const total = keyspaceHits + keyspaceMisses;
    const uptime = parseInt(info.match(/uptime_in_seconds:(\d+)/)?.[1] || '0');

    res.json({
      connected: stats.connected,
      keyCount: stats.keyCount,
      usedMemory: stats.usedMemory || '0 B',
      hitRate: total > 0 ? (keyspaceHits / total) * 100 : 0,
      missRate: total > 0 ? (keyspaceMisses / total) * 100 : 0,
      opsPerSec: parseInt(info.match(/instantaneous_ops_per_sec:(\d+)/)?.[1] || '0'),
      uptime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 3. GET /api/plugins/cache/keys?pattern=*

Returns list of cached keys matching a pattern with metadata.

**Query Parameters:**
- `pattern` - Glob pattern to match keys (default: '*')

**Response:**
```typescript
Array<{
  key: string;
  type: string;           // "string", "list", "set", "zset", "hash"
  ttl: number;            // TTL in seconds (-1 = no expiry, -2 = key not found)
  size: number;           // Memory size in bytes
}>
```

**Implementation:**
```typescript
app.get('/api/plugins/cache/keys', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const client = instance.getClient();
    const pattern = (req.query.pattern as string) || '*';

    // Use SCAN instead of KEYS for better performance
    const keys = await instance.scanKeys(pattern, { count: 100 });

    // Get metadata for each key
    const keysWithMeta = await Promise.all(
      keys.slice(0, 100).map(async (key) => {
        const [type, ttl, memory] = await Promise.all([
          client.type(key),
          instance.ttl(key),
          client.memory('USAGE', key).catch(() => 0),
        ]);

        return {
          key,
          type,
          ttl,
          size: memory || 0,
        };
      })
    );

    res.json(keysWithMeta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 4. GET /api/plugins/cache/keys/:key/value

Returns the value for a specific key.

**Response:**
```typescript
{
  key: string;
  type: string;
  ttl: number;
  value: string;          // JSON stringified value
}
```

**Implementation:**
```typescript
app.get('/api/plugins/cache/keys/:key/value', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const client = instance.getClient();
    const key = decodeURIComponent(req.params.key);

    const [type, ttl, value] = await Promise.all([
      client.type(key),
      instance.ttl(key),
      instance.getRaw(key),
    ]);

    res.json({
      key,
      type,
      ttl,
      value: value || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 5. DELETE /api/plugins/cache/keys/:key

Deletes a specific key from cache.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Implementation:**
```typescript
app.delete('/api/plugins/cache/keys/:key', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const key = decodeURIComponent(req.params.key);

    const deleted = await instance.delete(key);
    res.json({
      success: deleted,
      message: deleted ? 'Key deleted' : 'Key not found',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

### 6. POST /api/plugins/cache/flush

Flushes all keys with the configured prefix.

**Response:**
```typescript
{
  success: boolean;
  keysDeleted: number;
  message: string;
}
```

**Implementation:**
```typescript
app.post('/api/plugins/cache/flush', async (req, res) => {
  try {
    const instance = getCache(instanceName);
    const keysDeleted = await instance.flush();

    res.json({
      success: true,
      keysDeleted,
      message: `Flushed ${keysDeleted} keys`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      keysDeleted: 0,
      message: err.message,
    });
  }
});
```

## Integration with Plugin

These routes should be registered in the `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register all API routes
  app.get('/api/plugins/cache/stats', ...);
  app.get('/api/plugins/cache/info', ...);
  app.get('/api/plugins/cache/keys', ...);
  app.get('/api/plugins/cache/keys/:key/value', ...);
  app.delete('/api/plugins/cache/keys/:key', ...);
  app.post('/api/plugins/cache/flush', ...);
}
```

## Widget Registration

The plugin should also register its status widget and management page:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'cache-status',
    title: 'Redis Cache',
    component: 'CacheStatusWidget',
    props: { apiPrefix: '/api/plugins/cache' },
    order: 20,
  });

  registry.registerPage({
    path: '/cpanel/plugins/cache',
    title: 'Redis Cache',
    component: 'CacheManagementPage',
    props: { apiPrefix: '/api/plugins/cache' },
  });
}
```

## Performance Considerations

1. **SCAN vs KEYS**: Always use `scanKeys()` instead of `keys()` to avoid blocking Redis on large datasets
2. **Limit Results**: Limit key listings to 100-1000 items to prevent overwhelming the UI
3. **Pagination**: Consider implementing cursor-based pagination for large key sets
4. **Memory Usage**: Use `MEMORY USAGE` command carefully as it can be expensive on large values
5. **Hit Rate Calculation**: Cache hit/miss stats come from Redis INFO command, which is relatively cheap

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
