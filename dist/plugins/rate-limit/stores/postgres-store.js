/**
 * PostgreSQL Rate Limit Store
 *
 * Rate limit storage implementation using PostgreSQL with Row-Level Security (RLS).
 * Follows the same pattern as the preferences plugin's postgres-store.
 *
 * RLS Context Pattern:
 * Each operation uses an explicit transaction and sets `app.current_user_id`
 * as a transaction-local configuration variable. The RLS policy checks this
 * variable to enforce that users can only access their own rate limits.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Execute a function within an RLS-protected transaction
 *
 * This helper ensures that:
 * 1. All queries run within the same transaction
 * 2. The RLS context is set before any data access
 * 3. The transaction is properly committed or rolled back
 *
 * @param pool PostgreSQL pool
 * @param userId User ID to set as the RLS context (optional for IP-only limits)
 * @param callback Function to execute within the transaction
 */
async function withRLSContext(pool, userId, callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Set transaction-local user context for RLS
        // If no userId, set to empty string (allows IP-only limits via RLS policy)
        await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId || '']);
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Create a PostgreSQL rate limit store with RLS
 *
 * @param config Configuration including a pg Pool instance
 * @returns RateLimitStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresRateLimitStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresRateLimitStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresRateLimitStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export function postgresRateLimitStore(config) {
    const { pool: poolOrFn, tableName = 'rate_limits', schema = 'public', autoCreateTables = true, enableRLS = true, } = config;
    // Helper to get pool (supports lazy initialization via function)
    const getPool = () => {
        const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
        if (!pool || typeof pool.query !== 'function') {
            throw new Error('Invalid pool: must have query method');
        }
        return pool;
    };
    const tableFullName = `"${schema}"."${tableName}"`;
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            const pool = getPool();
            // Create table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableFullName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

          -- Scope identifiers (nullable, use what applies)
          user_id UUID,
          tenant_id UUID,
          ip_address INET,

          -- Limit key (composite identifier)
          limit_key VARCHAR(500) NOT NULL,

          -- Strategy and configuration
          strategy VARCHAR(50) NOT NULL DEFAULT 'sliding-window',
          max_requests INTEGER NOT NULL,
          window_ms INTEGER NOT NULL,

          -- Current state
          current_count INTEGER DEFAULT 0,
          window_start TIMESTAMPTZ NOT NULL,
          window_end TIMESTAMPTZ NOT NULL,

          -- Token bucket specific (nullable)
          tokens_remaining NUMERIC,
          last_refill TIMESTAMPTZ,

          -- Metadata
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
            // Create indexes
            await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_key ON ${tableFullName}(limit_key);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_key_window ON ${tableFullName}(limit_key, window_start);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_user ON ${tableFullName}(user_id) WHERE user_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant ON ${tableFullName}(tenant_id) WHERE tenant_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_cleanup ON ${tableFullName}(window_end);
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
          DROP POLICY IF EXISTS "${tableName}_access" ON ${tableFullName};
        `);
                // RLS policy: Users can access their own limits OR IP-only limits (no user)
                await pool.query(`
          CREATE POLICY "${tableName}_access" ON ${tableFullName}
            FOR ALL
            USING (
              user_id::text = current_setting('app.current_user_id', true)
              OR (user_id IS NULL AND current_setting('app.current_user_id', true) = '')
            )
            WITH CHECK (
              user_id::text = current_setting('app.current_user_id', true)
              OR (user_id IS NULL AND current_setting('app.current_user_id', true) = '')
            );
        `);
            }
        },
        async get(key, userId) {
            return withRLSContext(getPool(), userId, async (client) => {
                const result = await client.query(`SELECT * FROM ${tableFullName}
           WHERE limit_key = $1
           AND window_end > NOW()
           ORDER BY window_start DESC
           LIMIT 1`, [key]);
                if (result.rows.length === 0) {
                    return null;
                }
                const row = result.rows[0];
                return {
                    id: row.id,
                    key: row.limit_key,
                    count: row.current_count,
                    maxRequests: row.max_requests,
                    windowMs: row.window_ms,
                    windowStart: new Date(row.window_start),
                    windowEnd: new Date(row.window_end),
                    strategy: row.strategy,
                    userId: row.user_id,
                    tenantId: row.tenant_id,
                    ipAddress: row.ip_address,
                    tokensRemaining: row.tokens_remaining,
                    lastRefill: row.last_refill ? new Date(row.last_refill) : undefined,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at),
                };
            });
        },
        async increment(key, options) {
            const { maxRequests, windowMs, strategy, userId, tenantId, ipAddress, amount = 1 } = options;
            return withRLSContext(getPool(), userId, async (client) => {
                const now = new Date();
                const windowStart = new Date(now.getTime() - (now.getTime() % windowMs));
                const windowEnd = new Date(windowStart.getTime() + windowMs);
                // For token bucket, handle differently
                if (strategy === 'token-bucket') {
                    // Get existing record or create new one
                    const existing = await client.query(`SELECT * FROM ${tableFullName}
             WHERE limit_key = $1
             ORDER BY created_at DESC
             LIMIT 1`, [key]);
                    if (existing.rows.length > 0) {
                        const row = existing.rows[0];
                        const lastRefill = row.last_refill ? new Date(row.last_refill).getTime() : now.getTime();
                        const tokensRemaining = row.tokens_remaining ?? maxRequests;
                        // Calculate refill
                        const elapsed = now.getTime() - lastRefill;
                        const refillRate = maxRequests / windowMs;
                        const newTokens = Math.min(maxRequests, tokensRemaining + elapsed * refillRate - 1);
                        await client.query(`UPDATE ${tableFullName}
               SET tokens_remaining = $1,
                   last_refill = $2,
                   current_count = $3,
                   updated_at = NOW()
               WHERE id = $4`, [newTokens, now, Math.floor(maxRequests - newTokens), row.id]);
                        return {
                            id: row.id,
                            key,
                            count: Math.floor(maxRequests - newTokens),
                            maxRequests,
                            windowMs,
                            windowStart: new Date(row.window_start),
                            windowEnd: new Date(row.window_end),
                            strategy,
                            userId,
                            tenantId,
                            ipAddress,
                            tokensRemaining: newTokens,
                            lastRefill: now,
                            createdAt: new Date(row.created_at),
                            updatedAt: now,
                        };
                    }
                    // Create new record with full bucket minus 1
                    const newTokens = maxRequests - 1;
                    const insertResult = await client.query(`INSERT INTO ${tableFullName}
             (limit_key, strategy, max_requests, window_ms, current_count,
              window_start, window_end, user_id, tenant_id, ip_address,
              tokens_remaining, last_refill)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`, [key, strategy, maxRequests, windowMs, 1, windowStart, windowEnd,
                        userId || null, tenantId || null, ipAddress || null, newTokens, now]);
                    const row = insertResult.rows[0];
                    return {
                        id: row.id,
                        key,
                        count: 1,
                        maxRequests,
                        windowMs,
                        windowStart,
                        windowEnd,
                        strategy,
                        userId,
                        tenantId,
                        ipAddress,
                        tokensRemaining: newTokens,
                        lastRefill: now,
                        createdAt: now,
                        updatedAt: now,
                    };
                }
                // For sliding-window and fixed-window, use UPDATE-then-INSERT pattern
                // This avoids needing a unique constraint on (limit_key, window_start)
                // First try to update existing record in current window
                const updateResult = await client.query(`UPDATE ${tableFullName}
           SET current_count = current_count + $1,
               updated_at = NOW()
           WHERE limit_key = $2
             AND window_start = $3
           RETURNING *`, [amount, key, windowStart]);
                if (updateResult.rows.length > 0) {
                    const row = updateResult.rows[0];
                    return {
                        id: row.id,
                        key,
                        count: row.current_count,
                        maxRequests,
                        windowMs,
                        windowStart,
                        windowEnd,
                        strategy,
                        userId,
                        tenantId,
                        ipAddress,
                        createdAt: new Date(row.created_at),
                        updatedAt: now,
                    };
                }
                // No existing record - insert new
                const insertResult = await client.query(`INSERT INTO ${tableFullName}
           (limit_key, strategy, max_requests, window_ms, current_count,
            window_start, window_end, user_id, tenant_id, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`, [key, strategy, maxRequests, windowMs, amount, windowStart, windowEnd,
                    userId || null, tenantId || null, ipAddress || null]);
                const row = insertResult.rows[0];
                return {
                    id: row.id,
                    key,
                    count: amount,
                    maxRequests,
                    windowMs,
                    windowStart,
                    windowEnd,
                    strategy,
                    userId,
                    tenantId,
                    ipAddress,
                    createdAt: now,
                    updatedAt: now,
                };
            });
        },
        async clear(key, userId) {
            return withRLSContext(getPool(), userId, async (client) => {
                const result = await client.query(`DELETE FROM ${tableFullName} WHERE limit_key = $1`, [key]);
                return (result.rowCount ?? 0) > 0;
            });
        },
        async cleanup() {
            const pool = getPool();
            // Cleanup runs without RLS context as it's a system operation
            // We use a direct query without user context
            const result = await pool.query(`DELETE FROM ${tableFullName} WHERE window_end < NOW()`);
            return result.rowCount ?? 0;
        },
        async shutdown() {
            // Pool is managed externally, nothing to do here
        },
    };
}
//# sourceMappingURL=postgres-store.js.map