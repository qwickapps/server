/**
 * Auth Plugin Types
 *
 * Type definitions for the pluggable authentication system.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Request, Response, RequestHandler } from 'express';
/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
    /** Unique user ID from the provider */
    id: string;
    /** User's email address */
    email: string;
    /** User's display name */
    name?: string;
    /** User's profile picture URL */
    picture?: string;
    /** Whether the email is verified */
    emailVerified?: boolean;
    /** User's roles from the provider */
    roles?: string[];
    /** Raw user object from the provider */
    raw?: Record<string, unknown>;
}
/**
 * Auth adapter interface - all adapters must implement this
 */
export interface AuthAdapter {
    /** Adapter name (e.g., 'auth0', 'supabase', 'basic') */
    name: string;
    /**
     * Initialize the adapter - called once during plugin setup
     * Returns middleware to apply to the Express app
     */
    initialize(): RequestHandler | RequestHandler[];
    /**
     * Check if the request is authenticated
     */
    isAuthenticated(req: Request): boolean;
    /**
     * Get the authenticated user from the request
     * Can be async for adapters that need to validate tokens
     */
    getUser(req: Request): AuthenticatedUser | null | Promise<AuthenticatedUser | null>;
    /**
     * Check if user has required roles (optional)
     */
    hasRoles?(req: Request, roles: string[]): boolean;
    /**
     * Get the access token for downstream API calls (optional)
     */
    getAccessToken?(req: Request): string | null;
    /**
     * Handler for unauthorized requests (optional custom behavior)
     */
    onUnauthorized?(req: Request, res: Response): void;
    /**
     * Cleanup resources on shutdown (optional)
     */
    shutdown?(): Promise<void>;
}
/**
 * Auth0 adapter configuration
 */
export interface Auth0AdapterConfig {
    /** Auth0 domain (e.g., 'myapp.auth0.com') */
    domain: string;
    /** Auth0 client ID */
    clientId: string;
    /** Auth0 client secret */
    clientSecret: string;
    /** Base URL of the application */
    baseUrl: string;
    /** Session secret for cookie encryption */
    secret: string;
    /** API audience for access tokens (optional) */
    audience?: string;
    /** Scopes to request (default: ['openid', 'profile', 'email']) */
    scopes?: string[];
    /** Allowed roles - only these roles can access (optional) */
    allowedRoles?: string[];
    /** Allowed email domains - only these domains can access (optional) */
    allowedDomains?: string[];
    /** Whether to expose the access token to handlers (default: false) */
    exposeAccessToken?: boolean;
    /** Auth routes configuration */
    routes?: {
        login?: string;
        logout?: string;
        callback?: string;
    };
}
/**
 * Supabase adapter configuration
 */
export interface SupabaseAdapterConfig {
    /** Supabase project URL */
    url: string;
    /** Supabase anon key */
    anonKey: string;
}
/**
 * Basic auth adapter configuration
 */
export interface BasicAdapterConfig {
    /** Username for basic auth */
    username: string;
    /** Password for basic auth */
    password: string;
    /** Realm name for the WWW-Authenticate header */
    realm?: string;
}
/**
 * Supertokens adapter configuration
 */
export interface SupertokensAdapterConfig {
    /** Supertokens connection URI (e.g., 'http://localhost:3567') */
    connectionUri: string;
    /** Supertokens API key (for managed service) */
    apiKey?: string;
    /** App name for branding */
    appName: string;
    /** API domain (e.g., 'http://localhost:3000') */
    apiDomain: string;
    /** Website domain (e.g., 'http://localhost:3000') */
    websiteDomain: string;
    /** API base path (default: '/auth') */
    apiBasePath?: string;
    /** Website base path (default: '/auth') */
    websiteBasePath?: string;
    /** Enable email/password auth (default: true) */
    enableEmailPassword?: boolean;
    /** Social login providers */
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
/**
 * Auth plugin configuration
 */
export interface AuthPluginConfig {
    /** Primary adapter for authentication */
    adapter: AuthAdapter;
    /** Fallback adapters checked in order if primary fails (optional) */
    fallback?: AuthAdapter[];
    /** Paths to exclude from authentication */
    excludePaths?: string[];
    /** Whether auth is required for all routes (default: true) */
    authRequired?: boolean;
    /** Custom unauthorized handler */
    onUnauthorized?: (req: Request, res: Response) => void;
    /**
     * Callback invoked after successful authentication.
     * Use this to sync users to a local database on first login.
     */
    onAuthenticated?: (user: AuthenticatedUser) => Promise<void>;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Extended Express Request with auth info
 */
export interface AuthenticatedRequest extends Request {
    auth: {
        isAuthenticated: boolean;
        user: AuthenticatedUser | null;
        adapter: string;
        accessToken?: string;
    };
}
/**
 * Helper type guard for authenticated requests
 */
export declare function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest;
/**
 * Auth plugin state
 */
export type AuthPluginState = 'disabled' | 'enabled' | 'error';
/**
 * Options for createAuthPluginFromEnv (overrides only)
 */
export interface AuthEnvPluginOptions {
    /** Paths to exclude from authentication (can also use AUTH_EXCLUDE_PATHS env var) */
    excludePaths?: string[];
    /** Whether auth is required (can also use AUTH_REQUIRED env var, default: true) */
    authRequired?: boolean;
    /** Enable debug logging (can also use AUTH_DEBUG env var) */
    debug?: boolean;
    /** Custom unauthorized handler */
    onUnauthorized?: (req: Request, res: Response) => void;
    /**
     * Callback invoked after successful authentication.
     * Use this to sync users to a local database on first login.
     */
    onAuthenticated?: (user: AuthenticatedUser) => Promise<void>;
}
/**
 * Auth configuration status returned by getAuthStatus()
 */
export interface AuthConfigStatus {
    /** Current plugin state */
    state: AuthPluginState;
    /** Active adapter name (null if disabled or error) */
    adapter: string | null;
    /** Error message if state is 'error' */
    error?: string;
    /** List of missing environment variables if state is 'error' */
    missingVars?: string[];
    /** Current configuration with secrets masked */
    config?: Record<string, string>;
}
/**
 * Supported adapter types for runtime configuration
 */
export type AuthAdapterType = 'auth0' | 'supabase' | 'supertokens' | 'basic';
/**
 * Runtime auth configuration (persisted to database)
 */
export interface RuntimeAuthConfig {
    /** Which adapter to use */
    adapter: AuthAdapterType | null;
    /** Adapter-specific configuration */
    config: {
        auth0?: Auth0AdapterConfig;
        supabase?: SupabaseAdapterConfig;
        supertokens?: SupertokensAdapterConfig;
        basic?: BasicAdapterConfig;
    };
    /** General auth settings */
    settings: {
        authRequired?: boolean;
        excludePaths?: string[];
        debug?: boolean;
    };
    /** When the config was last updated */
    updatedAt: string;
    /** Who updated the config (optional) */
    updatedBy?: string;
}
/**
 * Request body for PUT /api/auth/config
 */
export interface UpdateAuthConfigRequest {
    /** Which adapter to use */
    adapter: AuthAdapterType;
    /** Adapter-specific configuration */
    config: Record<string, unknown>;
    /** General settings (optional) */
    settings?: {
        authRequired?: boolean;
        excludePaths?: string[];
    };
}
/**
 * Request body for POST /api/auth/test-provider
 */
export interface TestProviderRequest {
    /** Which adapter to test */
    adapter: AuthAdapterType;
    /** Adapter configuration to test */
    config: Record<string, unknown>;
    /** For social provider test (optional) */
    provider?: 'google' | 'github' | 'apple';
}
/**
 * Response for POST /api/auth/test-provider
 */
export interface TestProviderResponse {
    /** Whether the test was successful */
    success: boolean;
    /** Human-readable message */
    message: string;
    /** Additional details */
    details?: {
        latency?: number;
        version?: string;
    };
}
/**
 * Auth configuration store interface
 */
export interface AuthConfigStore {
    /** Store name for identification */
    name: string;
    /** Initialize the store (create tables if needed) */
    initialize(): Promise<void>;
    /** Load configuration from store */
    load(): Promise<RuntimeAuthConfig | null>;
    /** Save configuration to store */
    save(config: RuntimeAuthConfig): Promise<void>;
    /** Delete configuration (revert to env vars) */
    delete(): Promise<boolean>;
    /**
     * Subscribe to configuration changes
     * Returns unsubscribe function
     */
    onChange(callback: (config: RuntimeAuthConfig | null) => void): () => void;
    /** Shutdown and cleanup */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL auth config store configuration
 */
export interface PostgresAuthConfigStoreConfig {
    /** PostgreSQL pool instance or factory function for lazy initialization */
    pool: unknown | (() => unknown);
    /** Table name (default: 'auth_config') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create table on initialization (default: true) */
    autoCreateTable?: boolean;
    /** Enable pg_notify for cross-instance config updates (default: true) */
    enableNotify?: boolean;
    /** Channel name for pg_notify (default: 'auth_config_changed') */
    notifyChannel?: string;
}
//# sourceMappingURL=types.d.ts.map