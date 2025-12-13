/**
 * PostgreSQL Preferences Store
 *
 * Preferences storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Requires the 'pg' package and the Users plugin to be installed.
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own preferences.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  PreferencesStore,
  PostgresPreferencesStoreConfig,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
  connect(): Promise<PgPoolClient>;
}

interface PgPoolClient {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
  release(): void;
}

/**
 * Deep merge two objects
 * - Objects are recursively merged
 * - Arrays are replaced (not merged)
 * - Source values override target values
 */
export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const output = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    // Skip undefined values in source
    if (sourceValue === undefined) {
      continue;
    }

    // If both are plain objects, merge recursively
    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      );
    } else {
      // Otherwise, source overwrites target
      output[key] = sourceValue;
    }
  }

  return output;
}

/**
 * Execute a function within an RLS-protected transaction
 *
 * This helper ensures that:
 * 1. All queries run within the same transaction
 * 2. The RLS context is set before any data access
 * 3. The transaction is properly committed or rolled back
 *
 * @param pool PostgreSQL pool
 * @param userId User ID to set as the RLS context
 * @param callback Function to execute within the transaction
 */
async function withRLSContext<T>(
  pool: PgPool,
  userId: string,
  callback: (client: PgPoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Set transaction-local user context for RLS
    await client.query(
      "SELECT set_config('app.current_user_id', $1, true)",
      [userId]
    );
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create a PostgreSQL preferences store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns PreferencesStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresPreferencesStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresPreferencesStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresPreferencesStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export function postgresPreferencesStore(config: PostgresPreferencesStoreConfig): PreferencesStore {
  const {
    pool: poolOrFn,
    tableName = 'user_preferences',
    schema = 'public',
    autoCreateTables = true,
    enableRLS = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    if (!pool || typeof (pool as PgPool).query !== 'function') {
      throw new Error('Invalid pool: must have query method');
    }
    return pool as PgPool;
  };

  const tableFullName = `"${schema}"."${tableName}"`;

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      const pool = getPool();

      // Create table with foreign key to users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableFullName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE,
          preferences JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${tableFullName}(user_id);
      `);

      // Enable RLS if configured
      if (enableRLS) {
        await pool.query(`
          ALTER TABLE ${tableFullName} ENABLE ROW LEVEL SECURITY;
          ALTER TABLE ${tableFullName} FORCE ROW LEVEL SECURITY;
        `);

        // Create or replace the RLS policy
        // Drop existing policy first to avoid errors on re-initialization
        await pool.query(`
          DROP POLICY IF EXISTS "${tableName}_owner" ON ${tableFullName};
        `);

        // RLS policy with both USING (for SELECT/UPDATE/DELETE reads)
        // and WITH CHECK (for INSERT/UPDATE writes) clauses
        await pool.query(`
          CREATE POLICY "${tableName}_owner" ON ${tableFullName}
            FOR ALL
            USING (user_id::text = current_setting('app.current_user_id', true))
            WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
        `);
      }
    },

    async get(userId: string): Promise<Record<string, unknown> | null> {
      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `SELECT preferences FROM ${tableFullName} WHERE user_id = $1`,
          [userId]
        );

        if (result.rows.length === 0) {
          return null;
        }

        return (result.rows[0] as { preferences: Record<string, unknown> }).preferences;
      });
    },

    async update(userId: string, preferences: Record<string, unknown>): Promise<Record<string, unknown>> {
      return withRLSContext(getPool(), userId, async (client) => {
        // Get existing preferences within the same transaction
        const existingResult = await client.query(
          `SELECT preferences FROM ${tableFullName} WHERE user_id = $1`,
          [userId]
        );

        const existing = existingResult.rows.length > 0
          ? (existingResult.rows[0] as { preferences: Record<string, unknown> }).preferences
          : null;

        const merged = existing ? deepMerge(existing, preferences) : preferences;

        // Upsert the merged preferences
        await client.query(
          `INSERT INTO ${tableFullName} (user_id, preferences, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             preferences = $2,
             updated_at = NOW()`,
          [userId, JSON.stringify(merged)]
        );

        return merged;
      });
    },

    async delete(userId: string): Promise<boolean> {
      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `DELETE FROM ${tableFullName} WHERE user_id = $1`,
          [userId]
        );

        return (result.rowCount ?? 0) > 0;
      });
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
