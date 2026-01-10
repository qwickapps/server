/**
 * Auth Plugin Index
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createAuthPlugin, isAuthenticated, getAuthenticatedUser, getAccessToken, requireAuth, requireRoles, requireAnyRole, } from './auth-plugin.js';
export { createAuthPluginFromEnv, getAuthStatus, setAuthConfigStore, getAdapterWrapper, registerAuthConfigRoutes, } from './env-config.js';
export type { AuthEnvPluginOptionsExtended } from './env-config.js';
export { postgresAuthConfigStore } from './config-store.js';
export { createAdapterWrapper } from './adapter-wrapper.js';
export type { AdapterWrapper } from './adapter-wrapper.js';
export type { AuthPluginConfig, AuthAdapter, AuthenticatedUser, AuthenticatedRequest, Auth0AdapterConfig, SupabaseAdapterConfig, BasicAdapterConfig, SupertokensAdapterConfig, AuthPluginState, AuthEnvPluginOptions, AuthConfigStatus, AuthAdapterType, RuntimeAuthConfig, UpdateAuthConfigRequest, TestProviderRequest, TestProviderResponse, AuthConfigStore, PostgresAuthConfigStoreConfig, } from './types.js';
export { isAuthenticatedRequest } from './types.js';
export { auth0Adapter } from './adapters/auth0-adapter.js';
export { basicAdapter } from './adapters/basic-adapter.js';
export { supabaseAdapter } from './adapters/supabase-adapter.js';
export { supertokensAdapter } from './adapters/supertokens-adapter.js';
export { AuthStatusWidget } from './AuthStatusWidget.js';
export type { AuthStatusWidgetProps } from './AuthStatusWidget.js';
export { AuthManagementPage } from './AuthManagementPage.js';
export type { AuthManagementPageProps } from './AuthManagementPage.js';
//# sourceMappingURL=index.d.ts.map