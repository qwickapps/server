/**
 * API Keys Plugin
 *
 * API key authentication and management plugin for @qwickapps/server.
 * Provides API key generation, storage, and verification with PostgreSQL RLS.
 *
 * This plugin depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { ApiKeysPluginConfig, ApiKeyStore, CreateApiKeyParams, UpdateApiKeyParams, ApiKey } from './types.js';
/**
 * Create the API Keys plugin
 */
export declare function createApiKeysPlugin(config: ApiKeysPluginConfig): Plugin;
/**
 * Get the current API keys store instance
 */
export declare function getApiKeysStore(): ApiKeyStore | null;
/**
 * Verify an API key and return the associated key record
 * Returns null if key is invalid, expired, or inactive
 */
export declare function verifyApiKey(plaintextKey: string): Promise<ApiKey | null>;
/**
 * Create an API key for a user
 */
export declare function createApiKey(params: CreateApiKeyParams): Promise<ApiKey>;
/**
 * List all API keys for a user
 */
export declare function listApiKeys(userId: string): Promise<ApiKey[]>;
/**
 * Get a specific API key
 */
export declare function getApiKey(userId: string, keyId: string): Promise<ApiKey | null>;
/**
 * Update an API key
 */
export declare function updateApiKey(userId: string, keyId: string, params: UpdateApiKeyParams): Promise<ApiKey | null>;
/**
 * Delete an API key
 */
export declare function deleteApiKey(userId: string, keyId: string): Promise<boolean>;
//# sourceMappingURL=api-keys-plugin.d.ts.map