/**
 * PostgreSQL API Keys Store
 *
 * API key storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Uses SHA-256 for token hashing (high-entropy keys don't need bcrypt's slowness).
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own API keys.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import crypto from 'crypto';
import { getLogger } from '@qwickapps/logging';
import type {
  ApiKeyStore,
  PostgresApiKeyStoreConfig,
  CreateApiKeyParams,
  UpdateApiKeyParams,
  ApiKey,
  ApiKeyWithPlaintext,
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

// ============================================================================
// Logging
// ============================================================================

const logger = getLogger('api-keys');

// ============================================================================
// Token Generation and Hashing
// ============================================================================

/**
 * Generate a cryptographically secure API key
 *
 * Token format: `qk_<env>_<32 bytes base64url>`
 * - qk = QwickApps
 * - env = live or test
 * - 32 random bytes = high entropy secret
 *
 * @param isTest Whether this is a test key (default: false)
 * @returns Object with plaintext key, hash, and prefix
 */
function generateApiKey(isTest: boolean = false): { key: string; hash: string; prefix: string } {
  const env = isTest ? 'test' : 'live';
  const randomBytes = crypto.randomBytes(32);
  const secret = randomBytes.toString('base64url');
  const key = `qk_${env}_${secret}`;

  // Hash the key for storage (SHA-256 is appropriate for high-entropy tokens)
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  // Prefix for identification (first 12 characters)
  const prefix = key.substring(0, 12);

  return { key, hash, prefix };
}

/**
 * Hash an API key using SHA-256
 *
 * We use SHA-256 instead of bcrypt because:
 * 1. API keys are high-entropy (32 random bytes)
 * 2. No need for slow hashing (not user passwords)
 * 3. Faster verification for high-throughput API calls
 *
 * @param key Plaintext API key
 * @returns Hex-encoded SHA-256 hash
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Verify an API key against its stored hash
 *
 * Uses constant-time comparison to prevent timing attacks.
 *
 * @param key Plaintext API key
 * @param storedHash Hash from database
 * @returns True if key matches hash
 */
function verifyApiKey(key: string, storedHash: string): boolean {
  const keyHash = hashApiKey(key);

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(keyHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

/**
 * Extract prefix from API key
 *
 * @param key Plaintext API key
 * @returns Key prefix (first 12 characters)
 */
function getKeyPrefix(key: string): string {
  return key.substring(0, 12);
}

/**
 * Validate API key format
 *
 * @param key Key to validate
 * @returns True if format is valid
 */
function isValidKeyFormat(key: string): boolean {
  // Must start with qk_live_ or qk_test_
  if (!key.startsWith('qk_live_') && !key.startsWith('qk_test_')) {
    return false;
  }

  // Extract secret part
  const parts = key.split('_');
  if (parts.length !== 3) {
    return false;
  }

  const secret = parts[2];

  // Validate length (32 bytes base64url = 43 characters)
  if (secret.length !== 43) {
    return false;
  }

  // Validate characters (base64url: A-Za-z0-9_-)
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  return base64urlPattern.test(secret);
}

// ============================================================================
// RLS Helper
// ============================================================================

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

// ============================================================================
// PostgreSQL Store Implementation
// ============================================================================

/**
 * Create a PostgreSQL API keys store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns ApiKeyStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresApiKeyStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresApiKeyStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresApiKeyStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export function postgresApiKeyStore(config: PostgresApiKeyStoreConfig): ApiKeyStore {
  const {
    pool: poolOrFn,
    tableName = 'api_keys',
    schema = 'public',
    autoCreateTables = true,
    enableRLS = true,
    defaultExpirationDays = 90,
    environment = process.env.NODE_ENV === 'production' ? 'live' : 'test',
  } = config;

  // Validate environment configuration
  if (environment !== 'test' && environment !== 'live') {
    throw new Error(
      `Invalid environment: "${environment}". Must be "test" or "live". ` +
      `Check your PostgresApiKeyStoreConfig.environment setting.`
    );
  }

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
          name VARCHAR(255) NOT NULL,
          key_hash VARCHAR(64) NOT NULL,
          key_prefix VARCHAR(12) NOT NULL,
          key_type VARCHAR(10) NOT NULL CHECK (key_type IN ('m2m', 'pat')),
          scopes TEXT[] NOT NULL DEFAULT '{}',
          last_used_at TIMESTAMPTZ,
          expires_at TIMESTAMPTZ,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${tableFullName}(user_id);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_key_prefix ON ${tableFullName}(key_prefix);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_key_hash ON ${tableFullName}(key_hash);
      `);

      // Migration: Add user_id column if it doesn't exist (for existing installations)
      await pool.query(`
        DO $$
        DECLARE
          row_count INTEGER;
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = '${schema}'
            AND table_name = '${tableName}'
            AND column_name = 'user_id'
          ) THEN
            -- Check if table has data
            EXECUTE 'SELECT COUNT(*) FROM ${tableFullName}' INTO row_count;

            IF row_count > 0 THEN
              -- If table has data, cannot add NOT NULL column
              -- This requires manual migration or data cleanup
              RAISE EXCEPTION 'Cannot add user_id column: table ${tableFullName} contains % rows. Please migrate data or clear the table first.', row_count;
            ELSE
              -- Table is empty, safe to add NOT NULL column
              ALTER TABLE ${tableFullName}
              ADD COLUMN user_id UUID NOT NULL REFERENCES "public"."users"(id) ON DELETE CASCADE;

              CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${tableFullName}(user_id);
            END IF;
          END IF;
        END $$;
      `);

      // Enable RLS if configured
      if (enableRLS) {
        await pool.query(`
          ALTER TABLE ${tableFullName} ENABLE ROW LEVEL SECURITY;
          ALTER TABLE ${tableFullName} FORCE ROW LEVEL SECURITY;
        `);

        // Create or replace the RLS policy
        await pool.query(`
          DROP POLICY IF EXISTS "${tableName}_owner" ON ${tableFullName};
        `);

        // RLS policy: users can only access their own keys
        await pool.query(`
          CREATE POLICY "${tableName}_owner" ON ${tableFullName}
            FOR ALL
            USING (user_id::text = current_setting('app.current_user_id', true))
            WITH CHECK (user_id::text = current_setting('app.current_user_id', true));
        `);
      }
    },

    async create(params: CreateApiKeyParams): Promise<ApiKeyWithPlaintext> {
      const { user_id, name, key_type, scopes, expires_at } = params;

      // Generate API key based on configured environment
      const isTest = environment === 'test';
      const { key: plaintextKey, hash, prefix } = generateApiKey(isTest);

      // Calculate expiration if not provided
      const expiration = expires_at || (
        defaultExpirationDays !== null
          ? new Date(Date.now() + defaultExpirationDays * 24 * 60 * 60 * 1000)
          : null
      );

      return withRLSContext(getPool(), user_id, async (client) => {
        const result = await client.query(
          `INSERT INTO ${tableFullName}
           (user_id, name, key_hash, key_prefix, key_type, scopes, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [user_id, name, hash, prefix, key_type, scopes, expiration]
        );

        const row = result.rows[0] as ApiKey;

        logger.info('API key created', {
          action: 'api_key.created',
          user_id,
          key_id: row.id,
          key_prefix: row.key_prefix,
          key_type: row.key_type,
          scopes: row.scopes,
          timestamp: new Date().toISOString(),
        });

        return {
          ...row,
          plaintext_key: plaintextKey,
        };
      });
    },

    async list(userId: string): Promise<ApiKey[]> {
      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `SELECT * FROM ${tableFullName} WHERE user_id = $1 ORDER BY created_at DESC`,
          [userId]
        );

        return result.rows as ApiKey[];
      });
    },

    async get(userId: string, keyId: string): Promise<ApiKey | null> {
      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `SELECT * FROM ${tableFullName} WHERE user_id = $1 AND id = $2`,
          [userId, keyId]
        );

        if (result.rows.length === 0) {
          return null;
        }

        return result.rows[0] as ApiKey;
      });
    },

    async verify(plaintextKey: string): Promise<ApiKey | null> {
      // Validate format first
      if (!isValidKeyFormat(plaintextKey)) {
        return null;
      }

      const pool = getPool();
      const prefix = getKeyPrefix(plaintextKey);

      // Find key by prefix (no RLS needed for verification)
      const result = await pool.query(
        `SELECT * FROM ${tableFullName}
         WHERE key_prefix = $1 AND is_active = true`,
        [prefix]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const key = result.rows[0] as ApiKey;

      // Verify hash
      if (!verifyApiKey(plaintextKey, key.key_hash)) {
        return null;
      }

      // Check expiration
      if (key.expires_at && new Date() > new Date(key.expires_at)) {
        return null;
      }

      return key;
    },

    async update(userId: string, keyId: string, params: UpdateApiKeyParams): Promise<ApiKey | null> {
      const updates: string[] = [];
      const values: unknown[] = [userId, keyId];
      let paramIndex = 3;

      if (params.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(params.name);
      }

      if (params.scopes !== undefined) {
        updates.push(`scopes = $${paramIndex++}`);
        values.push(params.scopes);
      }

      if (params.expires_at !== undefined) {
        updates.push(`expires_at = $${paramIndex++}`);
        values.push(params.expires_at);
      }

      if (params.is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(params.is_active);
      }

      if (updates.length === 0) {
        // No updates, just return current key
        return this.get(userId, keyId);
      }

      updates.push(`updated_at = NOW()`);

      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `UPDATE ${tableFullName}
           SET ${updates.join(', ')}
           WHERE user_id = $1 AND id = $2
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          return null;
        }

        const updatedKey = result.rows[0] as ApiKey;

        logger.info('API key updated', {
          action: 'api_key.updated',
          user_id: userId,
          key_id: keyId,
          changes: Object.keys(params),
          timestamp: new Date().toISOString(),
        });

        return updatedKey;
      });
    },

    async delete(userId: string, keyId: string): Promise<boolean> {
      return withRLSContext(getPool(), userId, async (client) => {
        const result = await client.query(
          `DELETE FROM ${tableFullName} WHERE user_id = $1 AND id = $2`,
          [userId, keyId]
        );

        const deleted = (result.rowCount ?? 0) > 0;

        if (deleted) {
          logger.info('API key deleted', {
            action: 'api_key.deleted',
            user_id: userId,
            key_id: keyId,
            timestamp: new Date().toISOString(),
          });
        }

        return deleted;
      });
    },

    async recordUsage(keyId: string): Promise<void> {
      const pool = getPool();
      await pool.query(
        `UPDATE ${tableFullName} SET last_used_at = NOW() WHERE id = $1`,
        [keyId]
      );
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
