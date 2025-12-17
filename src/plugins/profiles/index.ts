/**
 * Profiles Plugin
 *
 * Generic multi-profile management with age support.
 * Exports all profile-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createProfilesPlugin,
  getProfileStore,
  createProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
  listUserProfiles,
  getDefaultProfile,
  setDefaultProfile,
  getProfilesByAgeGroup,
  getChildProfiles,
  getProfileAge,
  checkTimeRestrictions,
  getContentFilterLevel,
  canAccessContent,
} from './profiles-plugin.js';

// Types
export type {
  Profile,
  CreateProfileInput,
  UpdateProfileInput,
  ProfileSearchParams,
  ProfileListResponse,
  TimeRestrictionResult,
  ContentFilterLevel,
  AgeGroup,
  ProfileStore,
  ProfilesPluginConfig,
  ProfilesApiConfig,
  PostgresProfileStoreConfig,
  AgeThresholds,
  QwickBotProfileMetadata,
  GamingProfileMetadata,
} from './types.js';

// Stores
export { postgresProfileStore } from './stores/index.js';
