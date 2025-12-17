/**
 * Parental Plugin Types
 *
 * Type definitions for parental/guardian controls with adapter support.
 * Supports different use cases through adapters (kids, gaming, education).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * Guardian settings for a user
 */
export interface GuardianSettings {
  id: string;
  user_id: string;
  adapter_type: string;
  pin_hash?: string;
  pin_failed_attempts: number;
  pin_locked_until?: Date;
  biometric_enabled: boolean;
  notifications_enabled: boolean;
  weekly_report_enabled: boolean;
  metadata: Record<string, unknown>;
  updated_at: Date;
}

/**
 * Profile restriction
 */
export interface ProfileRestriction {
  id: string;
  profile_id: string;
  restriction_type: string;
  daily_limit_minutes?: number;
  schedule?: Record<string, { start: string; end: string }>;
  is_paused: boolean;
  pause_until?: Date;
  pause_reason?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  updated_at: Date;
}

/**
 * Activity log entry
 */
export interface ActivityLog {
  id: string;
  user_id: string;
  profile_id?: string;
  device_id?: string;
  adapter_type: string;
  activity_type: string;
  details: Record<string, unknown>;
  created_at: Date;
}

/**
 * Access check result
 */
export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  minutes_remaining?: number;
  available_at?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// Input Types
// ═══════════════════════════════════════════════════════════════════════════

export interface CreateGuardianSettingsInput {
  user_id: string;
  adapter_type: string;
  pin?: string;
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
  weekly_report_enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateGuardianSettingsInput {
  biometric_enabled?: boolean;
  notifications_enabled?: boolean;
  weekly_report_enabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateRestrictionInput {
  profile_id: string;
  restriction_type: string;
  daily_limit_minutes?: number;
  schedule?: Record<string, { start: string; end: string }>;
  metadata?: Record<string, unknown>;
}

export interface LogActivityInput {
  user_id: string;
  profile_id?: string;
  device_id?: string;
  adapter_type: string;
  activity_type: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Adapter Interface
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parental adapter interface
 */
export interface ParentalAdapter {
  name: string;
  getActivityTypes(): string[];
  getDefaultDailyLimit(): number;
  validateRestriction?(restriction: CreateRestrictionInput): { valid: boolean; errors?: string[] };
  formatActivityDetails?(activity: ActivityLog): Record<string, unknown>;
  onRestrictionViolation?(profileId: string, reason: string): Promise<void>;
  onDailyLimitReached?(profileId: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Store Interface
// ═══════════════════════════════════════════════════════════════════════════

export interface ParentalStore {
  name: string;
  initialize(): Promise<void>;

  // Guardian settings
  getSettings(userId: string): Promise<GuardianSettings | null>;
  createSettings(input: CreateGuardianSettingsInput): Promise<GuardianSettings>;
  updateSettings(userId: string, input: UpdateGuardianSettingsInput): Promise<GuardianSettings | null>;
  setPin(userId: string, pinHash: string): Promise<void>;
  verifyPin(userId: string, pinHash: string): Promise<boolean>;
  incrementFailedPinAttempts(userId: string): Promise<number>;
  resetFailedPinAttempts(userId: string): Promise<void>;

  // Restrictions
  getRestrictions(profileId: string): Promise<ProfileRestriction[]>;
  createRestriction(input: CreateRestrictionInput): Promise<ProfileRestriction>;
  updateRestriction(id: string, updates: Partial<ProfileRestriction>): Promise<ProfileRestriction | null>;
  deleteRestriction(id: string): Promise<boolean>;
  pauseProfile(profileId: string, until?: Date, reason?: string): Promise<void>;
  resumeProfile(profileId: string): Promise<void>;

  // Activity log
  logActivity(input: LogActivityInput): Promise<ActivityLog>;
  getActivityLog(userId: string, limit?: number, profileId?: string): Promise<ActivityLog[]>;

  shutdown(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Types
// ═══════════════════════════════════════════════════════════════════════════

export interface PostgresParentalStoreConfig {
  pool: unknown | (() => unknown);
  settingsTable?: string;
  restrictionsTable?: string;
  activityTable?: string;
  schema?: string;
  autoCreateTables?: boolean;
}

export interface ParentalApiConfig {
  prefix?: string;
  enabled?: boolean;
}

export interface ParentalPluginConfig {
  store: ParentalStore;
  adapter: ParentalAdapter;
  maxPinAttempts?: number;
  pinLockoutMinutes?: number;
  api?: ParentalApiConfig;
  debug?: boolean;
}
