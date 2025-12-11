# @qwickapps/server - Product Vision & Architecture

> **Version**: 1.x (Foundation Release)
> **Status**: Active Development
> **Last Updated**: 2025-12-08

## Executive Summary

`@qwickapps/server` is a **product assembly framework** that provides well-designed, battle-tested plugins to rapidly compose production-ready applications. Instead of rebuilding infrastructure for each product (QwickForge, AuthKeaper, SuvaiSpot, etc.), teams assemble products from reusable subsystems.

The framework introduces **traffic-light deployment support** - a multi-instance architecture where:

- **Green (Gateway)**: Always-available routing layer, handles authentication, health, and traffic orchestration
- **Yellow/Red (Services)**: Independently deployable backend services with instant promotion/rollback
- **Frontend**: Separately deployable UI with its own release lifecycle

---

## Problem Statement

Every product in the QwickApps monorepo rebuilds the same infrastructure:

| Subsystem | Products Implementing |
|-----------|----------------------|
| Database connections | QwickForge (5 services), AuthKeaper, Log Server |
| Authentication | BrainQuis (Supabase), AuthKeaper (Auth0), QwickForge (custom) |
| Logging | All products - inconsistent implementations |
| Health checks | Manually implemented per service |
| Rate limiting | Partial implementations |
| Configuration | dotenv everywhere, no validation |
| Static file serving | Express.static repeated |

**Result**: Duplicated effort, inconsistent quality, maintenance burden across 20+ subprojects.

---

## Solution: Plugin-Based Product Assembly

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Product (e.g., QwickForge)                      │
│                                                                         │
│   ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│   │  Gateway (Green) │───▶│ Service (Yellow) │    │  Frontend (PWA)  │  │
│   │  Port 3101       │    │ Port 3100        │    │  dist-ui/        │  │
│   │  Always up       │    │ Hot-swappable    │    │  Separate deploy │  │
│   └──────────────────┘    └──────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Assembled from @qwickapps/server plugins
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          @qwickapps/server                              │
│                                                                         │
│  Core Plugins (v1.2 - Shipped)      │  v1.3+ Plugins (Planned)          │
│  ────────────────────────────────   │  ─────────────────────────────    │
│  ✅ health      (custom)            │  🔲 auth       (pluggable adapters)│
│  ✅ diagnostics (custom)            │  🔲 users      (pluggable storage) │
│  ✅ config      (env display)       │  🔲 auth0-mgmt (tenant management) │
│  ✅ logs        (file reader)       │  🔲 automation (workflow engine)  │
│  ✅ gateway     (proxy pattern)     │  🔲 roles      (RBAC/entitlements)│
│  ✅ postgres    (pg pooling)        │  🔲 routing    (http-proxy-middleware)   │
│  ✅ cache       (ioredis)           │  🔲 static     (express.static+SPA)      │
│  ✅ frontend-app (landing/static)   │  🔲 traffic    (deployment orchestration)│
└───────────────────────────────────────────────────────────────────────────────┘
                                    │
                    Wraps battle-tested libraries
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Underlying Libraries                             │
│                                                                        │
│  drizzle-orm │ passport │ @auth0/node │ keyv │ ioredis │ pino          │
│  http-proxy-middleware │ helmet │ express-rate-limit │ terminus        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Existing QwickApps Packages Integration

The following packages already exist and should integrate with `@qwickapps/server`:

| Package | Purpose | Integration Strategy |
|---------|---------|---------------------|
| `@qwickapps/logging` | Structured logging | ✅ Already integrated as dependency |
| `@qwickapps/auth` | Auth contracts & types | Wrap in `auth` plugin as foundation |
| `@qwickapps/auth-client` | Client-side auth | Use with frontend apps |
| `@qwickapps/auth-backend` | Server-side auth | Wrap in `auth` plugin |
| `@qwickapps/auth0-client` | Auth0 M2M client | Wrap as auth adapter |
| `@qwickapps/automation` | Workflow engine | Create `automation` plugin |
| `@qwickapps/cms` | Payload CMS toolkit | Integrate via `payload` plugin |
| `@qwickapps/schema` | Zod schemas | Use for config validation |
| `@qwickapps/react-framework` | Frontend framework | ✅ Already peer dependency |
| `@qwickapps/keap-client` | Keap CRM client | Wrap as service plugin |

---

## Traffic-Light Deployment Architecture

Based on `/tools/anvil/ADMIN_ARCHITECTURE.md`, the server supports multi-instance deployment:

```
                    Internet
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                    Gateway Instance (GREEN)                   │
│                    Port 3101 - Always Available               │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Health    │ │    Auth     │ │   Routing   │              │
│  │   Plugin    │ │   Guard     │ │   Plugin    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                         │                                     │
│         ┌───────────────┼───────────────┐                     │
│         ▼               ▼               ▼                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   /api/*    │ │  /cpanel/*  │ │    /*       │              │
│  │   → Proxy   │ │  → Control  │ │  → Static   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└───────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐           ┌─────────────────────┐
│  Service (YELLOW)   │           │   Frontend (PWA)    │
│  Port 3100          │           │   Separate Deploy   │
│  Staging/Active     │           │   CDN or Container  │
│                     │           │                     │
│  - Can be swapped   │           │  - Independent      │
│  - Health checked   │           │    release cycle    │
│  - Auto-promoted    │           │  - Instant rollback │
└─────────────────────┘           └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Service (RED)      │
│  Development        │
│  Auto scale-down    │
└─────────────────────┘
```

### Deployment Flow

1. **Commit to main** → Build image → Deploy to YELLOW slot
2. **Health check passes** → Auto-promote YELLOW → GREEN
3. **Previous GREEN** → Becomes YELLOW (15-min rollback window)
4. **Rollback triggered** → Instant domain swap back

---

## Plugin Architecture

### Plugin Interface

```typescript
interface ServerPlugin {
  name: string;
  order?: number;  // Execution order (lower = earlier)

  // Lifecycle hooks
  onInit?(context: PluginContext): Promise<void>;
  onReady?(context: PluginContext): Promise<void>;
  onShutdown?(context: PluginContext): Promise<void>;

  // Express integration
  routes?: RouteDefinition[];
  middleware?: MiddlewareDefinition[];

  // Health contribution
  healthCheck?: () => Promise<HealthCheckResult>;

  // UI contribution (for control panel)
  ui?: {
    pages?: UIPage[];
    navigation?: NavigationItem[];
  };
}
```

### Plugin Categories

#### 1. Infrastructure Plugins (Always-on, Gateway-level)

- `health` - Health monitoring and endpoints
- `diagnostics` - System diagnostics for debugging
- `config` - Environment configuration display
- `logging` - Log viewing and streaming
- `routing` - URL rewriting and proxy
- `traffic` - Deployment orchestration

#### 2. Service Plugins (Per-service, swappable)

- `database` - Database connections and pooling
- `cache` - Caching layer (Redis, memory)
- `auth` - Authentication with provider adapters
- `users` - User management CRUD
- `roles` - RBAC/ABAC permissions

#### 3. Integration Plugins (External services)

- `automation` - Workflow engine (@qwickapps/automation)
- `cms` - Payload CMS integration (@qwickapps/cms)
- `keap` - Keap CRM (@qwickapps/keap-client)

---

## Enhanced Plugin Architecture (v2.0)

### The Manikin Model

Think of `@qwickapps/server` as a **manikin** (the base framework), and plugins as **accessories** (clothes, hats, jewelry). Products like AuthKeaper, QwickForge, or SuvaiSpot are **dressed-up dolls** - specific configurations of the manikin with particular accessories.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AuthKeaper (Dressed Doll)                       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    @qwickapps/server (Manikin)                  │   │
│   │                                                                 │   │
│   │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│   │   │  Auth    │ │  Users   │ │  Bans    │ │  Cache   │           │   │
│   │   │  Plugin  │ │  Plugin  │ │  Plugin  │ │  Plugin  │           │   │
│   │   │(Shirt)   │ │(Pants)   │ │(Belt)    │ │(Shoes)   │           │   │
│   │   └──────────┘ └──────────┘ └──────────┘ └──────────┘           │   │
│   │        ▲             ▲             │                            │   │
│   │        │             └─────────────┘                            │   │
│   │        │           Bans depends on Users                        │   │
│   └────────┼────────────────────────────────────────────────────────┘   │
│            │                                                            │
│   Product-specific configuration and business logic                     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight**: Plugins are *part of the outfit*, not external additions. The question "where does this plugin live?" is answered by: "it's a dependency installed from npm and configured by the product."

### Plugin Interface Hierarchy

Plugins are categorized via **interfaces** that define their capabilities:

```typescript
/**
 * Base plugin interface - all plugins implement this
 */
interface ControlPanelPlugin {
  name: string;
  version?: string;
  description?: string;
  order?: number;  // Execution order (lower = earlier)

  // Core lifecycle hooks
  onInit?(context: PluginContext): Promise<void>;
  onReady?(context: PluginContext): Promise<void>;
  onShutdown?(context: PluginContext): Promise<void>;

  // Express integration
  routes?: RouteDefinition[];
  middleware?: MiddlewareDefinition[];

  // Health contribution
  healthCheck?: () => Promise<HealthCheckResult>;

  // UI contribution (for control panel)
  ui?: {
    pages?: UIPage[];
    navigation?: NavigationItem[];
  };
}

/**
 * Activatable plugins can be enabled/disabled at runtime
 * State changes take effect immediately without server restart
 */
interface ActivatablePlugin extends ControlPanelPlugin {
  // Called when plugin is enabled (either on startup or at runtime)
  onActivate?(context: PluginContext): Promise<void>;

  // Called when plugin is disabled at runtime
  onDeactivate?(context: PluginContext): Promise<void>;

  // Current activation state (managed by Plugin Manager)
  isActive?: boolean;
}

/**
 * Persistent plugins require storage and may need migrations
 * Server calls onRunMigrations but plugin handles its own migration tracking
 */
interface PersistentPlugin extends ControlPanelPlugin {
  // Called to run any pending migrations
  // Plugin is responsible for tracking which migrations have run
  onRunMigrations?(context: PluginContext): Promise<void>;
}
```

### Plugin Lifecycle

```
Server Startup
      │
      ▼
┌─────────────────┐
│  Load plugins   │─────────────────────────────────────────┐
│  from config    │                                         │
└────────┬────────┘                                         │
         │                                                  │
         ▼                                                  │
┌─────────────────┐     ┌─────────────────────────────┐    │
│  onRunMigrations│────▶│  Plugin handles internally: │    │
│  (if Persistent) │     │  - Check migration state   │    │
└────────┬────────┘     │  - Run pending migrations  │    │
         │              │  - Update migration state  │    │
         │              └─────────────────────────────┘    │
         ▼                                                  │
┌─────────────────┐                                         │
│    onInit()     │  Initialize plugin (connect to DB, etc) │
└────────┬────────┘                                         │
         │                                                  │
         ▼                                                  │
┌─────────────────┐     ┌─────────────────────────────┐    │
│  Check enabled  │────▶│  State from:                │    │
│  state          │     │  1. ENV var override        │    │
│                 │     │  2. Redis (if available)    │    │
│                 │     │  3. Default: true           │    │
└────────┬────────┘     └─────────────────────────────┘    │
         │                                                  │
         ▼                                                  │
┌─────────────────┐                                         │
│  onActivate()   │  If enabled AND ActivatablePlugin       │
│ (if Activatable) │                                        │
└────────┬────────┘                                         │
         │                                                  │
         ▼                                                  │
┌─────────────────┐                                         │
│   onReady()     │  Plugin fully initialized               │
└────────┬────────┘                                         │
         │                                                  │
         ▼                                                  │
┌─────────────────┐                                         │
│  Server running │◀────────────────────────────────────────┘
│                 │
│  Runtime state  │
│  changes via    │───┐
│  Plugin Manager │   │
└─────────────────┘   │
                      ▼
              ┌─────────────────┐
              │ onDeactivate()  │  Plugin disabled at runtime
              │ or onActivate() │  Plugin enabled at runtime
              └─────────────────┘

Server Shutdown
      │
      ▼
┌─────────────────┐
│  onShutdown()   │  Cleanup resources
└─────────────────┘
```

### Plugin State Management

**Design Philosophy**: Only `ActivatablePlugin`'s state can be enabled/disabled. State is configured via:

1. **ENV var** (highest priority): `PLUGIN_{NAME}_ENABLED=true|false`
2. **Redis** (if available): Persists across restarts
3. **Memory** (fallback): Lost on restart, falls back to ENV var default

```typescript
interface PluginManager {
  // List all registered plugins with their state
  listPlugins(): PluginInfo[];

  // Get specific plugin info
  getPlugin(name: string): PluginInfo | undefined;

  // Enable/disable an ActivatablePlugin at runtime
  // State persisted to Redis if available, otherwise memory
  setEnabled(name: string, enabled: boolean): Promise<void>;

  // Get plugin configuration (read-only)
  getConfig(name: string): PluginConfig | undefined;
}

interface PluginInfo {
  name: string;
  version?: string;
  description?: string;
  status: 'active' | 'inactive' | 'error';
  isActivatable: boolean;
  isPersistent: boolean;
  error?: string;  // If status is 'error'
}
```

**State Storage Strategy**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Plugin State Resolution                          │
│                                                                          │
│   1. Check ENV var: PLUGIN_{NAME}_ENABLED                               │
│      │                                                                   │
│      ├─ If set → Use ENV value (highest priority)                       │
│      │                                                                   │
│      └─ If not set → Continue to step 2                                 │
│                                                                          │
│   2. Check Redis (if available): plugins:state:{name}                   │
│      │                                                                   │
│      ├─ If found → Use Redis value (persists across restarts)           │
│      │                                                                   │
│      └─ If not found → Continue to step 3                               │
│                                                                          │
│   3. Check Memory store                                                  │
│      │                                                                   │
│      ├─ If found → Use memory value (lost on restart)                   │
│      │                                                                   │
│      └─ If not found → Default: true (plugin enabled)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Error Handling

**Principle**: A failed plugin should NOT crash the server. Other plugins continue operating.

```typescript
// Lifecycle callbacks are guarded
async function safeCallLifecycle(plugin: Plugin, method: string): Promise<void> {
  try {
    await plugin[method]?.(context);
  } catch (error) {
    // Log the error
    logger.error({ plugin: plugin.name, method, error }, 'Plugin lifecycle error');

    // Mark plugin as errored
    pluginManager.setStatus(plugin.name, 'error', error.message);

    // Do NOT re-throw - server continues running
  }
}

// Plugin middleware/routes are also guarded
function createGuardedMiddleware(plugin: Plugin, middleware: Middleware) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await middleware(req, res, next);
    } catch (error) {
      logger.error({ plugin: plugin.name, error }, 'Plugin middleware error');

      // Return error response but don't crash
      res.status(500).json({
        error: 'Internal Server Error',
        plugin: plugin.name,
      });
    }
  };
}
```

### Plugin Dependencies

Plugin dependencies are managed via **npm peerDependencies**, not runtime detection:

```json
// @qwickapps/bans-plugin/package.json
{
  "name": "@qwickapps/bans-plugin",
  "peerDependencies": {
    "@qwickapps/server": "^1.3.0",
    "@qwickapps/users-plugin": "^1.0.0"  // Depends on Users plugin
  }
}
```

**Why npm dependencies, not runtime?**

- Installation fails if dependency missing → clear error message
- Version compatibility enforced by npm
- No runtime overhead checking dependencies
- Standard Node.js pattern

### Users Plugin vs Bans Plugin

**Key Design Decision**: Bans is a **separate plugin** that depends on Users.

**Rationale**:

- User management is the **core feature** (identity, profiles, CRUD)
- Banning is an **add-on feature** (access restriction)
- Not all products need banning
- Ban should be on the **USER**, not the email (email is just an identifier)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Users Plugin                                   │
│                                                                          │
│   Core Identity Management:                                             │
│   - User CRUD (create, read, update, delete)                            │
│   - External ID mapping (auth0_id, supabase_id, etc.)                   │
│   - User search and listing                                             │
│   - Profile metadata                                                     │
│                                                                          │
│   Exports:                                                               │
│   - getUserById(), getUserByEmail()                                      │
│   - findOrCreateUser()                                                   │
│   - UserStore interface for pluggable storage                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ peerDependency
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Bans Plugin                                    │
│                                                                          │
│   Access Restriction:                                                    │
│   - Ban/unban users                                                      │
│   - Temporary bans (expires_at)                                          │
│   - Ban history and audit trail                                          │
│   - Ban reason tracking                                                  │
│                                                                          │
│   Resolution Flow:                                                       │
│   email → Users Plugin.getUserByEmail() → user_id → check ban           │
│                                                                          │
│   Exports:                                                               │
│   - isUserBanned(), banUser(), unbanUser()                              │
│   - isEmailBanned() (convenience, resolves to user internally)          │
│   - Middleware: requireNotBanned()                                       │
│                                                                          │
│   Callbacks:                                                             │
│   - onBan(user, reason) - e.g., revoke Auth0 sessions                   │
│   - onUnban(user)       - e.g., send notification                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Email Ban Resolution**:

```typescript
// In Bans Plugin
async function isEmailBanned(email: string): Promise<boolean> {
  // Resolve email to user via Users Plugin
  const user = await getUserByEmail(email);
  if (!user) {
    return false;  // Unknown user = not banned
  }

  return isUserBanned(user.id);
}
```

This design ensures:

1. **Single source of truth**: Bans are always on users, not emails
2. **Multiple emails**: If user has multiple emails, banning works correctly
3. **Audit trail**: Ban history tied to user identity, not email string
4. **Separation of concerns**: Products that don't need banning don't install Bans Plugin

---

## Feature Specifications

### 1. Database Plugin

**Wraps**: `drizzle-orm` (chosen over Prisma for type safety and SQL-first approach)

```typescript
import { createDatabasePlugin } from '@qwickapps/server/plugins';

createDatabasePlugin({
  provider: 'postgres',  // or 'mysql', 'sqlite'
  url: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: './migrations',
  healthCheck: true,  // Contribute to /api/health
});
```

**Features**:

- Connection pooling with health monitoring
- Migration runner integration
- Query logging (debug mode)
- Transaction helpers
- Multi-tenant support (schema-per-tenant)

---

### 2. Auth Plugin

**Wraps**: `passport` with adapters for Auth0, Supabase, custom JWT

```typescript
import { createAuthPlugin, auth0Adapter, supabaseAdapter } from '@qwickapps/server/plugins';

createAuthPlugin({
  providers: [
    auth0Adapter({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      audience: process.env.AUTH0_AUDIENCE,
    }),
    supabaseAdapter({
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    }),
  ],
  session: {
    type: 'jwt',  // or 'session'
    secret: process.env.SESSION_SECRET,
  },
  routes: {
    login: '/auth/login',
    logout: '/auth/logout',
    callback: '/auth/callback',
  },
});
```

**Integrates with**:

- `@qwickapps/auth` - Contracts and types
- `@qwickapps/auth-backend` - Server implementation
- `@qwickapps/auth0-client` - Auth0 M2M tokens

---

### 3. Cache Plugin

**Wraps**: `keyv` (unified API) with `ioredis` adapter for Redis

```typescript
import { createCachePlugin } from '@qwickapps/server/plugins';

createCachePlugin({
  provider: 'redis',  // or 'memory', 'sqlite'
  url: process.env.REDIS_URL,
  namespace: 'app',
  ttl: 3600,  // Default TTL
  healthCheck: true,
});
```

**Features**:

- Unified get/set/delete API
- TTL management
- Cache invalidation patterns
- Stats for control panel (hit rate, memory usage)

---

### 4. Routing Plugin

**Wraps**: `http-proxy-middleware` + `express-urlrewrite`

```typescript
import { createRoutingPlugin } from '@qwickapps/server/plugins';

createRoutingPlugin({
  routes: [
    // Proxy API requests to backend service
    { match: '/api/v1/*', target: 'http://localhost:3100' },

    // URL rewriting
    { match: '/old-path', rewrite: '/new-path' },

    // Static files with SPA fallback
    { match: '/*', static: './dist-ui', spa: true },
  ],
  cors: {
    origin: ['https://qwickforge.com'],
    credentials: true,
  },
});
```

---

### 5. Traffic Plugin (Deployment Orchestration)

**Implements**: Traffic-light deployment from Anvil architecture

```typescript
import { createTrafficPlugin } from '@qwickapps/server/plugins';

createTrafficPlugin({
  mode: 'gateway',  // This instance is the gateway
  services: [
    {
      name: 'api',
      slots: ['slot-a', 'slot-b'],
      healthEndpoint: '/health',
      promotionDelay: 30000,  // 30s health check before promotion
    },
  ],
  rollback: {
    window: 15 * 60 * 1000,  // 15 minutes
    automatic: false,  // Manual rollback trigger
  },
  orchestrator: {
    type: 'caprover',  // or 'docker', 'kubernetes'
    url: process.env.CAPROVER_URL,
    token: process.env.CAPROVER_TOKEN,
  },
});
```

**Features**:

- Slot management (GREEN/YELLOW/RED)
- Health-gated promotion
- Instant domain-based rollback
- Activity-based scale-down for dev instances
- Integration with Anvil admin system

---

### 6. Static Plugin

**Wraps**: `express.static` with SPA support

```typescript
import { createStaticPlugin } from '@qwickapps/server/plugins';

createStaticPlugin({
  root: './dist-ui',
  spa: true,  // Fallback to index.html for client-side routing
  cache: {
    maxAge: '1d',
    immutable: true,  // For hashed assets
  },
  gzip: true,
  brotli: true,
});
```

---

### 7. Users Plugin

**Provides**: User management with auth integration

```typescript
import { createUsersPlugin } from '@qwickapps/server/plugins';

createUsersPlugin({
  storage: 'database',  // Uses database plugin
  table: 'users',
  fields: {
    email: { required: true, unique: true },
    name: { required: true },
    avatar: { type: 'url' },
  },
  sync: {
    provider: 'auth0',  // Sync from auth provider
    interval: 3600000,  // Hourly
  },
});
```

---

### 8. Roles Plugin

**Provides**: RBAC/ABAC permissions

```typescript
import { createRolesPlugin } from '@qwickapps/server/plugins';

createRolesPlugin({
  model: 'rbac',  // or 'abac'
  roles: ['admin', 'editor', 'viewer'],
  permissions: {
    admin: ['*'],
    editor: ['read:*', 'write:content'],
    viewer: ['read:*'],
  },
  storage: 'database',
});
```

---

## Tech Stack Recommendations

### Core Runtime

| Component | Recommended | Alternative | Rationale |
|-----------|-------------|-------------|-----------|
| HTTP Server | Express 4.x | Fastify | Ecosystem maturity, middleware compatibility |
| Logging | Pino | Winston | 5x faster, structured JSON, low overhead |
| Validation | Zod | Joi | TypeScript-first, smaller bundle |
| ORM | Drizzle | Prisma | Type-safe SQL, no codegen, lighter |

### Infrastructure

| Component | Recommended | Rationale |
|-----------|-------------|-----------|
| Proxy | http-proxy-middleware | Industry standard, well-maintained |
| Auth | Passport + adapters | Flexible, supports all providers |
| Cache | Keyv + ioredis | Unified API, Redis production-ready |
| Health | @godaddy/terminus | Kubernetes-native, graceful shutdown |
| Rate Limit | express-rate-limit | Simple, Redis-backed for distributed |

### Deployment

| Component | Recommended | Rationale |
|-----------|-------------|-----------|
| Container | Docker + CapRover | Already in use, works well |
| CI/CD | GitHub Actions | Already configured |
| Registry | Local registry:2 | No recurring cost |

---

## v1.3+ Feature Specifications: Pluggable Adapter Architecture

The upcoming releases introduce a **pluggable adapter pattern** where each plugin supports multiple backends/providers. This enables:

- **No vendor lock-in** for QwickApps (we can swap implementations)
- **Strategic vendor lock-in** for clients (they stay locked to our platform)
- **Reuse of existing packages** in the monorepo

### Design Principles

1. **Prefer existing solutions** - Use best available libraries (MIT/free, well-maintained)
2. **Pluggable adapters** - Each plugin supports multiple backends
3. **Monorepo-first** - Reuse existing @qwickapps/* packages
4. **Progressive enhancement** - Start simple, add features as needed

---

### 9. Auth Plugin (Enhanced)

**Purpose**: Unified authentication with pluggable identity providers

**Adapters**:

- `auth0` - Auth0 OIDC (express-openid-connect)
- `supabase` - Supabase Auth (@supabase/supabase-js)
- `basic` - HTTP Basic Auth (built-in)
- `jwt` - Custom JWT validation

**Leverages**: `@qwickapps/auth`, `@qwickapps/auth-backend`, `@qwickapps/auth0-client`

```typescript
import { createAuthPlugin, auth0Adapter, supabaseAdapter } from '@qwickapps/server';

createAuthPlugin({
  // Primary adapter for this deployment
  adapter: auth0Adapter({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    baseUrl: process.env.BASE_URL,
    secret: process.env.SESSION_SECRET,

    // Enhanced options (v2.x)
    audience: process.env.AUTH0_AUDIENCE,      // For access tokens
    scopes: ['openid', 'profile', 'email'],
    allowedRoles: ['admin', 'support'],        // RBAC
    allowedDomains: ['@t3live.com'],           // Domain whitelist
    exposeAccessToken: true,                   // For downstream API calls
  }),

  // Fallback adapters (checked in order)
  fallback: [
    supabaseAdapter({ url: '...', anonKey: '...' }),
  ],

  // Route configuration
  routes: {
    login: '/auth/login',
    logout: '/auth/logout',
    callback: '/auth/callback',
  },

  // Paths excluded from auth
  excludePaths: ['/health', '/api/v1/public'],
});
```

---

### 10. Users Plugin (Pluggable Storage)

**Purpose**: User management with pluggable storage backends

**Storage Adapters**:

- `postgres` - PostgreSQL via pg (built-in)
- `supabase` - Supabase as user store
- `auth0` - Auth0 Management API as user store
- `memory` - In-memory (testing only)

```typescript
import { createUsersPlugin, postgresUserStore, auth0UserStore } from '@qwickapps/server';

createUsersPlugin({
  // Primary storage
  store: postgresUserStore({
    pool: getPostgres(),
    table: 'users',
    schema: {
      id: 'uuid',
      email: 'string',
      name: 'string',
      auth0_id: 'string?',        // Optional external ID
      metadata: 'jsonb',
      created_at: 'timestamp',
      updated_at: 'timestamp',
    },
  }),

  // Sync with external identity provider
  sync: {
    enabled: true,
    provider: auth0UserStore({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_M2M_CLIENT_ID,
      clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
    }),
    onFirstLogin: true,           // Create local user on first login
    syncFields: ['email', 'name', 'picture'],
  },

  // Ban management
  bans: {
    enabled: true,
    table: 'user_bans',
    supportTemporary: true,       // Expiring bans
    onBan: async (user, reason) => {
      // Optional: Revoke Auth0 sessions
    },
  },

  // API endpoints
  api: {
    prefix: '/api/users',
    crud: true,                   // GET/POST/PUT/DELETE
    search: true,                 // GET /api/users/search
    bans: true,                   // /api/users/:id/ban
  },

  // Control panel UI
  ui: {
    enabled: true,
    page: '/users',
  },
});
```

---

### 11. Auth0 Management Plugin

**Purpose**: Manage Auth0 tenants, deploy Actions, configure branding

**Leverages**: `@qwickapps/auth0-client`, Auth0 Management API

```typescript
import { createAuth0ManagementPlugin } from '@qwickapps/server';

createAuth0ManagementPlugin({
  // M2M credentials for Management API
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,

  // Database for tenant configs (multi-tenant support)
  database: getPostgres(),
  tenantsTable: 'auth0_tenants',

  // Features to enable (start with tenants, add more later)
  features: {
    tenants: true,                // Phase 1: CRUD tenants
    actions: true,                // Phase 1: Deploy post-login Actions
    branding: false,              // Phase 2: Logo, colors
    connections: false,           // Phase 2: Social logins
    customDomains: false,         // Phase 3: Custom domains
  },

  // Action templates
  actionTemplates: {
    'post-login-entitlements': {
      name: 'Fetch Entitlements',
      trigger: 'post-login',
      // Template code with {{variables}}
      code: `
        const response = await fetch('{{authkeaperUrl}}/api/v1/entitlements/' + event.user.email, {
          headers: { 'X-API-Key': event.secrets.AUTHKEAPER_SERVICE_KEY }
        });
        const { entitlements, banned, banReason } = await response.json();

        if (banned) {
          api.access.deny(banReason || 'Account suspended');
          return;
        }

        api.idToken.setCustomClaim('entitlements', entitlements);
      `,
      secrets: ['AUTHKEAPER_SERVICE_KEY'],
    },
  },

  // Control panel UI
  ui: {
    enabled: true,
    pages: {
      tenants: '/auth0/tenants',
      actions: '/auth0/actions',
    },
  },
});
```

**Multi-Tenant Flow**:

1. Admin adds tenant in control panel (domain, M2M creds)
2. System validates credentials against Auth0 API
3. Admin deploys Action template to tenant
4. Action calls back to AuthKeaper for entitlements/ban check
5. Users of that tenant get entitlements in their tokens

---

### 12. Automation Plugin

**Purpose**: Event-driven workflows for webhooks, schedules, and integrations

**Leverages**: `@qwickapps/automation` (workflow engine)

**Trigger Types**:

- `webhook` - Incoming HTTP (Keap, Stripe, custom)
- `schedule` - Cron-based (node-cron)
- `api` - Manual trigger via REST API
- `event` - Internal application events

**Action Types**:

- `http-request` - Call external APIs
- `send-email` - Send emails (nodemailer)
- `database-query` - Run SQL
- `rules-engine` - Conditional logic (json-rules-engine)
- `custom` - User-defined functions

```typescript
import { createAutomationPlugin } from '@qwickapps/server';

createAutomationPlugin({
  database: getPostgres(),
  tables: {
    workflows: 'automation_workflows',
    executions: 'automation_executions',
  },

  // Webhook configuration
  webhooks: {
    prefix: '/webhooks',
    providers: {
      keap: {
        enabled: true,
        secretHeader: 'X-Keap-Signature',
        secretEnvVar: 'KEAP_WEBHOOK_SECRET',
      },
      stripe: {
        enabled: true,
        secretHeader: 'Stripe-Signature',
        secretEnvVar: 'STRIPE_WEBHOOK_SECRET',
      },
      custom: {
        enabled: true,
        secretHeader: 'X-Webhook-Secret',
      },
    },
  },

  // Schedule configuration
  schedules: {
    enabled: true,
    timezone: 'America/New_York',
  },

  // Built-in actions
  actions: {
    'http-request': true,
    'send-email': {
      enabled: true,
      transport: 'smtp',          // or 'sendgrid', 'ses'
    },
    'database-query': true,
    'rules-engine': true,
  },

  // Control panel UI
  ui: {
    enabled: true,
    pages: {
      workflows: '/automations',
      executions: '/automations/logs',
    },
  },
});
```

**AuthKeaper Use Cases**:

```typescript
// Workflow 1: Keap webhook → Update entitlements
{
  name: 'Keap Tag Added',
  trigger: { type: 'webhook', provider: 'keap', event: 'tag.applied' },
  actions: [
    {
      type: 'database-query',
      query: `
        INSERT INTO user_entitlements (user_email, tag_name, granted_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_email, tag_name) DO NOTHING
      `,
      params: ['{{data.email}}', '{{data.tag_name}}'],
    },
    {
      type: 'http-request',
      url: '{{cacheInvalidateUrl}}',
      method: 'POST',
      body: { email: '{{data.email}}' },
    },
  ],
}

// Workflow 2: User banned → Revoke Auth0 sessions
{
  name: 'User Banned',
  trigger: { type: 'event', event: 'user.banned' },
  actions: [
    {
      type: 'http-request',
      url: 'https://{{auth0Domain}}/api/v2/users/{{data.auth0_id}}/sessions',
      method: 'DELETE',
      headers: { Authorization: 'Bearer {{auth0ManagementToken}}' },
    },
  ],
}
```

---

### 13. Roles/Entitlements Plugin

**Purpose**: RBAC/entitlement-based access control

**Leverages**: Can integrate with Auth0 RBAC or standalone

```typescript
import { createRolesPlugin, auth0RolesAdapter, localRolesAdapter } from '@qwickapps/server';

createRolesPlugin({
  // Adapter: where roles/permissions are stored
  adapter: localRolesAdapter({
    database: getPostgres(),
    tables: {
      roles: 'roles',
      permissions: 'permissions',
      userRoles: 'user_roles',
    },
  }),

  // Or use Auth0 RBAC
  // adapter: auth0RolesAdapter({ domain, clientId, clientSecret }),

  // Define permissions
  permissions: [
    'read:users',
    'write:users',
    'manage:users',
    'read:entitlements',
    'write:entitlements',
    'manage:automations',
  ],

  // Default roles
  roles: {
    admin: ['*'],                 // All permissions
    support: ['read:users', 'read:entitlements'],
    api: ['read:entitlements'],
  },

  // Middleware
  middleware: {
    enabled: true,
    claimPath: 'permissions',     // Where to find permissions in JWT
  },

  // Control panel UI
  ui: {
    enabled: true,
    page: '/roles',
  },
});

// Usage in routes
app.get('/admin/users',
  requirePermission('read:users'),
  (req, res) => { ... }
);
```

---

## Existing Monorepo Packages Integration

| Package | Use In | Integration |
|---------|--------|-------------|
| `@qwickapps/logging` | All plugins | ✅ Already integrated |
| `@qwickapps/auth` | Auth plugin | Contracts/types |
| `@qwickapps/auth-backend` | Auth plugin | Server implementation |
| `@qwickapps/auth0-client` | Auth0 Mgmt plugin | M2M token management |
| `@qwickapps/automation` | Automation plugin | Port workflow engine |
| `@qwickapps/keap-client` | Automation actions | Keap API integration |
| `@qwickapps/schema` | All plugins | Zod validation |
| `@qwickapps/react-framework` | Control panel UI | ✅ Already peer dep |

---

## Migration Path

### Phase 1: Foundation (v1.0 - v1.1) ✅ COMPLETE

- [x] Gateway pattern with service proxy
- [x] Plugin architecture (health, diagnostics, config, logs)
- [x] Route guards (basic, auth0, supabase)
- [x] React UI integration
- [x] Frontend app plugin (landing page, static files)

### Phase 2: Data Layer (v1.2) ✅ COMPLETE

- [x] PostgreSQL plugin (pg pooling, transactions, health checks)
- [x] Cache plugin (ioredis, TTL, pattern operations)
- [x] Reduced log verbosity
- [x] Configurable logo for landing page

### Phase 3: Auth & Users (v1.3) 🔄 IN PROGRESS

- [x] Enhanced Auth plugin with pluggable adapters
  - [x] Auth0 adapter (enhanced: RBAC, domain whitelist, token exposure)
  - [x] Supabase adapter
  - [x] Basic adapter
  - [x] Unified `isAuthenticated()`, `getAuthenticatedUser()`, `requireAuth()` helpers
- [x] Users plugin with pluggable storage
  - [x] PostgreSQL user store
  - [x] External ID mapping for provider sync
  - [x] User CRUD API endpoints
- [ ] **Enhanced Plugin Architecture** (in progress)
  - [ ] Plugin Manager for state/config management
  - [ ] ActivatablePlugin interface with onActivate/onDeactivate
  - [ ] PersistentPlugin interface with onRunMigrations
  - [ ] Guarded lifecycle callbacks (error isolation)
  - [ ] Plugin state storage (Redis/memory with ENV override)

### Phase 3.1: Bans Plugin (v1.3.1) 📋 PLANNED

- [ ] Extract Bans Plugin from Users Plugin
  - [ ] Separate npm package: `@qwickapps/bans-plugin`
  - [ ] peerDependency on `@qwickapps/users-plugin`
  - [ ] Ban by user_id (not email)
  - [ ] `isEmailBanned()` convenience function (resolves email → user → ban)
- [ ] Ban management features
  - [ ] Temporary bans (expires_at)
  - [ ] Ban history and audit trail
  - [ ] `onBan`, `onUnban` callbacks
- [ ] REST API endpoints
  - [ ] `GET/POST/DELETE /api/users/:id/ban`
  - [ ] `GET /api/bans` - List active bans
- [ ] Control panel UI for ban management

### Phase 4: Auth0 Management (v1.4)

- [ ] Auth0 Management plugin
  - [ ] Single tenant support (Phase 4a)
  - [ ] Multi-tenant support (Phase 4b)
- [ ] Action deployment (post-login triggers)
- [ ] Branding configuration (logo, colors)
- [ ] Social connections toggle
- [ ] Control panel UI for tenant management

### Phase 5: Automation (v1.5)

- [ ] Port @qwickapps/automation engine to server plugin
- [ ] Webhook triggers (Keap, Stripe, custom)
- [ ] Schedule triggers (cron)
- [ ] Built-in actions (http-request, send-email, database-query)
- [ ] Control panel UI for workflow management

### Phase 6: Roles & Permissions (v1.6)

- [ ] Roles plugin with pluggable adapters
  - [ ] Local roles (PostgreSQL)
  - [ ] Auth0 RBAC integration
- [ ] Permission middleware
- [ ] Entitlements integration
- [ ] Control panel UI for role management

### Phase 7: Routing & Static (v1.7)

- [ ] Routing plugin (proxy, rewrite)
- [ ] Static plugin (SPA support, gzip, brotli)
- [ ] Rate limiting

### Phase 8: Traffic Orchestration (v1.8)

- [ ] Traffic plugin
- [ ] Slot management (GREEN/YELLOW/RED)
- [ ] Health-gated promotion
- [ ] Rollback support
- [ ] Anvil integration

### Phase 9: Builder Integration (v1.9)

- [ ] Update @qwickapps/builder templates
- [ ] Add server plugin scaffolding
- [ ] Template: `qwickapps-product` (full stack)

---

## Implementation TODO List

### Immediate Priority: Enhanced Plugin Architecture (v1.3)

**Goal**: Implement robust plugin system that enables T3Live AuthKeaper to use Auth0 for admin login and manage users/bans with proper separation of concerns.

- [x] **Auth Plugin** ✅ COMPLETE
  - [x] `createAuthPlugin()` with adapter pattern
  - [x] `auth0Adapter` - RBAC, domain whitelist, token exposure
  - [x] `supabaseAdapter` - JWT validation
  - [x] `basicAdapter` - HTTP Basic auth
  - [x] Unified `isAuthenticated()`, `getAuthenticatedUser()`, `requireAuth()` helpers

- [x] **Users Plugin** ✅ COMPLETE (needs refactoring)
  - [x] `createUsersPlugin()` with storage adapter pattern
  - [x] `postgresUserStore` - PostgreSQL storage
  - [x] Schema: id, email, name, external_id, provider, metadata, created_at, updated_at
  - [x] CRUD API endpoints: `/api/users/*`
  - [x] Search API: `/api/users?search=...`
  - [ ] **Refactor**: Remove ban functionality (move to Bans Plugin)

- [ ] **Plugin Manager** (NEW)
  - [ ] Create `PluginManager` class
  - [ ] `listPlugins()` - List all plugins with state
  - [ ] `getPlugin(name)` - Get plugin info
  - [ ] `setEnabled(name, enabled)` - Enable/disable ActivatablePlugin
  - [ ] State storage: ENV var > Redis > memory > default
  - [ ] Expose via API: `/api/plugins`

- [ ] **Plugin Lifecycle Enhancements** (NEW)
  - [ ] `ActivatablePlugin` interface with `onActivate()`, `onDeactivate()`
  - [ ] `PersistentPlugin` interface with `onRunMigrations()`
  - [ ] Guarded lifecycle callbacks (catch errors, set plugin status to 'error')
  - [ ] Guarded middleware/routes (catch errors, return 500, don't crash)

### Next Priority: Bans Plugin (v1.3.1)

**Goal**: Separate Bans Plugin that depends on Users Plugin

- [ ] **Extract from Users Plugin**
  - [ ] Create `@qwickapps/bans-plugin` package (or keep in @qwickapps/server for now)
  - [ ] `createBansPlugin()` factory function
  - [ ] peerDependency on Users Plugin (for `getUserByEmail()`)

- [ ] **Ban Management**
  - [ ] Ban table: id, user_id, reason, banned_by, banned_at, expires_at, is_active
  - [ ] `isUserBanned(userId)` - Check if user is banned
  - [ ] `isEmailBanned(email)` - Convenience: resolve email → user → check ban
  - [ ] `banUser(userId, options)` - Ban a user
  - [ ] `unbanUser(userId)` - Unban a user
  - [ ] `onBan`, `onUnban` callbacks for external actions

- [ ] **API Endpoints**
  - [ ] `GET /api/users/:id/ban` - Get active ban for user
  - [ ] `POST /api/users/:id/ban` - Ban a user
  - [ ] `DELETE /api/users/:id/ban` - Unban a user
  - [ ] `GET /api/bans` - List all active bans

- [ ] **Control Panel UI**
  - [ ] Bans list page
  - [ ] Ban action in user detail page

### Next: Auth0 Management (v1.4)

**Goal**: Manage Auth0 tenants and deploy Actions from AuthKeaper

- [ ] **Auth0 Management Plugin**
  - [ ] Create `createAuth0ManagementPlugin()`
  - [ ] Leverage `@qwickapps/auth0-client` for M2M tokens
  - [ ] Tenant CRUD (single tenant first, then multi-tenant)
  - [ ] Action templates with variable substitution

- [ ] **Action Deployment**
  - [ ] POST /api/auth0/actions/deploy
  - [ ] Template: post-login entitlements fetch
  - [ ] Template: ban check
  - [ ] Bind action to login flow

- [ ] **Control Panel UI**
  - [ ] Tenants list/add page
  - [ ] Tenant detail page
  - [ ] Action deployment UI

### Then: Automation (v1.5)

**Goal**: Handle Keap webhooks and automate entitlement updates

- [ ] **Port @qwickapps/automation**
  - [ ] Extract core engine (AutomationEngine, TriggerManager, ActionRegistry)
  - [ ] Create `createAutomationPlugin()`
  - [ ] Integrate with postgres plugin for workflow storage

- [ ] **Webhook Trigger**
  - [ ] Create `WebhookTrigger` implementation
  - [ ] Keap webhook signature validation
  - [ ] Stripe webhook signature validation
  - [ ] Generic webhook with secret header

- [ ] **Built-in Actions**
  - [ ] `http-request` - Call external APIs
  - [ ] `database-query` - Run SQL with params
  - [ ] `cache-invalidate` - Clear cache entries

- [ ] **Control Panel UI**
  - [ ] Workflows list page
  - [ ] Workflow builder (trigger + actions)
  - [ ] Execution logs

### Existing Packages to Leverage

| Package | How to Use |
|---------|------------|
| `@qwickapps/auth0-client` | M2M token management in Auth0 Mgmt plugin |
| `@qwickapps/automation` | Port engine code to server plugin |
| `@qwickapps/keap-client` | Keap API calls in automation actions |
| `@qwickapps/logging` | Already integrated, use throughout |
| `@qwickapps/schema` | Zod validation for plugin configs |

### Not Reinventing

| Need | Use This | Why |
|------|----------|-----|
| Auth0 OIDC | express-openid-connect | Official, well-maintained |
| JWT validation | jose | Fast, standards-compliant |
| Cron scheduling | node-cron | Simple, battle-tested |
| Rules engine | json-rules-engine | Already in automation package |
| PostgreSQL | pg | Already using, works well |
| Redis | ioredis | Already using, works well |

### Long-term (After T3Live Launch)

- [ ] **Roles Plugin** (v1.6)
- [ ] **Routing Plugin** (v1.7)
- [ ] **Traffic Orchestration** (v1.8)
- [ ] **Builder Integration** (v1.9)

---

## Success Metrics

1. **Development Velocity**: New products assembled in hours, not weeks
2. **Code Reuse**: 80%+ infrastructure code shared across products
3. **Reliability**: Zero-downtime deployments with instant rollback
4. **Consistency**: Uniform health checks, logging, and configuration across all products
5. **Maintainability**: Single place to fix infrastructure issues

---

## Open Questions

1. Should we support Fastify as an alternative to Express for performance-critical services?
2. ~~How do we handle plugin dependencies (e.g., users plugin requires database plugin)?~~ **RESOLVED**: Use npm peerDependencies for plugin-to-plugin dependencies. Installation fails if dependency missing, version compatibility enforced by npm. See "Plugin Dependencies" section.
3. Should traffic orchestration be part of the server or a separate tool (Anvil)?
4. How do we version plugins independently of the core framework?

---

## Event-Driven Plugin Architecture v2.0

> **Status**: ✅ Implemented
> **Date**: 2025-12-09
> **Implementation**: `src/core/plugin-registry.ts`

### Design Philosophy

Keep it simple. No frozen registries, no complex phases. Just:

1. **Start plugins** - they register what they need
2. **Broadcast events** - plugins react to changes
3. **Stop plugins** - cleanup

### Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version?: string;

  // Lifecycle - simple and clear
  onStart(config: PluginConfig, registry: PluginRegistry): Promise<void>;
  onStop(): Promise<void>;

  // React to system changes (optional)
  onPluginEvent?(event: PluginEvent): Promise<void>;
}

type PluginEvent =
  | { type: 'plugin:started'; pluginId: string; config: unknown }
  | { type: 'plugin:stopped'; pluginId: string }
  | { type: 'plugin:config-changed'; pluginId: string; key: string; oldValue: unknown; newValue: unknown }
  | { type: 'plugin:error'; pluginId: string; error: Error };
```

### Plugin Registry

The registry is just a directory - query it, register things, subscribe to events. No freezing.

```typescript
interface PluginRegistry {
  // Query plugins
  hasPlugin(id: string): boolean;
  getPlugin<T>(id: string): T | null;
  listPlugins(): PluginInfo[];

  // Register capabilities (anytime)
  addRoute(route: RouteDefinition): void;
  addMenuItem(menu: MenuContribution): void;
  addPage(page: PageContribution): void;
  addWidget(widget: WidgetContribution): void;

  // Configuration
  getConfig<T>(pluginId: string): T;
  setConfig<T>(pluginId: string, config: Partial<T>): Promise<void>;

  // Events
  subscribe(handler: (event: PluginEvent) => void): () => void;
  emit(event: PluginEvent): void;
}
```

### How Dependencies Work

Plugins check for dependencies in `onStart`. If a dependency isn't available yet, they can either fail or subscribe to events and wait.

```typescript
const bansPlugin: Plugin = {
  id: 'bans',

  async onStart(config, registry) {
    // Check if Users plugin is available
    if (!registry.hasPlugin('users')) {
      throw new Error('Bans plugin requires Users plugin');
    }

    // Register routes, initialize store
    registry.addRoute({ method: 'get', path: '/api/bans', handler: listBans });
    registry.addMenuItem({ id: 'bans:sidebar', label: 'Bans', route: '/bans' });
  },

  async onPluginEvent(event) {
    // React to other plugins
    if (event.type === 'plugin:stopped' && event.pluginId === 'users') {
      // Users went away - enter degraded mode or stop ourselves
      console.warn('Users plugin stopped - bans functionality degraded');
    }

    if (event.type === 'plugin:config-changed' && event.pluginId === 'users') {
      // Users config changed - maybe we need to adapt
    }
  },

  async onStop() {
    // Cleanup
  }
};
```

### Error Isolation

Wrap plugin lifecycle calls to prevent one plugin from crashing the server:

```typescript
async function safeStartPlugin(plugin: Plugin, config: PluginConfig, registry: PluginRegistry): Promise<boolean> {
  try {
    await Promise.race([
      plugin.onStart(config, registry),
      timeout(30000) // 30 second timeout
    ]);
    registry.emit({ type: 'plugin:started', pluginId: plugin.id, config });
    return true;
  } catch (error) {
    registry.emit({ type: 'plugin:error', pluginId: plugin.id, error });
    console.error(`Plugin ${plugin.id} failed to start:`, error);
    return false; // Server continues, plugin marked as failed
  }
}
```

### UI Contributions

Plugins register UI contributions through the registry:

```typescript
interface MenuContribution {
  id: string;
  label: string;
  icon?: string;
  route: string;
  order?: number;
  badge?: string | { api: string };
}

interface PageContribution {
  id: string;
  route: string;
  component: string;
  title?: string;
}

interface WidgetContribution {
  id: string;
  title: string;
  component: string;
  defaultSize?: { width: number; height: number };
}
```

The control panel fetches contributions via `/cpanel/api/ui-contributions`.

### Why This Design?

| Aspect | Complex (Three-Phase) | Simple (Event-Driven) |
|--------|----------------------|----------------------|
| Startup | 4 phases, strict order | Just `onStart` |
| Dependencies | Check during special phase | Check in `onStart`, react to events |
| Runtime changes | Needs separate mechanism | Same mechanism (events) |
| Hot-loading | Doesn't fit model | Natural - start/stop plugins anytime |
| Config changes | Separate callback | Event: `plugin:config-changed` |
| Complexity | High | Low |

### Implementation Status

| Item | Status |
|------|--------|
| **PluginRegistry** with event bus | ✅ Complete |
| **Plugin interface** with `onStart`, `onStop`, `onPluginEvent` | ✅ Complete |
| **Safe execution wrapper** for error isolation | ✅ Complete |
| **UI contribution types** and `/cpanel/api/ui-contributions` endpoint | ✅ Complete |
| **Migrate existing plugins** to new interface | 🔲 Next step |

### Files Created/Modified

- `src/core/plugin-registry.ts` - Main implementation
- `src/core/control-panel.ts` - Integration with control panel, `/api/ui-contributions` endpoint
- `src/core/types.ts` - Updated `PluginContext` to include registry
- `src/core/index.ts` - Exports for plugin registry
- `src/index.ts` - Package-level exports

---

## References

- [Anvil Admin Architecture](/tools/anvil/ADMIN_ARCHITECTURE.md)
- [@qwickapps/auth packages](/packages/qwickapps-auth*)
- [@qwickapps/automation](/packages/qwickapps-automation)
- [@qwickapps/cms](/packages/qwickapps-cms)
- [QwickApps Builder](/packages/qwickapps-builder)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Grafana Plugin Development](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Backstage Plugin Architecture](https://backstage.io/docs/plugins/)
