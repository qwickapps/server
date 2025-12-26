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
export function isValidScopeFormat(scope: string): boolean {
  // Plugin scope format: plugin-id:action
  if (/^[a-z0-9-]+:[a-z0-9-]+$/.test(scope)) {
    return true;
  }
  // Legacy format: read, write, admin
  if (['read', 'write', 'admin'].includes(scope)) {
    return true;
  }
  return false;
}

/**
 * Normalize scope to new format
 *
 * Converts legacy scopes ('read', 'write', 'admin') to new format ('system:*')
 *
 * @param scope Scope to normalize
 * @returns Normalized scope
 */
export function normalizeScope(scope: string): string {
  const legacyMap: Record<string, string> = {
    'read': 'system:read',
    'write': 'system:write',
    'admin': 'system:admin',
  };
  return legacyMap[scope] || scope;
}

/**
 * System scopes for backwards compatibility
 */
export const SystemScopes = {
  READ: 'system:read',
  WRITE: 'system:write',
  ADMIN: 'system:admin',
} as const;

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

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * Zod schema for API key scope
 *
 * Validates scope format:
 * - Plugin scope: 'plugin-id:action' (e.g., 'qwickbrain:execute')
 * - Legacy scope: 'read', 'write', 'admin'
 */
export const ApiKeyScopeSchema = z.string().refine(
  (scope) => isValidScopeFormat(scope),
  { message: 'Scope must be in format "plugin-id:action" or a legacy scope (read, write, admin)' }
);

/**
 * Zod schema for API key type
 */
export const ApiKeyTypeSchema = z.enum(['m2m', 'pat']);

/**
 * Zod schema for creating an API key
 */
export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  key_type: ApiKeyTypeSchema,
  scopes: z.array(ApiKeyScopeSchema).min(1),
  expires_at: z.coerce.date().optional(),
});

/**
 * Zod schema for updating an API key
 */
export const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scopes: z.array(ApiKeyScopeSchema).min(1).optional(),
  expires_at: z.coerce.date().optional(),
  is_active: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Zod schema for API key record
 */
export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  key_hash: z.string(),
  key_prefix: z.string(),
  key_type: ApiKeyTypeSchema,
  scopes: z.array(ApiKeyScopeSchema),
  last_used_at: z.coerce.date().nullable(),
  expires_at: z.coerce.date().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
