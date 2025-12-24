/**
 * API Keys Plugin Index
 *
 * API key authentication and management plugin with PostgreSQL RLS.
 * Depends on the Users Plugin for user identity.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createApiKeysPlugin,
  getApiKeysStore,
  verifyApiKey,
  createApiKey,
  listApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
} from './api-keys-plugin.js';

// Types
export type {
  ApiKeysPluginConfig,
  ApiKeyStore,
  ApiKey,
  ApiKeyWithPlaintext,
  ApiKeyScope,
  ApiKeyType,
  CreateApiKeyParams,
  UpdateApiKeyParams,
  PostgresApiKeyStoreConfig,
  ApiKeysApiConfig,
} from './types.js';

// Zod schemas
export {
  ApiKeyScopeSchema,
  ApiKeyTypeSchema,
  CreateApiKeySchema,
  UpdateApiKeySchema,
  ApiKeySchema,
} from './types.js';

// Stores
export { postgresApiKeyStore } from './stores/index.js';

// Middleware
export { bearerTokenAuth } from './middleware/index.js';
