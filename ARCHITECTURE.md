# @qwickapps/server Architecture

## Overview

@qwickapps/server is a plugin-based application server framework for building websites, APIs, admin dashboards, and full-stack products. It provides a production-ready gateway pattern with built-in health monitoring, authentication, and extensible plugin architecture.

## System Design

### Gateway Architecture

The gateway pattern separates the control panel from the internal service, ensuring the admin dashboard remains responsive even if the API crashes:

```text
                                Internet
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                        Gateway (Public Port 3101)                          │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Express Application                          │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Helmet    │→ │    CORS     │→ │ Body Parser │→ │ Compression │  │  │
│  │  │ (Security)  │  │ (Origins)   │  │ (Cond.)     │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                      │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │                     Route Guards                              │   │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │  │
│  │  │  │   None   │  │  Basic   │  │  Auth0   │  │ Supabase │       │   │  │
│  │  │  │          │  │   Auth   │  │  OIDC    │  │  OAuth   │       │   │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌───────────────────────────────────────────────────────────────┐   │  │
│  │  │                      Route Handlers                           │   │  │
│  │  │                                                               │   │  │
│  │  │  /health        → Health Status (always enabled, public)      │   │  │
│  │  │  /{cpPath}/*    → Control Panel (optional, path configurable) │   │  │
│  │  │  /*             → Mounted Apps (proxy, static, or landing)    │   │  │
│  │  │                   Each with maintenance mode and fallback     │   │  │
│  │  └───────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        Mounted Apps Handler                           │ │
│  │                                                                       │ │
│  │  Each mounted app can be: proxy, static, or landing page              │ │
│  │  - Proxy: Forward requests to target service                          │ │
│  │  - Static: Serve files from disk                                      │ │
│  │  - Landing: Show configurable landing page with links                 │ │
│  │                                                                       │ │
│  │  All types support maintenance mode and service unavailable fallback  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    Internal Service (Port 3100, localhost only)            │
│                                                                            │
│  Your application's API endpoints, business logic, database connections    │
└────────────────────────────────────────────────────────────────────────────┘
```

### Plugin System

Plugins extend the server with custom functionality. Each plugin can register routes, health checks, and lifecycle hooks:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                              Plugin System                                  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Built-in Plugins                             │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │Health Plugin │  │ Logs Plugin  │  │Config Plugin │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │• HTTP Checks │  │• File logs   │  │• Env display │               │   │
│  │  │• Custom Chks │  │• Streaming   │  │• Masking     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │Postgres      │  │Cache Plugin  │  │FrontendApp   │               │   │
│  │  │Plugin        │  │              │  │Plugin        │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │• Pool mgmt   │  │• Redis cache │  │• Redirects   │               │   │
│  │  │• Transactions│  │• Key prefix  │  │• Static      │               │   │
│  │  │• Health chks │  │• TTL support │  │• Landing pg  │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │Auth Plugin   │  │Users Plugin  │  │Entitlements  │               │   │
│  │  │              │  │              │  │Plugin        │               │   │
│  │  │• Adapters    │  │• User CRUD   │  │              │               │   │
│  │  │  - Auth0     │  │• Search API  │  │• Source adapt│               │   │
│  │  │  - Basic     │  │• Ban mgmt    │  │• Grant/revoke│               │   │
│  │  │  - Supabase  │  │• Temp bans   │  │• Lookup API  │               │   │
│  │  │• RBAC        │  │• Callbacks   │  │• Dashboard   │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Custom Plugins                               │   │
│  │                                                                     │   │
│  │  interface ControlPanelPlugin {                                     │   │
│  │    name: string;                                                    │   │
│  │    order?: number;                                                  │   │
│  │    routes?: Route[];                                                │   │
│  │    onInit?: (ctx: PluginContext) => Promise<void>;                  │   │
│  │    onShutdown?: () => Promise<void>;                                │   │
│  │  }                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Health Manager

Centralized health check orchestration with caching and aggregation:

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Health Manager                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     Check Registry                          │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │HTTP Check│  │ Postgres │  │  Redis   │  │ Custom   │     │  │
│  │  │          │  │  Check   │  │  Check   │  │  Check   │     │  │
│  │  │ 10s int  │  │ 30s int  │  │ 30s int  │  │ N int    │     │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │  │
│  │       │             │             │             │           │  │
│  └───────┼─────────────┼─────────────┼─────────────┼───────────┘  │
│          │             │             │             │              │
│          ▼             ▼             ▼             ▼              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     Result Cache                            │  │
│  │                                                             │  │
│  │  { name: status, latency, lastChecked, details }            │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  GET /health                                │  │
│  │                                                             │  │
│  │  {                                                          │  │
│  │    status: "healthy" | "degraded" | "unhealthy",            │  │
│  │    timestamp: "...",                                        │  │
│  │    uptime: 12345,                                           │  │
│  │    checks: { ... }                                          │  │
│  │  }                                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Route Guard System

Unified authentication with multiple provider support:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Route Guard Flow                          │
│                                                              │
│  Request                                                     │
│     │                                                        │
│     ▼                                                        │
│  ┌──────────────────┐                                        │
│  │ Excluded Path?   │──── Yes ───────────────────────► Pass  │
│  │ /health, /api/*  │                                        │
│  └────────┬─────────┘                                        │
│           │ No                                               │
│           ▼                                                  │
│  ┌──────────────────┐                                        │
│  │  Guard Type?     │                                        │
│  └────────┬─────────┘                                        │
│           │                                                  │
│     ┌─────┴─────┬──────────────┬────────────┐                │
│     ▼           ▼              ▼            ▼                │
│ ┌────────┐ ┌────────┐   ┌──────────┐   ┌────────┐            │
│ │  None  │ │ Basic  │   │  Auth0   │   │Supabase│            │
│ │        │ │  Auth  │   │   OIDC   │   │  JWT   │            │
│ │  Pass  │ │        │   │          │   │        │            │
│ └────────┘ │ Check  │   │ Redirect │   │ Verify │            │
│            │ Header │   │ to login │   │ Token  │            │
│            └────────┘   └──────────┘   └────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```text
@qwickapps/server/
├── src/
│   ├── index.ts                    # Package entry point
│   ├── core/
│   │   ├── index.ts                # Core exports
│   │   ├── control-panel.ts        # Control panel factory
│   │   ├── gateway.ts              # Gateway pattern implementation
│   │   ├── guards.ts               # Route guard implementations
│   │   ├── health-manager.ts       # Health check orchestration
│   │   ├── logging.ts              # Logging subsystem
│   │   └── types.ts                # TypeScript interfaces
│   │
│   └── plugins/
│       ├── index.ts                # Plugin exports
│       ├── health-plugin.ts        # Health monitoring
│       ├── logs-plugin.ts          # Log viewer
│       ├── config-plugin.ts        # Configuration display
│       ├── diagnostics-plugin.ts   # System diagnostics
│       ├── frontend-app-plugin.ts  # Root path handling
│       ├── postgres-plugin.ts      # PostgreSQL connection pooling
│       ├── cache-plugin.ts         # Redis caching
│       ├── auth/                   # Auth plugin
│       │   ├── index.ts
│       │   ├── auth-plugin.ts      # Pluggable auth with adapters
│       │   ├── types.ts
│       │   └── adapters/
│       │       ├── auth0-adapter.ts
│       │       ├── basic-adapter.ts
│       │       └── supabase-adapter.ts
│       ├── users/                  # Users plugin
│       │   ├── index.ts
│       │   ├── users-plugin.ts     # User mgmt with ban support
│       │   ├── types.ts
│       │   └── stores/
│       │       └── postgres-store.ts
│       └── entitlements/           # Entitlements plugin
│           ├── index.ts
│           ├── entitlements-plugin.ts # Pluggable entitlements
│           ├── types.ts
│           └── sources/
│               ├── in-memory-source.ts
│               └── postgres-source.ts
│
├── ui/                             # React dashboard UI
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   └── components/
│   └── vite.config.ts
│
├── dist/                           # Compiled server code
├── dist-ui/                        # Built dashboard UI
├── tests/                          # Test files
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── ARCHITECTURE.md
```

### Maintenance and Fallback System

Mounted apps support maintenance mode and automatic fallback pages:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    Mounted App Request Flow                      │
│                                                                  │
│  Request                                                         │
│     │                                                            │
│     ▼                                                            │
│  ┌──────────────────┐                                            │
│  │ Maintenance Mode │──── Yes ────► Maintenance Page             │
│  │    Enabled?      │              (orange, ETA countdown)       │
│  └────────┬─────────┘                                            │
│           │ No                                                   │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │  Bypass Path?    │──── Yes ────► Continue to Service          │
│  │ /health, /api/*  │                                            │
│  └────────┬─────────┘                                            │
│           │ No                                                   │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ Proxy to Service │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│     ┌─────┴─────┐                                                │
│     ▼           ▼                                                │
│  Success    Error (ECONNREFUSED, timeout)                        │
│     │           │                                                │
│     ▼           ▼                                                │
│  Response   Service Unavailable Page                             │
│             (red, auto-refresh countdown)                        │
└─────────────────────────────────────────────────────────────────┘
```

**Maintenance Mode**: Orange-themed page with wrench icon, customizable ETA countdown, and optional contact URL.

**Service Unavailable**: Red-themed page with alert icon, auto-refresh countdown (default 30s), and retry button.

Both pages feature:
- Responsive design with dark mode support
- Smart content negotiation (JSON for API requests, HTML for browsers)
- Configurable titles and messages

## Key Components

### createGateway()

The main factory function for production deployments:

```typescript
const gateway = createGateway(
  {
    productName: 'My Service',
    gatewayPort: 3101,      // Public port
    servicePort: 3100,      // Internal API port
    controlPanelPath: '/cpanel',
    controlPanelGuard: { type: 'basic', username: 'admin', password: '...' },
    proxyPaths: ['/api'],
    plugins: [...],
  },
  async (port) => {
    // Service factory - creates your internal API
    const app = createMyApp();
    return { app, server: app.listen(port), shutdown: async () => {} };
  }
);

await gateway.start();
```

### createControlPanel()

Standalone control panel without gateway (for embedding):

```typescript
const controlPanel = createControlPanel({
  config: { productName: 'My App', port: 3101, ... },
  plugins: [...],
});

await controlPanel.start();
```

### Plugin Context

Plugins receive a context object with access to the application:

```typescript
interface PluginContext {
  config: ControlPanelConfig;
  app: Express.Application;
  router: Express.Router;
  logger: Logger;
  registerHealthCheck: (check: HealthCheck) => void;
}
```

## Security Considerations

### Authentication

- Basic auth uses HTTP WWW-Authenticate challenge
- Auth0 OIDC uses secure token exchange and HTTP-only cookies
- Supabase validates JWT tokens on each request
- Guards can exclude specific paths (e.g., `/health`)

### Headers

- Helmet middleware sets security headers
- CORS configured with explicit origins
- Content-Security-Policy allows inline scripts for dashboard UI

### Network Isolation

- Internal service binds to localhost only
- Only gateway port is exposed publicly
- Proxy middleware handles request forwarding securely

## Usage Patterns

### Production Gateway

```typescript
import { createGateway, createPostgresPlugin, createCachePlugin } from '@qwickapps/server';

const gateway = createGateway(
  {
    productName: 'My API',
    gatewayPort: 3101,
    servicePort: 3100,
    controlPanelPath: '/cpanel',
    controlPanelGuard: {
      type: 'basic',
      username: process.env.ADMIN_USER!,
      password: process.env.ADMIN_PASSWORD!,
    },
    proxyPaths: ['/api/v1'],
    plugins: [
      createPostgresPlugin({ connectionString: process.env.DATABASE_URL }),
      createCachePlugin({ url: process.env.REDIS_URL }),
    ],
  },
  async (port) => createMyApiService(port)
);

await gateway.start();
```

### Embedded Dashboard

```typescript
import { createControlPanel } from '@qwickapps/server';

const controlPanel = createControlPanel({
  config: { productName: 'Admin', port: 3101 },
  plugins: [],
});

// Use as middleware
myApp.use('/admin', controlPanel.app);
```

## Performance Considerations

- Health checks run on configurable intervals (not per-request)
- Results are cached and served from memory
- Proxy middleware streams responses (no buffering)
- PostgreSQL plugin uses connection pooling
- Cache plugin uses Redis pipelining where applicable

---

Copyright (c) 2025 QwickApps. All rights reserved.
