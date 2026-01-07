# Health Check Plugin API Routes

This document describes the API routes needed to support the HealthStatusWidget and HealthManagementPage UI components.

## Routes to Add

All routes should be registered in the `onGatewayReady` hook of the health plugin.

### 1. GET /api/plugins/health/summary

Returns aggregated health status across all registered health checks.

**Response:**
```typescript
{
  overall: 'healthy' | 'degraded' | 'unhealthy';
  totalChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  degradedChecks: number;
  checks: Array<{
    name: string;
    type: string;           // "http", "tcp", "custom"
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;       // Response time in ms
    message?: string;
    lastChecked: string;    // ISO 8601 timestamp
    details?: Record<string, unknown>;
  }>;
}
```

**Implementation:**
```typescript
app.get('/api/plugins/health/summary', async (req, res) => {
  const healthManager = registry.getHealthManager();
  const results = await healthManager.checkAll();

  const checks = results.map((result) => ({
    name: result.name,
    type: result.type,
    status: result.status,
    latency: result.latency,
    message: result.message,
    lastChecked: result.lastChecked.toISOString(),
    details: result.details,
  }));

  const healthyCount = checks.filter((c) => c.status === 'healthy').length;
  const degradedCount = checks.filter((c) => c.status === 'degraded').length;
  const unhealthyCount = checks.filter((c) => c.status === 'unhealthy').length;

  const overall =
    unhealthyCount > 0 ? 'unhealthy' :
    degradedCount > 0 ? 'degraded' : 'healthy';

  res.json({
    overall,
    totalChecks: checks.length,
    healthyChecks: healthyCount,
    unhealthyChecks: unhealthyCount,
    degradedChecks: degradedCount,
    checks,
  });
});
```

### 2. GET /api/plugins/health/checks/:name

Returns detailed status for a specific health check.

**Response:**
```typescript
{
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  lastChecked: string;
  details?: Record<string, unknown>;
  history?: Array<{
    timestamp: string;
    status: string;
    latency?: number;
  }>;
}
```

**Implementation:**
```typescript
app.get('/api/plugins/health/checks/:name', async (req, res) => {
  const healthManager = registry.getHealthManager();
  const checkName = req.params.name;

  const result = await healthManager.check(checkName);

  if (!result) {
    return res.status(404).json({ error: 'Health check not found' });
  }

  res.json({
    name: result.name,
    type: result.type,
    status: result.status,
    latency: result.latency,
    message: result.message,
    lastChecked: result.lastChecked.toISOString(),
    details: result.details,
    // TODO: Implement history tracking
    history: [],
  });
});
```

### 3. POST /api/plugins/health/checks/:name/run

Triggers an immediate health check for a specific check (useful for testing).

**Response:**
```typescript
{
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  timestamp: string;
}
```

**Implementation:**
```typescript
app.post('/api/plugins/health/checks/:name/run', async (req, res) => {
  const healthManager = registry.getHealthManager();
  const checkName = req.params.name;

  try {
    const result = await healthManager.runCheck(checkName);

    res.json({
      name: result.name,
      status: result.status,
      latency: result.latency,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 4. GET /api/plugins/health/aggregate

Returns aggregate health across all services (standard health endpoint format).

**Response:**
```typescript
{
  status: 'pass' | 'warn' | 'fail';
  version: string;
  releaseId: string;
  checks: {
    [name: string]: [{
      status: 'pass' | 'warn' | 'fail';
      time: string;
      output?: string;
    }]
  };
}
```

**Implementation:**
```typescript
app.get('/api/plugins/health/aggregate', async (req, res) => {
  const healthManager = registry.getHealthManager();
  const results = await healthManager.checkAll();

  const checks: Record<string, any[]> = {};

  for (const result of results) {
    checks[result.name] = [{
      status:
        result.status === 'healthy' ? 'pass' :
        result.status === 'degraded' ? 'warn' : 'fail',
      time: result.lastChecked.toISOString(),
      output: result.message,
    }];
  }

  const hasFailed = results.some((r) => r.status === 'unhealthy');
  const hasDegraded = results.some((r) => r.status === 'degraded');

  res.json({
    status: hasFailed ? 'fail' : hasDegraded ? 'warn' : 'pass',
    version: '1.0.0',
    releaseId: process.env.RELEASE_ID || 'unknown',
    checks,
  });
});
```

## Health Status Mapping

The plugin should map health check results to standardized statuses:

| Internal Status | API Status | Description |
|----------------|------------|-------------|
| `healthy: true` | `healthy` | Service operating normally |
| `healthy: false` | `unhealthy` | Service is down or failing |
| `latency > threshold` | `degraded` | Service is slow but functional |

**Degraded Thresholds:**
- HTTP checks: latency > 1000ms
- TCP checks: latency > 500ms
- Custom checks: up to implementation

## Integration with Plugin

These routes should be registered in the `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register all API routes
  app.get('/api/plugins/health/summary', ...);
  app.get('/api/plugins/health/checks/:name', ...);
  app.post('/api/plugins/health/checks/:name/run', ...);
  app.get('/api/plugins/health/aggregate', ...);
}
```

## Widget Registration

The plugin should also register its status widget and management page:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'health-status',
    title: 'Service Health',
    component: 'HealthStatusWidget',
    props: { apiPrefix: '/api/plugins/health' },
    order: 5,
  });

  registry.registerPage({
    path: '/cpanel/plugins/health',
    title: 'Service Health',
    component: 'HealthManagementPage',
    props: { apiPrefix: '/api/plugins/health' },
  });
}
```

## Health Check History (Future Enhancement)

To implement health check history:

1. Store last N check results in memory or database
2. Track status changes and timestamps
3. Calculate uptime percentage
4. Detect patterns (flapping, gradual degradation)

Example structure:
```typescript
interface HealthCheckHistory {
  checkName: string;
  results: Array<{
    timestamp: Date;
    status: string;
    latency?: number;
  }>;
  uptime: number;          // Percentage
  mtbf: number;            // Mean time between failures (seconds)
}
```

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
