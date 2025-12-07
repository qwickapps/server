# Changelog

All notable changes to @qwickapps/server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
