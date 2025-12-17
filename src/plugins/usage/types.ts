/**
 * Usage Plugin Types
 *
 * Type definitions for usage tracking with daily/monthly counters.
 * Integrates with subscriptions-plugin for limit enforcement.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * Daily usage record
 */
export interface DailyUsage {
  /** Primary key - UUID */
  id: string;
  /** User ID */
  user_id: string;
  /** Feature code (e.g., 'ai_messages', 'vision_calls') */
  feature_code: string;
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Usage count */
  count: number;
  /** Additional metadata */
  metadata: Record<string, unknown>;
  /** When the record was created */
  created_at: Date;
  /** When the record was last updated */
  updated_at: Date;
}

/**
 * Monthly usage record
 */
export interface MonthlyUsage {
  /** Primary key - UUID */
  id: string;
  /** User ID */
  user_id: string;
  /** Feature code */
  feature_code: string;
  /** Year-month (YYYY-MM) */
  year_month: string;
  /** Usage count */
  count: number;
  /** Additional metadata */
  metadata: Record<string, unknown>;
  /** When the record was created */
  created_at: Date;
  /** When the record was last updated */
  updated_at: Date;
}

/**
 * Usage increment result
 */
export interface UsageIncrementResult {
  /** Whether the increment was allowed */
  allowed: boolean;
  /** Current count after increment (if allowed) */
  current_count: number;
  /** Limit value (-1 = unlimited) */
  limit: number | null;
  /** Remaining quota */
  remaining: number | null;
  /** When the counter resets */
  resets_at?: Date;
  /** Reason if not allowed */
  reason?: string;
}

/**
 * Usage status for a feature
 */
export interface UsageStatus {
  /** Feature code */
  feature_code: string;
  /** Current usage count */
  current: number;
  /** Limit value (-1 = unlimited, null = no subscription) */
  limit: number | null;
  /** Remaining quota (-1 = unlimited) */
  remaining: number | null;
  /** When the counter resets */
  resets_at: Date;
  /** Percentage used (0-100, null if unlimited) */
  percentage_used: number | null;
}

/**
 * Usage summary for a user
 */
export interface UsageSummary {
  /** User ID */
  user_id: string;
  /** Period (daily or monthly) */
  period: 'daily' | 'monthly';
  /** Period date/month */
  period_value: string;
  /** Usage by feature */
  features: UsageStatus[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Store Interface
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Usage store interface
 */
export interface UsageStore {
  /** Store name (e.g., 'postgres') */
  name: string;

  /**
   * Initialize the store (create tables, etc.)
   */
  initialize(): Promise<void>;

  /**
   * Get daily usage for a user and feature
   */
  getDailyUsage(userId: string, featureCode: string, date?: string): Promise<DailyUsage | null>;

  /**
   * Get monthly usage for a user and feature
   */
  getMonthlyUsage(userId: string, featureCode: string, yearMonth?: string): Promise<MonthlyUsage | null>;

  /**
   * Increment daily usage (also updates monthly)
   */
  incrementDaily(userId: string, featureCode: string, amount?: number, date?: string): Promise<number>;

  /**
   * Get all daily usage for a user on a date
   */
  getAllDailyUsage(userId: string, date?: string): Promise<DailyUsage[]>;

  /**
   * Get all monthly usage for a user
   */
  getAllMonthlyUsage(userId: string, yearMonth?: string): Promise<MonthlyUsage[]>;

  /**
   * Reset daily usage for a user and feature
   */
  resetDailyUsage(userId: string, featureCode: string, date?: string): Promise<void>;

  /**
   * Cleanup old daily records
   */
  cleanupOldDaily(daysToKeep: number): Promise<number>;

  /**
   * Cleanup old monthly records
   */
  cleanupOldMonthly(monthsToKeep: number): Promise<number>;

  /**
   * Shutdown the store
   */
  shutdown(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Configuration Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PostgreSQL usage store configuration
 */
export interface PostgresUsageStoreConfig {
  /** PostgreSQL pool instance or a function that returns one */
  pool: unknown | (() => unknown);
  /** Daily usage table name (default: 'usage_daily') */
  dailyTable?: string;
  /** Monthly usage table name (default: 'usage_monthly') */
  monthlyTable?: string;
  /** Schema name (default: 'public') */
  schema?: string;
  /** Auto-create tables on init (default: true) */
  autoCreateTables?: boolean;
}

/**
 * API configuration
 */
export interface UsageApiConfig {
  /** API route prefix (default: '/usage') */
  prefix?: string;
  /** Enable usage endpoints */
  enabled?: boolean;
}

/**
 * Cleanup configuration
 */
export interface UsageCleanupConfig {
  /** Days to keep daily records (default: 90) */
  dailyRetentionDays?: number;
  /** Months to keep monthly records (default: 24) */
  monthlyRetentionMonths?: number;
  /** Run cleanup on startup */
  runOnStartup?: boolean;
  /** Cleanup interval in hours (0 = disabled) */
  cleanupIntervalHours?: number;
}

/**
 * Usage plugin configuration
 */
export interface UsagePluginConfig {
  /** Usage storage backend */
  store: UsageStore;
  /** API configuration */
  api?: UsageApiConfig;
  /** Cleanup configuration */
  cleanup?: UsageCleanupConfig;
  /** Enable debug logging */
  debug?: boolean;
}
