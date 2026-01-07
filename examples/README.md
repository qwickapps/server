# @qwickapps/server Examples

Demonstration applications showcasing different aspects of the qwickapps-server framework.

## Examples

### 🎯 demo-kitchen-sink.ts

**Comprehensive showcase of ALL plugins**

A complete demonstration featuring all 26 qwickapps-server plugins:
- Core infrastructure (postgres, cache, health, diagnostics, logs, config)
- User & auth management (auth, api-keys, users, bans, preferences)
- Business logic (devices, profiles, subscriptions, entitlements, usage, parental)
- Advanced features (notifications, rate-limit, qwickbrain, frontend-app)

**Purpose:**
- Reference implementation showing all features
- E2E testing ground
- Plugin integration examples

**Usage:**
```bash
# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and REDIS_URL

# Run the demo
pnpm tsx examples/demo-kitchen-sink.ts
```

**Access:**
- Control Panel: http://localhost:3200/cpanel (admin / demo123)
- Landing Page: http://localhost:3200/
- API: http://localhost:3200/api/v1/demo
- Health: http://localhost:3200/health

---

### 🔧 demo-server.ts

**Basic control panel setup**

Simple control panel with essential plugins.

**Usage:**
```bash
pnpm tsx examples/demo-server.ts
```

---

### 🌐 demo-gateway.ts

**Gateway pattern demonstration**

Shows production-ready gateway setup with proxy configuration.

**Usage:**
```bash
pnpm tsx examples/demo-gateway.ts
```

---

### 🔐 demo-supertokens.ts

**Supertokens authentication**

Demonstrates Supertokens integration for authentication.

**Usage:**
```bash
pnpm tsx examples/demo-supertokens.ts
```

---

## Environment Variables

Create a `.env` file in the examples directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qwickapps_demo

# Redis
REDIS_URL=redis://localhost:6379

# Gateway
GATEWAY_PORT=3200
SERVICE_PORT=3199

# Authentication
ADMIN_PASSWORD=demo123
AUTH_ADAPTER=basic

# Optional: QwickBrain
QWICKBRAIN_API_URL=http://localhost:3300
```

## Prerequisites

- Node.js 18+
- PostgreSQL (for demos using database plugins)
- Redis (for demos using cache plugin)
- pnpm

## Quick Start

```bash
# Install dependencies (from package root)
pnpm install

# Start PostgreSQL and Redis (if using Docker)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15
docker run -d -p 6379:6379 redis:7

# Run kitchen-sink demo
cd examples
cp .env.example .env
pnpm tsx demo-kitchen-sink.ts
```

## Testing

The kitchen-sink demo is used for E2E testing of all plugins. See `__tests__/kitchen-sink/` for test suites.

## UI Showcase

Each plugin provides UI components accessible through the Control Panel:

| Plugin | Status Widget | Management Page | Config UI |
|--------|--------------|-----------------|-----------|
| postgres | ✓ | ✓ | - |
| cache | ✓ | ✓ | - |
| health | ✓ | ✓ | - |
| diagnostics | ✓ | ✓ | - |
| logs | ✓ | ✓ | - |
| config | - | ✓ | - |
| auth | ✓ | ✓ | ✓ |
| api-keys | ✓ | ✓ | - |
| users | ✓ | ✓ | - |
| bans | ✓ | ✓ | - |
| preferences | ✓ | ✓ | - |
| devices | ✓ | ✓ | - |
| profiles | ✓ | ✓ | - |
| subscriptions | ✓ | ✓ | - |
| entitlements | ✓ | ✓ | - |
| usage | ✓ | ✓ | - |
| parental | ✓ | ✓ | - |
| notifications | ✓ | ✓ | - |
| rate-limit | ✓ | ✓ | ✓ |
| qwickbrain | ✓ | ✓ | - |
| frontend-app | - | ✓ | - |

## License

Copyright (c) 2025 QwickApps.com. All rights reserved.
See LICENSE for details.
