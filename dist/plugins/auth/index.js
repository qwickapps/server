/**
 * Auth Plugin Index
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createAuthPlugin, isAuthenticated, getAuthenticatedUser, getAccessToken, requireAuth, requireRoles, requireAnyRole, } from './auth-plugin.js';
// Environment-based configuration
export { createAuthPluginFromEnv, getAuthStatus, setAuthConfigStore, getAdapterWrapper, 
// Export for applications using createAuthPlugin directly (e.g., QwickSecrets)
// Allows them to add config routes without using createAuthPluginFromEnv wrapper
registerAuthConfigRoutes, } from './env-config.js';
// Config store
export { postgresAuthConfigStore } from './config-store.js';
// Adapter wrapper
export { createAdapterWrapper } from './adapter-wrapper.js';
export { isAuthenticatedRequest } from './types.js';
// Adapters
export { auth0Adapter } from './adapters/auth0-adapter.js';
export { basicAdapter } from './adapters/basic-adapter.js';
export { supabaseAdapter } from './adapters/supabase-adapter.js';
export { supertokensAdapter } from './adapters/supertokens-adapter.js';
// UI Components
export { AuthStatusWidget } from './AuthStatusWidget.js';
export { AuthManagementPage } from './AuthManagementPage.js';
//# sourceMappingURL=index.js.map