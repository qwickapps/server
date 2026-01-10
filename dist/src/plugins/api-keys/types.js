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
 * Validate scope name format
 *
 * Valid formats:
 * - Plugin scope: 'plugin-id:action' (e.g., 'qwickbrain:execute')
 * - Legacy scope: 'read', 'write', 'admin' (converted to 'system:*')
 *
 * @param scope Scope name to validate
 * @returns True if scope format is valid
 */
export function isValidScopeFormat(scope) {
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
export function normalizeScope(scope) {
    const legacyMap = {
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
};
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
export const ApiKeyScopeSchema = z.string().refine((scope) => isValidScopeFormat(scope), { message: 'Scope must be in format "plugin-id:action" or a legacy scope (read, write, admin)' });
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
}).refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided for update' });
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
//# sourceMappingURL=types.js.map