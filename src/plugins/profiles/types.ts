/**
 * Profiles Plugin Types
 *
 * Type definitions for generic multi-profile management with age support.
 * Supports child profiles for QwickBot, player profiles for gaming, etc.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * Content filter levels for age-appropriate content
 */
export type ContentFilterLevel = 'strict' | 'moderate' | 'minimal' | 'none';

/**
 * Age groups for categorization
 */
export type AgeGroup = 'child' | 'teen' | 'adult';

/**
 * Profile record in the database
 */
export interface Profile {
  /** Primary key - UUID */
  id: string;
  /** Organization ID for multi-tenant isolation */
  org_id?: string;
  /** Owner/parent user ID */
  user_id: string;
  /** Profile name */
  name: string;
  /** Avatar identifier or URL */
  avatar?: string;

  // Age-based features
  /** Birth date for precise age calculation */
  birth_date?: Date;
  /** Static age (if birth_date not provided) */
  age?: number;
  /** Computed age group (child, teen, adult) */
  age_group?: AgeGroup;

  // Content/access control
  /** Content filter level */
  content_filter_level: ContentFilterLevel;

  // Time restrictions
  /** Daily time limit in minutes (null = no limit) */
  daily_time_limit_minutes?: number;
  /** Allowed hours start (null = no restriction) */
  allowed_hours_start?: string;
  /** Allowed hours end (null = no restriction) */
  allowed_hours_end?: string;

  // Status
  /** Whether profile is active */
  is_active: boolean;
  /** Whether this is the default profile for the user */
  is_default: boolean;

  // Extensibility
  /** App-specific metadata */
  metadata: Record<string, unknown>;

  /** When the profile was created */
  created_at: Date;
  /** When the profile was last updated */
  updated_at: Date;
  /** Soft delete timestamp */
  deleted_at?: Date;
}

/**
 * Profile creation payload
 */
export interface CreateProfileInput {
  /** Organization ID */
  org_id?: string;
  /** Owner user ID */
  user_id: string;
  /** Profile name */
  name: string;
  /** Avatar identifier or URL */
  avatar?: string;
  /** Birth date for age calculation */
  birth_date?: Date;
  /** Static age (if birth_date not provided) */
  age?: number;
  /** Content filter level (default: 'moderate') */
  content_filter_level?: ContentFilterLevel;
  /** Daily time limit in minutes */
  daily_time_limit_minutes?: number;
  /** Allowed hours start (HH:MM format) */
  allowed_hours_start?: string;
  /** Allowed hours end (HH:MM format) */
  allowed_hours_end?: string;
  /** Whether this is the default profile */
  is_default?: boolean;
  /** App-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Profile update payload
 */
export interface UpdateProfileInput {
  /** Profile name */
  name?: string;
  /** Avatar identifier or URL */
  avatar?: string;
  /** Birth date for age calculation */
  birth_date?: Date | null;
  /** Static age */
  age?: number | null;
  /** Content filter level */
  content_filter_level?: ContentFilterLevel;
  /** Daily time limit in minutes (null to remove) */
  daily_time_limit_minutes?: number | null;
  /** Allowed hours start (null to remove) */
  allowed_hours_start?: string | null;
  /** Allowed hours end (null to remove) */
  allowed_hours_end?: string | null;
  /** Whether profile is active */
  is_active?: boolean;
  /** Whether this is the default profile */
  is_default?: boolean;
  /** App-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Profile search parameters
 */
export interface ProfileSearchParams {
  /** Organization ID filter */
  org_id?: string;
  /** User ID filter */
  user_id?: string;
  /** Age group filter */
  age_group?: AgeGroup;
  /** Active status filter */
  is_active?: boolean;
  /** Search query (searches name) */
  query?: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: 'name' | 'created_at' | 'age';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated profile list response
 */
export interface ProfileListResponse {
  profiles: Profile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Time restriction check result
 */
export interface TimeRestrictionResult {
  /** Whether access is allowed right now */
  allowed: boolean;
  /** Reason if not allowed */
  reason?: string;
  /** Minutes remaining today (if has limit) */
  minutes_remaining?: number;
  /** When restriction ends (if currently restricted) */
  available_at?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// Store Interface
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Profile store interface - all storage backends must implement this
 */
export interface ProfileStore {
  /** Store name (e.g., 'postgres', 'memory') */
  name: string;

  /**
   * Initialize the store (create tables, etc.)
   */
  initialize(): Promise<void>;

  /**
   * Get a profile by ID
   */
  getById(id: string): Promise<Profile | null>;

  /**
   * Create a new profile
   */
  create(input: CreateProfileInput): Promise<Profile>;

  /**
   * Update an existing profile
   */
  update(id: string, input: UpdateProfileInput): Promise<Profile | null>;

  /**
   * Soft delete a profile
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search/list profiles
   */
  search(params: ProfileSearchParams): Promise<ProfileListResponse>;

  /**
   * List profiles for a user
   */
  listByUser(userId: string): Promise<Profile[]>;

  /**
   * Get the default profile for a user
   */
  getDefaultProfile(userId: string): Promise<Profile | null>;

  /**
   * Count profiles for a user
   */
  getProfileCount(userId: string): Promise<number>;

  /**
   * Get profiles by age group
   */
  getByAgeGroup(userId: string, ageGroup: AgeGroup): Promise<Profile[]>;

  /**
   * Set a profile as default (unsets others)
   */
  setDefaultProfile(profileId: string, userId: string): Promise<boolean>;

  /**
   * Shutdown the store
   */
  shutdown(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PostgreSQL profile store configuration
 */
export interface PostgresProfileStoreConfig {
  /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
  pool: unknown | (() => unknown);
  /** Profiles table name (default: 'profiles') */
  tableName?: string;
  /** Schema name (default: 'public') */
  schema?: string;
  /** Auto-create tables on init (default: true) */
  autoCreateTables?: boolean;
}

/**
 * Age thresholds for categorization
 */
export interface AgeThresholds {
  /** Maximum age for 'child' (default: 12) */
  child: number;
  /** Maximum age for 'teen' (default: 17) */
  teen: number;
}

/**
 * API configuration
 */
export interface ProfilesApiConfig {
  /** API route prefix (default: '/profiles') */
  prefix?: string;
  /** Enable CRUD endpoints */
  crud?: boolean;
}

/**
 * Profiles plugin configuration
 */
export interface ProfilesPluginConfig {
  /** Profile storage backend */
  store: ProfileStore;
  /** Maximum profiles per user (default: 10) */
  maxProfilesPerUser?: number;
  /** Default content filter level (default: 'moderate') */
  defaultFilterLevel?: ContentFilterLevel;
  /** Age thresholds for categorization */
  ageThresholds?: AgeThresholds;
  /** API configuration */
  api?: ProfilesApiConfig;
  /** Enable debug logging */
  debug?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// App-specific Metadata Types (examples)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * QwickBot profile metadata (stored in metadata field)
 */
export interface QwickBotProfileMetadata {
  /** Voice ID for text-to-speech */
  voice_id?: string;
  /** Avatar style identifier */
  avatar_style?: string;
  /** Personality prompt for AI */
  personality_prompt?: string;
  /** User's interests */
  interests?: string[];
}

/**
 * Gaming profile metadata (stored in metadata field)
 */
export interface GamingProfileMetadata {
  /** Gamer tag */
  gamer_tag?: string;
  /** Avatar URL */
  avatar_url?: string;
  /** Allowed game ratings (E, E10+, T, M) */
  allowed_ratings?: string[];
  /** Preferred genres */
  preferred_genres?: string[];
}
