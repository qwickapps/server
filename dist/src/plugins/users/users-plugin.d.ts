/**
 * Users Plugin
 *
 * User identity management plugin for @qwickapps/server.
 * Provides CRUD operations, search, and user lookup functionality.
 *
 * Note: Ban management is handled by the separate Bans Plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin, PluginRegistry } from '../../core/plugin-registry.js';
import type { UsersPluginConfig, UserStore, User, UserInfo, UserIdentifiers, StoredIdentifiers } from './types.js';
/**
 * Create the Users plugin
 */
export declare function createUsersPlugin(config: UsersPluginConfig): Plugin;
/**
 * Get the current user store instance
 */
export declare function getUserStore(): UserStore | null;
/**
 * Get a user by ID
 */
export declare function getUserById(id: string): Promise<User | null>;
/**
 * Get a user by email
 */
export declare function getUserByEmail(email: string): Promise<User | null>;
/**
 * Get multiple users by IDs (batch query - more efficient than multiple getUserById calls)
 */
export declare function getUsersByIds(ids: string[]): Promise<User[]>;
/**
 * Find or create a user from auth provider data
 */
export declare function findOrCreateUser(data: {
    email: string;
    name?: string;
    external_id: string;
    provider: string;
    picture?: string;
}): Promise<User>;
/**
 * Build comprehensive user info by aggregating data from all loaded plugins.
 * This helper fetches data from entitlements, preferences, and bans plugins
 * in parallel (if they are loaded) and returns a unified UserInfo object.
 */
export declare function buildUserInfo(user: User, registry: PluginRegistry): Promise<UserInfo>;
/**
 * Get a user by any known identifier.
 * Tries identifiers in priority order: email > auth0_user_id > wp_user_id > keap_contact_id.
 */
export declare function getUserByIdentifier(identifiers: UserIdentifiers): Promise<User | null>;
/**
 * Link external identifiers to a user.
 * Stores identifiers in metadata.identifiers for future lookups.
 */
export declare function linkUserIdentifiers(userId: string, identifiers: Partial<StoredIdentifiers>): Promise<void>;
//# sourceMappingURL=users-plugin.d.ts.map