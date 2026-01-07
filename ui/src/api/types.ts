/**
 * API Client Type Definitions
 *
 * Type-safe API client interfaces for the auto-generated client.
 * These types are manually maintained and should be updated when
 * new plugins/routes are added.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  HealthResponse,
  InfoResponse,
  DiagnosticsResponse,
  ConfigResponse,
  LogsResponse,
  LogSource,
  UsersResponse,
  User,
  InviteUserRequest,
  InvitationResponse,
  BansResponse,
  ApiKeysResponse,
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  AvailableScopesResponse,
  KeyUsageResponse,
  EntitlementsStatus,
  UiContributionsResponse,
  PluginsResponse,
  AuthConfigStatus,
  RuntimeAuthConfig,
  UpdateAuthConfigRequest,
  TestProviderRequest,
  TestProviderResponse,
  NotificationsStatsResponse,
  NotificationsClientsResponse,
  RateLimitConfigUpdateRequest,
  RateLimitConfigUpdateResponse,
  PreferencesResponse,
} from './controlPanelApi.js';

// =============================================================================
// Route Manifest Types
// =============================================================================

/**
 * Type-safe API route manifest
 *
 * Manually maintained to provide IDE autocomplete and type checking.
 * Update when new plugins/routes are added.
 */
export interface APIClientManifest {
  routes: {
    // Config plugin (separate namespace)
    'config.query': { method: 'GET'; path: '/api/config'; auth: true };

    // Core routes
    'core.health': { method: 'GET'; path: '/api/health'; auth: false };
    'core.info': { method: 'GET'; path: '/api/info'; auth: false };
    'core.diagnostics': { method: 'GET'; path: '/api/diagnostics'; auth: false };
    'core.uiContributions': { method: 'GET'; path: '/api/ui-contributions'; auth: false };
    'core.plugins': { method: 'GET'; path: '/api/plugins'; auth: false };

    // Logs plugin
    'logs.query': { method: 'GET'; path: '/api/logs'; auth: true };
    'logs.sources': { method: 'GET'; path: '/api/logs/sources'; auth: true };

    // Users plugin
    'users.query': { method: 'GET'; path: '/api/users'; auth: true };
    'users.get': { method: 'GET'; path: '/api/users/:id'; auth: true };
    'users.invite': { method: 'POST'; path: '/api/users/invite'; auth: true };

    // Bans plugin
    'bans.query': { method: 'GET'; path: '/api/bans'; auth: true };

    // API Keys plugin (camelCase namespace)
    'apiKeys.query': { method: 'GET'; path: '/api/api-keys'; auth: true };
    'apiKeys.create': { method: 'POST'; path: '/api/api-keys'; auth: true };
    'apiKeys.get': { method: 'GET'; path: '/api/api-keys/:id'; auth: true };
    'apiKeys.update': { method: 'PUT'; path: '/api/api-keys/:id'; auth: true };
    'apiKeys.delete': { method: 'DELETE'; path: '/api/api-keys/:id'; auth: true };
    'apiKeys.scopes': { method: 'GET'; path: '/api/api-keys/scopes'; auth: true };
    'apiKeys.usage': { method: 'GET'; path: '/api/api-keys/:id/usage'; auth: true };

    // Entitlements plugin
    'entitlements.query': { method: 'GET'; path: '/api/entitlements'; auth: true };

    // Auth plugin
    'auth.status': { method: 'GET'; path: '/api/auth/status'; auth: true };
    'auth.config': { method: 'GET'; path: '/api/auth/config'; auth: true };
    'auth.update': { method: 'PUT'; path: '/api/auth/config'; auth: true };
    'auth.test': { method: 'POST'; path: '/api/auth/test-provider'; auth: true };

    // Notifications plugin
    'notifications.stats': { method: 'GET'; path: '/api/notifications/stats'; auth: true };
    'notifications.clients': { method: 'GET'; path: '/api/notifications/clients'; auth: true };

    // Rate Limit plugin (camelCase namespace)
    'rateLimit.config': { method: 'GET'; path: '/api/rate-limit/config'; auth: true };
    'rateLimit.update': { method: 'PUT'; path: '/api/rate-limit/config'; auth: true };

    // Preferences plugin
    'preferences.query': { method: 'GET'; path: '/api/preferences'; auth: true };
  };
}

// =============================================================================
// Generated API Client Types
// =============================================================================

/**
 * Query parameters for log queries
 */
export interface LogQueryParams {
  level?: string;
  source?: string;
  limit?: number;
  offset?: number;
  startTime?: string;
  endTime?: string;
}

/**
 * Query parameters for user queries
 */
export interface UserQueryParams {
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for bans
 */
export interface BanQueryParams {
  userId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for API keys
 */
export interface ApiKeyQueryParams {
  userId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Query parameters for entitlements
 */
export interface EntitlementQueryParams {
  userId?: string;
}

/**
 * Query parameters for preferences
 */
export interface PreferenceQueryParams {
  userId?: string;
}

/**
 * Generated API Client interface
 *
 * Provides type-safe access to all API routes.
 * Auto-generated at runtime, types defined manually.
 */
export interface APIClient {
  /** Configuration plugin routes */
  config: {
    /** Get server configuration */
    query: () => Promise<ConfigResponse>;
  };

  /** Core system routes */
  core: {
    /** Health check endpoint */
    health: () => Promise<HealthResponse>;
    /** Server information */
    info: () => Promise<InfoResponse>;
    /** System diagnostics */
    diagnostics: () => Promise<DiagnosticsResponse>;
    /** UI contributions from plugins */
    uiContributions: () => Promise<UiContributionsResponse>;
    /** List plugins */
    plugins: () => Promise<PluginsResponse>;
  };

  /** Logs plugin routes */
  logs: {
    /** Query logs */
    query: (params?: LogQueryParams) => Promise<LogsResponse>;
    /** Get log sources */
    sources: () => Promise<LogSource[]>;
  };

  /** Users plugin routes */
  users: {
    /** Query users */
    query: (params?: UserQueryParams) => Promise<UsersResponse>;
    /** Get user by ID */
    get: (id: string) => Promise<User>;
    /** Invite new user */
    invite: (data: InviteUserRequest) => Promise<InvitationResponse>;
  };

  /** Bans plugin routes */
  bans: {
    /** Query bans */
    query: (params?: BanQueryParams) => Promise<BansResponse>;
  };

  /** API Keys plugin routes */
  apiKeys: {
    /** Query API keys */
    query: (params?: ApiKeyQueryParams) => Promise<ApiKeysResponse>;
    /** Create API key */
    create: (data: CreateApiKeyRequest) => Promise<ApiKey>;
    /** Get API key by ID */
    get: (id: string) => Promise<ApiKey>;
    /** Update API key */
    update: (id: string, data: UpdateApiKeyRequest) => Promise<ApiKey>;
    /** Delete API key */
    delete: (id: string) => Promise<void>;
    /** Get available scopes */
    scopes: () => Promise<AvailableScopesResponse>;
    /** Get key usage stats */
    usage: (id: string) => Promise<KeyUsageResponse>;
  };

  /** Entitlements plugin routes */
  entitlements: {
    /** Query entitlements */
    query: (params?: EntitlementQueryParams) => Promise<EntitlementsStatus>;
  };

  /** Auth plugin routes */
  auth: {
    /** Get auth status */
    status: () => Promise<AuthConfigStatus>;
    /** Get auth config */
    config: () => Promise<RuntimeAuthConfig>;
    /** Update auth config */
    update: (data: UpdateAuthConfigRequest) => Promise<RuntimeAuthConfig>;
    /** Test provider connection */
    test: (data: TestProviderRequest) => Promise<TestProviderResponse>;
  };

  /** Notifications plugin routes */
  notifications: {
    /** Get notification stats */
    stats: () => Promise<NotificationsStatsResponse>;
    /** Get connected clients */
    clients: () => Promise<NotificationsClientsResponse>;
  };

  /** Rate limit plugin routes */
  rateLimit: {
    /** Get rate limit config */
    config: () => Promise<RateLimitConfigUpdateResponse>;
    /** Update rate limit config */
    update: (data: RateLimitConfigUpdateRequest) => Promise<RateLimitConfigUpdateResponse>;
  };

  /** Preferences plugin routes */
  preferences: {
    /** Query preferences */
    query: (params?: PreferenceQueryParams) => Promise<PreferencesResponse>;
  };
}
