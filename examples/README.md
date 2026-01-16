# @qwickapps/server Examples

Demonstration applications showcasing different aspects of the qwickapps-server framework.

## Port Scheme

All demos use ports 4000+ to avoid conflicts and run entirely in-memory:
- **demo-server.ts**: Port 4000 - Basic control panel with essential plugins
- **demo-gateway.ts**: Port 4100 (gateway), 4101 (cpanel) - Gateway pattern with core plugins
- **demo-all.ts**: Port 4000 (gateway), 3999 (cpanel) - Comprehensive showcase of core plugins

**All demos use in-memory stores** - no external database installation required!

## Examples

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

### 🎯 demo-all.ts

**Complete plugin showcase**

Comprehensive demonstration of core qwickapps-server plugins with in-memory stores. Perfect for E2E testing, learning the framework capabilities, and seeing plugins working together.

**Plugins Included (11 total):**
- **CORE (5):** health, diagnostics, logs, config, maintenance
- **AUTH (4):** users, bans, entitlements, tenants
- **ADVANCED (2):** notifications, frontend-app

**Features Demonstrated:**
- User management with demo data
- Ban management for user restrictions
- Entitlements for feature gating
- Multi-tenant data isolation
- Real-time SSE notifications
- Health monitoring and diagnostics

**Usage:**
```bash
npm run demo:all
```

**Access:**
- Gateway: http://localhost:4000
- Control Panel: http://localhost:4000/cpanel
- Credentials: admin / demo123

---

## Environment Variables (Optional)

All demos work out-of-the-box with sensible defaults. You can optionally create a `.env` file to customize:

```env
# Ports (optional - defaults shown)
PORT=4000                 # demo-server.ts
GATEWAY_PORT=4100         # demo-gateway.ts
CPANEL_PORT=4101          # demo-gateway.ts

# Authentication (optional)
AUTH_ADAPTER=basic        # Enable auth (basic, auth0, supabase, supertokens)
ADMIN_PASSWORD=demo123    # Basic auth password

# QwickBrain (optional)
QWICKBRAIN_API_URL=http://localhost:3300
```

**Note:** No database configuration needed - all demos use in-memory stores!

## Prerequisites

- Node.js 18+
- pnpm

**That's it!** All demos use in-memory stores. No external database setup required!

## Quick Start

```bash
# Install dependencies (from package root)
pnpm install

# Run any demo instantly (each has auto-build)
npm run demo              # Port 4000 (basic control panel)
npm run demo:gateway      # Port 4100-4101 (gateway pattern)
npm run demo:all          # Port 4000-3999 (core plugins showcase)
```

All demos start instantly with no external dependencies!

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
