# Diagnostics Plugin API Routes

This document describes the API routes needed to support the DiagnosticsStatusWidget and DiagnosticsManagementPage UI components.

## Routes to Add

All routes should be registered in the `onGatewayReady` hook of the diagnostics plugin.

### 1. GET /api/plugins/diagnostics/stats

Returns summary statistics for the widget.

**Response:**
```typescript
{
  uptime: number;              // Process uptime in seconds
  memoryUsed: string;          // e.g., "45.2 MB"
  memoryTotal: string;         // e.g., "128 MB"
  cpuUsage: number;            // Percentage (0-100)
  envVarsConfigured: number;   // Number of configured env vars
  envVarsTotal: number;        // Total number of checked env vars
  health: 'healthy' | 'warning' | 'error';
}
```

**Implementation:**
```typescript
app.get('/api/plugins/diagnostics/stats', (req, res) => {
  const memUsage = process.memoryUsage();
  const usage = process.cpuUsage();

  // Simple CPU usage calculation (may need more sophisticated approach)
  const cpuPercent = (usage.user + usage.system) / 1000000; // Convert to seconds

  // Check environment variables
  const envVars = ['NODE_ENV', 'DATABASE_URI', 'PAYLOAD_SECRET', 'LOGFIRE_TOKEN'];
  const configured = envVars.filter((key) => !!process.env[key]).length;

  res.json({
    uptime: process.uptime(),
    memoryUsed: formatBytes(memUsage.heapUsed),
    memoryTotal: formatBytes(memUsage.heapTotal),
    cpuUsage: Math.min(cpuPercent, 100),
    envVarsConfigured: configured,
    envVarsTotal: envVars.length,
    health: configured < envVars.length ? 'warning' : 'healthy',
  });
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

### 2. GET /api/plugins/diagnostics/full

Returns full diagnostics report (already implemented in plugin).

**Response:**
```typescript
{
  timestamp: string;           // ISO 8601 timestamp
  generated_for: string;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
    cwd: string;
    uptime: number;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
    };
  };
  envCheck: Record<string, boolean>;
  logs?: {
    startup?: string[];
    app?: string[];
  };
  health?: unknown;
}
```

**Note:** This endpoint is already implemented in the diagnostics plugin. Ensure it's accessible at the configured path (default: `/diagnostics/full`). The UI should call it at `/api/plugins/diagnostics/full`.

### 3. GET /api/plugins/diagnostics/logs/:type

Returns specific log type (startup or app).

**Response:**
```typescript
{
  type: 'startup' | 'app';
  lines: string[];
  totalLines: number;
  lastModified?: string;
}
```

**Implementation:**
```typescript
app.get('/api/plugins/diagnostics/logs/:type', (req, res) => {
  const logType = req.params.type as 'startup' | 'app';
  const lines = parseInt(req.query.lines as string) || 100;

  const logPath =
    logType === 'startup' ? config.logPaths?.startup : config.logPaths?.app;

  if (!logPath) {
    return res.status(404).json({ error: 'Log file not configured' });
  }

  try {
    const logLines = readLastNLines(logPath, lines);
    const stats = existsSync(logPath) ? statSync(logPath) : null;

    res.json({
      type: logType,
      lines: logLines,
      totalLines: logLines.length,
      lastModified: stats?.mtime.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to read last N lines from file
function readLastNLines(filePath: string, n: number): string[] {
  if (!existsSync(filePath)) return [];

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter((line) => line.trim());

  return lines.slice(-n);
}
```

### 4. GET /api/plugins/diagnostics/environment

Returns environment variable check status.

**Response:**
```typescript
{
  variables: Array<{
    name: string;
    configured: boolean;
    required: boolean;
  }>;
  summary: {
    total: number;
    configured: number;
    missing: number;
  };
}
```

**Implementation:**
```typescript
app.get('/api/plugins/diagnostics/environment', (req, res) => {
  const requiredVars = [
    'NODE_ENV',
    'DATABASE_URI',
    'PAYLOAD_SECRET',
    'LOGFIRE_TOKEN',
  ];

  const optionalVars = [
    'PORT',
    'REDIS_URL',
    'SMTP_HOST',
    'AWS_ACCESS_KEY',
  ];

  const variables = [
    ...requiredVars.map((name) => ({
      name,
      configured: !!process.env[name],
      required: true,
    })),
    ...optionalVars.map((name) => ({
      name,
      configured: !!process.env[name],
      required: false,
    })),
  ];

  const configured = variables.filter((v) => v.configured).length;

  res.json({
    variables,
    summary: {
      total: variables.length,
      configured,
      missing: variables.length - configured,
    },
  });
});
```

### 5. GET /api/plugins/diagnostics/system

Returns detailed system information.

**Response:**
```typescript
{
  process: {
    version: string;
    platform: string;
    arch: string;
    pid: number;
    uptime: number;
    cwd: string;
  };
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}
```

**Implementation:**
```typescript
app.get('/api/plugins/diagnostics/system', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    process: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      uptime: process.uptime(),
      cwd: process.cwd(),
    },
    memory: memUsage,
    cpu: cpuUsage,
  });
});
```

## Integration with Plugin

These routes should be registered in the `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register all API routes
  app.get('/api/plugins/diagnostics/stats', ...);
  app.get('/api/plugins/diagnostics/full', ...); // May already exist
  app.get('/api/plugins/diagnostics/logs/:type', ...);
  app.get('/api/plugins/diagnostics/environment', ...);
  app.get('/api/plugins/diagnostics/system', ...);
}
```

## Widget Registration

The plugin should also register its status widget and management page:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'diagnostics-status',
    title: 'System Diagnostics',
    component: 'DiagnosticsStatusWidget',
    props: { apiPrefix: '/api/plugins/diagnostics' },
    order: 30,
  });

  registry.registerPage({
    path: '/cpanel/plugins/diagnostics',
    title: 'System Diagnostics',
    component: 'DiagnosticsManagementPage',
    props: { apiPrefix: '/api/plugins/diagnostics' },
  });
}
```

## Security Considerations

1. **Log Access**: Never expose full log files - always limit to last N lines
2. **Environment Variables**: Never return actual values, only presence check
3. **System Info**: Be cautious about exposing system details in production
4. **Rate Limiting**: Consider rate limiting the diagnostics endpoints
5. **Authentication**: Ensure diagnostics endpoints require authentication

## Future Enhancements

1. **CPU Monitoring**: Implement proper CPU usage tracking over time
2. **Disk Usage**: Add disk space monitoring
3. **Network Stats**: Monitor network I/O
4. **Process List**: Show active processes and threads
5. **Real-time Updates**: WebSocket support for live system stats

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
