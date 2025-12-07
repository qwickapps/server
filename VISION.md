# @qwickapps/server - Product Vision & Architecture

> **Version**: 1.x (Foundation Release)
> **Status**: Draft
> **Last Updated**: 2025-12-07

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
│                         Product (e.g., QwickForge)                       │
│                                                                          │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│   │  Gateway (Green) │───▶│ Service (Yellow) │    │  Frontend (PWA)  │    │
│   │  Port 3101       │    │ Port 3100        │    │  dist-ui/        │    │
│   │  Always up       │    │ Hot-swappable    │    │  Separate deploy │    │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Assembled from @qwickapps/server plugins
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          @qwickapps/server                               │
│                                                                          │
│  Core Plugins (v1.x - Current)      │  Planned Plugins (v1.x Roadmap)   │
│  ────────────────────────────────   │  ─────────────────────────────    │
│  ✅ health      (terminus)          │  🔲 database   (drizzle-orm)      │
│  ✅ diagnostics (custom)            │  🔲 auth       (passport + adapters)│
│  ✅ config      (env display)       │  🔲 cache      (keyv/ioredis)     │
│  ✅ logs        (file reader)       │  🔲 routing    (http-proxy-middleware)│
│  ✅ gateway     (proxy pattern)     │  🔲 static     (express.static+SPA)│
│                                      │  🔲 users      (user management)  │
│                                      │  🔲 roles      (RBAC/entitlements)│
│                                      │  🔲 traffic    (deployment orchestration)│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Wraps battle-tested libraries
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Underlying Libraries                               │
│                                                                          │
│  drizzle-orm │ passport │ @auth0/node │ keyv │ ioredis │ pino          │
│  http-proxy-middleware │ helmet │ express-rate-limit │ terminus         │
└─────────────────────────────────────────────────────────────────────────┘
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
│                    Gateway Instance (GREEN)                    │
│                    Port 3101 - Always Available                │
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Health    │ │    Auth     │ │   Routing   │              │
│  │   Plugin    │ │   Guard     │ │   Plugin    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                         │                                      │
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

## Migration Path

### Phase 1: Foundation (Current - v1.1.x)
- [x] Gateway pattern with service proxy
- [x] Plugin architecture (health, diagnostics, config, logs)
- [x] Route guards (basic, auth0, supabase)
- [x] React UI integration
- [ ] Improve health plugin (use terminus)
- [ ] Add graceful shutdown

### Phase 2: Data Layer (v1.2.x)
- [ ] Database plugin (drizzle-orm)
- [ ] Cache plugin (keyv/ioredis)
- [ ] Config validation (zod schemas)

### Phase 3: Authentication (v1.3.x)
- [ ] Auth plugin with adapters
- [ ] Integrate @qwickapps/auth packages
- [ ] Session management
- [ ] OAuth flows

### Phase 4: Routing & Static (v1.4.x)
- [ ] Routing plugin (proxy, rewrite)
- [ ] Static plugin (SPA support)
- [ ] Rate limiting

### Phase 5: Users & Permissions (v1.5.x)
- [ ] Users plugin
- [ ] Roles plugin (RBAC)
- [ ] Entitlements integration

### Phase 6: Traffic Orchestration (v1.6.x)
- [ ] Traffic plugin
- [ ] Slot management
- [ ] Health-gated promotion
- [ ] Rollback support
- [ ] Anvil integration

### Phase 7: Builder Integration
- [ ] Update @qwickapps/builder templates
- [ ] Add server plugin scaffolding
- [ ] Template: `qwickapps-product` (full stack)

---

## Implementation TODO List

### Immediate (This Sprint)

- [ ] **Document current state**: Audit existing plugins, identify gaps
- [ ] **Design plugin API v2**: Unified interface for all plugins
- [ ] **Research terminus**: Evaluate for health checks replacement
- [ ] **Research keyv**: Evaluate for cache abstraction
- [ ] **Research drizzle**: Evaluate for database plugin

### Short-term (Next 2 Sprints)

- [ ] **Implement database plugin**
  - [ ] PostgreSQL adapter
  - [ ] Connection pooling
  - [ ] Health check contribution
  - [ ] Migration runner

- [ ] **Implement cache plugin**
  - [ ] Redis adapter
  - [ ] Memory adapter (dev)
  - [ ] Stats for control panel

- [ ] **Implement routing plugin**
  - [ ] Proxy routes
  - [ ] URL rewriting
  - [ ] CORS configuration

### Medium-term (Next Quarter)

- [ ] **Implement auth plugin**
  - [ ] Auth0 adapter
  - [ ] Supabase adapter
  - [ ] Session management
  - [ ] Integrate @qwickapps/auth

- [ ] **Implement users plugin**
  - [ ] CRUD operations
  - [ ] Provider sync

- [ ] **Implement roles plugin**
  - [ ] RBAC model
  - [ ] Permission checking middleware

### Long-term (Next 6 Months)

- [ ] **Implement traffic plugin**
  - [ ] Slot management
  - [ ] CapRover integration
  - [ ] Health-gated promotion
  - [ ] Rollback support

- [ ] **Update @qwickapps/builder**
  - [ ] New templates using server plugins
  - [ ] Plugin scaffolding commands

- [ ] **Migrate existing products**
  - [ ] AuthKeaper (reference implementation)
  - [ ] QwickForge services
  - [ ] Log server

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
2. How do we handle plugin dependencies (e.g., users plugin requires database plugin)?
3. Should traffic orchestration be part of the server or a separate tool (Anvil)?
4. How do we version plugins independently of the core framework?

---

## References

- [Anvil Admin Architecture](/tools/anvil/ADMIN_ARCHITECTURE.md)
- [@qwickapps/auth packages](/packages/qwickapps-auth*)
- [@qwickapps/automation](/packages/qwickapps-automation)
- [@qwickapps/cms](/packages/qwickapps-cms)
- [QwickApps Builder](/packages/qwickapps-builder)
