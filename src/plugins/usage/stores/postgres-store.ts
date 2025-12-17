/**
 * PostgreSQL Usage Store
 *
 * Usage tracking storage implementation using PostgreSQL.
 * Tracks daily and monthly usage counters.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  UsageStore,
  DailyUsage,
  MonthlyUsage,
  PostgresUsageStoreConfig,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current year-month in YYYY-MM format
 */
function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Create a PostgreSQL usage store
 */
export function postgresUsageStore(config: PostgresUsageStoreConfig): UsageStore {
  const {
    pool: poolOrFn,
    dailyTable = 'usage_daily',
    monthlyTable = 'usage_monthly',
    schema = 'public',
    autoCreateTables = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    return pool as PgPool;
  };

  const dailyTableFull = `"${schema}"."${dailyTable}"`;
  const monthlyTableFull = `"${schema}"."${monthlyTable}"`;

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      // Create usage_daily table
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${dailyTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          feature_code VARCHAR(100) NOT NULL,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          count INTEGER DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, feature_code, date)
        );

        CREATE INDEX IF NOT EXISTS idx_${dailyTable}_user_date ON ${dailyTableFull}(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_${dailyTable}_feature ON ${dailyTableFull}(feature_code);
        CREATE INDEX IF NOT EXISTS idx_${dailyTable}_date ON ${dailyTableFull}(date);
      `);

      // Create usage_monthly table
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${monthlyTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          feature_code VARCHAR(100) NOT NULL,
          year_month VARCHAR(7) NOT NULL,
          count INTEGER DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, feature_code, year_month)
        );

        CREATE INDEX IF NOT EXISTS idx_${monthlyTable}_user ON ${monthlyTableFull}(user_id, year_month);
        CREATE INDEX IF NOT EXISTS idx_${monthlyTable}_feature ON ${monthlyTableFull}(feature_code);
      `);
    },

    async getDailyUsage(userId: string, featureCode: string, date?: string): Promise<DailyUsage | null> {
      const targetDate = date || getCurrentDate();
      const result = await getPool().query(
        `SELECT * FROM ${dailyTableFull}
         WHERE user_id = $1 AND feature_code = $2 AND date = $3`,
        [userId, featureCode, targetDate]
      );
      return (result.rows[0] as DailyUsage) || null;
    },

    async getMonthlyUsage(userId: string, featureCode: string, yearMonth?: string): Promise<MonthlyUsage | null> {
      const targetMonth = yearMonth || getCurrentYearMonth();
      const result = await getPool().query(
        `SELECT * FROM ${monthlyTableFull}
         WHERE user_id = $1 AND feature_code = $2 AND year_month = $3`,
        [userId, featureCode, targetMonth]
      );
      return (result.rows[0] as MonthlyUsage) || null;
    },

    async incrementDaily(userId: string, featureCode: string, amount = 1, date?: string): Promise<number> {
      const targetDate = date || getCurrentDate();
      const yearMonth = targetDate.substring(0, 7); // Extract YYYY-MM from YYYY-MM-DD

      // Increment daily usage (upsert)
      const dailyResult = await getPool().query(
        `INSERT INTO ${dailyTableFull} (user_id, feature_code, date, count)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, feature_code, date)
         DO UPDATE SET count = ${dailyTableFull}.count + $4, updated_at = NOW()
         RETURNING count`,
        [userId, featureCode, targetDate, amount]
      );

      const newCount = (dailyResult.rows[0] as { count: number }).count;

      // Also increment monthly usage
      await getPool().query(
        `INSERT INTO ${monthlyTableFull} (user_id, feature_code, year_month, count)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, feature_code, year_month)
         DO UPDATE SET count = ${monthlyTableFull}.count + $4, updated_at = NOW()`,
        [userId, featureCode, yearMonth, amount]
      );

      return newCount;
    },

    async getAllDailyUsage(userId: string, date?: string): Promise<DailyUsage[]> {
      const targetDate = date || getCurrentDate();
      const result = await getPool().query(
        `SELECT * FROM ${dailyTableFull}
         WHERE user_id = $1 AND date = $2
         ORDER BY feature_code`,
        [userId, targetDate]
      );
      return result.rows as DailyUsage[];
    },

    async getAllMonthlyUsage(userId: string, yearMonth?: string): Promise<MonthlyUsage[]> {
      const targetMonth = yearMonth || getCurrentYearMonth();
      const result = await getPool().query(
        `SELECT * FROM ${monthlyTableFull}
         WHERE user_id = $1 AND year_month = $2
         ORDER BY feature_code`,
        [userId, targetMonth]
      );
      return result.rows as MonthlyUsage[];
    },

    async resetDailyUsage(userId: string, featureCode: string, date?: string): Promise<void> {
      const targetDate = date || getCurrentDate();
      await getPool().query(
        `UPDATE ${dailyTableFull}
         SET count = 0, updated_at = NOW()
         WHERE user_id = $1 AND feature_code = $2 AND date = $3`,
        [userId, featureCode, targetDate]
      );
    },

    async cleanupOldDaily(daysToKeep: number): Promise<number> {
      // Calculate cutoff date to avoid SQL interpolation
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const result = await getPool().query(
        `DELETE FROM ${dailyTableFull} WHERE date < $1`,
        [cutoffDateStr]
      );
      return result.rowCount ?? 0;
    },

    async cleanupOldMonthly(monthsToKeep: number): Promise<number> {
      // Calculate the cutoff year-month
      const now = new Date();
      now.setMonth(now.getMonth() - monthsToKeep);
      const cutoffMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const result = await getPool().query(
        `DELETE FROM ${monthlyTableFull}
         WHERE year_month < $1`,
        [cutoffMonth]
      );
      return result.rowCount ?? 0;
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
