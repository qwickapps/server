/**
 * Bans Plugin
 *
 * User ban management plugin for @qwickapps/server.
 * Bans are always on USER entities (by user_id), not emails.
 *
 * This plugin depends on the Users Plugin for user resolution.
 * Use `isEmailBanned()` convenience function to check bans by email,
 * which internally resolves email → user_id → ban status.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { BansPluginConfig, BanStore, Ban, CreateBanInput, RemoveBanInput } from './types.js';
/**
 * Create the Bans plugin
 */
export declare function createBansPlugin(config: BansPluginConfig): Plugin;
/**
 * Get the current ban store instance
 */
export declare function getBanStore(): BanStore | null;
/**
 * Check if a user is banned by user ID
 */
export declare function isUserBanned(userId: string): Promise<boolean>;
/**
 * Check if a user is banned by email
 *
 * This is a convenience function that:
 * 1. Resolves email → user via Users Plugin
 * 2. Checks ban status by user_id
 *
 * Returns false if user doesn't exist (unknown user = not banned)
 */
export declare function isEmailBanned(email: string): Promise<boolean>;
/**
 * Get active ban for a user
 */
export declare function getActiveBan(userId: string): Promise<Ban | null>;
/**
 * Ban a user
 */
export declare function banUser(input: CreateBanInput): Promise<Ban>;
/**
 * Unban a user
 */
export declare function unbanUser(input: RemoveBanInput): Promise<boolean>;
/**
 * List all active bans
 */
export declare function listActiveBans(options?: {
    limit?: number;
    offset?: number;
}): Promise<{
    bans: Ban[];
    total: number;
}>;
//# sourceMappingURL=bans-plugin.d.ts.map