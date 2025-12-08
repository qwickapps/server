# @qwickapps/server

A flexible, pluggable control panel framework for QwickApps services. Provides a web-based dashboard with authentication, health monitoring, and extensible plugin architecture.

## Features

- **Gateway Pattern**: Production-ready gateway that proxies API requests while keeping control panel always responsive
- **Configurable Mount Paths**: Control panel mounts at `/cpanel` by default, reserving root for frontend apps
- **Route Guards**: Unified authentication system supporting Basic Auth, Supabase OAuth, and Auth0
- **Plugin System**: Extensible architecture for adding custom functionality
- **Health Monitoring**: Built-in health check management with customizable checks
- **Frontend App Support**: Handle root path with redirect, static files, or landing page
- **Theming**: Customizable branding and styling

## Installation

```bash
pnpm add @qwickapps/server
```

## Quick Start

```typescript
import { createControlPanel, createHealthPlugin } from '@qwickapps/server';

const controlPanel = createControlPanel({
  config: {
    productName: 'My Service',
    port: 3101,
    version: '1.0.0',
    mountPath: '/cpanel',
    guard: {
      type: 'basic',
      username: 'admin',
      password: process.env.ADMIN_PASSWORD!,
      realm: 'My Service Control Panel',
      excludePaths: ['/api/health'],
    },
  },
  plugins: [
    createHealthPlugin({
      checks: [
        {
          name: 'database',
          type: 'http',
          url: 'http://localhost:5432/health',
          interval: 10000,
        },
      ],
    }),
  ],
});

await controlPanel.start();
console.log(`Control panel running at http://localhost:3101/cpanel`);
```

## Gateway Pattern

For production deployments, use `createGateway` to run a gateway that:
1. Serves the control panel UI (always responsive, even if the API crashes)
2. Proxies API requests to an internal service
3. Handles graceful error responses when the internal service is down

```typescript
import { createGateway, createHealthPlugin } from '@qwickapps/server';
import { createApp } from './app.js';

const gateway = createGateway(
  {
    productName: 'My Service',
    gatewayPort: 3101,  // Public port (control panel)
    servicePort: 3100,  // Internal port (API)
    controlPanelPath: '/cpanel',
    controlPanelGuard: {
      type: 'basic',
      username: 'admin',
      password: process.env.ADMIN_PASSWORD!,
      realm: 'My Service Control Panel',
      excludePaths: ['/health', '/api/v1'],
    },
    proxyPaths: ['/api/v1'],
    plugins: [
      createHealthPlugin({
        checks: [
          { name: 'api', type: 'http', url: 'http://localhost:3100/health' },
        ],
      }),
    ],
  },
  // Service factory - creates the internal API service
  async (port) => {
    const app = createApp();
    const server = app.listen(port);
    return {
      app,
      server,
      shutdown: async () => { server.close(); },
    };
  }
);

await gateway.start();
```

### Gateway Architecture

```
Internet → Gateway (3101, public) → API Service (3100, internal)
                ↓
         Control Panel UI (/cpanel)
         /cpanel/api/health
         /cpanel/api/diagnostics
```

The gateway is always responsive even if the internal API service crashes, allowing you to view diagnostics and error information.

## Configuration

### ControlPanelConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `productName` | `string` | Yes | Name displayed in the dashboard |
| `port` | `number` | Yes | Port to run the control panel on |
| `version` | `string` | No | Product version to display |
| `mountPath` | `string` | No | Path to mount control panel (default: `/cpanel`) |
| `guard` | `RouteGuardConfig` | No | Authentication guard configuration |
| `branding` | `object` | No | Logo, primary color, favicon |
| `cors` | `object` | No | CORS origins configuration |
| `links` | `array` | No | Quick links for the dashboard |
| `skipBodyParserPaths` | `string[]` | No | Paths to skip body parsing (for proxy) |
| `logoUrl` | `string` | No | Custom logo URL for the landing page |

### Route Guards

The unified guard system provides authentication for the control panel. All guards support `excludePaths` to allow unauthenticated access to specific routes.

#### No Authentication

```typescript
guard: { type: 'none' }
```

#### Basic Auth

```typescript
guard: {
  type: 'basic',
  username: 'admin',
  password: process.env.ADMIN_PASSWORD!,
  realm: 'Control Panel',
  excludePaths: ['/api/health'],
}
```

#### Supabase OAuth

```typescript
guard: {
  type: 'supabase',
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  excludePaths: ['/api/health'],
}
```

#### Auth0 OpenID Connect

Requires `express-openid-connect` as a peer dependency.

```typescript
guard: {
  type: 'auth0',
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  baseUrl: 'https://myapp.example.com',
  secret: process.env.AUTH0_SECRET!,
  routes: {
    login: '/login',
    logout: '/logout',
    callback: '/callback',
  },
  excludePaths: ['/api/health'],
}
```

### Mount Paths

By default, the control panel mounts at `/cpanel`, reserving the root path (`/`) for frontend applications:

```typescript
// Control panel at /cpanel
config: {
  mountPath: '/cpanel',  // Dashboard at /cpanel, API at /cpanel/api/*
}

// Or mount at root (legacy behavior)
config: {
  mountPath: '/',  // Dashboard at /, API at /api/*
}
```

### Frontend App Plugin

Handle the root path when control panel is mounted elsewhere:

```typescript
import { createFrontendAppPlugin } from '@qwickapps/server';

// Redirect to external URL
createFrontendAppPlugin({
  redirectUrl: 'https://myapp.example.com',
})

// Serve static files
createFrontendAppPlugin({
  staticPath: './dist',
})

// Show landing page with links
createFrontendAppPlugin({
  landingPage: {
    title: 'My Service',
    heading: 'Welcome',
    description: 'Select a destination',
    links: [
      { label: 'Control Panel', url: '/cpanel' },
      { label: 'API Docs', url: '/docs' },
    ],
  },
})
```

## Plugins

### Built-in Plugins

#### Health Plugin

Monitors service health with configurable checks:

```typescript
import { createHealthPlugin } from '@qwickapps/server';

createHealthPlugin({
  checks: [
    {
      name: 'api',
      type: 'http',
      url: 'http://localhost:3000/health',
      interval: 10000,
      timeout: 5000,
    },
    {
      name: 'custom',
      type: 'custom',
      check: async () => ({
        healthy: true,
        details: { message: 'All good' },
      }),
      interval: 30000,
    },
  ],
});
```

#### Diagnostics Plugin

```typescript
import { createDiagnosticsPlugin } from '@qwickapps/server';

createDiagnosticsPlugin({});
```

#### Config Plugin

```typescript
import { createConfigPlugin } from '@qwickapps/server';

createConfigPlugin({
  show: ['NODE_ENV', 'PORT', 'DATABASE_URL'],
  mask: ['SECRET', 'PASSWORD', 'KEY', 'TOKEN'],
});
```

#### Logs Plugin

```typescript
import { createLogsPlugin } from '@qwickapps/server';

createLogsPlugin({
  sources: [
    { name: 'app', type: 'file', path: './logs/app.log' },
    { name: 'error', type: 'file', path: './logs/error.log' },
  ],
});
```

#### PostgreSQL Plugin

Provides connection pooling, transactions, and health checks for PostgreSQL databases.

```typescript
import { createPostgresPlugin, getPostgres } from '@qwickapps/server';

// Register the plugin
createPostgresPlugin({
  connectionString: process.env.DATABASE_URL,
  // Or individual options:
  // host: 'localhost',
  // port: 5432,
  // database: 'mydb',
  // user: 'postgres',
  // password: 'secret',
  maxConnections: 20,
  healthCheckInterval: 30000,
});

// Use in your code
const pg = getPostgres();
const result = await pg.query('SELECT * FROM users WHERE id = $1', [userId]);

// With transactions
await pg.withTransaction(async (client) => {
  await client.query('INSERT INTO orders ...');
  await client.query('UPDATE inventory ...');
});
```

**Exports:**
- `createPostgresPlugin(config)` - Create and register the plugin
- `getPostgres(name?)` - Get a PostgreSQL instance (throws if not registered)
- `hasPostgres(name?)` - Check if an instance is registered
- `PostgresInstance` - TypeScript type for the instance

#### Cache Plugin

Redis-based caching with key prefixing, TTL support, and pattern operations.

```typescript
import { createCachePlugin, getCache } from '@qwickapps/server';

// Register the plugin
createCachePlugin({
  url: process.env.REDIS_URL,
  // Or individual options:
  // host: 'localhost',
  // port: 6379,
  // password: 'secret',
  keyPrefix: 'myapp:',
  defaultTTL: 3600, // 1 hour default
  healthCheckInterval: 30000,
});

// Use in your code
const cache = getCache();

// Basic operations
await cache.set('user:123', userData, 600); // TTL in seconds
const user = await cache.get('user:123');
await cache.delete('user:123');

// Pattern operations
const keys = await cache.keys('user:*');
await cache.deletePattern('session:*');

// Stats and maintenance
const stats = await cache.getStats();
await cache.flush(); // Clear all keys with prefix
```

**Exports:**
- `createCachePlugin(config)` - Create and register the plugin
- `getCache(name?)` - Get a cache instance (throws if not registered)
- `hasCache(name?)` - Check if an instance is registered
- `CacheInstance` - TypeScript type for the instance

### Creating Custom Plugins

```typescript
import type { ControlPanelPlugin, PluginContext } from '@qwickapps/server';

const myPlugin: ControlPanelPlugin = {
  name: 'my-plugin',
  order: 10,
  routes: [
    {
      method: 'get',
      path: '/my-plugin/status',
      handler: async (req, res) => {
        res.json({ status: 'ok' });
      },
    },
  ],
  initialize: async (context: PluginContext) => {
    context.logger.debug('My plugin initialized');
  },
  shutdown: async () => {
    // Cleanup
  },
};
```

## API Reference

### createControlPanel(options)

Creates a new control panel instance.

**Returns**: `ControlPanelInstance`

```typescript
interface ControlPanelInstance {
  app: Express.Application;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  registerPlugin: (plugin: ControlPanelPlugin) => void;
  getHealthStatus: () => Promise<HealthStatus>;
}
```

### createRouteGuard(config)

Creates authentication middleware from guard configuration.

```typescript
import { createRouteGuard } from '@qwickapps/server';

const guard = createRouteGuard({
  type: 'basic',
  username: 'admin',
  password: 'secret',
});

app.use(guard);
```

### isAuthenticated(req)

Check if current request is authenticated.

```typescript
import { isAuthenticated } from '@qwickapps/server';

if (isAuthenticated(req)) {
  // User is authenticated
}
```

### getAuthenticatedUser(req)

Get authenticated user information.

```typescript
import { getAuthenticatedUser } from '@qwickapps/server';

const user = getAuthenticatedUser(req);
// { id: string; email?: string; name?: string; }
```

### Built-in Routes

Routes are mounted at the configured `mountPath` (default `/cpanel`):

| Route | Method | Description |
|-------|--------|-------------|
| `{mountPath}/` | GET | Dashboard UI |
| `{mountPath}/api/health` | GET | Aggregated health status |
| `{mountPath}/api/diagnostics` | GET | System diagnostics |
| `{mountPath}/api/config` | GET | Configuration (if plugin enabled) |
| `{mountPath}/api/logs` | GET | Log viewer (if plugin enabled) |

## License

This software is licensed under the **PolyForm Shield License 1.0.0**.

### What This Means

**Permitted Uses:**
- Internal business applications
- Learning and educational projects
- Non-competitive commercial applications
- Academic research and teaching
- Building applications that use this control panel framework

**Prohibited Uses:**
- Creating competing control panel frameworks
- Building competing developer tools or dashboards
- Reselling or redistributing as a competing product
- Reverse engineering to create competitive products

For full license terms, see [PolyForm Shield 1.0.0](https://polyformproject.org/licenses/shield/1.0.0/).

For commercial licensing options, contact **legal@qwickapps.com**.

---

Copyright (c) 2025 QwickApps. All rights reserved.
