/**
 * Users Plugin Types
 *
 * Type definitions for user identity management.
 * Storage-agnostic - supports any database through the UserStore interface.
 *
 * Note: Ban management is handled by the separate Bans Plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * User record in the database
 */
export interface User {
  /** Primary key - UUID */
  id: string;
  /** User's email address (unique) */
  email: string;
  /** User's display name */
  name?: string;
  /** External provider ID (e.g., Auth0 sub) */
  external_id?: string;
  /** Provider name (e.g., 'auth0', 'supabase') */
  provider?: string;
  /** Profile picture URL */
  picture?: string;
  /** Additional metadata (JSON) */
  metadata?: Record<string, unknown>;
  /** When the user was created */
  created_at: Date;
  /** When the user was last updated */
  updated_at: Date;
  /** When the user last logged in */
  last_login_at?: Date;
}

/**
 * User creation payload
 */
export interface CreateUserInput {
  email: string;
  name?: string;
  external_id?: string;
  provider?: string;
  picture?: string;
  metadata?: Record<string, unknown>;
}

/**
 * User update payload
 */
export interface UpdateUserInput {
  name?: string;
  picture?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Known user identifiers for multi-system lookup.
 * Users can be looked up by any of these identifiers.
 * At least one identifier must be provided for lookup.
 */
export interface UserIdentifiers {
  /** User's email address (most reliable) */
  email?: string;
  /** WordPress user ID */
  wp_user_id?: number;
  /** Auth0 user ID (sub claim, e.g., "auth0|123" or "google-oauth2|456") */
  auth0_user_id?: string;
  /** Keap CRM contact ID */
  keap_contact_id?: number;
}

/**
 * Stored identifiers in user metadata.
 * These are stored in metadata.identifiers for multi-system linking.
 */
export interface StoredIdentifiers {
  wp_user_id?: number;
  auth0_user_id?: string;
  keap_contact_id?: number;
}

/**
 * User search parameters
 */
export interface UserSearchParams {
  /** Search query (searches email and name) */
  query?: string;
  /** Filter by provider */
  provider?: string;
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: 'email' | 'name' | 'created_at' | 'last_login_at';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated user list response
 */
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * User store interface - all storage backends must implement this
 */
export interface UserStore {
  /** Store name (e.g., 'postgres', 'memory') */
  name: string;

  /**
   * Initialize the store (create tables, etc.)
   */
  initialize(): Promise<void>;

  /**
   * Get a user by ID
   */
  getById(id: string): Promise<User | null>;

  /**
   * Get multiple users by IDs (batch query)
   */
  getByIds(ids: string[]): Promise<User[]>;

  /**
   * Get a user by email
   */
  getByEmail(email: string): Promise<User | null>;

  /**
   * Get a user by external ID
   */
  getByExternalId(externalId: string, provider: string): Promise<User | null>;

  /**
   * Get a user by any known identifier.
   * Tries identifiers in priority order: email > auth0_user_id > wp_user_id > keap_contact_id.
   * Returns the first match found.
   */
  getByIdentifier(identifiers: UserIdentifiers): Promise<User | null>;

  /**
   * Link external identifiers to a user.
   * Stores identifiers in metadata.identifiers for future lookups.
   * Merges with existing identifiers (doesn't overwrite unless value provided).
   */
  linkIdentifiers(userId: string, identifiers: Partial<StoredIdentifiers>): Promise<void>;

  /**
   * Create a new user
   */
  create(input: CreateUserInput): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, input: UpdateUserInput): Promise<User | null>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search/list users
   */
  search(params: UserSearchParams): Promise<UserListResponse>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * Shutdown the store
   */
  shutdown(): Promise<void>;
}

/**
 * PostgreSQL user store configuration
 * Note: Import Pool type from 'pg' when using this store
 */
export interface PostgresUserStoreConfig {
  /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
  pool: unknown | (() => unknown);
  /** Users table name (default: 'users') */
  usersTable?: string;
  /** Schema name (default: 'public') */
  schema?: string;
  /** Auto-create tables on init (default: true) */
  autoCreateTables?: boolean;
}

/**
 * User sync configuration
 */
export interface UserSyncConfig {
  /** Enable sync */
  enabled: boolean;
  /** Create local user on first login */
  onFirstLogin?: boolean;
  /** Fields to sync from external provider */
  syncFields?: Array<'email' | 'name' | 'picture'>;
}

/**
 * API configuration
 */
export interface UsersApiConfig {
  /** API route prefix (default: '/api/users') */
  prefix?: string;
  /** Enable CRUD endpoints */
  crud?: boolean;
  /** Enable search endpoint */
  search?: boolean;
}

/**
 * UI configuration
 */
export interface UsersUiConfig {
  /** Enable UI pages */
  enabled: boolean;
  /** UI page path (default: '/users') */
  page?: string;
}

/**
 * Users plugin configuration
 */
export interface UsersPluginConfig {
  /** User storage backend */
  store: UserStore;
  /** Sync configuration (optional) */
  sync?: UserSyncConfig;
  /** API configuration */
  api?: UsersApiConfig;
  /** UI configuration */
  ui?: UsersUiConfig;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Comprehensive user information aggregated from multiple plugins.
 * Used by /users/:id/info and /users/sync endpoints.
 */
export interface UserInfo {
  /** Core user data from users plugin */
  user: User;
  /** User's entitlements (if entitlements plugin loaded) */
  entitlements?: string[];
  /** User's preferences (if preferences plugin loaded) */
  preferences?: Record<string, unknown>;
  /** Active ban info (if bans plugin loaded, null if not banned) */
  ban?: {
    id: string;
    reason: string;
    banned_at: Date;
    expires_at?: Date;
  } | null;
  /** User's roles (if roles plugin loaded - future) */
  roles?: string[];
}

/**
 * Input for POST /users/sync endpoint.
 * Supports multiple identifiers for cross-system user linking.
 */
export interface UserSyncInput {
  /** User's email address (required for user lookup/creation) */
  email: string;
  /** WordPress user ID (optional) */
  wp_user_id?: number;
  /** Auth0 user ID (sub claim) (optional) */
  auth0_user_id?: string;
  /** Keap CRM contact ID (optional - typically looked up by AuthKeaper) */
  keap_contact_id?: number;
  /** Provider name indicating source of sync request (e.g., 'auth0', 'wordpress') */
  provider?: string;
  /** User's display name (optional) */
  name?: string;
  /** Profile picture URL (optional) */
  picture?: string;

  // Legacy fields for backwards compatibility
  /** @deprecated Use auth0_user_id instead */
  external_id?: string;
}

/**
 * Input for PUT /users/profile endpoint.
 * At least one identifier is required for user lookup.
 */
export interface UserProfileInput {
  /** User's email address */
  email?: string;
  /** WordPress user ID */
  wp_user_id?: number;
  /** Auth0 user ID */
  auth0_user_id?: string;
  /** Profile data to update */
  profile: {
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    birthday?: string;
    [key: string]: unknown;
  };
}
