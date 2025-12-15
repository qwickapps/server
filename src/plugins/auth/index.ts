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
export { createAuthPluginFromEnv, getAuthStatus } from './env-config.js';

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
} from './types.js';
export { isAuthenticatedRequest } from './types.js';

// Adapters
export { auth0Adapter } from './adapters/auth0-adapter.js';
export { basicAdapter } from './adapters/basic-adapter.js';
export { supabaseAdapter } from './adapters/supabase-adapter.js';
export { supertokensAdapter } from './adapters/supertokens-adapter.js';
