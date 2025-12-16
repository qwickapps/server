/**
 * Auth Configuration Store
 *
 * PostgreSQL-based storage for runtime auth configuration.
 * Supports pg_notify for cross-instance hot-reload in scaled deployments.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  AuthConfigStore,
  RuntimeAuthConfig,
  PostgresAuthConfigStoreConfig,
} from './types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
  connect(): Promise<PgPoolClient>;
  on(event: string, callback: (err?: Error, client?: PgPoolClient) => void): void;
}

interface PgPoolClient {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
  on(event: string, callback: (msg: { channel: string; payload?: string }) => void): void;
  release(destroy?: boolean): void;
}

/**
 * Create a PostgreSQL-backed auth configuration store
 *
 * @param config Configuration including a pg Pool instance
 * @returns AuthConfigStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresAuthConfigStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresAuthConfigStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresAuthConfigStore({ pool: () => getPostgres().getPool() });
 * ```
 */
// Valid identifier pattern (alphanumeric + underscore, starting with letter or underscore)
const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validate SQL identifier to prevent SQL injection
 */
function validateIdentifier(name: string, type: string): void {
  if (!VALID_IDENTIFIER.test(name)) {
    throw new Error(`Invalid ${type}: must be alphanumeric with underscores, starting with letter or underscore`);
  }
  if (name.length > 63) {
    throw new Error(`Invalid ${type}: must be 63 characters or less`);
  }
}

export function postgresAuthConfigStore(config: PostgresAuthConfigStoreConfig): AuthConfigStore {
  const {
    pool: poolOrFn,
    tableName = 'auth_config',
    schema = 'public',
    autoCreateTable = true,
    enableNotify = true,
    notifyChannel = 'auth_config_changed',
  } = config;

  // Validate identifiers to prevent SQL injection
  validateIdentifier(tableName, 'table name');
  validateIdentifier(schema, 'schema name');
  validateIdentifier(notifyChannel, 'notify channel');

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    if (!pool || typeof (pool as PgPool).query !== 'function') {
      throw new Error('Invalid pool: must have query method');
    }
    return pool as PgPool;
  };

  const tableFullName = `"${schema}"."${tableName}"`;

  // Listeners for config changes
  const listeners: Set<(config: RuntimeAuthConfig | null) => void> = new Set();

  // Client dedicated to listening for notifications
  let listenerClient: PgPoolClient | null = null;

  // Reconnection state for exponential backoff
  let reconnectAttempt = 0;
  const maxReconnectDelay = 60000; // Max 60 seconds
  const baseReconnectDelay = 1000; // Start at 1 second

  /**
   * Calculate reconnect delay with exponential backoff
   */
  function getReconnectDelay(): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s (capped)
    const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempt), maxReconnectDelay);
    reconnectAttempt++;
    return delay;
  }

  /**
   * Reset reconnection state after successful connection
   */
  function resetReconnectState(): void {
    reconnectAttempt = 0;
  }

  /**
   * Start listening for pg_notify events
   */
  async function startListening(): Promise<void> {
    if (!enableNotify || listenerClient) return;

    try {
      const pool = getPool();
      listenerClient = await pool.connect();

      // Subscribe to the notification channel
      await listenerClient.query(`LISTEN ${notifyChannel}`);

      // Reset backoff on successful connection
      resetReconnectState();

      // Handle notifications
      listenerClient.on('notification', async (msg: { channel: string; payload?: string }) => {
        if (msg.channel === notifyChannel) {
          // Reload config from database and notify listeners
          const newConfig = await loadFromDb();
          for (const listener of listeners) {
            try {
              listener(newConfig);
            } catch (err) {
              console.error('[AuthConfigStore] Listener error:', err);
            }
          }
        }
      });

      // Handle errors - try to reconnect with exponential backoff
      // Note: pg client emits 'error' events with Error objects, but our interface
      // only defines 'notification'. We cast to any to handle this.
      (listenerClient as unknown as { on(event: 'error', cb: (err: Error) => void): void }).on(
        'error',
        (err: Error) => {
          console.error('[AuthConfigStore] Listener connection error:', err);
          listenerClient?.release(true);
          listenerClient = null;
          // Try to reconnect with exponential backoff
          const delay = getReconnectDelay();
          console.log(`[AuthConfigStore] Reconnecting in ${delay}ms (attempt ${reconnectAttempt})`);
          setTimeout(() => startListening(), delay);
        }
      );
    } catch (err) {
      console.error('[AuthConfigStore] Failed to start listener:', err);
      listenerClient = null;
      // Also apply backoff on initial connection failure
      const delay = getReconnectDelay();
      console.log(`[AuthConfigStore] Retrying connection in ${delay}ms (attempt ${reconnectAttempt})`);
      setTimeout(() => startListening(), delay);
    }
  }

  /**
   * Load config from database
   */
  async function loadFromDb(): Promise<RuntimeAuthConfig | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT adapter, config, settings, updated_at, updated_by
       FROM ${tableFullName}
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0] as {
      adapter: string | null;
      config: Record<string, unknown>;
      settings: Record<string, unknown>;
      updated_at: Date;
      updated_by: string | null;
    };

    return {
      adapter: row.adapter as RuntimeAuthConfig['adapter'],
      config: row.config as RuntimeAuthConfig['config'],
      settings: row.settings as RuntimeAuthConfig['settings'],
      updatedAt: row.updated_at.toISOString(),
      updatedBy: row.updated_by || undefined,
    };
  }

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTable) {
        await startListening();
        return;
      }

      const pool = getPool();

      // Create table with singleton pattern (only one row allowed)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableFullName} (
          id SERIAL PRIMARY KEY,
          adapter VARCHAR(50),
          config JSONB NOT NULL DEFAULT '{}',
          settings JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          updated_by VARCHAR(255)
        );

        -- Ensure only one config row (singleton pattern)
        CREATE UNIQUE INDEX IF NOT EXISTS idx_${tableName}_singleton
        ON ${tableFullName} ((true));
      `);

      // Start listening for notifications
      await startListening();
    },

    async load(): Promise<RuntimeAuthConfig | null> {
      return loadFromDb();
    },

    async save(runtimeConfig: RuntimeAuthConfig): Promise<void> {
      const pool = getPool();

      // Upsert the configuration
      await pool.query(
        `INSERT INTO ${tableFullName} (adapter, config, settings, updated_at, updated_by)
         VALUES ($1, $2, $3, NOW(), $4)
         ON CONFLICT ((true)) DO UPDATE SET
           adapter = $1,
           config = $2,
           settings = $3,
           updated_at = NOW(),
           updated_by = $4`,
        [
          runtimeConfig.adapter,
          JSON.stringify(runtimeConfig.config),
          JSON.stringify(runtimeConfig.settings),
          runtimeConfig.updatedBy || null,
        ]
      );

      // Notify other instances
      if (enableNotify) {
        await pool.query(`NOTIFY ${notifyChannel}`);
      }
    },

    async delete(): Promise<boolean> {
      const pool = getPool();

      const result = await pool.query(`DELETE FROM ${tableFullName}`);

      // Notify other instances
      if (enableNotify) {
        await pool.query(`NOTIFY ${notifyChannel}`);
      }

      return (result.rowCount ?? 0) > 0;
    },

    onChange(callback: (config: RuntimeAuthConfig | null) => void): () => void {
      listeners.add(callback);

      // Return unsubscribe function
      return () => {
        listeners.delete(callback);
      };
    },

    async shutdown(): Promise<void> {
      // Release the listener client
      if (listenerClient) {
        try {
          await listenerClient.query(`UNLISTEN ${notifyChannel}`);
        } catch {
          // Ignore errors during shutdown
        }
        listenerClient.release(true);
        listenerClient = null;
      }

      // Clear listeners
      listeners.clear();
    },
  };
}
