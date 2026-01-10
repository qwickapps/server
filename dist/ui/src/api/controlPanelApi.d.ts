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
    links: Array<{
        label: string;
        url: string;
        external?: boolean;
    }>;
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
export interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    key_type: 'm2m' | 'pat';
    scopes: string[];
    last_used_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface ApiKeyWithPlaintext extends ApiKey {
    key: string;
}
export interface ApiKeysResponse {
    keys: ApiKey[];
}
export interface CreateApiKeyRequest {
    name: string;
    key_type: 'm2m' | 'pat';
    scopes: string[];
    expires_at?: string;
}
export interface UpdateApiKeyRequest {
    name?: string;
    scopes?: string[];
    expires_at?: string;
    is_active?: boolean;
}
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
export interface PluginFeatures {
    users: boolean;
    bans: boolean;
    entitlements: boolean;
    entitlementsReadonly?: boolean;
}
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
    plugins: Array<{
        id: string;
        name: string;
        version?: string;
        status: string;
    }>;
}
export interface ConfigContribution {
    id: string;
    component: string;
    title?: string;
    pluginId: string;
}
export interface PluginContributions {
    routes: Array<{
        method: string;
        path: string;
    }>;
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
        google?: {
            clientId: string;
            clientSecret: string;
        };
        apple?: {
            clientId: string;
            clientSecret: string;
            keyId: string;
            teamId: string;
        };
        github?: {
            clientId: string;
            clientSecret: string;
        };
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
declare class ControlPanelApi {
    private baseUrl;
    private client;
    private clientPromise;
    constructor(baseUrl?: string);
    /**
     * Ensure the API client is initialized.
     * Lazy-loads the client on first use by fetching the manifest.
     */
    private ensureClient;
    /**
     * Set the base URL for API requests.
     * Call this when the control panel is mounted at a custom path.
     * Invalidates the cached client since the manifest will be different.
     */
    setBaseUrl(baseUrl: string): void;
    /**
     * Get the base URL for API requests.
     */
    getBaseUrl(): string;
    /**
     * Internal fetch wrapper that includes credentials for Basic Auth support.
     * Using 'same-origin' ensures the browser sends stored Basic Auth credentials
     * without embedding them in the URL (which would cause fetch to fail).
     */
    private _fetch;
    /**
     * Generic fetch method for API requests.
     * Automatically prepends the base URL and /api prefix.
     */
    fetch<T = unknown>(path: string, options?: RequestInit): Promise<T>;
    /**
     * Detect which user management plugins are available by probing their endpoints
     */
    detectFeatures(): Promise<PluginFeatures>;
    private checkEndpoint;
    getUsers(options?: {
        limit?: number;
        page?: number;
        search?: string;
    }): Promise<UsersResponse>;
    getUserById(id: string): Promise<User>;
    inviteUser(request: InviteUserRequest): Promise<InvitationResponse>;
    acceptInvitation(token: string): Promise<AcceptInvitationResponse>;
    getInvitations(): Promise<UsersResponse>;
    getBans(): Promise<BansResponse>;
    banUser(email: string, reason: string, expiresAt?: string): Promise<void>;
    unbanUser(email: string): Promise<void>;
    checkBan(email: string): Promise<{
        banned: boolean;
        ban?: Ban;
    }>;
    getEntitlements(email: string): Promise<EntitlementResult>;
    refreshEntitlements(email: string): Promise<EntitlementResult>;
    checkEntitlement(email: string, entitlement: string): Promise<{
        has: boolean;
    }>;
    getAvailableEntitlements(): Promise<EntitlementDefinition[]>;
    grantEntitlement(email: string, entitlement: string): Promise<void>;
    revokeEntitlement(email: string, entitlement: string): Promise<void>;
    invalidateEntitlementCache(email: string): Promise<void>;
    getEntitlementsStatus(): Promise<EntitlementsStatus>;
    getHealth(): Promise<HealthResponse>;
    getInfo(): Promise<InfoResponse>;
    getDiagnostics(): Promise<DiagnosticsResponse>;
    getConfig(): Promise<ConfigResponse>;
    getLogs(options?: {
        source?: string;
        level?: string;
        search?: string;
        limit?: number;
        page?: number;
    }): Promise<LogsResponse>;
    getLogSources(): Promise<LogSource[]>;
    getPlugins(): Promise<PluginsResponse>;
    getPluginDetail(id: string): Promise<PluginDetailResponse>;
    getUiContributions(): Promise<UiContributionsResponse>;
    getAuthConfigStatus(): Promise<AuthConfigStatus>;
    getAuthConfig(): Promise<AuthConfigStatus>;
    /**
     * Update auth configuration (save to database for hot-reload)
     */
    updateAuthConfig(request: UpdateAuthConfigRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Delete auth configuration (revert to environment variables)
     */
    deleteAuthConfig(): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Test auth provider connection without saving
     */
    testAuthProvider(request: TestProviderRequest): Promise<TestProviderResponse>;
    /**
     * Test current auth provider connection (uses existing env/runtime config)
     */
    testCurrentAuthProvider(): Promise<TestProviderResponse>;
    getRateLimitConfig(): Promise<RateLimitConfig>;
    updateRateLimitConfig(updates: RateLimitConfigUpdateRequest): Promise<RateLimitConfigUpdateResponse>;
    getNotificationsStats(): Promise<NotificationsStatsResponse>;
    getNotificationsClients(): Promise<NotificationsClientsResponse>;
    disconnectNotificationsClient(clientId: string): Promise<{
        success: boolean;
    }>;
    forceNotificationsReconnect(): Promise<{
        success: boolean;
        message: string;
    }>;
    getApiKeys(): Promise<ApiKeysResponse>;
    createApiKey(request: CreateApiKeyRequest): Promise<ApiKeyWithPlaintext>;
    getApiKey(keyId: string): Promise<ApiKey>;
    updateApiKey(keyId: string, updates: UpdateApiKeyRequest): Promise<ApiKey>;
    deleteApiKey(keyId: string): Promise<void>;
    getAvailableScopes(): Promise<AvailableScopesResponse>;
    getKeyUsage(keyId: string, _params?: {
        limit?: number;
        offset?: number;
        since?: string;
        until?: string;
        endpoint?: string;
        method?: string;
        statusCode?: number;
    }): Promise<KeyUsageResponse>;
    getPreferences(): Promise<PreferencesResponse>;
    updatePreferences(preferences: Record<string, unknown>): Promise<PreferencesResponse>;
    deletePreferences(): Promise<void>;
}
export declare const api: ControlPanelApi;
export {};
//# sourceMappingURL=controlPanelApi.d.ts.map