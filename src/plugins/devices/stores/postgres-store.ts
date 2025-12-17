/**
 * PostgreSQL Device Store
 *
 * Device storage implementation using PostgreSQL.
 * Supports multi-tenant isolation via org_id.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  DeviceStore,
  Device,
  CreateDeviceInput,
  UpdateDeviceInput,
  DeviceSearchParams,
  DeviceListResponse,
  PostgresDeviceStoreConfig,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

/**
 * Create a PostgreSQL device store
 *
 * @param config Configuration including a pg Pool instance
 * @returns DeviceStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresDeviceStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresDeviceStore({ pool });
 * ```
 */
export function postgresDeviceStore(config: PostgresDeviceStoreConfig): DeviceStore {
  const {
    pool: poolOrFn,
    tableName = 'devices',
    schema = 'public',
    autoCreateTables = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    return pool as PgPool;
  };

  const devicesTableFull = `"${schema}"."${tableName}"`;

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      // Create devices table
      await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${devicesTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID,
          user_id UUID,
          adapter_type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          token_hash VARCHAR(64) NOT NULL,
          token_prefix VARCHAR(12),
          token_expires_at TIMESTAMPTZ NOT NULL,
          last_seen_at TIMESTAMPTZ,
          last_ip INET,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_org ON ${devicesTableFull}(org_id) WHERE deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_user ON ${devicesTableFull}(user_id) WHERE deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_token ON ${devicesTableFull}(token_hash) WHERE is_active = true AND deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_adapter ON ${devicesTableFull}(adapter_type);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_expires ON ${devicesTableFull}(token_expires_at) WHERE deleted_at IS NULL;
      `);
    },

    async getById(id: string): Promise<Device | null> {
      const result = await getPool().query(
        `SELECT * FROM ${devicesTableFull} WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      return (result.rows[0] as Device) || null;
    },

    async getByTokenHash(tokenHash: string): Promise<Device | null> {
      const result = await getPool().query(
        `SELECT * FROM ${devicesTableFull}
         WHERE token_hash = $1
           AND is_active = true
           AND deleted_at IS NULL
           AND token_expires_at > NOW()`,
        [tokenHash]
      );
      return (result.rows[0] as Device) || null;
    },

    async create(
      input: CreateDeviceInput & {
        tokenHash: string;
        tokenPrefix: string;
        tokenExpiresAt: Date;
        adapterType: string;
      }
    ): Promise<Device> {
      const result = await getPool().query(
        `INSERT INTO ${devicesTableFull}
         (org_id, user_id, adapter_type, name, token_hash, token_prefix, token_expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          input.org_id || null,
          input.user_id || null,
          input.adapterType,
          input.name,
          input.tokenHash,
          input.tokenPrefix,
          input.tokenExpiresAt,
          JSON.stringify(input.metadata || {}),
        ]
      );
      return result.rows[0] as Device;
    },

    async update(id: string, input: UpdateDeviceInput): Promise<Device | null> {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }

      if (input.is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(input.is_active);
      }

      if (input.metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(input.metadata));
      }

      if (updates.length === 0) {
        return this.getById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await getPool().query(
        `UPDATE ${devicesTableFull}
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND deleted_at IS NULL
         RETURNING *`,
        values
      );
      return (result.rows[0] as Device) || null;
    },

    async delete(id: string): Promise<boolean> {
      // Soft delete
      const result = await getPool().query(
        `UPDATE ${devicesTableFull}
         SET deleted_at = NOW(), is_active = false, updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    },

    async search(params: DeviceSearchParams): Promise<DeviceListResponse> {
      const {
        org_id,
        user_id,
        adapter_type,
        is_active,
        query,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = params;

      const conditions: string[] = ['deleted_at IS NULL'];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (org_id) {
        conditions.push(`org_id = $${paramIndex++}`);
        values.push(org_id);
      }

      if (user_id) {
        conditions.push(`user_id = $${paramIndex++}`);
        values.push(user_id);
      }

      if (adapter_type) {
        conditions.push(`adapter_type = $${paramIndex++}`);
        values.push(adapter_type);
      }

      if (is_active !== undefined) {
        conditions.push(`is_active = $${paramIndex++}`);
        values.push(is_active);
      }

      if (query) {
        conditions.push(`LOWER(name) LIKE $${paramIndex++}`);
        values.push(`%${query.toLowerCase()}%`);
      }

      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      // Validate sort column to prevent SQL injection
      const validSortColumns = ['name', 'created_at', 'last_seen_at'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await getPool().query(
        `SELECT COUNT(*) FROM ${devicesTableFull} ${whereClause}`,
        values
      );
      const countRow = countResult.rows[0] as { count: string } | undefined;
      const total = countRow ? parseInt(countRow.count, 10) : 0;

      // Get devices
      const result = await getPool().query(
        `SELECT * FROM ${devicesTableFull} ${whereClause}
         ORDER BY ${sortColumn} ${sortDir}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset]
      );

      return {
        devices: result.rows as Device[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async updateLastSeen(id: string, ip?: string): Promise<void> {
      if (ip) {
        await getPool().query(
          `UPDATE ${devicesTableFull} SET last_seen_at = NOW(), last_ip = $1 WHERE id = $2`,
          [ip, id]
        );
      } else {
        await getPool().query(
          `UPDATE ${devicesTableFull} SET last_seen_at = NOW() WHERE id = $1`,
          [id]
        );
      }
    },

    async updateToken(
      id: string,
      tokenHash: string,
      tokenPrefix: string,
      expiresAt: Date
    ): Promise<boolean> {
      const result = await getPool().query(
        `UPDATE ${devicesTableFull}
         SET token_hash = $1, token_prefix = $2, token_expires_at = $3, updated_at = NOW()
         WHERE id = $4 AND deleted_at IS NULL`,
        [tokenHash, tokenPrefix, expiresAt, id]
      );
      return (result.rowCount ?? 0) > 0;
    },

    async cleanupExpired(): Promise<number> {
      // Deactivate expired tokens
      const result = await getPool().query(
        `UPDATE ${devicesTableFull}
         SET is_active = false, updated_at = NOW()
         WHERE token_expires_at < NOW() AND is_active = true AND deleted_at IS NULL`
      );
      return result.rowCount ?? 0;
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
