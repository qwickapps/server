/**
 * Parental Plugin
 *
 * Generic parental/guardian controls for @qwickapps/server.
 * Supports PIN protection, profile restrictions, schedules, and activity logging.
 * Uses adapters for domain-specific behavior (kids, gaming, education).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { ParentalPluginConfig, ParentalStore, ParentalAdapter, GuardianSettings, ProfileRestriction, ActivityLog, AccessCheckResult, CreateGuardianSettingsInput, UpdateGuardianSettingsInput, CreateRestrictionInput, LogActivityInput } from './types.js';
/**
 * Create the Parental plugin
 */
export declare function createParentalPlugin(config: ParentalPluginConfig): Plugin;
/**
 * Get the current parental store instance
 */
export declare function getParentalStore(): ParentalStore | null;
/**
 * Get the current parental adapter instance
 */
export declare function getParentalAdapter(): ParentalAdapter | null;
/**
 * Get guardian settings for a user
 */
export declare function getGuardianSettings(userId: string): Promise<GuardianSettings | null>;
/**
 * Create guardian settings
 */
export declare function createGuardianSettings(input: CreateGuardianSettingsInput): Promise<GuardianSettings>;
/**
 * Update guardian settings
 */
export declare function updateGuardianSettings(userId: string, input: UpdateGuardianSettingsInput): Promise<GuardianSettings | null>;
/**
 * Set PIN for guardian
 */
export declare function setPin(userId: string, pin: string): Promise<void>;
/**
 * Verify PIN
 */
export declare function verifyPin(userId: string, pin: string): Promise<boolean>;
/**
 * Increment failed PIN attempts
 */
export declare function incrementFailedPinAttempts(userId: string): Promise<number>;
/**
 * Reset failed PIN attempts
 */
export declare function resetFailedPinAttempts(userId: string): Promise<void>;
/**
 * Get restrictions for a profile
 */
export declare function getRestrictions(profileId: string): Promise<ProfileRestriction[]>;
/**
 * Create a restriction
 */
export declare function createRestriction(input: CreateRestrictionInput): Promise<ProfileRestriction>;
/**
 * Update a restriction
 */
export declare function updateRestriction(id: string, updates: Partial<ProfileRestriction>): Promise<ProfileRestriction | null>;
/**
 * Delete a restriction (soft delete)
 */
export declare function deleteRestriction(id: string): Promise<boolean>;
/**
 * Pause a profile's access
 */
export declare function pauseProfile(profileId: string, until?: Date, reason?: string): Promise<void>;
/**
 * Resume a profile's access
 */
export declare function resumeProfile(profileId: string): Promise<void>;
/**
 * Check if a profile has access based on restrictions
 */
export declare function checkProfileAccess(profileId: string): Promise<AccessCheckResult>;
/**
 * Log an activity
 */
export declare function logActivity(input: LogActivityInput): Promise<ActivityLog>;
/**
 * Get activity log
 */
export declare function getActivityLog(userId: string, limit?: number, profileId?: string): Promise<ActivityLog[]>;
//# sourceMappingURL=parental-plugin.d.ts.map