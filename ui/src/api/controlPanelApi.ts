/**
 * Control Panel API Client
 *
 * Communicates with the backend Express API
 */

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
export interface User {
  id: string;
  email: string;
  name?: string;
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
  scopes: Array<'read' | 'write' | 'admin'>;
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
  scopes: Array<'read' | 'write' | 'admin'>;
  expires_at?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  scopes?: Array<'read' | 'write' | 'admin'>;
  expires_at?: string;
  is_active?: boolean;
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
  /** Priority for ordering (lower = first, default: 100) */
  priority?: number;
  /** Whether this widget is shown by default */
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

class ControlPanelApi {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the base URL for API requests.
   * Call this when the control panel is mounted at a custom path.
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
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
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.page) params.set('page', options.page.toString());
    if (options.search) params.set('q', options.search);

    const response = await this._fetch(`${this.baseUrl}/api/users?${params}`);
    if (!response.ok) {
      throw new Error(`Users request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getUserById(id: string): Promise<User> {
    const response = await this._fetch(`${this.baseUrl}/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`User request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Bans API
  // ==================

  async getBans(): Promise<BansResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/bans`);
    if (!response.ok) {
      throw new Error(`Bans request failed: ${response.statusText}`);
    }
    return response.json();
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
    const response = await this._fetch(`${this.baseUrl}/api/entitlements/status`);
    if (!response.ok) {
      throw new Error(`Entitlements status request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Health API
  // ==================

  async getHealth(): Promise<HealthResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getInfo(): Promise<InfoResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/info`);
    if (!response.ok) {
      throw new Error(`Info request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getDiagnostics(): Promise<DiagnosticsResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/diagnostics`);
    if (!response.ok) {
      throw new Error(`Diagnostics request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getConfig(): Promise<ConfigResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/config`);
    if (!response.ok) {
      throw new Error(`Config request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getLogs(options: {
    source?: string;
    level?: string;
    search?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<LogsResponse> {
    const params = new URLSearchParams();
    if (options.source) params.set('source', options.source);
    if (options.level) params.set('level', options.level);
    if (options.search) params.set('search', options.search);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.page) params.set('page', options.page.toString());

    const response = await this._fetch(`${this.baseUrl}/api/logs?${params}`);
    if (!response.ok) {
      throw new Error(`Logs request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getLogSources(): Promise<LogSource[]> {
    const response = await this._fetch(`${this.baseUrl}/api/logs/sources`);
    if (!response.ok) {
      throw new Error(`Log sources request failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.sources;
  }

  // ==================
  // Plugins API
  // ==================

  async getPlugins(): Promise<PluginsResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/plugins`);
    if (!response.ok) {
      throw new Error(`Plugins request failed: ${response.statusText}`);
    }
    return response.json();
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
    const response = await this._fetch(`${this.baseUrl}/api/ui-contributions`);
    if (!response.ok) {
      throw new Error(`UI contributions request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Auth Config API
  // ==================

  async getAuthConfigStatus(): Promise<AuthConfigStatus> {
    const response = await this._fetch(`${this.baseUrl}/api/auth/config/status`);
    if (!response.ok) {
      // Return disabled state if endpoint not available
      if (response.status === 404) {
        return { state: 'disabled', adapter: null };
      }
      throw new Error(`Auth config status request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getAuthConfig(): Promise<AuthConfigStatus> {
    const response = await this._fetch(`${this.baseUrl}/api/auth/config`);
    if (!response.ok) {
      if (response.status === 404) {
        return { state: 'disabled', adapter: null };
      }
      throw new Error(`Auth config request failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Update auth configuration (save to database for hot-reload)
   */
  async updateAuthConfig(request: UpdateAuthConfigRequest): Promise<{ success: boolean; message: string }> {
    const response = await this._fetch(`${this.baseUrl}/api/auth/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Auth config update failed: ${response.statusText}`);
    }
    return response.json();
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
    const response = await this._fetch(`${this.baseUrl}/api/auth/test-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Provider test failed: ${response.statusText}`);
    }
    return response.json();
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
    const response = await this._fetch(`${this.baseUrl}/api/rate-limit/config`);
    if (!response.ok) {
      throw new Error(`Rate limit config request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async updateRateLimitConfig(updates: RateLimitConfigUpdateRequest): Promise<RateLimitConfigUpdateResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/rate-limit/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Rate limit config update failed: ${response.statusText}`);
    }
    return response.json();
  }

  // ==================
  // Notifications API
  // ==================

  async getNotificationsStats(): Promise<NotificationsStatsResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/notifications/stats`);
    if (!response.ok) {
      throw new Error(`Notifications stats request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getNotificationsClients(): Promise<NotificationsClientsResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/notifications/clients`);
    if (!response.ok) {
      throw new Error(`Notifications clients request failed: ${response.statusText}`);
    }
    return response.json();
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
    const response = await this._fetch(`${this.baseUrl}/api/api-keys`);
    if (!response.ok) {
      throw new Error(`API keys request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async createApiKey(request: CreateApiKeyRequest): Promise<ApiKeyWithPlaintext> {
    const response = await this._fetch(`${this.baseUrl}/api/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API key creation failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getApiKey(keyId: string): Promise<ApiKey> {
    const response = await this._fetch(`${this.baseUrl}/api/api-keys/${encodeURIComponent(keyId)}`);
    if (!response.ok) {
      throw new Error(`API key request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async updateApiKey(keyId: string, updates: UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await this._fetch(`${this.baseUrl}/api/api-keys/${encodeURIComponent(keyId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API key update failed: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteApiKey(keyId: string): Promise<void> {
    const response = await this._fetch(`${this.baseUrl}/api/api-keys/${encodeURIComponent(keyId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API key deletion failed: ${response.statusText}`);
    }
  }
}

export const api = new ControlPanelApi();
