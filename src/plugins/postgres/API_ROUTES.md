# PostgreSQL Plugin API Routes

This document describes the API routes needed to support the PostgresStatusWidget and PostgresManagementPage UI components.

## Routes to Add

All routes should be registered in the `onGatewayReady` hook of the postgres plugin.

### 1. GET /api/plugins/postgres/stats

Returns current pool statistics and health metrics.

**Response:**
```typescript
{
  total: number;           // Total connections in pool
  idle: number;            // Idle connections
  waiting: number;         // Waiting requests
  active: number;          // Active connections (calculated)
  utilization: number;     // Percentage (active/total * 100)
  queryCount: number;      // Queries processed in last minute
  avgQueryTime: number;    // Average query time in ms
  health: 'healthy' | 'warning' | 'error';
}
```

**Implementation:**
```typescript
app.get('/api/plugins/postgres/stats', (req, res) => {
  const instance = getPostgres(instanceName);
  const poolStats = instance.getStats();

  res.json({
    total: poolStats.total,
    idle: poolStats.idle,
    waiting: poolStats.waiting,
    active: poolStats.total - poolStats.idle,
    utilization: ((poolStats.total - poolStats.idle) / poolStats.total) * 100,
    queryCount: 0, // TODO: Implement query counter
    avgQueryTime: 0, // TODO: Implement query timing
    health: poolStats.waiting > 10 ? 'error' :
            poolStats.waiting > 5 ? 'warning' : 'healthy',
  });
});
```

### 2. GET /api/plugins/postgres/connections

Returns active database connections with query details.

**Response:**
```typescript
Array<{
  pid: number;
  user: string;
  database: string;
  state: string;
  query: string;
  duration: number;
  waitEvent: string | null;
}>
```

**Implementation:**
```typescript
app.get('/api/plugins/postgres/connections', async (req, res) => {
  try {
    const instance = getPostgres(instanceName);
    const connections = await instance.query(`
      SELECT
        pid,
        usename as user,
        datname as database,
        state,
        COALESCE(query, '<idle>') as query,
        EXTRACT(EPOCH FROM (now() - query_start)) * 1000 as duration,
        wait_event as "waitEvent"
      FROM pg_stat_activity
      WHERE datname = current_database()
      ORDER BY query_start DESC NULLS LAST
    `);

    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 3. GET /api/plugins/postgres/query-logs

Returns recent query execution logs.

**Response:**
```typescript
Array<{
  id: string;
  timestamp: string;
  query: string;
  duration: number;
  rows: number;
  status: 'success' | 'error';
}>
```

**Implementation:**
```typescript
// Note: This requires query logging to be implemented in the plugin
// For now, return empty array or sample data
app.get('/api/plugins/postgres/query-logs', (req, res) => {
  res.json([]);
  // TODO: Implement query logging middleware
});
```

### 4. GET /api/plugins/postgres/config

Returns current pool configuration (masked sensitive data).

**Response:**
```typescript
{
  url: string;                 // Masked connection string
  maxConnections: number;
  minConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
}
```

**Implementation:**
```typescript
app.get('/api/plugins/postgres/config', (req, res) => {
  res.json({
    url: config.url.replace(/:[^:@]+@/, ':***@'),
    maxConnections: config.maxConnections ?? 20,
    minConnections: config.minConnections ?? 2,
    idleTimeoutMs: config.idleTimeoutMs ?? 30000,
    connectionTimeoutMs: config.connectionTimeoutMs ?? 5000,
    statementTimeoutMs: config.statementTimeoutMs ?? 0,
  });
});
```

### 5. POST /api/plugins/postgres/connections/:pid/kill

Terminates a specific database connection.

**Request:**
- URL param: `pid` - Process ID of connection to kill

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Implementation:**
```typescript
app.post('/api/plugins/postgres/connections/:pid/kill', async (req, res) => {
  try {
    const instance = getPostgres(instanceName);
    await instance.query('SELECT pg_terminate_backend($1)', [req.params.pid]);
    res.json({ success: true, message: 'Connection terminated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

## Integration with Plugin

These routes should be registered in the `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register all API routes
  app.get('/api/plugins/postgres/stats', ...);
  app.get('/api/plugins/postgres/connections', ...);
  app.get('/api/plugins/postgres/query-logs', ...);
  app.get('/api/plugins/postgres/config', ...);
  app.post('/api/plugins/postgres/connections/:pid/kill', ...);
}
```

## Widget Registration

The plugin should also register its status widget and management page:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'postgres-status',
    title: 'PostgreSQL Database',
    component: 'PostgresStatusWidget',
    props: { apiPrefix: '/api/plugins/postgres' },
    order: 10,
  });

  registry.registerPage({
    path: '/cpanel/plugins/postgres',
    title: 'PostgreSQL Database',
    component: 'PostgresManagementPage',
    props: { apiPrefix: '/api/plugins/postgres' },
  });
}
```

## Query Logging Enhancement (Future)

To implement query logging:

1. Add query interceptor in the `query()` method
2. Store query metadata in memory or database
3. Track execution time, row count, errors
4. Implement circular buffer to limit memory usage
5. Expose via `/query-logs` endpoint

Example structure:
```typescript
interface QueryLog {
  id: string;
  timestamp: Date;
  query: string;
  params?: unknown[];
  duration: number;
  rows: number;
  status: 'success' | 'error';
  error?: string;
}

const queryLogs: QueryLog[] = []; // Circular buffer, max 1000 entries
```

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
