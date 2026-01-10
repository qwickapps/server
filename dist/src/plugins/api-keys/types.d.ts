/**
 * API Keys Plugin Types
 *
 * Type definitions for API key authentication and management.
 * Supports PostgreSQL with Row-Level Security (RLS) for data isolation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { z } from 'zod';
/**
 * API key scope type
 *
 * Scopes follow the format: 'plugin-id:action' (e.g., 'qwickbrain:execute')
 *
 * Legacy scopes ('read', 'write', 'admin') are automatically converted to
 * 'system:read', 'system:write', 'system:admin' for backwards compatibility.
 */
export type ApiKeyScope = string;
/**
 * Validate scope name format
 *
 * Valid formats:
 * - Plugin scope: 'plugin-id:action' (e.g., 'qwickbrain:execute')
 * - Legacy scope: 'read', 'write', 'admin' (converted to 'system:*')
 *
 * @param scope Scope name to validate
 * @returns True if scope format is valid
 */
export declare function isValidScopeFormat(scope: string): boolean;
/**
 * Normalize scope to new format
 *
 * Converts legacy scopes ('read', 'write', 'admin') to new format ('system:*')
 *
 * @param scope Scope to normalize
 * @returns Normalized scope
 */
export declare function normalizeScope(scope: string): string;
/**
 * System scopes for backwards compatibility
 */
export declare const SystemScopes: {
    readonly READ: "system:read";
    readonly WRITE: "system:write";
    readonly ADMIN: "system:admin";
};
/**
 * API key type (M2M = machine-to-machine, PAT = personal access token)
 */
export type ApiKeyType = 'm2m' | 'pat';
/**
 * API key record in the database
 */
export interface ApiKey {
    /** Primary key - UUID */
    id: string;
    /** User ID (foreign key to users table) */
    user_id: string;
    /** Human-readable name for the key */
    name: string;
    /** Hashed API key (SHA-256) */
    key_hash: string;
    /** Key prefix for identification (e.g., 'qk_live_') - stored in plaintext */
    key_prefix: string;
    /** Key type: m2m (machine-to-machine) or pat (personal access token) */
    key_type: ApiKeyType;
    /** Scopes granted to this key */
    scopes: ApiKeyScope[];
    /** Last time this key was used */
    last_used_at: Date | null;
    /** Expiration date (null = never expires) */
    expires_at: Date | null;
    /** Whether the key is active */
    is_active: boolean;
    /** When the key was created */
    created_at: Date;
    /** When the key was last updated */
    updated_at: Date;
}
/**
 * API key creation parameters
 */
export interface CreateApiKeyParams {
    /** User ID who owns this key */
    user_id: string;
    /** Human-readable name for the key */
    name: string;
    /** Key type: m2m or pat */
    key_type: ApiKeyType;
    /** Scopes to grant */
    scopes: ApiKeyScope[];
    /** Optional expiration date */
    expires_at?: Date;
}
/**
 * API key update parameters
 */
export interface UpdateApiKeyParams {
    /** New name (optional) */
    name?: string;
    /** New scopes (optional) */
    scopes?: ApiKeyScope[];
    /** New expiration date (optional) */
    expires_at?: Date;
    /** Activate/deactivate key (optional) */
    is_active?: boolean;
}
/**
 * API key with plaintext key (only returned on creation)
 */
export interface ApiKeyWithPlaintext extends ApiKey {
    /** Plaintext API key - only available on creation */
    plaintext_key: string;
}
/**
 * API key store interface - all storage backends must implement this
 */
export interface ApiKeyStore {
    /** Store name (e.g., 'postgres', 'memory') */
    name: string;
    /**
     * Initialize the store (create tables, RLS policies, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Create a new API key
     * Returns the key with plaintext value (only time plaintext is accessible)
     */
    create(params: CreateApiKeyParams): Promise<ApiKeyWithPlaintext>;
    /**
     * Get all API keys for a user
     */
    list(userId: string): Promise<ApiKey[]>;
    /**
     * Get a specific API key by ID
     * Returns null if key doesn't exist or doesn't belong to user
     */
    get(userId: string, keyId: string): Promise<ApiKey | null>;
    /**
     * Verify an API key and return the associated key record
     * Returns null if key is invalid, expired, or inactive
     */
    verify(plaintextKey: string): Promise<ApiKey | null>;
    /**
     * Update an API key
     * Returns the updated key or null if key doesn't exist
     */
    update(userId: string, keyId: string, params: UpdateApiKeyParams): Promise<ApiKey | null>;
    /**
     * Delete an API key
     * Returns true if key was deleted, false if it didn't exist
     */
    delete(userId: string, keyId: string): Promise<boolean>;
    /**
     * Record key usage (updates last_used_at timestamp)
     */
    recordUsage(keyId: string): Promise<void>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL API key store configuration
 */
export interface PostgresApiKeyStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: unknown | (() => unknown);
    /** Table name (default: 'api_keys') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
    /** Enable RLS (default: true) */
    enableRLS?: boolean;
    /** Key expiration in days (default: 90, null = never expires) */
    defaultExpirationDays?: number | null;
    /** Environment for key prefix (default: from NODE_ENV, 'test' in non-production, 'live' in production) */
    environment?: 'test' | 'live';
}
/**
 * API keys API configuration
 */
export interface ApiKeysApiConfig {
    /** API route prefix (default: '/api-keys') */
    prefix?: string;
    /** Enable API endpoints (default: true) */
    enabled?: boolean;
}
/**
 * API keys plugin configuration
 */
export interface ApiKeysPluginConfig {
    /** API key storage backend */
    store: ApiKeyStore;
    /** Plugin scope storage backend (optional, for Phase 2) */
    scopeStore?: import('./stores/plugin-scope-store.js').PluginScopeStore;
    /** Usage log storage backend (optional, for Phase 2) */
    usageStore?: import('./stores/usage-log-store.js').UsageLogStore;
    /** API configuration */
    api?: ApiKeysApiConfig;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Zod schema for API key scope
 *
 * Validates scope format:
 * - Plugin scope: 'plugin-id:action' (e.g., 'qwickbrain:execute')
 * - Legacy scope: 'read', 'write', 'admin'
 */
export declare const ApiKeyScopeSchema: z.ZodEffects<z.ZodString, string, string>;
/**
 * Zod schema for API key type
 */
export declare const ApiKeyTypeSchema: z.ZodEnum<["m2m", "pat"]>;
/**
 * Zod schema for creating an API key
 */
export declare const CreateApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    key_type: z.ZodEnum<["m2m", "pat"]>;
    scopes: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    expires_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    name: string;
    key_type: "m2m" | "pat";
    scopes: string[];
    expires_at?: Date | undefined;
}, {
    name: string;
    key_type: "m2m" | "pat";
    scopes: string[];
    expires_at?: Date | undefined;
}>;
/**
 * Zod schema for updating an API key
 */
export declare const UpdateApiKeySchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    expires_at: z.ZodOptional<z.ZodDate>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    scopes?: string[] | undefined;
    expires_at?: Date | undefined;
    is_active?: boolean | undefined;
}, {
    name?: string | undefined;
    scopes?: string[] | undefined;
    expires_at?: Date | undefined;
    is_active?: boolean | undefined;
}>, {
    name?: string | undefined;
    scopes?: string[] | undefined;
    expires_at?: Date | undefined;
    is_active?: boolean | undefined;
}, {
    name?: string | undefined;
    scopes?: string[] | undefined;
    expires_at?: Date | undefined;
    is_active?: boolean | undefined;
}>;
/**
 * Zod schema for API key record
 */
export declare const ApiKeySchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    name: z.ZodString;
    key_hash: z.ZodString;
    key_prefix: z.ZodString;
    key_type: z.ZodEnum<["m2m", "pat"]>;
    scopes: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
    last_used_at: z.ZodNullable<z.ZodDate>;
    expires_at: z.ZodNullable<z.ZodDate>;
    is_active: z.ZodBoolean;
    created_at: z.ZodDate;
    updated_at: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    created_at: Date;
    updated_at: Date;
    key_type: "m2m" | "pat";
    scopes: string[];
    expires_at: Date | null;
    is_active: boolean;
    id: string;
    user_id: string;
    key_hash: string;
    key_prefix: string;
    last_used_at: Date | null;
}, {
    name: string;
    created_at: Date;
    updated_at: Date;
    key_type: "m2m" | "pat";
    scopes: string[];
    expires_at: Date | null;
    is_active: boolean;
    id: string;
    user_id: string;
    key_hash: string;
    key_prefix: string;
    last_used_at: Date | null;
}>;
//# sourceMappingURL=types.d.ts.map