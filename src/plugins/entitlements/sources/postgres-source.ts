/**
 * PostgreSQL Entitlement Source
 *
 * Entitlement storage implementation using PostgreSQL.
 * Stores user entitlements and entitlement definitions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  EntitlementSource,
  EntitlementDefinition,
  EntitlementStats,
  PostgresEntitlementSourceConfig,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

/**
 * Create a PostgreSQL entitlement source
 *
 * @param config Configuration including a pg Pool instance or a function that returns one
 * @returns EntitlementSource implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresEntitlementSource } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const source = postgresEntitlementSource({ pool });
 *
 * // Or with lazy initialization:
 * const source = postgresEntitlementSource({ pool: () => getPostgres().getPool() });
 * ```
 */
export function postgresEntitlementSource(config: PostgresEntitlementSourceConfig): EntitlementSource {
  const {
    pool: poolOrFn,
    tableName = 'user_entitlements',
    definitionsTable = 'entitlement_definitions',
    schema = 'public',
    autoCreateTables = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    return pool as PgPool;
  };

  const entitlementsTable = `"${schema}"."${tableName}"`;
  const defsTable = `"${schema}"."${definitionsTable}"`;

  return {
    name: 'postgres',
    description: 'PostgreSQL local entitlements',
    readonly: false,

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      // Create entitlement definitions table (catalog of available entitlements)
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${defsTable} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(100),
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Create user entitlements table (many-to-many style)
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${entitlementsTable} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          email VARCHAR(255) NOT NULL,
          entitlement VARCHAR(255) NOT NULL,
          granted_at TIMESTAMPTZ DEFAULT NOW(),
          granted_by VARCHAR(255),
          expires_at TIMESTAMPTZ,
          metadata JSONB DEFAULT '{}',
          UNIQUE(email, entitlement)
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_email ON ${entitlementsTable}(LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${entitlementsTable}(user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_entitlement ON ${entitlementsTable}(entitlement);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_expires_at ON ${entitlementsTable}(expires_at) WHERE expires_at IS NOT NULL;
      `);
    },

    async getEntitlements(identifier: string): Promise<string[]> {
      const email = identifier.toLowerCase();

      const result = await getPool().query(
        `SELECT entitlement FROM ${entitlementsTable}
         WHERE LOWER(email) = $1
         AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY entitlement`,
        [email]
      );

      return result.rows.map((row) => (row as { entitlement: string }).entitlement);
    },

    async getAllAvailable(): Promise<EntitlementDefinition[]> {
      const result = await getPool().query(
        `SELECT id, name, category, description FROM ${defsTable}
         ORDER BY category NULLS LAST, name`
      );

      return result.rows as EntitlementDefinition[];
    },

    async getUsersWithEntitlement(
      entitlement: string,
      options: { limit?: number; offset?: number } = {}
    ): Promise<{ emails: string[]; total: number }> {
      const { limit = 50, offset = 0 } = options;

      // Get total count
      const countResult = await getPool().query(
        `SELECT COUNT(DISTINCT email) FROM ${entitlementsTable}
         WHERE entitlement = $1
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [entitlement]
      );
      const total = parseInt((countResult.rows[0] as { count: string }).count, 10);

      // Get emails
      const result = await getPool().query(
        `SELECT DISTINCT email FROM ${entitlementsTable}
         WHERE entitlement = $1
         AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY email
         LIMIT $2 OFFSET $3`,
        [entitlement, limit, offset]
      );

      return {
        emails: result.rows.map((row) => (row as { email: string }).email),
        total,
      };
    },

    async addEntitlement(identifier: string, entitlement: string, grantedBy?: string): Promise<void> {
      const email = identifier.toLowerCase();

      // Use ON CONFLICT to handle duplicates (update granted_at if re-granting)
      await getPool().query(
        `INSERT INTO ${entitlementsTable} (email, entitlement, granted_by)
         VALUES ($1, $2, $3)
         ON CONFLICT (email, entitlement) DO UPDATE SET
           granted_at = NOW(),
           granted_by = EXCLUDED.granted_by,
           expires_at = NULL`,
        [email, entitlement, grantedBy || 'system']
      );

      // Auto-create definition if it doesn't exist
      await getPool().query(
        `INSERT INTO ${defsTable} (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [entitlement]
      );
    },

    async removeEntitlement(identifier: string, entitlement: string): Promise<void> {
      const email = identifier.toLowerCase();

      await getPool().query(
        `DELETE FROM ${entitlementsTable}
         WHERE LOWER(email) = $1 AND entitlement = $2`,
        [email, entitlement]
      );
    },

    async setEntitlements(identifier: string, entitlements: string[]): Promise<void> {
      const email = identifier.toLowerCase();
      const pool = getPool();

      // Start a transaction
      await pool.query('BEGIN');

      try {
        // Remove all existing entitlements for this email
        await pool.query(
          `DELETE FROM ${entitlementsTable} WHERE LOWER(email) = $1`,
          [email]
        );

        // Insert new entitlements
        if (entitlements.length > 0) {
          const values = entitlements
            .map((_, i) => `($1, $${i + 2}, 'system')`)
            .join(', ');

          await pool.query(
            `INSERT INTO ${entitlementsTable} (email, entitlement, granted_by)
             VALUES ${values}`,
            [email, ...entitlements]
          );

          // Auto-create definitions for any new entitlements
          for (const ent of entitlements) {
            await pool.query(
              `INSERT INTO ${defsTable} (name)
               VALUES ($1)
               ON CONFLICT (name) DO NOTHING`,
              [ent]
            );
          }
        }

        await pool.query('COMMIT');
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    },

    async getStats(): Promise<EntitlementStats> {
      const result = await getPool().query(
        `SELECT
           COUNT(DISTINCT email) as users_with_entitlements,
           COUNT(DISTINCT entitlement) as total_entitlements
         FROM ${entitlementsTable}
         WHERE expires_at IS NULL OR expires_at > NOW()`
      );

      const row = result.rows[0] as {
        users_with_entitlements: string;
        total_entitlements: string;
      };

      return {
        usersWithEntitlements: parseInt(row.users_with_entitlements, 10) || 0,
        totalEntitlements: parseInt(row.total_entitlements, 10) || 0,
      };
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
