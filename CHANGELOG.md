# Changelog

All notable changes to @qwickapps/server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Seed Management UI**: Database seed script management with real-time execution monitoring (#702)
  - Seed discovery: Auto-discover `seed-*.mjs` scripts in configured scripts directory
  - Real-time execution: Stream stdout/stderr via Server-Sent Events (SSE)
  - Execution history: Track seed runs with status, duration, and output (requires PostgreSQL)
  - Security: Path traversal prevention, concurrent execution blocking, minimal environment isolation
  - API endpoints: `/api/maintenance/seeds/discover`, `/api/maintenance/seeds/execute`, `/api/maintenance/seeds/history`
  - Startup cleanup: Automatically marks orphaned 'running' executions as failed on server restart
  - Process isolation: Child processes spawned with `process.execPath` for reliable node binary resolution

- **Preferences UI**: User preferences management page with JSON editor (#592)
  - PreferencesPage component with real-time JSON validation and syntax highlighting
  - Client-side nesting depth validation (max 10 levels)
  - Size limit indicator with color coding (100KB max)
  - Actions: Save, Reset to Defaults, Format JSON
  - Preferences API methods: `getPreferences()`, `updatePreferences()`, `deletePreferences()`
  - Exported `MAX_PREFERENCES_SIZE` and `MAX_NESTING_DEPTH` constants from backend types
  - Plugin registry integration: backend registers UI page via `registry.addPage()`

- **API Keys Phase 2: Scope-Based Authorization** (#573)
  - Plugin-declared scopes: Plugins can now declare scopes via `scopes` property
  - QwickBrain declares `qwickbrain:read` and `qwickbrain:execute` scopes
  - Automatic scope registration: API Keys plugin auto-registers scopes when plugins start
  - Plugin scope store: PostgreSQL storage for plugin-declared scopes with caching
  - Usage log store: Partitioned tables track all API key requests with 30-day intervals
  - GET `/cpanel/api/auth/scopes` endpoint - List all available scopes grouped by plugin
  - GET `/cpanel/api/auth/keys/:id/usage` endpoint - Usage logs with query filters and statistics
  - Usage logging middleware: Async, non-blocking request logging using setImmediate
  - Scope format: `plugin-id:action` (e.g., `qwickbrain:execute`)
  - Backwards compatibility: Legacy scopes (`read`, `write`, `admin`) auto-convert to `system:*`
  - System scopes seeded: `system:read`, `system:write`, `system:admin`
  - Usage statistics: Calls by status code, calls by endpoint, total calls, last used timestamp

## [1.6.1] - 2026-01-06

### Fixed

- **Plugin Route Prefixes** - Auto-detect and fix duplicate slug prefixes in plugin routes (#746)
  - Added runtime auto-fix in plugin-registry.ts to detect duplicate slug in route paths
  - Auto-normalizes paths to prevent double-prefixing (e.g., `/api/users/users` → `/api/users`)
  - Logs warning with fix instructions when duplicate detected
  - Added pre-commit hook to catch duplicate slug patterns before commit
  - Fixed authkeaper plugin configurations (users, bans, entitlements, auth0-settings)
  - Prevents 404 errors caused by double-prefixed routes

## [1.6.0] - 2025-12-25

### Added

- **User Invitation System** - Complete user invitation workflow for control panel
  - Added invitation creation, acceptance, and management APIs
  - Added `AcceptInvitationPage` UI for users to accept invitations
  - Added invitation UI to `UsersPage` for admins to send invitations
  - Store invitations in PostgreSQL with expiration and token validation
  - Support for role assignment during invitation

### Fixed

- **Frontend API Paths** - Fixed UI calling incorrect API endpoints
  - Updated logs API paths: `/api/logs` → `/api/logs/logs`, `/api/logs/sources` → `/api/logs/logs/sources`
  - Updated users API paths: `/api/users` → `/api/users/users` and all related endpoints
  - Fixes "Logs request failed" error on logs page
  - Fixes users page indefinite loading issue
  - Aligns frontend paths with plugin slug prefixing (introduced in v1.6.0)
- **Route Registration** - Fixed plugin routes not being accessible
  - Plugin routes now correctly register on the router instead of app
  - Routes are properly mounted at `/cpanel/api/*` endpoints
  - Fixes 404 errors for `/cpanel/api/users`, `/cpanel/api/logs`, etc.
- **Auth Exclusion Paths** - Fixed auth middleware blocking control panel
  - Added `/cpanel` to excludePaths to match both `/cpanel` and `/cpanel/*`
  - Control panel now correctly bypasses SuperTokens authentication
  - Basic auth guard works properly for admin access

### Removed

- **QwickBrain Plugin** - Removed redundant `qwickbrain-tailscale` health check
  - Removed health check that required tailscale CLI inside Docker container
  - Removed `tailscaleStatus` field from `QwickBrainConnectionStatus` interface
  - Removed `checkTailscaleStatus()` function
  - Existing `tailscale` and `qwickbrain-connection` health checks provide sufficient monitoring

## [1.5.2] - 2025-12-21

### Fixed

- **Basic Auth Guard** - Fixed repeated login prompts in Control Panel (#523)
  - Added session cookie support to basic auth guard
  - After successful authentication, a signed session cookie is set
  - Subsequent requests use the session cookie instead of re-prompting for credentials
  - Configurable session duration via `sessionDurationHours` (default: 8 hours)
  - Adds `Secure` flag automatically when running over HTTPS
  - Fixes issue where users had to login 4-5 times to access `/cpanel/users`

### Added

- **Auth Plugin onAuthenticated Callback** - New callback for syncing users on authentication
  - Added `onAuthenticated` callback to `AuthPluginConfig` and `AuthEnvPluginOptions`
  - Called after successful authentication with the authenticated user's info
  - Use this to sync users to a local database on first login
  - Errors in callback are logged but don't fail the authentication
- **Guards Unit Tests** - Comprehensive test suite for route guards (14 tests)

## [1.5.1] - 2025-12-18

### Fixed

- **npm Package** - Include CHANGELOG.md in published package
- **README** - Add "What's New" section highlighting v1.5.0 features
- **Input Validation** - `getByIdentifier()` now throws if no identifiers provided
- **Zero-value IDs** - Fixed `wp_user_id` and `keap_contact_id` to allow 0 as valid identifier
- **Memory Leak** - Fixed potential memory leak in NotificationsPage component
- **Audit Logging** - Disconnect actions now log admin user info (userId, email, IP)

### Added

- **Unit Tests** - Comprehensive tests for postgres store methods (`getByIdentifier`, `linkIdentifiers`, `getByIds`)

## [1.5.0] - 2025-12-18

### Added

- **Notifications Plugin UI** - Stats widget and management UI for notifications (#484)
  - `NotificationsStatsWidget` - Dashboard widget showing notification statistics
  - `NotificationsPage` - Full management UI for viewing and managing notifications
  - `StatCard` component - Reusable statistics display component
  - `formatters` utility - Number and date formatting helpers

- **Users Plugin Enhancements** - Improved user search and ban management (#491)
  - Enhanced search functionality in Control Panel users page
  - Search users by email, name, or external ID
  - Ban management directly from user list with ban/unban actions
  - Updated `controlPanelApi` with expanded user management endpoints

### Fixed

- **Profile Sync** - Multi-identifier lookup for Auth0 profile sync (#492)
  - Improved user matching with multiple identifier support

## [1.4.0] - 2025-12-16

### Added

- **Rate Limit Plugin** (`createRateLimitPlugin`) - API rate limiting with multiple strategies (#401)
  - Three rate limiting strategies: sliding window (default), fixed window, token bucket
  - PostgreSQL persistence with Row-Level Security (RLS) for multi-tenant isolation
  - Redis caching with in-memory fallback (via cache plugin)
  - Express middleware (`rateLimitMiddleware`) for automatic enforcement
  - Programmatic API: `isLimited`, `checkLimit`, `incrementLimit`, `getRemainingRequests`, `clearLimit`
  - Standard rate limit headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, `Retry-After`
  - Auto-cleanup of expired limits
  - Configurable scopes: user, tenant, IP
  - **Environment Config** (`createRateLimitPluginFromEnv`) for zero-config setup via env vars
  - **Runtime Config UI** - Control Panel page for live configuration changes
    - Edit window size, max requests, strategy at runtime
    - Toggle cleanup job on/off
    - View store and cache status
  - **Config API** (`GET/PUT /api/rate-limit/config`) for programmatic runtime updates
  - **PostgreSQL Store** (`postgresRateLimitStore`) with RLS policies
  - **Cache Store** (`createRateLimitCache`) with Redis/memory support
  - Status API endpoints: `GET /rate-limit/status`, `DELETE /rate-limit/clear/:key`
  - New types: `RateLimitPluginConfig`, `LimitStatus`, `RateLimitMiddlewareOptions`, `RateLimitEnvPluginOptions`

### Fixed

- **Supabase Adapter TypeScript Error** - Fix build failure with `response.json()` returning `unknown`
  - Added `SupabaseUserResponse` interface for type-safe Supabase API responses
  - Node.js fetch types (`undici-types`) correctly return `Promise<unknown>` from `json()`
  - This caused TS18046 errors when accessing properties on the response
  - Fixes GitHub Actions publish workflow failure

### Added

- **Auth Plugin Runtime Configuration** - Control Panel UI for auth config with hot-reload (#394)
  - Editable configuration forms for all auth providers (Auth0, Supabase, SuperTokens, Basic)
  - PostgreSQL-backed config store with `pg_notify` for cross-instance sync
  - Adapter wrapper pattern enables hot-reload without server restart
  - Test connection feature validates provider before saving
  - API endpoints: `PUT /api/auth/config`, `DELETE /api/auth/config`, `POST /api/auth/test-provider`
  - New exports: `postgresAuthConfigStore()`, `setAuthConfigStore()`, `createAdapterWrapper()`, `getAdapterWrapper()`
  - New types: `RuntimeAuthConfig`, `UpdateAuthConfigRequest`, `TestProviderRequest`, `TestProviderResponse`, `AuthConfigStore`, `PostgresAuthConfigStoreConfig`
  - Social providers panel for SuperTokens (Google, GitHub, Apple)
  - Reset to environment variables functionality
  - SQL injection protection with identifier validation
  - URL validation for SSRF protection in test connections
  - Exponential backoff for pg_notify reconnection (1s → 60s max)
  - **Note**: Hot-reload swaps `isAuthenticated/getUser` methods immediately; Express middleware routes (e.g., OAuth callbacks) require server restart to fully apply

- **Auth Plugin Environment Configuration** - Zero-code auth setup via environment variables (#393)
  - New `createAuthPluginFromEnv()` factory function
  - Supports ALL 4 adapters: Auth0, Supabase, Supertokens, Basic
  - Plugin states: disabled (no config), enabled (valid config), error (invalid config)
  - Clear error messages listing missing environment variables
  - Control Panel Auth page showing configuration status
  - `getAuthStatus()` function to check current auth state
  - API endpoints: `GET /api/auth/config/status`, `GET /api/auth/config`
  - New types: `AuthPluginState`, `AuthEnvPluginOptions`, `AuthConfigStatus`
  - Comprehensive env var support (30+ variables across all adapters)
  - Secrets automatically masked in status responses

- **Supertokens Auth Adapter** - Self-hosted authentication with Supertokens (#392)
  - Supports email/password authentication via EmailPassword recipe
  - Supports social logins (Google, Apple, GitHub) via ThirdParty recipe
  - Uses Supertokens' native session management (HTTP-only cookies)
  - Lazy initialization - doesn't require supertokens-node unless used
  - Configurable options: enable/disable email/password, custom API paths
  - Integrates with existing `requireAuth()` middleware
  - New types: `SupertokensAdapterConfig`
  - Requires `supertokens-node` v20+ as optional peer dependency

- **Users Plugin: User Info API** - Comprehensive user information aggregation (#352)
  - `GET /api/users/:id/info` - Get comprehensive user info from all loaded plugins
  - `POST /api/users/sync` - Find or create user and return full info (for Auth0/OAuth triggers)
  - `buildUserInfo()` helper aggregates data in parallel from:
    - Entitlements plugin (user's entitlements)
    - Preferences plugin (user's preferences)
    - Bans plugin (active ban status)
  - Graceful degradation when plugins are not loaded
  - Error resilience - partial failures don't break the entire request
  - New types: `UserInfo`, `UserSyncInput`

- **Preferences Plugin** (`createPreferencesPlugin`) - User preferences management with PostgreSQL RLS (#349)
  - Row-Level Security (RLS) for database-level data isolation
  - Foreign key to users table with `ON DELETE CASCADE`
  - Transaction-safe RLS context setting for connection pooling
  - Deep merge updates (preserve nested objects on partial updates)
  - Configurable default preferences
  - Input validation (100KB size limit, 10-level nesting depth)
  - **PostgreSQL Store** (`postgresPreferencesStore`)
    - Creates `user_preferences` table with RLS policies
    - `WITH CHECK` clause for complete RLS protection on writes
  - **REST API endpoints**:
    - `GET /api/preferences` - Get current user's preferences (merged with defaults)
    - `PUT /api/preferences` - Update preferences (deep merge)
    - `DELETE /api/preferences` - Reset to defaults
  - **Helper functions**: `getPreferences()`, `updatePreferences()`, `deletePreferences()`, `getDefaultPreferences()`
  - **Utility**: `deepMerge()` function exported for custom merge operations

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
