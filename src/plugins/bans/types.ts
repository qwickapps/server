/**
 * Bans Plugin Types
 *
 * Type definitions for ban management.
 * Bans are always on USER entities (by user_id), not emails.
 * Email is just an identifier to resolve to a user.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { User } from '../users/types.js';

/**
 * Ban record
 */
export interface Ban {
  /** Primary key - UUID */
  id: string;
  /** User ID being banned */
  user_id: string;
  /** Reason for the ban */
  reason: string;
  /** Who created the ban (user ID or system) */
  banned_by: string;
  /** When the ban was created */
  banned_at: Date;
  /** When the ban expires (null = permanent) */
  expires_at?: Date;
  /** Whether the ban is currently active */
  is_active: boolean;
  /** When the ban was removed */
  removed_at?: Date;
  /** Who removed the ban */
  removed_by?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Ban creation payload
 */
export interface CreateBanInput {
  user_id: string;
  reason: string;
  banned_by: string;
  /** Duration in seconds (null = permanent) */
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Ban removal payload
 */
export interface RemoveBanInput {
  user_id: string;
  removed_by: string;
  note?: string;
}

/**
 * Ban store interface - storage backend for bans
 */
export interface BanStore {
  /** Store name (e.g., 'postgres', 'memory') */
  name: string;

  /** Initialize the store (create tables, etc.) */
  initialize(): Promise<void>;

  /** Check if user is banned */
  isBanned(userId: string): Promise<boolean>;

  /** Get active ban for user */
  getActiveBan(userId: string): Promise<Ban | null>;

  /** Create a ban */
  createBan(input: CreateBanInput): Promise<Ban>;

  /** Remove a ban */
  removeBan(input: RemoveBanInput): Promise<boolean>;

  /** List bans for a user (including history) */
  listBans(userId: string): Promise<Ban[]>;

  /** List all active bans */
  listActiveBans(options?: { limit?: number; offset?: number }): Promise<{
    bans: Ban[];
    total: number;
  }>;

  /** Cleanup expired bans */
  cleanupExpiredBans(): Promise<number>;

  /** Shutdown the store */
  shutdown(): Promise<void>;
}

/**
 * Ban callbacks
 */
export interface BanCallbacks {
  /** Called when a user is banned */
  onBan?: (user: User, ban: Ban) => Promise<void>;
  /** Called when a ban is removed */
  onUnban?: (user: User) => Promise<void>;
}

/**
 * Bans plugin configuration
 */
export interface BansPluginConfig {
  /** Ban storage backend */
  store: BanStore;
  /** Support temporary bans (with expiration) */
  supportTemporary?: boolean;
  /** Callbacks */
  callbacks?: BanCallbacks;
  /** API configuration */
  api?: {
    /** API route prefix (default: '/api/bans') */
    prefix?: string;
    /** Enable API endpoints */
    enabled?: boolean;
  };
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * PostgreSQL ban store configuration
 */
export interface PostgresBanStoreConfig {
  /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
  pool: unknown | (() => unknown);
  /** Bans table name (default: 'user_bans') */
  tableName?: string;
  /** Schema name (default: 'public') */
  schema?: string;
  /** Auto-create tables on init (default: true) */
  autoCreateTables?: boolean;
}
