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

## What's New in v1.5.0

- **Notifications Plugin UI** - Full management page for SSE notifications with stats widget, connected clients table, and disconnect controls
- **Users Plugin Enhancements** - Multi-identifier user lookup (`getUserByIdentifier`), batch queries (`getUsersByIds`), and identifier linking
- **User Search & Ban Management** - Enhanced Control Panel with user search by email/name/ID and ban/unban actions
- **Audit Logging** - Admin actions now include user context (email, IP) for better traceability

See [CHANGELOG.md](./CHANGELOG.md) for full release history.

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
4. Supports maintenance mode with customizable status pages
5. Shows service unavailable pages when mounted apps are unreachable

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

### Mounted Apps with Maintenance Mode

Mount frontend apps or proxy services with full maintenance and fallback support:

```typescript
const gateway = createGateway({
  // ... base config
  mountedApps: [
    {
      path: '/app',
      name: 'Main App',
      type: 'proxy',
      target: 'http://localhost:4000',
      maintenance: {
        enabled: false,  // Toggle to enable maintenance mode
        title: 'Scheduled Maintenance',
        message: 'We are upgrading our systems.',
        expectedBackAt: '2 hours',  // or ISO date, or "soon"
        contactUrl: 'https://status.example.com',
        bypassPaths: ['/app/health', '/app/api/status'],
      },
      fallback: {
        title: 'Service Unavailable',
        message: 'The application is temporarily unavailable.',
        showRetry: true,
        autoRefresh: 30,  // seconds
      },
    },
    {
      path: '/docs',
      name: 'Documentation',
      type: 'static',
      staticPath: './docs-dist',
    },
  ],
});
```

### Maintenance and Fallback Configuration

**MaintenanceConfig** - Shown when maintenance mode is enabled:

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `boolean` | Enable/disable maintenance mode |
| `title` | `string` | Page title (default: "Under Maintenance") |
| `message` | `string` | Custom message to display |
| `expectedBackAt` | `string` | ETA: ISO date, relative time ("2 hours"), or "soon" |
| `contactUrl` | `string` | Link to status page or contact |
| `bypassPaths` | `string[]` | Paths that bypass maintenance (e.g., health checks) |

**FallbackConfig** - Shown when the proxied service is unreachable:

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Page title (default: "Service Unavailable") |
| `message` | `string` | Custom message to display |
| `showRetry` | `boolean` | Show retry button (default: true) |
| `autoRefresh` | `number` | Auto-refresh countdown in seconds (default: 30) |

Both pages feature modern, responsive designs with automatic dark mode support.

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

### API Authentication (M2M)

Enable machine-to-machine authentication for your API routes using bearer tokens. This is ideal for service-to-service communication.

#### Prerequisites

API authentication requires the rate-limit plugin:

```typescript
import { createRateLimitPlugin, postgresRateLimitStore, getPostgres } from '@qwickapps/server';

plugins: [
  // PostgreSQL plugin (required by rate-limit)
  {
    plugin: createPostgresPlugin({
      url: process.env.DATABASE_URL,
    }),
  },

  // Rate-limit plugin (required by API keys auth)
  {
    plugin: createRateLimitPlugin({
      store: postgresRateLimitStore({
        pool: () => getPostgres().getPool(),
      }),
      defaults: {
        maxRequests: 1000,
        windowMs: 60000, // 1 minute
      },
    }),
  },
]
```

#### Enabling Authentication on Routes

Routes can opt-in to M2M authentication by setting `auth: { required: true }`:

```typescript
import { createControlPanel } from '@qwickapps/server';

const controlPanel = createControlPanel({
  config: { /* ... */ },
  plugins: [
    {
      plugin: {
        name: 'my-api',
        async start({ registry }) {
          // Authenticated route - requires API key
          registry.addRoute({
            method: 'post',
            path: '/api/jobs/schedule',
            pluginId: 'my-api',
            auth: { required: true }, // Enable authentication
            handler: async (req, res) => {
              // req.apiKey contains verified key info
              res.json({ success: true });
            },
          });

          // Public route - no authentication required
          registry.addRoute({
            method: 'get',
            path: '/api/status',
            pluginId: 'my-api',
            // No auth property = unauthenticated
            handler: async (req, res) => {
              res.json({ status: 'ok' });
            },
          });
        },
      },
    },
  ],
});
```

#### Generating API Keys

Create M2M API keys for your clients:

```typescript
import { createApiKey } from '@qwickapps/server';

// Generate a new M2M API key
const apiKey = await createApiKey({
  user_id: '00000000-0000-0000-0000-000000000000', // Service user ID
  name: 'production-worker',
  key_type: 'm2m', // Machine-to-machine
  scopes: [], // No scopes required in Phase 1A
  expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
});

console.log(`API Key: ${apiKey.plaintext_key}`);
// Output: qk_live_BdrbOkdpYidqkx0vkFnulmSUR4eYFLbAGndrPOAOxM8
```

**Important**: The `plaintext_key` is only returned once during creation. Store it securely.

#### Using API Keys

Clients pass the API key in the `Authorization` header:

```bash
# cURL example
curl -X POST https://api.example.com/api/jobs/schedule \
  -H "Authorization: Bearer qk_live_BdrbOkdpYidqkx0vkFnulmSUR4eYFLbAGndrPOAOxM8" \
  -H "Content-Type: application/json" \
  -d '{"type": "llm-completion", "model": "gpt-3.5-turbo"}'
```

```typescript
// Node.js example
const response = await fetch('https://api.example.com/api/jobs/schedule', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'llm-completion',
    model: 'gpt-3.5-turbo',
  }),
});
```

#### API Key Management

```typescript
import { listApiKeys, getApiKey, updateApiKey, deleteApiKey } from '@qwickapps/server';

// List all keys for a user
const keys = await listApiKeys(userId);

// Get specific key
const key = await getApiKey(userId, keyId);

// Update key (name, scopes, expiration, active status)
await updateApiKey(userId, keyId, {
  name: 'updated-name',
  is_active: false, // Disable key
});

// Delete (revoke) key
await deleteApiKey(userId, keyId);
```

#### Security Best Practices

1. **Store keys securely**: Use environment variables or secrets management
2. **Rotate keys regularly**: Generate new keys and delete old ones every 90 days
3. **Use HTTPS**: Always transmit keys over encrypted connections
4. **Monitor usage**: Track `last_used_at` to identify unused keys
5. **Set expiration**: Configure `expires_at` for automatic key expiry
6. **Revoke compromised keys**: Delete keys immediately if leaked

#### Error Handling

Authentication failures return HTTP 401:

```json
{
  "success": false,
  "error": "Invalid, expired, or inactive API key"
}
```

Rate limit exceeded returns HTTP 429:

```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
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

#### Auth Plugin

Pluggable authentication with support for multiple providers via the adapter pattern.

##### Zero-Config Environment Setup

The simplest way to configure auth is via environment variables:

```typescript
import { createAuthPluginFromEnv } from '@qwickapps/server';

// Auto-configures based on AUTH_ADAPTER env var
const authPlugin = createAuthPluginFromEnv();

// With overrides
const authPlugin = createAuthPluginFromEnv({
  excludePaths: ['/health', '/metrics'],
  authRequired: true,
});
```

**Environment Variables:**

```bash
# General (required to enable auth)
AUTH_ADAPTER=supertokens|auth0|supabase|basic
AUTH_REQUIRED=true                    # Default: true
AUTH_EXCLUDE_PATHS=/health,/metrics   # Comma-separated
AUTH_DEBUG=false

# Supertokens
SUPERTOKENS_CONNECTION_URI=http://localhost:3567
SUPERTOKENS_APP_NAME=MyApp
SUPERTOKENS_API_DOMAIN=http://localhost:3000
SUPERTOKENS_WEBSITE_DOMAIN=http://localhost:3000
SUPERTOKENS_API_KEY=                  # Optional, for managed service
SUPERTOKENS_GOOGLE_CLIENT_ID=         # Optional social providers
SUPERTOKENS_GOOGLE_CLIENT_SECRET=
SUPERTOKENS_GITHUB_CLIENT_ID=
SUPERTOKENS_GITHUB_CLIENT_SECRET=

# Auth0
AUTH0_DOMAIN=myapp.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=                         # Session encryption secret
AUTH0_AUDIENCE=                       # Optional, for API access tokens
AUTH0_SCOPES=openid,profile,email     # Default scopes

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=

# Basic Auth
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=
BASIC_AUTH_REALM=Protected            # Default: Protected
```

**Plugin States:**

| State | Condition | Behavior |
|-------|-----------|----------|
| `disabled` | `AUTH_ADAPTER` not set | No auth middleware |
| `enabled` | Valid configuration | Auth active |
| `error` | Invalid configuration | Disabled with error details |

**Check Auth Status:**

```typescript
import { getAuthStatus } from '@qwickapps/server';

const status = getAuthStatus();
// { state: 'enabled', adapter: 'supertokens', config: {...} }
```

##### Programmatic Configuration

For more control, configure adapters directly in code:

```typescript
import { createAuthPlugin, auth0Adapter, basicAdapter } from '@qwickapps/server';

// Auth0 with RBAC and domain restrictions
createAuthPlugin({
  adapter: auth0Adapter({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    baseUrl: 'https://myapp.example.com',
    secret: process.env.SESSION_SECRET!,
    audience: process.env.AUTH0_AUDIENCE,    // For API access tokens
    allowedRoles: ['admin', 'support'],       // RBAC filtering
    allowedDomains: ['@company.com'],         // Domain whitelist
    exposeAccessToken: true,                  // For downstream API calls
  }),
  excludePaths: ['/health', '/api/public'],
});

// Basic auth fallback
createAuthPlugin({
  adapter: basicAdapter({
    username: 'admin',
    password: process.env.ADMIN_PASSWORD!,
  }),
});
```

**Available Adapters:**
- `supertokensAdapter` - Supertokens email/password + social logins (requires `supertokens-node`)
- `auth0Adapter` - Auth0 OIDC (requires `express-openid-connect`)
- `supabaseAdapter` - Supabase JWT validation
- `basicAdapter` - HTTP Basic authentication

**Helper Functions:**
```typescript
import { isAuthenticated, getAuthenticatedUser, getAccessToken } from '@qwickapps/server';

// In your route handlers
if (isAuthenticated(req)) {
  const user = getAuthenticatedUser(req);
  // { id, email, name, picture, emailVerified, roles }

  const accessToken = getAccessToken(req);
  // Use for downstream API calls
}
```

**Middleware Helpers:**
```typescript
import { requireAuth, requireRoles, requireAnyRole } from '@qwickapps/server';

// Require authentication
app.get('/admin', requireAuth(), (req, res) => { ... });

// Require specific roles (all required)
app.get('/admin/users', requireRoles('admin', 'user-manager'), (req, res) => { ... });

// Require any of the roles
app.get('/dashboard', requireAnyRole('admin', 'editor', 'viewer'), (req, res) => { ... });
```

#### Users Plugin

Storage-agnostic user management with ban support.

```typescript
import { createUsersPlugin, postgresUserStore, getPostgres } from '@qwickapps/server';
import { Pool } from 'pg';

// Create with PostgreSQL storage
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

createUsersPlugin({
  store: postgresUserStore({
    pool,
    usersTable: 'users',
    bansTable: 'user_bans',
    autoCreateTables: true,
  }),
  bans: {
    enabled: true,
    supportTemporary: true, // Enable expiring bans
    onBan: async (user, ban) => {
      // Notify external systems, revoke sessions, etc.
      console.log(`User ${user.email} banned: ${ban.reason}`);
    },
    onUnban: async (user) => {
      console.log(`User ${user.email} unbanned`);
    },
  },
  api: {
    prefix: '/api/users',
    crud: true,    // GET/POST/PUT/DELETE /api/users
    search: true,  // GET /api/users?q=...
    bans: true,    // Ban management endpoints
  },
});
```

**REST API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List/search users |
| `/api/users` | POST | Create user |
| `/api/users/:id` | GET | Get user by ID |
| `/api/users/:id` | PUT | Update user |
| `/api/users/:id` | DELETE | Delete user |
| `/api/users/bans` | GET | List active bans |
| `/api/users/:id/ban` | GET | Get user's ban status |
| `/api/users/:id/ban` | POST | Ban user |
| `/api/users/:id/ban` | DELETE | Unban user |
| `/api/users/:id/bans` | GET | Get user's ban history |

**Helper Functions:**
```typescript
import { getUserById, getUserByEmail, isUserBanned, findOrCreateUser } from '@qwickapps/server';

// Get user
const user = await getUserById('user-123');
const userByEmail = await getUserByEmail('test@example.com');

// Check ban status
const banned = await isUserBanned('user-123');

// Find or create from auth provider
const user = await findOrCreateUser({
  email: 'user@example.com',
  name: 'Test User',
  external_id: 'auth0|12345',
  provider: 'auth0',
});
```

**Email Ban Support (for auth-only scenarios):**

For cases where you don't store users locally but need to ban by email:

```typescript
import { isEmailBanned, getEmailBan, banEmail, unbanEmail } from '@qwickapps/server';

// Check if email is banned
const banned = await isEmailBanned('user@example.com');

// Get ban details
const ban = await getEmailBan('user@example.com');

// Ban an email
await banEmail({
  email: 'user@example.com',
  reason: 'Spam activity',
  banned_by: 'admin@company.com',
  duration: 86400, // 24 hours (optional, null = permanent)
});

// Unban an email
await unbanEmail({
  email: 'user@example.com',
  unbanned_by: 'admin@company.com',
  note: 'Cleared after review',
});
```

**Email Ban API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/email-bans` | GET | List active email bans |
| `/api/users/email-bans/:email` | GET | Check email ban status |
| `/api/users/email-bans` | POST | Ban an email |
| `/api/users/email-bans/:email` | DELETE | Unban an email |

#### Preferences Plugin

Per-user preferences storage with PostgreSQL Row-Level Security (RLS) for data isolation.

```typescript
import { createPreferencesPlugin, postgresPreferencesStore } from '@qwickapps/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

createPreferencesPlugin({
  store: postgresPreferencesStore({
    pool,
    tableName: 'user_preferences',
    autoCreateTables: true,
    enableRLS: true,  // Enable Row-Level Security
  }),
  defaults: {
    theme: 'system',
    notifications: {
      email: true,
      push: true,
    },
  },
  api: {
    prefix: '/preferences',
    enabled: true,
  },
});
```

**Note:** The Preferences plugin requires the Users plugin to be loaded first, as it creates a foreign key reference to the users table.

**REST API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/preferences` | GET | Get current user's preferences (merged with defaults) |
| `/api/preferences` | PUT | Update preferences (deep merge with existing) |
| `/api/preferences` | DELETE | Reset preferences to defaults |

**Helper Functions:**
```typescript
import {
  getPreferences,
  updatePreferences,
  deletePreferences,
  getDefaultPreferences,
  deepMerge,
} from '@qwickapps/server';

// Get user preferences (merged with defaults)
const prefs = await getPreferences('user-123');

// Update preferences (deep merge - preserves nested values)
const updated = await updatePreferences('user-123', {
  theme: 'dark',
  notifications: { email: false },
});
// Result: { theme: 'dark', notifications: { email: false, push: true } }

// Reset to defaults
await deletePreferences('user-123');

// Get configured defaults
const defaults = getDefaultPreferences();

// Deep merge utility (exported for custom use)
const merged = deepMerge(baseObject, overrides);
```

**Security Features:**
- PostgreSQL Row-Level Security ensures users can only access their own preferences
- Transaction-safe RLS context for connection pooling compatibility
- Input validation: 100KB size limit, 10-level nesting depth
- Foreign key to users table with `ON DELETE CASCADE`

#### Rate Limit Plugin

API rate limiting with multiple strategies, PostgreSQL persistence, and Redis caching.

```typescript
import {
  createRateLimitPlugin,
  postgresRateLimitStore,
  rateLimitMiddleware,
} from '@qwickapps/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Add plugin to gateway
createRateLimitPlugin({
  store: postgresRateLimitStore({
    pool,
    tableName: 'rate_limits',
    autoCreateTables: true,
    enableRLS: true,
  }),
  defaults: {
    windowMs: 60000,      // 1 minute window
    maxRequests: 100,     // 100 requests per window
    strategy: 'sliding-window',  // or 'fixed-window', 'token-bucket'
  },
  cache: {
    type: 'auto',  // 'redis' | 'memory' | 'auto' (uses Redis if available)
  },
  cleanup: {
    enabled: true,
    intervalMs: 300000,  // Clean up expired limits every 5 minutes
  },
});

// Use middleware on routes
app.use('/api', rateLimitMiddleware());

// Per-route configuration
app.post('/api/chat', rateLimitMiddleware({
  windowMs: 60000,
  max: 50,  // Lower limit for expensive operations
  keyGenerator: (req) => `chat:${req.user?.id}`,
}));

// Dynamic limits based on user tier
app.use(rateLimitMiddleware({
  max: (req) => req.user?.tier === 'premium' ? 1000 : 50,
}));
```

**Rate Limiting Strategies:**
| Strategy | Description | Best For |
|----------|-------------|----------|
| `sliding-window` | Smooth rate limiting with weighted overlap | Most use cases (default) |
| `fixed-window` | Simple discrete time windows | High performance, simple needs |
| `token-bucket` | Allows bursts while maintaining average rate | APIs needing burst capacity |

**REST API Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rate-limit/status` | GET | Get rate limit status for current user |
| `/api/rate-limit/status/:key` | GET | Get status for a specific key |
| `/api/rate-limit/clear/:key` | DELETE | Clear a rate limit (requires auth) |

**Programmatic API:**
```typescript
import {
  isLimited,
  checkLimit,
  incrementLimit,
  getRemainingRequests,
  getLimitStatus,
  clearLimit,
} from '@qwickapps/server';

// Check if rate limited
const limited = await isLimited('user:123:api');

// Get full status without incrementing
const status = await checkLimit('user:123:api');
// { limited: false, current: 45, limit: 100, remaining: 55, resetAt: 1702656000, retryAfter: 30 }

// Increment and get status
const result = await incrementLimit('user:123:api');

// Clear limit (e.g., after CAPTCHA)
await clearLimit('user:123:api');
```

**Response Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 55
RateLimit-Reset: 1702656000
Retry-After: 30  (only when limited)
```

**Security Features:**
- PostgreSQL Row-Level Security isolates rate limits per user
- Redis caching with in-memory fallback for high availability
- Fail-open by default (allows requests on errors)

**Environment Variable Configuration:**

Use `createRateLimitPluginFromEnv()` for zero-config setup:

```typescript
import { createRateLimitPluginFromEnv, createPostgresPlugin } from '@qwickapps/server';

// Requires postgres-plugin to be registered first
const gateway = createGateway({
  plugins: [
    createPostgresPlugin({ /* ... */ }),
    createRateLimitPluginFromEnv(),  // Reads config from env vars
  ],
});
```

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_STRATEGY` | `sliding-window` | Strategy: `sliding-window`, `fixed-window`, `token-bucket` |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Window size in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Maximum requests per window |
| `RATE_LIMIT_CACHE_TYPE` | `auto` | Cache type: `redis`, `memory`, `auto` |
| `RATE_LIMIT_CLEANUP_ENABLED` | `true` | Enable cleanup job |
| `RATE_LIMIT_CLEANUP_INTERVAL_MS` | `300000` | Cleanup interval (5 min) |
| `RATE_LIMIT_API_ENABLED` | `true` | Enable status API endpoints |
| `RATE_LIMIT_API_PREFIX` | `/rate-limit` | API route prefix |
| `RATE_LIMIT_TABLE_NAME` | `rate_limits` | PostgreSQL table name |
| `RATE_LIMIT_ENABLE_RLS` | `true` | Enable Row-Level Security |
| `RATE_LIMIT_AUTO_CREATE_TABLES` | `true` | Auto-create tables |
| `RATE_LIMIT_DEBUG` | `false` | Enable debug logging |

Config status endpoint: `GET /api/rate-limit/config/status`

**Runtime Configuration UI:**

The Rate Limit plugin includes a Control Panel page for live configuration:
- Navigate to `/rate-limits` in the Control Panel
- Edit default window size, max requests, and strategy
- Toggle cleanup job on/off and adjust interval
- Changes take effect immediately (no restart required)

**Runtime Config API:**
```bash
# Get current config
curl http://localhost:3000/api/rate-limit/config

# Update config at runtime
curl -X PUT http://localhost:3000/api/rate-limit/config \
  -H "Content-Type: application/json" \
  -d '{"maxRequests": 200, "windowMs": 120000, "strategy": "token-bucket"}'
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
# Build trigger Mon Dec 29 09:36:28 EST 2025
