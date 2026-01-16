/**
 * Control Panel API Client
 *
 * Communicates with the backend Express API
 */

import { buildClientFromManifest } from './clientBuilder.js';
import type { APIClient } from './types.js';

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastChecked: string;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheck>;
}

export interface InfoResponse {
  product: string;
  logoName: string;
  logoIconUrl?: string;
  version: string;
  uptime: number;
  links: Array<{ label: string; url: string; external?: boolean }>;
  branding?: {
    primaryColor?: string;
  };
}

export interface DiagnosticsResponse {
  timestamp: string;
  product: string;
  version?: string;
  /** @qwickapps/server framework version */
  frameworkVersion?: string;
  uptime: number;
  health: Record<string, HealthCheck>;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      total: number;
      used: number;
      free: number;
    };
    cpu: {
      usage: number;
    };
  };
}

export interface ConfigResponse {
  config: Record<string, string | number | boolean>;
  masked: string[];
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  namespace?: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface LogSource {
  name: string;
  type: 'file' | 'api';
  available: boolean;
}

// ==================
// Users API Types
// ==================
export type UserStatus = 'invited' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name?: string;
  status: UserStatus;
  invitation_token?: string;
  invitation_expires_at?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  metadata?: Record<string, unknown>;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface InviteUserRequest {
  email: string;
  name?: string;
  role?: string;
  metadata?: Record<string, unknown>;
  expiresInDays?: number;
}

export interface InvitationResponse {
  user: User;
  token: string;
  inviteLink: string;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  user: User;
}

// ==================
// Bans API Types
// ==================
export interface Ban {
  id: string;
  user_id?: string;
  email: string;
  reason: string;
  banned_at: string;
  banned_by: string;
  expires_at?: string;
}

export interface BansResponse {
  bans: Ban[];
  total: number;
}

// ==================
// API Keys Types
// ==================
export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_type: 'm2m' | 'pat';
  scopes: string[]; // Phase 2: Support plugin-declared scopes
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyWithPlaintext extends ApiKey {
  key: string; // Only available on creation
}

export interface ApiKeysResponse {
  keys: ApiKey[];
}

export interface CreateApiKeyRequest {
  name: string;
  key_type: 'm2m' | 'pat';
  scopes: string[]; // Phase 2: Support plugin-declared scopes
  expires_at?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  scopes?: string[]; // Phase 2: Support plugin-declared scopes
  expires_at?: string;
  is_active?: boolean;
}

// Phase 2: Scope Management
export interface PluginScope {
  name: string;
  description: string;
  category?: 'read' | 'write' | 'admin';
}

export interface PluginScopesGroup {
  pluginId: string;
  scopes: PluginScope[];
}

export interface AvailableScopesResponse {
  scopes: PluginScopesGroup[];
}

// Phase 2: Usage Tracking
export interface UsageLogEntry {
  id: string;
  key_id: string;
  endpoint: string;
  method: string;
  status_code?: number;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface UsageStats {
  totalCalls: number;
  lastUsed: string | null;
  callsByStatus: Record<string, number>;
  callsByEndpoint: Record<string, number>;
}

export interface KeyUsageResponse {
  keyId: string;
  keyName: string;
  totalCalls: number;
  lastUsed: string | null;
  callsByStatus: Record<string, number>;
  callsByEndpoint: Record<string, number>;
  logs: UsageLogEntry[];
}

// ==================
// Entitlements API Types
// ==================
export interface EntitlementDefinition {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface EntitlementResult {
  identifier: string;
  entitlements: string[];
  source: string;
  cached?: boolean;
  cachedAt?: string;
  expiresAt?: string;
}

// ==================
// Entitlements Status
// ==================
export interface EntitlementSourceInfo {
  name: string;
  description?: string;
  readonly: boolean;
  primary: boolean;
}

export interface EntitlementsStatus {
  readonly: boolean;
  writeEnabled: boolean;
  cacheEnabled: boolean;
  cacheTtl: number;
  sources: EntitlementSourceInfo[];
}

// ==================
// Plugin Feature Detection
// ==================
export interface PluginFeatures {
  users: boolean;
  bans: boolean;
  entitlements: boolean;
  entitlementsReadonly?: boolean;
}

// ==================
// UI Contributions Types
// ==================

export interface MenuContribution {
  id: string;
  label: string;
  icon?: string;
  route: string;
  order?: number;
  pluginId: string;
  parent?: string;
}

export interface PageContribution {
  id: string;
  route: string;
  title: string;
  pluginId: string;
}

export interface WidgetContribution {
  id: string;
  title: string;
  /** Component name to render (matched by frontend widget registry) */
  component: string;
  /**
   * Widget type/category - determines which page(s) can display this widget
   * - 'status': System health, service status, monitoring metrics (Dashboard)
   * - 'maintenance': Operational tasks like seeding, service control, config (Maintenance page)
   * - 'analytics': Charts, graphs, usage metrics (Dashboard or Analytics page)
   * - 'monitoring': Performance, logs, real-time data (Monitoring page)
   * - 'custom': Custom widgets for specific use cases
   */
  type: 'status' | 'maintenance' | 'analytics' | 'monitoring' | 'custom';
  /** Priority for ordering (lower = first, default: 100) */
  priority?: number;
  /** Whether this widget is shown by default on its designated page */
  showByDefault?: boolean;
  pluginId: string;
}

export interface UiContributionsResponse {
  menuItems: MenuContribution[];
  pages: PageContribution[];
  widgets: WidgetContribution[];
  plugins: Array<{ id: string; name: string; version?: string; status: string }>;
}

// ==================
// Plugin Detail Types
// ==================

export interface ConfigContribution {
  id: string;
  component: string;
  title?: string;
  pluginId: string;
}

export interface PluginContributions {
  routes: Array<{ method: string; path: string }>;
  menuItems: MenuContribution[];
  pages: PageContribution[];
  widgets: WidgetContribution[];
  config?: ConfigContribution;
}

export interface PluginInfo {
  id: string;
  name: string;
  version?: string;
  status: 'starting' | 'active' | 'stopped' | 'error';
  error?: string;
  contributionCounts: {
    routes: number;
    menuItems: number;
    pages: number;
    widgets: number;
    hasConfig: boolean;
  };
}

export interface PluginsResponse {
  plugins: PluginInfo[];
}

export interface PluginDetailResponse {
  id: string;
  name: string;
  version?: string;
  status: 'starting' | 'active' | 'stopped' | 'error';
  error?: string;
  contributions: PluginContributions;
}

// ==================
// Auth Config Types
// ==================

export type AuthPluginState = 'disabled' | 'enabled' | 'error';
export type AuthAdapterType = 'auth0' | 'supabase' | 'supertokens' | 'basic';

export interface AuthConfigStatus {
  state: AuthPluginState;
  adapter: string | null;
  error?: string;
  missingVars?: string[];
  config?: Record<string, string>;
  /** Runtime config from database (if available) */
  runtimeConfig?: RuntimeAuthConfig;
}

export interface RuntimeAuthConfig {
  adapter: AuthAdapterType | null;
  config: {
    auth0?: Auth0AdapterConfig;
    supabase?: SupabaseAdapterConfig;
    supertokens?: SupertokensAdapterConfig;
    basic?: BasicAdapterConfig;
  };
  settings: {
    authRequired?: boolean;
    excludePaths?: string[];
    debug?: boolean;
  };
  updatedAt: string;
  updatedBy?: string;
}

export interface Auth0AdapterConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  secret: string;
  audience?: string;
  scopes?: string[];
  allowedRoles?: string[];
  allowedDomains?: string[];
}

export interface SupabaseAdapterConfig {
  url: string;
  anonKey: string;
}

export interface BasicAdapterConfig {
  username: string;
  password: string;
  realm?: string;
}

export interface SupertokensAdapterConfig {
  connectionUri: string;
  apiKey?: string;
  appName: string;
  apiDomain: string;
  websiteDomain: string;
  apiBasePath?: string;
  websiteBasePath?: string;
  enableEmailPassword?: boolean;
  socialProviders?: {
    google?: { clientId: string; clientSecret: string };
    apple?: { clientId: string; clientSecret: string; keyId: string; teamId: string };
    github?: { clientId: string; clientSecret: string };
  };
}

export interface UpdateAuthConfigRequest {
  adapter: AuthAdapterType;
  config: Record<string, unknown>;
  settings?: {
    authRequired?: boolean;
    excludePaths?: string[];
  };
}

export interface TestProviderRequest {
  adapter: AuthAdapterType;
  config: Record<string, unknown>;
  provider?: 'google' | 'github' | 'apple';
}

export interface TestProviderResponse {
  success: boolean;
  message: string;
  details?: {
    latency?: number;
    version?: string;
  };
}

// ==================
// Notifications API Types
// ==================

export interface NotificationsConnectionHealth {
  isConnected: boolean;
  isHealthy: boolean;
  lastEventAt: string | null;
  timeSinceLastEvent: number;
  channelCount: number;
  isReconnecting: boolean;
  reconnectAttempts: number;
}

export interface NotificationsStatsResponse {
  totalConnections: number;
  currentConnections: number;
  eventsProcessed: number;
  eventsRouted: number;
  eventsParseFailed: number;
  eventsDroppedNoClients: number;
  reconnectionAttempts: number;
  lastReconnectionAt?: string;
  clientsByType: {
    device: number;
    user: number;
  };
  connectionHealth: NotificationsConnectionHealth;
  channels: string[];
  lastEventAt?: string;
}

export interface NotificationsClient {
  id: string;
  deviceId?: string;
  userId?: string;
  connectedAt: string;
  durationMs: number;
}

export interface NotificationsClientsResponse {
  clients: NotificationsClient[];
  total: number;
}

// ==================
// Rate Limit Config Types
// ==================

export type RateLimitStrategy = 'sliding-window' | 'fixed-window' | 'token-bucket';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  strategy: RateLimitStrategy;
  cleanupEnabled: boolean;
  cleanupIntervalMs: number;
  store: string;
  cache: string;
  cacheAvailable: boolean;
}

export interface RateLimitConfigUpdateRequest {
  windowMs?: number;
  maxRequests?: number;
  strategy?: RateLimitStrategy;
  cleanupEnabled?: boolean;
  cleanupIntervalMs?: number;
}

export interface RateLimitConfigUpdateResponse {
  success: boolean;
  config: RateLimitConfig;
}

export interface PreferencesResponse {
  user_id: string;
  preferences: Record<string, unknown>;
}

class ControlPanelApi {
  private baseUrl: string;
  private client: APIClient | null = null;
  private clientPromise: Promise<APIClient> | null = null;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Ensure the API client is initialized.
   * Lazy-loads the client on first use by fetching the manifest.
   */
  private async ensureClient(): Promise<APIClient> {
    if (this.client) {
      return this.client;
    }

    // If already fetching, wait for that promise
    if (this.clientPromise) {
      return this.clientPromise;
    }

    // Start fetching the client
    this.clientPromise = buildClientFromManifest<APIClient>(this.baseUrl);

    try {
      this.client = await this.clientPromise;
      return this.client;
    } catch (error) {
      // Reset promise so we can retry on next call
      this.clientPromise = null;
      throw error;
    }
  }

  /**
   * Set the base URL for API requests.
   * Call this when the control panel is mounted at a custom path.
   * Invalidates the cached client since the manifest will be different.
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    // Invalidate cached client
    this.client = null;
    this.clientPromise = null;
  }

  /**
   * Get the base URL for API requests.
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Internal fetch wrapper that includes credentials for Basic Auth support.
   * Using 'same-origin' ensures the browser sends stored Basic Auth credentials
   * without embedding them in the URL (which would cause fetch to fail).
   */
  private async _fetch(url: string, options?: RequestInit): Promise<Response> {
    return fetch(url, {
      ...options,
      credentials: 'same-origin',
    });
  }

  /**
   * Generic fetch method for API requests.
   * Automatically prepends the base URL and /api prefix.
   */
  async fetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
    const response = await this._fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Plugin Feature Detection
  // ==================

  /**
   * Detect which user management plugins are available by probing their endpoints
   */
  async detectFeatures(): Promise<PluginFeatures> {
    const [users, bans, entitlements] = await Promise.all([
      this.checkEndpoint('/api/users'),
      this.checkEndpoint('/api/bans'),
      this.checkEndpoint('/api/entitlements/available'),
    ]);

    // If entitlements is available, get readonly status
    let entitlementsReadonly = true;
    if (entitlements) {
      try {
        const status = await this.getEntitlementsStatus();
        entitlementsReadonly = status.readonly;
      } catch {
        // Default to readonly if we can't get status
      }
    }

    return { users, bans, entitlements, entitlementsReadonly };
  }

  private async checkEndpoint(path: string): Promise<boolean> {
    try {
      const response = await this._fetch(`${this.baseUrl}${path}`, { method: 'HEAD' });
      // 200, 401, 403 mean the endpoint exists (might need auth)
      // 404 means it doesn't exist
      return response.status !== 404;
    } catch {
      return false;
    }
  }

  // ==================
  // Users API
  // ==================

  async getUsers(options: {
    limit?: number;
    page?: number;
    search?: string;
  } = {}): Promise<UsersResponse> {
    const client = await this.ensureClient();
    return client.users.query(options);
  }

  async getUserById(id: string): Promise<User> {
    const client = await this.ensureClient();
    return client.users.get(id);
  }

  async inviteUser(request: InviteUserRequest): Promise<InvitationResponse> {
    const client = await this.ensureClient();
    return client.users.invite(request);
  }

  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/users/accept-invitation/${encodeURIComponent(token)}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Accept invitation failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getInvitations(): Promise<UsersResponse> {
    const params = new URLSearchParams();
    params.set('status', 'invited');
    params.set('limit', '100');

    const response = await this._fetch(`${this.baseUrl}/api/users?${params}`);
    if (!response.ok) {
      throw new Error(`Invitations request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Bans API
  // ==================

  async getBans(): Promise<BansResponse> {
    const client = await this.ensureClient();
    return client.bans.query();
  }

  async banUser(email: string, reason: string, expiresAt?: string): Promise<void> {
    // Convert expiresAt datetime to duration in seconds
    let duration: number | undefined;
    if (expiresAt) {
      const expiresDate = new Date(expiresAt);
      const now = new Date();
      duration = Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000));
    }

    const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, duration }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Ban request failed: ${response.statusText}`);
    }
  }

  async unbanUser(email: string): Promise<void> {
    const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Unban request failed: ${response.statusText}`);
    }
  }

  async checkBan(email: string): Promise<{ banned: boolean; ban?: Ban }> {
    const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`Ban check failed: ${response.statusText}`);
    }
    const data = await response.json();
    // Backend returns { email, isBanned }, transform to expected shape
    return { banned: data.isBanned };
  }

  // ==================
  // Entitlements API
  // ==================

  async getEntitlements(email: string): Promise<EntitlementResult> {
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error(`Entitlements request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async refreshEntitlements(email: string): Promise<EntitlementResult> {
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/refresh`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Entitlements refresh failed: ${response.statusText}`);
    }
    return response.json();
  }

  async checkEntitlement(email: string, entitlement: string): Promise<{ has: boolean }> {
    const response = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/check/${encodeURIComponent(entitlement)}`
    );
    if (!response.ok) {
      throw new Error(`Entitlement check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getAvailableEntitlements(): Promise<EntitlementDefinition[]> {
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/available`);
    if (!response.ok) {
      throw new Error(`Available entitlements request failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.entitlements;
  }

  async grantEntitlement(email: string, entitlement: string): Promise<void> {
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entitlement }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Grant entitlement failed: ${response.statusText}`);
    }
  }

  async revokeEntitlement(email: string, entitlement: string): Promise<void> {
    const response = await this._fetch(
      `${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/${encodeURIComponent(entitlement)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(`Revoke entitlement failed: ${response.statusText}`);
    }
  }

  async invalidateEntitlementCache(email: string): Promise<void> {
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/cache/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Cache invalidation failed: ${response.statusText}`);
    }
  }

  async getEntitlementsStatus(): Promise<EntitlementsStatus> {
    const client = await this.ensureClient();
    return client.entitlements.query();
  }

  // ==================
  // Health API
  // ==================

  async getHealth(): Promise<HealthResponse> {
    const client = await this.ensureClient();
    return client.core.health();
  }

  async getInfo(): Promise<InfoResponse> {
    const client = await this.ensureClient();
    return client.core.info();
  }

  async getDiagnostics(): Promise<DiagnosticsResponse> {
    const client = await this.ensureClient();
    return client.core.diagnostics();
  }

  async getConfig(): Promise<ConfigResponse> {
    const client = await this.ensureClient();
    return client.config.query();
  }

  async getLogs(options: {
    source?: string;
    level?: string;
    search?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<LogsResponse> {
    const client = await this.ensureClient();
    return client.logs.query(options);
  }

  async getLogSources(): Promise<LogSource[]> {
    const client = await this.ensureClient();
    return client.logs.sources();
  }

  // ==================
  // Plugins API
  // ==================

  async getPlugins(): Promise<PluginsResponse> {
    const client = await this.ensureClient();
    return client.core.plugins();
  }

  async getPluginDetail(id: string): Promise<PluginDetailResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/plugins/${encodeURIComponent(id)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Plugin not found: ${id}`);
      }
      throw new Error(`Plugin detail request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // UI Contributions API
  // ==================

  async getUiContributions(): Promise<UiContributionsResponse> {
    const client = await this.ensureClient();
    return client.core.uiContributions();
  }

  // ==================
  // Auth Config API
  // ==================

  async getAuthConfigStatus(): Promise<AuthConfigStatus> {
    try {
      const client = await this.ensureClient();
      return await client.auth.status();
    } catch (error) {
      // Return disabled state if endpoint not available
      if (error instanceof Error && error.message.includes('404')) {
        return { state: 'disabled', adapter: null };
      }
      throw error;
    }
  }

  async getAuthConfig(): Promise<AuthConfigStatus> {
    try {
      const client = await this.ensureClient();
      return await client.auth.config() as unknown as AuthConfigStatus;
    } catch (error) {
      // Return disabled state if endpoint not available
      if (error instanceof Error && error.message.includes('404')) {
        return { state: 'disabled', adapter: null };
      }
      throw error;
    }
  }

  /**
   * Update auth configuration (save to database for hot-reload)
   */
  async updateAuthConfig(request: UpdateAuthConfigRequest): Promise<{ success: boolean; message: string }> {
    const client = await this.ensureClient();
    return client.auth.update(request) as unknown as { success: boolean; message: string };
  }

  /**
   * Delete auth configuration (revert to environment variables)
   */
  async deleteAuthConfig(): Promise<{ success: boolean; message: string }> {
    const response = await this._fetch(`${this.baseUrl}/api/auth/config`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Auth config delete failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Test auth provider connection without saving
   */
  async testAuthProvider(request: TestProviderRequest): Promise<TestProviderResponse> {
    const client = await this.ensureClient();
    return client.auth.test(request);
  }

  /**
   * Test current auth provider connection (uses existing env/runtime config)
   */
  async testCurrentAuthProvider(): Promise<TestProviderResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/auth/test-current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Provider test failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Rate Limit Config API
  // ==================

  async getRateLimitConfig(): Promise<RateLimitConfig> {
    const client = await this.ensureClient();
    return client.rateLimit.config() as unknown as RateLimitConfig;
  }

  async updateRateLimitConfig(updates: RateLimitConfigUpdateRequest): Promise<RateLimitConfigUpdateResponse> {
    const client = await this.ensureClient();
    return client.rateLimit.update(updates);
  }

  // ==================
  // Notifications API
  // ==================

  async getNotificationsStats(): Promise<NotificationsStatsResponse> {
    const client = await this.ensureClient();
    return client.notifications.stats();
  }

  async getNotificationsClients(): Promise<NotificationsClientsResponse> {
    const client = await this.ensureClient();
    return client.notifications.clients();
  }

  async disconnectNotificationsClient(clientId: string): Promise<{ success: boolean }> {
    const response = await this._fetch(`${this.baseUrl}/api/notifications/clients/${encodeURIComponent(clientId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Disconnect client failed: ${response.statusText}`);
    }
    return response.json();
  }

  async forceNotificationsReconnect(): Promise<{ success: boolean; message: string }> {
    const response = await this._fetch(`${this.baseUrl}/api/notifications/reconnect`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Force reconnect failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // API Keys API
  // ==================

  async getApiKeys(): Promise<ApiKeysResponse> {
    const client = await this.ensureClient();
    return client.apiKeys.query();
  }

  async createApiKey(request: CreateApiKeyRequest): Promise<ApiKeyWithPlaintext> {
    const client = await this.ensureClient();
    return client.apiKeys.create(request) as unknown as ApiKeyWithPlaintext;
  }

  async getApiKey(keyId: string): Promise<ApiKey> {
    const client = await this.ensureClient();
    return client.apiKeys.get(keyId);
  }

  async updateApiKey(keyId: string, updates: UpdateApiKeyRequest): Promise<ApiKey> {
    const client = await this.ensureClient();
    return client.apiKeys.update(keyId, updates);
  }

  async deleteApiKey(keyId: string): Promise<void> {
    const client = await this.ensureClient();
    return client.apiKeys.delete(keyId);
  }

  // Phase 2: Scope Management
  async getAvailableScopes(): Promise<AvailableScopesResponse> {
    const client = await this.ensureClient();
    return client.apiKeys.scopes();
  }

  // Phase 2: Usage Tracking
  async getKeyUsage(
    keyId: string,
    _params?: {
      limit?: number;
      offset?: number;
      since?: string;
      until?: string;
      endpoint?: string;
      method?: string;
      statusCode?: number;
    }
  ): Promise<KeyUsageResponse> {
    const client = await this.ensureClient();
    // Note: _params are ignored in auto-generated client - API expects them as query params
    // TODO: Verify if usage endpoint accepts query params and update client if needed
    return client.apiKeys.usage(keyId);
  }

  // ============================================================================
  // Preferences API
  // ============================================================================

  async getPreferences(): Promise<PreferencesResponse> {
    const client = await this.ensureClient();
    return client.preferences.query();
  }

  async updatePreferences(preferences: Record<string, unknown>): Promise<PreferencesResponse> {
    const url = `${this.baseUrl}/api/preferences`;
    const response = await this._fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Failed to update preferences: ${response.statusText}`);
    }
    return response.json();
  }

  async deletePreferences(): Promise<void> {
    const url = `${this.baseUrl}/api/preferences`;
    const response = await this._fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete preferences: ${response.statusText}`);
    }
  }
}

export const api = new ControlPanelApi();
