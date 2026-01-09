/**
 * Plugin Scope Store - PostgreSQL Implementation
 *
 * Manages plugin-declared scopes for fine-grained API key authorization.
 * Plugins register their scopes during initialization, which are then available
 * for selection during API key creation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * PostgreSQL implementation of PluginScopeStore
 */
export function createPostgresPluginScopeStore(config) {
    const tableName = config.tableName || 'plugin_scopes';
    const schema = config.schema || 'public';
    const tableFullName = `"${schema}"."${tableName}"`;
    const autoCreateTables = config.autoCreateTables !== false;
    // In-memory cache for fast validation
    const scopeCache = new Set();
    let cacheInitialized = false;
    /**
     * Get PostgreSQL pool (lazy initialization support)
     */
    function getPool() {
        if (typeof config.pool === 'function') {
            return config.pool();
        }
        return config.pool;
    }
    /**
     * Initialize scope cache
     */
    async function initializeCache() {
        if (cacheInitialized)
            return;
        const pool = getPool();
        const result = await pool.query(`SELECT name FROM ${tableFullName}`);
        scopeCache.clear();
        result.rows.forEach(row => scopeCache.add(row.name));
        cacheInitialized = true;
    }
    /**
     * Refresh cache after modifications
     */
    async function refreshCache() {
        cacheInitialized = false;
        await initializeCache();
    }
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            const pool = getPool();
            // Create plugin_scopes table
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${tableFullName} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          plugin_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT NOT NULL,
          category VARCHAR(50),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

          -- Enforce naming convention: plugin-id:action
          CONSTRAINT scope_name_format CHECK (name ~ '^[a-z0-9-]+:[a-z0-9-]+$')
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_${tableName}_plugin_id ON ${tableFullName}(plugin_id);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_category ON ${tableFullName}(category);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_name ON ${tableFullName}(name);
      `);
            // Insert system scopes for backwards compatibility
            await pool.query(`
        INSERT INTO ${tableFullName} (plugin_id, name, description, category)
        VALUES
          ('system', 'system:read', 'Read access to system resources', 'read'),
          ('system', 'system:write', 'Write access to system resources', 'write'),
          ('system', 'system:admin', 'Administrative access to system resources', 'admin')
        ON CONFLICT (name) DO NOTHING;
      `);
            // Initialize cache
            await initializeCache();
        },
        async registerScopes(pluginId, scopes) {
            const pool = getPool();
            // Start transaction for atomic upsert
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                // Get existing scopes for this plugin
                const existingResult = await client.query(`SELECT name FROM ${tableFullName} WHERE plugin_id = $1`, [pluginId]);
                const existingScopes = new Set(existingResult.rows.map(r => r.name));
                const newScopes = new Set(scopes.map(s => s.name));
                // Delete scopes that are no longer declared
                const scopesToDelete = [...existingScopes].filter(name => !newScopes.has(name));
                if (scopesToDelete.length > 0) {
                    await client.query(`DELETE FROM ${tableFullName} WHERE plugin_id = $1 AND name = ANY($2)`, [pluginId, scopesToDelete]);
                }
                // Upsert scopes (insert new, update existing)
                for (const scope of scopes) {
                    await client.query(`INSERT INTO ${tableFullName} (plugin_id, name, description, category)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (name) DO UPDATE SET
               description = EXCLUDED.description,
               category = EXCLUDED.category,
               updated_at = NOW()`, [pluginId, scope.name, scope.description, scope.category || null]);
                }
                await client.query('COMMIT');
                // Refresh cache
                await refreshCache();
            }
            catch (error) {
                await client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        },
        async getPluginScopes(pluginId) {
            const pool = getPool();
            const result = await pool.query(`SELECT plugin_id, name, description, category, created_at, updated_at
         FROM ${tableFullName}
         WHERE plugin_id = $1
         ORDER BY name`, [pluginId]);
            return result.rows;
        },
        async getAllScopes() {
            const pool = getPool();
            const result = await pool.query(`SELECT plugin_id, name, description, category, created_at, updated_at
         FROM ${tableFullName}
         ORDER BY plugin_id, name`);
            return result.rows;
        },
        async isValidScope(scopeName) {
            // Use cache for fast validation
            await initializeCache();
            return scopeCache.has(scopeName);
        },
        async deletePluginScopes(pluginId) {
            const pool = getPool();
            await pool.query(`DELETE FROM ${tableFullName} WHERE plugin_id = $1`, [pluginId]);
            // Refresh cache
            await refreshCache();
        },
        async shutdown() {
            scopeCache.clear();
            cacheInitialized = false;
        },
    };
}
//# sourceMappingURL=plugin-scope-store.js.map