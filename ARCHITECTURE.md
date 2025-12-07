# @qwickapps/server Architecture

## Overview

The control panel is a reusable Express-based framework for building administrative dashboards with authentication, health monitoring, and extensible plugin architecture.

## System Design

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        @qwickapps/server                            │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Express Application                          │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Helmet    │→ │    CORS     │→ │ Body Parser │→ │ Compression │  │  │
│  │  │ (Security)  │  │ (Origins)   │  │ (Cond.)     │  │             │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │         │                                                            │  │
│  │         ▼                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                    Authentication Layer                         │ │  │
│  │  │                                                                 │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │ │  │
│  │  │  │ Supabase │  │  Basic   │  │   JWT    │  │  Custom  │         │ │  │
│  │  │  │  OAuth   │  │   Auth   │  │   Auth   │  │Middleware│         │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │ │  │
│  │  │                                                                 │ │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐   │ │  │
│  │  │  │              Localhost Bypass (Development)              │   │ │  │
│  │  │  └──────────────────────────────────────────────────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  │         │                                                            │  │
│  │         ▼                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │                      Route Handlers                             │ │  │
│  │  │                                                                 │ │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │ │  │
│  │  │  │Dashboard │  │  Auth    │  │  Health  │  │ Plugins  │         │ │  │
│  │  │  │   UI     │  │  Routes  │  │   API    │  │  Routes  │         │ │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Plugin System                                │  │
│  │                                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │Health Plugin │  │  Log Plugin  │  │Custom Plugin │  ...           │  │
│  │  │              │  │              │  │              │                │  │
│  │  │• HTTP Checks │  │• Stats       │  │• Custom      │                │  │
│  │  │• Custom Chks │  │• Logfire     │  │  Routes      │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       Health Manager                                 │  │
│  │                                                                      │  │
│  │  • Registers health checks from plugins                              │  │
│  │  • Periodic check execution                                          │  │
│  │  • Aggregated health status                                          │  │
│  │  • Status caching with TTL                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Authentication System

The authentication layer supports multiple providers with a unified interface:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                      │
│                                                             │
│  Request                                                    │
│     │                                                       │
│     ▼                                                       │
│  ┌──────────────────┐                                       │
│  │ Localhost Check  │──── Is localhost? ──── Yes ───► Pass  │
│  └────────┬─────────┘                                       │
│           │ No                                              │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │ Provider Router  │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│     ┌─────┴─────┬─────────────┬────────────┐                │
│     ▼           ▼             ▼            ▼                │
│ ┌────────┐ ┌────────┐   ┌────────┐   ┌────────┐             │
│ │Supabase│ │ Basic  │   │  JWT   │   │ Custom │             │
│ │ OAuth  │ │  Auth  │   │  Auth  │   │Midware │             │
│ └────────┘ └────────┘   └────────┘   └────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Supabase OAuth Flow

```text
1. User visits protected route
2. Middleware checks for auth cookie
3. If no cookie, redirect to /auth/login
4. Login page initiates OAuth with Supabase
5. User authenticates with provider (Google, GitHub, etc.)
6. Callback receives tokens, validates email whitelist
7. Sets secure HTTP-only cookie with JWT
8. User redirected to original destination
```

### Plugin System

Plugins extend the control panel with custom functionality:

```typescript
interface ControlPanelPlugin {
  name: string;           // Unique identifier
  order?: number;         // Display/init order
  routes?: Route[];       // Custom API routes
  initialize?: (ctx) => Promise<void>;
  shutdown?: () => Promise<void>;
}
```

Plugin lifecycle:

1. Registration during `createControlPanel()`
2. Routes mounted on Express app
3. `initialize()` called with plugin context
4. Health checks registered via context
5. `shutdown()` called on server stop

### Health Manager

Centralized health check orchestration:

```text
┌──────────────────────────────────────────────────────────────┐
│                      Health Manager                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Check Registry                      │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │  │
│  │  │HTTP Check│  │TCP Check │  │Custom Fn │  ...         │  │
│  │  │ interval │  │ interval │  │ interval │              │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘              │  │
│  │       │             │             │                    │  │
│  └───────┼─────────────┼─────────────┼────────────────────┘  │
│          │             │             │                       │
│          ▼             ▼             ▼                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   Result Cache                         │  │
│  │                                                        │  │
│  │  { name: status, latency, lastChecked, details }       │  │
│  └────────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              GET /api/health                           │  │
│  │                                                        │  │
│  │  { status: "healthy|unhealthy", checks: {...} }        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Body Parser Bypass

For gateway/proxy use cases, body parsing can be selectively disabled:

```text
Request
   │
   ▼
┌──────────────────┐
│ Path Check       │
│                  │
│ /api/v1/*? ──────┼──── Yes ───► Skip body parsing ───► Proxy
│ /health?   ──────┼──── Yes ───► Skip body parsing ───► Proxy
│                  │
└────────┬─────────┘
         │ No
         ▼
┌──────────────────┐
│  express.json()  │
│                  │
│  Parse body for  │
│  control panel   │
│  routes          │
└──────────────────┘
```

## File Structure

```text
qwickapps-control-panel/
├── src/
│   ├── core/
│   │   ├── index.ts            # Public exports
│   │   ├── control-panel.ts    # Main factory function
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── health-manager.ts   # Health check orchestration
│   │   └── supabase-auth.ts    # OAuth implementation
│   │
│   └── index.ts                # Package entry point
│
├── dist/                       # Compiled output
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── ARCHITECTURE.md
```

## Security Considerations

### Authentication

- Supabase OAuth uses secure token exchange
- JWT stored in HTTP-only cookies (XSS protection)
- Email whitelist restricts access to authorized users
- Localhost bypass only in development

### Headers

- Helmet middleware sets security headers
- CORS configured with explicit origins
- Content-Security-Policy allows inline scripts for basic UI

### Session Management

- JWT tokens have configurable expiration
- Logout clears cookies and redirects
- No sensitive data stored client-side

## Usage Patterns

### As Standalone Dashboard

```typescript
const controlPanel = createControlPanel({
  config: { productName: 'My App', port: 3101, ... },
  plugins: [createHealthPlugin({ ... })],
});

await controlPanel.start();
```

### As Gateway with Proxy

```typescript
const controlPanel = createControlPanel({
  config: {
    productName: 'API Gateway',
    port: 3101,
    skipBodyParserPaths: ['/api/v1'],
    ...
  },
});

// Add proxy middleware after control panel creation
controlPanel.app.use(createProxyMiddleware({
  target: 'http://localhost:3100',
  pathFilter: '/api/v1/**',
}));

await controlPanel.start();
```

### Embedded in Existing App

```typescript
const controlPanel = createControlPanel({ ... });

// Use controlPanel.app as middleware
myApp.use('/admin', controlPanel.app);
```
