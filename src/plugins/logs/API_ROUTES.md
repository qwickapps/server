# Logs Plugin API Routes

This document describes the API routes needed to support the LogsStatusWidget and LogsManagementPage UI components.

## Routes to Add

Most routes are already implemented in the logs plugin. These notes document their usage and any additional routes needed.

### 1. GET /api/plugins/logs/stats

Returns log statistics for the current source.

**Query Parameters:**
- `source` - Log source name (default: 'app')

**Response:**
```typescript
{
  totalLogs: number;
  byLevel: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  fileSize: number;
  fileSizeFormatted: string;
  oldestLog: string | null;
  newestLog: string | null;
}
```

**Note:** This endpoint is already implemented in the logs plugin at `/logs/stats`. The UI calls it at `/api/plugins/logs/stats`.

### 2. GET /api/plugins/logs/sources

Returns available log sources.

**Response:**
```typescript
{
  sources: Array<{
    name: string;
    type: string;       // "file" or "api"
  }>;
}
```

**Note:** Already implemented at `/logs/sources`. UI calls it at `/api/plugins/logs/sources`.

### 3. GET /api/plugins/logs

Returns log entries with optional filtering.

**Query Parameters:**
- `source` - Source name (default: first source)
- `limit` - Max entries to return (default: 100, max: 10000)
- `offset` - Pagination offset (default: 0)
- `level` - Filter by log level (debug, info, warn, error)
- `search` - Search query to filter messages
- `order` - Sort order ('asc' or 'desc', default: 'desc')

**Response:**
```typescript
{
  logs: Array<{
    id: number;
    level: string;
    timestamp: string;
    namespace: string;
    message: string;
    [key: string]: unknown;  // Additional fields from JSON logs
  }>;
  total: number;
}
```

**Note:** Already implemented at `/logs`. UI calls it at `/api/plugins/logs`.

### 4. GET /api/plugins/logs/download

Downloads the full log file.

**Query Parameters:**
- `source` - Source name

**Response:**
- Content-Type: text/plain
- Content-Disposition: attachment

**Implementation:**
```typescript
app.get('/api/plugins/logs/download', (req, res) => {
  const sources = getSources();
  const sourceName = (req.query.source as string) || sources[0]?.name;
  const source = sources.find((s) => s.name === sourceName);

  if (!source || source.type !== 'file' || !source.path) {
    return res.status(404).json({ error: 'Source not found or not a file' });
  }

  const resolvedPath = resolve(source.path);
  if (!existsSync(resolvedPath)) {
    return res.status(404).json({ error: 'Log file not found' });
  }

  res.download(resolvedPath, `${sourceName}.log`);
});
```

### 5. DELETE /api/plugins/logs/clear

Clears (truncates) a log file.

**Query Parameters:**
- `source` - Source name

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Implementation:**
```typescript
app.delete('/api/plugins/logs/clear', (req, res) => {
  const sources = getSources();
  const sourceName = (req.query.source as string) || sources[0]?.name;
  const source = sources.find((s) => s.name === sourceName);

  if (!source || source.type !== 'file' || !source.path) {
    return res.status(404).json({ error: 'Source not found or not a file' });
  }

  const resolvedPath = resolve(source.path);
  if (!existsSync(resolvedPath)) {
    return res.status(404).json({ error: 'Log file not found' });
  }

  try {
    writeFileSync(resolvedPath, '');
    res.json({ success: true, message: `Cleared ${sourceName} log` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
```

### 6. GET /api/plugins/logs/tail

Real-time log tailing (server-sent events).

**Query Parameters:**
- `source` - Source name
- `level` - Filter by level

**Response:**
- Content-Type: text/event-stream
- SSE stream of log entries

**Implementation:**
```typescript
import { watch } from 'fs';

app.get('/api/plugins/logs/tail', (req, res) => {
  const sources = getSources();
  const sourceName = (req.query.source as string) || sources[0]?.name;
  const levelFilter = req.query.level as string;
  const source = sources.find((s) => s.name === sourceName);

  if (!source || source.type !== 'file' || !source.path) {
    return res.status(404).json({ error: 'Source not found or not a file' });
  }

  const resolvedPath = resolve(source.path);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Watch file for changes
  const watcher = watch(resolvedPath, (eventType) => {
    if (eventType === 'change') {
      // Read last line
      const content = readFileSync(resolvedPath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim());
      const lastLine = lines[lines.length - 1];

      if (lastLine) {
        try {
          const log = JSON.parse(lastLine);
          if (!levelFilter || log.level === levelFilter) {
            res.write(`data: ${JSON.stringify(log)}\n\n`);
          }
        } catch (err) {
          // Not JSON, send raw line
          res.write(`data: ${JSON.stringify({ message: lastLine })}\n\n`);
        }
      }
    }
  });

  req.on('close', () => {
    watcher.close();
  });
});
```

## Integration with Plugin

These routes should be registered in the `onGatewayReady` hook:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Existing routes are already at /logs/*
  // Add API prefix versions for UI:
  app.get('/api/plugins/logs/stats', (req, res) => {
    // Proxy to /logs/stats
  });
  app.get('/api/plugins/logs/sources', (req, res) => {
    // Proxy to /logs/sources
  });
  app.get('/api/plugins/logs', (req, res) => {
    // Proxy to /logs
  });

  // New routes:
  app.get('/api/plugins/logs/download', ...);
  app.delete('/api/plugins/logs/clear', ...);
  app.get('/api/plugins/logs/tail', ...);
}
```

## Widget Registration

The plugin should also register its status widget and management page:

```typescript
async onGatewayReady(app: Express): Promise<void> {
  // Register API routes (see above)

  // Register control panel UI
  registry.registerWidget({
    id: 'logs-status',
    title: 'Application Logs',
    component: 'LogsStatusWidget',
    props: { apiPrefix: '/api/plugins/logs' },
    order: 40,
  });

  registry.registerPage({
    path: '/cpanel/plugins/logs',
    title: 'Application Logs',
    component: 'LogsManagementPage',
    props: { apiPrefix: '/api/plugins/logs' },
  });
}
```

## Log Parsing

The logs plugin expects JSON-formatted log entries with this structure:

```json
{
  "level": "info",
  "timestamp": "2025-12-26T12:00:00.000Z",
  "namespace": "app",
  "message": "Server started",
  "extra": "field"
}
```

For plain text logs, each line is wrapped in a log entry object.

## Performance Considerations

1. **Large Files**: Limit results to avoid reading entire file
2. **File Watching**: Use efficient file watching for tail feature
3. **Memory**: Stream large file downloads instead of loading into memory
4. **Caching**: Consider caching recent logs in memory
5. **Rotation**: Coordinate with log rotation to avoid missing entries

## Security Considerations

1. **Path Traversal**: Always resolve and validate file paths
2. **Authentication**: Require authentication for all log endpoints
3. **Sensitive Data**: Never log sensitive information (passwords, tokens)
4. **Download Limits**: Rate limit log downloads
5. **Clear Permission**: Require elevated permissions to clear logs

---

Copyright (c) 2025 QwickApps.com. All rights reserved.
