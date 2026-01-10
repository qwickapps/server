/**
 * Profiles Plugin
 *
 * Generic multi-profile management plugin for @qwickapps/server.
 * Supports age-based categorization and content filtering.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { ProfilesPluginConfig, ProfileStore, Profile, CreateProfileInput, UpdateProfileInput, AgeGroup, ContentFilterLevel, TimeRestrictionResult } from './types.js';
/**
 * Create the Profiles plugin
 */
export declare function createProfilesPlugin(config: ProfilesPluginConfig): Plugin;
/**
 * Get the current profile store instance
 */
export declare function getProfileStore(): ProfileStore | null;
/**
 * Create a new profile
 */
export declare function createProfile(input: CreateProfileInput): Promise<Profile>;
/**
 * Get a profile by ID
 */
export declare function getProfileById(id: string): Promise<Profile | null>;
/**
 * Update a profile
 */
export declare function updateProfile(id: string, input: UpdateProfileInput): Promise<Profile | null>;
/**
 * Delete a profile
 */
export declare function deleteProfile(id: string): Promise<boolean>;
/**
 * List profiles for a user
 */
export declare function listUserProfiles(userId: string): Promise<Profile[]>;
/**
 * Get the default profile for a user
 */
export declare function getDefaultProfile(userId: string): Promise<Profile | null>;
/**
 * Set a profile as the default
 */
export declare function setDefaultProfile(profileId: string, userId: string): Promise<boolean>;
/**
 * Get profiles by age group
 */
export declare function getProfilesByAgeGroup(userId: string, ageGroup: AgeGroup): Promise<Profile[]>;
/**
 * Get child profiles (age_group = 'child')
 */
export declare function getChildProfiles(userId: string): Promise<Profile[]>;
/**
 * Get the current age for a profile
 */
export declare function getProfileAge(profile: Profile): number | null;
/**
 * Check time restrictions for a profile
 */
export declare function checkTimeRestrictions(profile: Profile): TimeRestrictionResult;
/**
 * Get content filter level for a profile
 */
export declare function getContentFilterLevel(profile: Profile): ContentFilterLevel;
/**
 * Check if profile can access content based on filter level
 */
export declare function canAccessContent(profile: Profile, requiredLevel: ContentFilterLevel): boolean;
//# sourceMappingURL=profiles-plugin.d.ts.map