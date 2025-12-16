/**
 * Auth Plugin Index
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createAuthPlugin,
  isAuthenticated,
  getAuthenticatedUser,
  getAccessToken,
  requireAuth,
  requireRoles,
  requireAnyRole,
} from './auth-plugin.js';

// Environment-based configuration
export {
  createAuthPluginFromEnv,
  getAuthStatus,
  setAuthConfigStore,
  getAdapterWrapper,
} from './env-config.js';
export type { AuthEnvPluginOptionsExtended } from './env-config.js';

// Config store
export { postgresAuthConfigStore } from './config-store.js';

// Adapter wrapper
export { createAdapterWrapper } from './adapter-wrapper.js';
export type { AdapterWrapper } from './adapter-wrapper.js';

// Types
export type {
  AuthPluginConfig,
  AuthAdapter,
  AuthenticatedUser,
  AuthenticatedRequest,
  Auth0AdapterConfig,
  SupabaseAdapterConfig,
  BasicAdapterConfig,
  SupertokensAdapterConfig,
  // Environment config types
  AuthPluginState,
  AuthEnvPluginOptions,
  AuthConfigStatus,
  // Runtime config types
  AuthAdapterType,
  RuntimeAuthConfig,
  UpdateAuthConfigRequest,
  TestProviderRequest,
  TestProviderResponse,
  AuthConfigStore,
  PostgresAuthConfigStoreConfig,
} from './types.js';
export { isAuthenticatedRequest } from './types.js';

// Adapters
export { auth0Adapter } from './adapters/auth0-adapter.js';
export { basicAdapter } from './adapters/basic-adapter.js';
export { supabaseAdapter } from './adapters/supabase-adapter.js';
export { supertokensAdapter } from './adapters/supertokens-adapter.js';
