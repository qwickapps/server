/**
 * PostgreSQL Ban Store
 *
 * Ban storage implementation using PostgreSQL.
 * Requires the 'pg' package and the Users plugin to be installed.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a PostgreSQL ban store
 *
 * @param config Configuration including a pg Pool instance or a function that returns one
 * @returns BanStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresBanStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresBanStore({ pool });
 *
 * // Or with lazy initialization:
 * const store = postgresBanStore({ pool: () => getPostgres().getPool() });
 * ```
 */
export function postgresBanStore(config) {
    const { pool: poolOrFn, tableName = 'user_bans', schema = 'public', autoCreateTables = true, } = config;
    // Helper to get pool (supports lazy initialization via function)
    const getPool = () => {
        const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
        return pool;
    };
    const tableFullName = `"${schema}"."${tableName}"`;
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            // Create bans table
            // Note: This does NOT have a foreign key to users table
            // The relationship is enforced at the application level via Users Plugin
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${tableFullName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          reason TEXT NOT NULL,
          banned_by VARCHAR(255) NOT NULL,
          banned_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          is_active BOOLEAN DEFAULT TRUE,
          removed_at TIMESTAMPTZ,
          removed_by VARCHAR(255),
          metadata JSONB DEFAULT '{}'
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_user_id ON ${tableFullName}(user_id);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_is_active ON ${tableFullName}(is_active);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_expires_at ON ${tableFullName}(expires_at) WHERE expires_at IS NOT NULL;
      `);
        },
        async isBanned(userId) {
            const ban = await this.getActiveBan(userId);
            return ban !== null;
        },
        async getActiveBan(userId) {
            const result = await getPool().query(`SELECT * FROM ${tableFullName}
         WHERE user_id = $1 AND is_active = TRUE
         AND (expires_at IS NULL OR expires_at > NOW())`, [userId]);
            return result.rows[0] || null;
        },
        async createBan(input) {
            const expiresAt = input.duration
                ? new Date(Date.now() + input.duration * 1000)
                : null;
            // Deactivate any existing active bans for this user
            await getPool().query(`UPDATE ${tableFullName}
         SET is_active = FALSE, removed_at = NOW(), removed_by = $2
         WHERE user_id = $1 AND is_active = TRUE`, [input.user_id, input.banned_by]);
            // Create new ban
            const result = await getPool().query(`INSERT INTO ${tableFullName} (user_id, reason, banned_by, expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`, [
                input.user_id,
                input.reason,
                input.banned_by,
                expiresAt,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async removeBan(input) {
            const result = await getPool().query(`UPDATE ${tableFullName}
         SET is_active = FALSE, removed_at = NOW(), removed_by = $2
         WHERE user_id = $1 AND is_active = TRUE
         RETURNING *`, [input.user_id, input.removed_by]);
            return (result.rowCount ?? 0) > 0;
        },
        async listBans(userId) {
            const result = await getPool().query(`SELECT * FROM ${tableFullName}
         WHERE user_id = $1
         ORDER BY banned_at DESC`, [userId]);
            return result.rows;
        },
        async listActiveBans(options = {}) {
            const { limit = 50, offset = 0 } = options;
            // Get total count
            const countResult = await getPool().query(`SELECT COUNT(*) FROM ${tableFullName}
         WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())`);
            const total = parseInt(countResult.rows[0].count, 10);
            // Get bans
            const result = await getPool().query(`SELECT * FROM ${tableFullName}
         WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())
         ORDER BY banned_at DESC
         LIMIT $1 OFFSET $2`, [limit, offset]);
            return {
                bans: result.rows,
                total,
            };
        },
        async cleanupExpiredBans() {
            const result = await getPool().query(`UPDATE ${tableFullName}
         SET is_active = FALSE
         WHERE is_active = TRUE AND expires_at IS NOT NULL AND expires_at <= NOW()`);
            return result.rowCount ?? 0;
        },
        async shutdown() {
            // Pool is managed externally, nothing to do here
        },
    };
}
//# sourceMappingURL=postgres-store.js.map