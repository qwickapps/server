# @qwickapps/server

A flexible, pluggable control panel framework for QwickApps services. Provides a web-based dashboard with authentication, health monitoring, and extensible plugin architecture.

## Features

- **Gateway Pattern**: Production-ready gateway that proxies API requests while keeping control panel always responsive
- **Authentication**: Support for multiple auth providers (Supabase OAuth, Basic Auth, JWT, Custom)
- **Localhost Bypass**: Automatic auth bypass for local development
- **Plugin System**: Extensible architecture for adding custom functionality
- **Health Monitoring**: Built-in health check management with customizable checks
- **Theming**: Customizable branding and styling
- **Proxy Support**: Skip body parsing for specific paths to enable proxy middleware

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
    auth: {
      enabled: true,
      provider: 'supabase',
      skipAuthForLocalhost: true,
      supabase: {
        url: process.env.SUPABASE_URL!,
        anonKey: process.env.SUPABASE_ANON_KEY!,
        provider: 'google',
        allowedEmails: ['admin@example.com'],
      },
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
console.log(`Control panel running at http://localhost:3101`);
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
    authMode: 'basic',
    basicAuthUser: 'admin',
    basicAuthPassword: process.env.ADMIN_PASSWORD,
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
         Control Panel UI
         /api/health
         /api/diagnostics
```

The gateway is always responsive even if the internal API service crashes, allowing you to view diagnostics and error information.

## Configuration

### ControlPanelConfig

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `productName` | `string` | Yes | Name displayed in the dashboard |
| `port` | `number` | Yes | Port to run the control panel on |
| `version` | `string` | No | Product version to display |
| `branding` | `object` | No | Logo, primary color, favicon |
| `auth` | `AuthConfig` | No | Authentication configuration |
| `cors` | `object` | No | CORS origins configuration |
| `links` | `array` | No | Quick links for the dashboard |
| `skipBodyParserPaths` | `string[]` | No | Paths to skip body parsing (for proxy) |

### Authentication Providers

#### Supabase OAuth (Recommended)

```typescript
auth: {
  enabled: true,
  provider: 'supabase',
  skipAuthForLocalhost: true,
  supabase: {
    url: 'https://xxx.supabase.co',
    anonKey: 'your-anon-key',
    provider: 'google', // or 'github', 'azure', 'gitlab'
    allowedEmails: ['admin@company.com'], // Optional whitelist
    redirectUrl: '/auth/callback', // Default
  },
}
```

#### Basic Auth

```typescript
auth: {
  enabled: true,
  provider: 'basic',
  users: [
    { username: 'admin', password: 'secret' },
  ],
}
```

#### Custom Middleware

```typescript
auth: {
  enabled: true,
  provider: 'custom',
  customMiddleware: (req, res, next) => {
    // Your auth logic
    next();
  },
}
```

### Localhost Bypass

When `skipAuthForLocalhost` is `true` (default), requests from `localhost` or `127.0.0.1` skip authentication. This is useful for local development.

### Proxy Support

When using the control panel as a gateway with proxy middleware, configure `skipBodyParserPaths` to prevent body parsing from consuming the request body:

```typescript
config: {
  // ... other config
  skipBodyParserPaths: ['/api/v1', '/health'],
}

// Then add proxy middleware
controlPanel.app.use(createProxyMiddleware({
  target: 'http://localhost:3100',
  pathFilter: '/api/v1/**',
}));
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
        status: 'healthy',
        details: { message: 'All good' },
      }),
      interval: 30000,
    },
  ],
});
```

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
    context.logger.info('My plugin initialized');
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

### Built-in Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Dashboard UI |
| `/auth/login` | GET | OAuth login page (Supabase) |
| `/auth/callback` | GET | OAuth callback handler |
| `/auth/logout` | GET | Logout and clear session |
| `/api/health` | GET | Aggregated health status |
| `/api/diagnostics` | GET | System diagnostics |

## Environment Variables

```env
# Supabase OAuth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ALLOWED_EMAILS=admin@example.com,user@example.com

# Development
SKIP_AUTH_LOCALHOST=true
```

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
