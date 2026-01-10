/**
 * Entitlements Plugin
 *
 * User entitlement management plugin for @qwickapps/server.
 * Supports pluggable sources (PostgreSQL, Keap, etc.) with Redis caching.
 *
 * Entitlements are string-based tags (e.g., 'pro', 'enterprise', 'feature:analytics').
 * Multiple sources can be combined - entitlements are merged from all sources.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RequestHandler } from 'express';
import type { Plugin } from '../../core/plugin-registry.js';
import type { EntitlementsPluginConfig, EntitlementSource, EntitlementResult, EntitlementDefinition, EntitlementStats } from './types.js';
/**
 * Create the Entitlements plugin
 */
export declare function createEntitlementsPlugin(config: EntitlementsPluginConfig): Plugin;
/**
 * Get the primary entitlement source
 */
export declare function getEntitlementSource(): EntitlementSource | null;
/**
 * Check if the primary source is readonly
 */
export declare function isSourceReadonly(): boolean;
/**
 * Get entitlements for an email (cache-first)
 */
export declare function getEntitlements(email: string): Promise<EntitlementResult>;
/**
 * Refresh entitlements (bypass cache)
 */
export declare function refreshEntitlements(email: string): Promise<EntitlementResult>;
/**
 * Check if user has a specific entitlement
 */
export declare function hasEntitlement(email: string, entitlement: string): Promise<boolean>;
/**
 * Check if user has any of the specified entitlements
 */
export declare function hasAnyEntitlement(email: string, entitlements: string[]): Promise<boolean>;
/**
 * Check if user has all of the specified entitlements
 */
export declare function hasAllEntitlements(email: string, entitlements: string[]): Promise<boolean>;
/**
 * Grant an entitlement to a user
 * @throws Error if source is read-only
 */
export declare function grantEntitlement(email: string, entitlement: string, grantedBy?: string): Promise<void>;
/**
 * Revoke an entitlement from a user
 * @throws Error if source is read-only
 */
export declare function revokeEntitlement(email: string, entitlement: string): Promise<void>;
/**
 * Set all entitlements for a user (replaces existing)
 * Used by sync services to bulk-update user entitlements from external sources
 * @throws Error if source is read-only or doesn't support setEntitlements
 */
export declare function setEntitlements(email: string, entitlements: string[]): Promise<void>;
/**
 * Get all available entitlement definitions
 */
export declare function getAvailableEntitlements(): Promise<EntitlementDefinition[]>;
/**
 * Get entitlement statistics from the primary source
 */
export declare function getEntitlementStats(): Promise<EntitlementStats>;
/**
 * Invalidate cache for an email
 */
export declare function invalidateEntitlementCache(email: string): Promise<void>;
/**
 * Store a mapping from external ID to email (for webhook invalidation)
 */
export declare function storeExternalIdMapping(source: string, externalId: string, email: string): Promise<void>;
/**
 * Invalidate cache by external ID (for webhook handling)
 */
export declare function invalidateByExternalId(source: string, externalId: string): Promise<void>;
/**
 * Express middleware to require a specific entitlement
 */
export declare function requireEntitlement(entitlement: string): RequestHandler;
/**
 * Express middleware to require any of the specified entitlements
 */
export declare function requireAnyEntitlement(entitlements: string[]): RequestHandler;
/**
 * Express middleware to require all of the specified entitlements
 */
export declare function requireAllEntitlements(entitlements: string[]): RequestHandler;
//# sourceMappingURL=entitlements-plugin.d.ts.map