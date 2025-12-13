# Changelog

All notable changes to @qwickapps/server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Logo Configuration**: Consolidated redundant logo properties into single `logoIconUrl` (fixes #336)
  - Replaced `GatewayConfig.logoUrl` with `logoIconUrl`
  - Removed `ControlPanelConfig.branding.logo` (was unused by React UI)
  - Added `ControlPanelConfig.logoIconUrl` for custom logo icons
  - React UI now renders custom logo when `logoIconUrl` is provided in `/api/info`
  - **BREAKING**: Migrate from `logoUrl` to `logoIconUrl` in gateway configs

### Added

- **Plugins Overview Page** in Control Panel UI (closes #346)
  - New core built-in page at `/plugins` showing all registered plugins
  - Plugin list with status badges (active/stopped/error/starting)
  - Expandable details showing plugin contributions (routes, menu items, pages, widgets)
  - Error display for plugins in error state
  - New `ConfigContribution` type for plugins to provide custom settings UI
  - `GET /api/plugins/:id` endpoint for detailed plugin info
  - Enhanced `GET /api/plugins` with contribution counts
  - `addConfigComponent()` and `getPluginContributions()` methods on PluginRegistry

- **Cache Plugin**: `scanKeys()` method using Redis SCAN for non-blocking key iteration (closes #258)
  - Cursor-based iteration prevents blocking Redis on large datasets
  - Accepts optional `count` parameter for batch size hints
  - Deprecated `keys()` method in favor of `scanKeys()` for production use

## [1.3.0] - 2025-12-10

### Added

- **Entitlements Plugin** (`createEntitlementsPlugin`)
  - Pluggable entitlement source with adapter pattern
  - **In-Memory Source** for demo/testing
  - **PostgreSQL Source** (`postgresEntitlementSource`) for production
  - REST API endpoints:
    - `GET /api/entitlements/:email` - Get user entitlements
    - `GET /api/entitlements/:email/check/:entitlement` - Check specific entitlement
    - `POST /api/entitlements/:email/refresh` - Force cache refresh
    - `GET /api/entitlements/available` - List all available entitlements
    - `POST /api/entitlements/:email` - Grant entitlement (writable sources)
    - `DELETE /api/entitlements/:email/:entitlement` - Revoke entitlement
  - Helper functions: `getEntitlements()`, `hasEntitlement()`, `hasAnyEntitlement()`, `hasAllEntitlements()`
  - Dashboard widget showing entitlement statistics

- **Entitlements Page** in Control Panel UI
  - View all available entitlements with categories
  - Search and filter entitlements
  - Add/edit/delete entitlements (writable sources)
  - View users with specific entitlements

- **Users Page** in Control Panel UI
  - View all users with entitlement counts
  - Lookup user entitlements dialog
  - Grant/revoke entitlements from user view
  - Ban/unban users integration

- **Bans Plugin** (`createBansPlugin`)
  - Separated ban management from Users plugin
  - Standalone ban store interface
  - REST API endpoints for ban management

- **Gateway Maintenance Mode**
  - Configurable maintenance pages for mounted apps
  - `MaintenanceConfig`: enabled, title, message, expectedBackAt, contactUrl, bypassPaths
  - Modern responsive design with dark mode support
  - ETA countdown (ISO date, relative time like "2 hours", or "soon")
  - Bypass paths for health checks during maintenance

- **Gateway Service Unavailable Pages**
  - Automatic fallback page when proxied services are unreachable
  - `FallbackConfig`: title, message, showRetry, autoRefresh
  - Auto-refresh countdown (default 30 seconds)
  - Smart content negotiation (JSON for API requests, HTML for browsers)

- **Auth Plugin** (`createAuthPlugin`)
  - Pluggable authentication with adapter pattern
  - **Auth0 Adapter** (`auth0Adapter`)
    - OIDC authentication via express-openid-connect
    - Role-based access control (RBAC) support
    - Domain whitelist filtering
    - Access token exposure for downstream API calls
  - **Basic Adapter** (`basicAdapter`)
    - HTTP Basic authentication
    - Configurable realm
  - **Supabase Adapter** (`supabaseAdapter`)
    - JWT token validation
    - User caching for performance
  - Fallback adapter chain support
  - Helper functions: `isAuthenticated()`, `getAuthenticatedUser()`, `getAccessToken()`
  - Middleware helpers: `requireAuth()`, `requireRoles()`, `requireAnyRole()`

- **Users Plugin** (`createUsersPlugin`)
  - Storage-agnostic user management with UserStore interface
  - **PostgreSQL User Store** (`postgresUserStore`)
    - User CRUD operations
    - Search with pagination and filtering
    - External ID mapping for provider sync
  - **Ban Management** (user-id keyed)
    - Permanent and temporary bans
    - Ban history tracking
    - Automatic cleanup of expired bans
    - Callbacks: `onBan`, `onUnban`
  - **Email Ban Management** (email-keyed, for auth-only scenarios)
    - Ban users by email without storing users locally
    - Helper functions: `isEmailBanned()`, `getEmailBan()`, `banEmail()`, `unbanEmail()`
    - REST API endpoints for email bans
  - REST API endpoints:
    - `GET/POST /api/users` - List/create users
    - `GET/PUT/DELETE /api/users/:id` - Get/update/delete user
    - `GET /api/users/bans` - List active bans
    - `GET/POST/DELETE /api/users/:id/ban` - Manage user bans
    - `GET /api/users/email-bans` - List active email bans
    - `GET/POST /api/users/email-bans/:email` - Get/create email ban
    - `DELETE /api/users/email-bans/:email` - Remove email ban

- **Plugin Registry** (`PluginRegistry`)
  - New centralized plugin registration system replacing PluginManager
  - Cleaner API for plugin lifecycle management
  - Better type safety for plugin metadata and dependencies

- **Dashboard Widget System** for Control Panel UI
  - `DashboardWidgetProvider` context for managing widgets
  - `DashboardWidget` interface for creating custom widgets
  - Built-in widgets: Service Status, Quick Actions
  - Consumer apps can register custom dashboard widgets

- **System Page** in Control Panel UI
  - Displays server version and system information
  - Shows plugin status and configuration

- **UI Library Export** (`@qwickapps/server/ui`)
  - `ControlPanelApp` component for building admin UIs
  - Shared dashboard components
  - Vite library build configuration

### Changed

- **ControlPanelApp Navigation**: Routes now use relative paths (e.g., `/health` instead of `${basePath}/health`)
  - Works correctly with React Router's `basename` prop
  - Integrates with `@qwickapps/react-framework` NavigationContext

- **Control Panel Base Path Injection**
  - Server now injects `window.__APP_BASE_PATH__` into HTML for reliable base path detection
  - Simplified client-side detection from ~50 lines to single global read
  - Works seamlessly behind proxies with X-Forwarded-Prefix support

- **Control Panel Asset Serving**
  - Dynamic asset path rewriting for non-root mount paths
  - Apps mounted at subpaths (e.g., `/cpanel`) now work without rebuilding UI

- **Demo Server**
  - Added `demo-gateway.ts` example with frontend app at `/` and cpanel at `/cpanel`
  - Uses in-memory stores for Users, Bans, and Entitlements

### Fixed

- Fixed `DashboardWidgetProvider` not wrapping app in built-in UI

### Removed

- **PluginManager** - Replaced by simpler PluginRegistry

## [1.2.0] - 2025-12-08

### Changed

- **Reduced Log Verbosity**
  - Moved verbose startup messages to debug level
  - Gateway now logs single concise INFO line: `{productName} started on port {port} (auth: {type})`
  - Detailed route, port, and configuration info logged at debug level
  - Control panel start/stop messages moved to debug level

### Notes

This release includes all features from 1.1.7-1.1.9 (PostgreSQL plugin, Cache plugin, Route Guards, Gateway enhancements) which were not published to npm. If upgrading from 1.1.6, see those version entries for full feature list.

## [1.1.9] - 2025-12-07

### Added

- **Configurable Logo for Landing Page**
  - New `logoUrl` option in `GatewayConfig` to specify a custom product logo
  - When set, the landing page displays the custom logo instead of the default icon
  - Supports SVG, PNG, and other image formats

### Changed

- **Default Landing Page**
  - Logo container now supports both custom images and the default SVG icon
  - Added CSS classes `.logo.custom` and `.logo.default` for differentiated styling

## [1.1.8] - 2025-12-07

### Changed

- **Default Landing Page**
  - Removed "Health Check" button (health can be checked via control panel)
  - Updated footer to "Powered by QwickApps Server - Version x.y.z"
  - "QwickApps Server" links to https://qwickapps.com
  - Version links to https://github.com/qwickapps/server

## [1.1.7] - 2025-12-07

### Added

- **PostgreSQL Plugin** (`createPostgresPlugin`)
  - Connection pooling with configurable max connections
  - Transaction support with `withTransaction()` callback
  - Built-in health checks with configurable intervals
  - Named instances for multi-database support
  - Exports: `getPostgres()`, `hasPostgres()`

- **Cache Plugin** (`createCachePlugin`)
  - Redis-based caching using ioredis
  - Key prefixing and configurable default TTL
  - Full cache API: `get`, `set`, `delete`, `deletePattern`, `keys`, `flush`, `getStats`
  - Built-in health checks
  - Exports: `getCache()`, `hasCache()`

### Changed

- Renamed internal database plugin to postgres-plugin for clarity
- Added backward compatibility aliases (`createDatabasePlugin`, `getDatabase`)

## [1.1.6] - 2025-12-07

### Added

- **Configurable Mount Paths**
  - Control panel now mounts at `/cpanel` by default (configurable via `mountPath`)
  - Root path (`/`) reserved for frontend applications
  - API routes available at `{mountPath}/api/` (e.g., `/cpanel/api/health`)

- **Route Guards System**
  - New unified guard system replaces old auth configuration
  - `BasicAuthGuardConfig` - HTTP Basic authentication
  - `SupabaseAuthGuardConfig` - Supabase JWT token validation
  - `Auth0GuardConfig` - Auth0 OpenID Connect integration
  - `createRouteGuard()` factory function
  - `isAuthenticated()` and `getAuthenticatedUser()` helper functions

- **Frontend App Plugin**
  - New `createFrontendAppPlugin()` for handling root path
  - Support for redirect to another URL
  - Support for serving static files
  - Support for custom landing page with links

- **Gateway Enhancements**
  - `controlPanelPath` - Configurable mount path for control panel
  - `controlPanelGuard` - Guard configuration for control panel
  - `frontendApp` - Configuration for root path handling

### Changed

- Default control panel mount path changed from `/` to `/cpanel`
- Auth configuration replaced with guard-based system

### Removed

- Legacy `auth` configuration in `ControlPanelConfig` (use `guard` instead)
- Legacy `authMode`, `basicAuthUser`, `basicAuthPassword` in `GatewayConfig` (use `controlPanelGuard` instead)

### Breaking Changes

- Applications using the old `auth` configuration must migrate to `guard`
- Applications using gateway `authMode` must migrate to `controlPanelGuard`

## [1.1.5] - 2025-12-06

### Fixed

- Fixed `file:` reference for `@qwickapps/react-framework` devDependency that prevented builds in public repo

## [1.1.4] - 2025-12-06

### Changed

- Updated repository and homepage URLs to point to public GitHub org (https://github.com/qwickapps/control-panel)

## [1.1.3] - 2025-12-06

### Fixed

- Fixed `workspace:*` reference in devDependencies that prevented npm publish

## [1.1.2] - 2025-12-06

### Added

- **Gateway Pattern**
  - New `createGateway()` function for production deployments
  - Gateway runs control panel on public port (3101) and proxies to internal API (3100)
  - Control panel remains responsive even when internal service crashes
  - Built-in HTTP proxy middleware using `http-proxy-middleware`
  - Auto-generated or configurable basic auth for control panel access
  - Graceful error responses when internal service is unavailable

### Dependencies

- Added `http-proxy-middleware` ^3.0.3

## [1.1.1] - 2025-11-29

### Changed

- **Removed Supabase OAuth from core package**
  - Server-side Supabase auth has been removed from @qwickapps/server
  - Authentication should now be handled client-side using `@qwickapps/auth-client`
  - This allows for better separation of concerns and reuse of existing auth infrastructure

### Removed

- `SupabaseAuthConfig` type export
- `supabase-auth.ts` module
- `@supabase/supabase-js` dependency
- `cookie-parser` dependency
- Supabase auth provider option

### Notes

- The `skipBodyParserPaths` feature is retained for proxy middleware support
- For authentication, use `@qwickapps/auth-client` with `SupabaseAuthProvider` in your React app

## [1.1.0] - 2025-11-29

### Added

- **Proxy Middleware Support**
  - Added `skipBodyParserPaths` configuration option
  - Allows control panel to act as a gateway with proxy middleware
  - Prevents body parsing from consuming request body for proxied routes

### Changed

- Body parsing now conditionally skips configured paths

## [1.0.0] - 2025-11-28

### Added

- **Core Framework**
  - Express-based control panel with security middleware (Helmet, CORS, compression)
  - Plugin architecture for extensible functionality
  - Health check management system
  - Basic dashboard UI with product branding

- **Authentication**
  - Basic auth provider with username/password
  - JWT auth provider
  - Custom middleware auth provider

- **Plugins**
  - Health plugin for service monitoring
  - Diagnostics endpoint for system information

- **Built-in Routes**
  - `GET /` - Dashboard UI
  - `GET /api/health` - Aggregated health status
  - `GET /api/diagnostics` - System diagnostics

### Technical Details

- Written in TypeScript with full type exports
- ESM module format
- Express 4.x compatibility
