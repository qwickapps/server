/**
 * API Key Usage Log Store - PostgreSQL Implementation
 *
 * Tracks all API calls made with API keys for audit trails and usage analytics.
 * Uses table partitioning for efficient storage and querying of large log volumes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * PostgreSQL implementation of UsageLogStore
 */
export function createPostgresUsageLogStore(config) {
    const tableName = config.tableName || 'api_key_usage_logs';
    const schema = config.schema || 'public';
    const tableFullName = `"${schema}"."${tableName}"`;
    const autoCreateTables = config.autoCreateTables !== false;
    const enablePartitioning = config.enablePartitioning !== false;
    const partitionIntervalDays = config.partitionIntervalDays || 30;
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
     * Create partition for a specific date range
     */
    async function createPartition(pool, startDate, endDate) {
        const partitionName = `${tableName}_${startDate.toISOString().slice(0, 7).replace('-', '_')}`;
        const partitionFullName = `"${schema}"."${partitionName}"`;
        try {
            await pool.query(`
        CREATE TABLE IF NOT EXISTS ${partitionFullName}
        PARTITION OF ${tableFullName}
        FOR VALUES FROM ('${startDate.toISOString()}') TO ('${endDate.toISOString()}');
      `);
        }
        catch (error) {
            // Ignore if partition already exists
            if (error.message?.includes('already exists')) {
                return;
            }
            throw error;
        }
    }
    /**
     * Create partitions for the next N days
     */
    async function createUpcomingPartitions(pool, days) {
        const now = new Date();
        const intervals = Math.ceil(days / partitionIntervalDays);
        for (let i = 0; i < intervals; i++) {
            const startDate = new Date(now);
            startDate.setDate(startDate.getDate() + (i * partitionIntervalDays));
            startDate.setUTCHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + partitionIntervalDays);
            await createPartition(pool, startDate, endDate);
        }
    }
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            const pool = getPool();
            if (enablePartitioning) {
                // Create partitioned table
                await pool.query(`
          CREATE TABLE IF NOT EXISTS ${tableFullName} (
            id UUID DEFAULT gen_random_uuid(),
            key_id UUID NOT NULL,
            endpoint VARCHAR(500) NOT NULL,
            method VARCHAR(10) NOT NULL,
            status_code INTEGER,
            ip_address INET,
            user_agent TEXT,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600),
            PRIMARY KEY (id, timestamp)
          ) PARTITION BY RANGE (timestamp);
        `);
                // Create default partition for current and future data
                await pool.query(`
          CREATE TABLE IF NOT EXISTS "${schema}"."${tableName}_default"
          PARTITION OF ${tableFullName}
          DEFAULT;
        `);
                // Create partitions for the next 90 days
                await createUpcomingPartitions(pool, 90);
            }
            else {
                // Create regular table (no partitioning)
                await pool.query(`
          CREATE TABLE IF NOT EXISTS ${tableFullName} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key_id UUID NOT NULL,
            endpoint VARCHAR(500) NOT NULL,
            method VARCHAR(10) NOT NULL,
            status_code INTEGER,
            ip_address INET,
            user_agent TEXT,
            timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

            CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)
          );
        `);
            }
            // Create indexes for performance
            await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_${tableName}_key_id_timestamp
        ON ${tableFullName}(key_id, timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_${tableName}_timestamp
        ON ${tableFullName}(timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_${tableName}_endpoint
        ON ${tableFullName}(endpoint);
      `);
        },
        async log(entry) {
            const pool = getPool();
            await pool.query(`INSERT INTO ${tableFullName} (key_id, endpoint, method, status_code, ip_address, user_agent, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()))`, [
                entry.key_id,
                entry.endpoint,
                entry.method,
                entry.status_code || null,
                entry.ip_address || null,
                entry.user_agent || null,
                entry.timestamp || null,
            ]);
        },
        async logBatch(entries) {
            if (entries.length === 0)
                return;
            const pool = getPool();
            const values = entries.map((entry, index) => {
                const baseIndex = index * 7;
                return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, COALESCE($${baseIndex + 7}, NOW()))`;
            }).join(', ');
            const params = entries.flatMap(entry => [
                entry.key_id,
                entry.endpoint,
                entry.method,
                entry.status_code || null,
                entry.ip_address || null,
                entry.user_agent || null,
                entry.timestamp || null,
            ]);
            await pool.query(`INSERT INTO ${tableFullName} (key_id, endpoint, method, status_code, ip_address, user_agent, timestamp)
         VALUES ${values}`, params);
        },
        async getKeyUsage(keyId, options = {}) {
            const pool = getPool();
            const conditions = ['key_id = $1'];
            const params = [keyId];
            let paramIndex = 2;
            if (options.since) {
                conditions.push(`timestamp >= $${paramIndex++}`);
                params.push(options.since);
            }
            if (options.until) {
                conditions.push(`timestamp <= $${paramIndex++}`);
                params.push(options.until);
            }
            if (options.endpoint) {
                conditions.push(`endpoint LIKE $${paramIndex++}`);
                params.push(`%${options.endpoint}%`);
            }
            if (options.method) {
                conditions.push(`method = $${paramIndex++}`);
                params.push(options.method.toUpperCase());
            }
            if (options.statusCode) {
                conditions.push(`status_code = $${paramIndex++}`);
                params.push(options.statusCode);
            }
            const limit = options.limit || 100;
            const offset = options.offset || 0;
            const result = await pool.query(`SELECT id, key_id, endpoint, method, status_code, ip_address, user_agent, timestamp
         FROM ${tableFullName}
         WHERE ${conditions.join(' AND ')}
         ORDER BY timestamp DESC
         LIMIT ${limit} OFFSET ${offset}`, params);
            return result.rows;
        },
        async getKeyStats(keyId, options = {}) {
            const pool = getPool();
            const conditions = ['key_id = $1'];
            const params = [keyId];
            let paramIndex = 2;
            if (options.since) {
                conditions.push(`timestamp >= $${paramIndex++}`);
                params.push(options.since);
            }
            if (options.until) {
                conditions.push(`timestamp <= $${paramIndex++}`);
                params.push(options.until);
            }
            // Get total calls and last used
            const totalResult = await pool.query(`SELECT COUNT(*)::text as total, MAX(timestamp) as last_used
         FROM ${tableFullName}
         WHERE ${conditions.join(' AND ')}`, params);
            // Get calls by status code
            const statusResult = await pool.query(`SELECT status_code, COUNT(*)::text as count
         FROM ${tableFullName}
         WHERE ${conditions.join(' AND ')} AND status_code IS NOT NULL
         GROUP BY status_code`, params);
            // Get calls by endpoint (top 10)
            const endpointResult = await pool.query(`SELECT endpoint, COUNT(*)::text as count
         FROM ${tableFullName}
         WHERE ${conditions.join(' AND ')}
         GROUP BY endpoint
         ORDER BY count DESC
         LIMIT 10`, params);
            const callsByStatus = {};
            statusResult.rows.forEach(row => {
                callsByStatus[row.status_code] = parseInt(row.count, 10);
            });
            const callsByEndpoint = {};
            endpointResult.rows.forEach(row => {
                callsByEndpoint[row.endpoint] = parseInt(row.count, 10);
            });
            return {
                totalCalls: parseInt(totalResult.rows[0]?.total || '0', 10),
                lastUsed: totalResult.rows[0]?.last_used,
                callsByStatus,
                callsByEndpoint,
            };
        },
        async deleteOlderThan(date) {
            const pool = getPool();
            const result = await pool.query(`DELETE FROM ${tableFullName} WHERE timestamp < $1`, [date]);
            return result.rowCount || 0;
        },
        async shutdown() {
            // No cleanup needed
        },
    };
}
//# sourceMappingURL=usage-log-store.js.map