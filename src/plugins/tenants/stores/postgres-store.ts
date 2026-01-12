/**
 * PostgreSQL Tenant Store
 *
 * Tenant storage implementation using PostgreSQL.
 * Requires the 'pg' package to be installed.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  TenantStore,
  Tenant,
  CreateTenantInput,
  UpdateTenantInput,
  TenantSearchParams,
  TenantListResponse,
  TenantMembership,
  CreateTenantMembershipInput,
  UpdateTenantMembershipInput,
  TenantWithMembership,
  PostgresTenantStoreConfig,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

/**
 * Create a PostgreSQL tenant store
 *
 * @param config Configuration including a pg Pool instance
 * @returns TenantStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresTenantStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresTenantStore({ pool });
 * ```
 */
export function postgresTenantStore(config: PostgresTenantStoreConfig): TenantStore {
  const {
    pool: poolOrFn,
    tenantsTable = 'tenants',
    membershipsTable = 'tenant_memberships',
    schema = 'public',
    autoCreateTables = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    return pool as PgPool;
  };

  const tenantsTableFull = `"${schema}"."${tenantsTable}"`;
  const membershipsTableFull = `"${schema}"."${membershipsTable}"`;

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      try {
        // Create tenants table
        await getPool().query(`
          CREATE TABLE IF NOT EXISTS ${tenantsTableFull} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            owner_id UUID NOT NULL,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);

        // Create tenant memberships table
        await getPool().query(`
          CREATE TABLE IF NOT EXISTS ${membershipsTableFull} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES ${tenantsTableFull}(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            role VARCHAR(50) NOT NULL,
            joined_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(tenant_id, user_id)
          );
        `);

        // Create indexes
        await getPool().query(`
          CREATE INDEX IF NOT EXISTS idx_${tenantsTable}_name ON ${tenantsTableFull}(name);
          CREATE INDEX IF NOT EXISTS idx_${tenantsTable}_type ON ${tenantsTableFull}(type);
          CREATE INDEX IF NOT EXISTS idx_${tenantsTable}_owner ON ${tenantsTableFull}(owner_id);
          CREATE INDEX IF NOT EXISTS idx_${membershipsTable}_tenant ON ${membershipsTableFull}(tenant_id);
          CREATE INDEX IF NOT EXISTS idx_${membershipsTable}_user ON ${membershipsTableFull}(user_id);
          CREATE INDEX IF NOT EXISTS idx_${membershipsTable}_role ON ${membershipsTableFull}(role);
        `);
      } catch (error) {
        console.error('[PostgresTenantStore] Failed to initialize:', error);
        throw new Error(
          `Failed to initialize tenants tables: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    async getById(id: string): Promise<Tenant | null> {
      const result = await getPool().query(`SELECT * FROM ${tenantsTableFull} WHERE id = $1`, [id]);
      return (result.rows[0] as Tenant) || null;
    },

    async getByIds(ids: string[]): Promise<Tenant[]> {
      if (ids.length === 0) return [];
      const result = await getPool().query(`SELECT * FROM ${tenantsTableFull} WHERE id = ANY($1)`, [ids]);
      return result.rows as Tenant[];
    },

    async getByName(name: string): Promise<Tenant | null> {
      const result = await getPool().query(`SELECT * FROM ${tenantsTableFull} WHERE LOWER(name) = LOWER($1)`, [
        name,
      ]);
      return (result.rows[0] as Tenant) || null;
    },

    async create(input: CreateTenantInput): Promise<Tenant> {
      const { name, type, owner_id, metadata = {} } = input;

      const result = await getPool().query(
        `INSERT INTO ${tenantsTableFull} (name, type, owner_id, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, type, owner_id, JSON.stringify(metadata)]
      );

      const tenant = result.rows[0] as Tenant;

      // Automatically add owner as a member with 'owner' role
      await this.addMember({
        tenant_id: tenant.id,
        user_id: owner_id,
        role: 'owner',
      });

      return tenant;
    },

    async update(id: string, input: UpdateTenantInput): Promise<Tenant | null> {
      const { name, metadata } = input;
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }

      if (metadata !== undefined) {
        updates.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(metadata));
      }

      if (updates.length === 0) {
        return this.getById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await getPool().query(
        `UPDATE ${tenantsTableFull}
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      return (result.rows[0] as Tenant) || null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await getPool().query(`DELETE FROM ${tenantsTableFull} WHERE id = $1`, [id]);
      return (result.rowCount ?? 0) > 0;
    },

    async search(params: TenantSearchParams): Promise<TenantListResponse> {
      const { query, type, owner_id, page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'desc' } = params;

      const conditions: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      if (query) {
        conditions.push(`name ILIKE $${paramCount++}`);
        values.push(`%${query}%`);
      }

      if (type) {
        conditions.push(`type = $${paramCount++}`);
        values.push(type);
      }

      if (owner_id) {
        conditions.push(`owner_id = $${paramCount++}`);
        values.push(owner_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await getPool().query(
        `SELECT COUNT(*) FROM ${tenantsTableFull} ${whereClause}`,
        values
      );
      const total = parseInt((countResult.rows[0] as { count: string }).count, 10);

      // Get paginated results
      const offset = (page - 1) * limit;
      const result = await getPool().query(
        `SELECT * FROM ${tenantsTableFull}
         ${whereClause}
         ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
         LIMIT $${paramCount++} OFFSET $${paramCount}`,
        [...values, limit, offset]
      );

      return {
        tenants: result.rows as Tenant[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async getTenantsForUser(userId: string): Promise<TenantWithMembership[]> {
      const result = await getPool().query(
        `SELECT t.*, m.role as user_role, m.*
         FROM ${tenantsTableFull} t
         JOIN ${membershipsTableFull} m ON t.id = m.tenant_id
         WHERE m.user_id = $1
         ORDER BY t.created_at DESC`,
        [userId]
      );

      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        owner_id: row.owner_id,
        metadata: row.metadata,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_role: row.user_role,
        membership: {
          id: row.id,
          tenant_id: row.tenant_id,
          user_id: row.user_id,
          role: row.role,
          joined_at: row.joined_at,
        },
      })) as TenantWithMembership[];
    },

    async getTenantForUser(tenantId: string, userId: string): Promise<TenantWithMembership | null> {
      const result = await getPool().query(
        `SELECT t.*, m.role as user_role, m.*
         FROM ${tenantsTableFull} t
         JOIN ${membershipsTableFull} m ON t.id = m.tenant_id
         WHERE t.id = $1 AND m.user_id = $2`,
        [tenantId, userId]
      );

      if (!result.rows[0]) return null;

      const row: any = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        type: row.type,
        owner_id: row.owner_id,
        metadata: row.metadata,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_role: row.user_role,
        membership: {
          id: row.id,
          tenant_id: row.tenant_id,
          user_id: row.user_id,
          role: row.role,
          joined_at: row.joined_at,
        },
      } as TenantWithMembership;
    },

    async addMember(input: CreateTenantMembershipInput): Promise<TenantMembership> {
      const { tenant_id, user_id, role } = input;

      const result = await getPool().query(
        `INSERT INTO ${membershipsTableFull} (tenant_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = $3
         RETURNING *`,
        [tenant_id, user_id, role]
      );

      return result.rows[0] as TenantMembership;
    },

    async updateMember(
      tenantId: string,
      userId: string,
      input: UpdateTenantMembershipInput
    ): Promise<TenantMembership | null> {
      const { role } = input;

      if (!role) {
        return this.getMembership(tenantId, userId);
      }

      const result = await getPool().query(
        `UPDATE ${membershipsTableFull}
         SET role = $1
         WHERE tenant_id = $2 AND user_id = $3
         RETURNING *`,
        [role, tenantId, userId]
      );

      return (result.rows[0] as TenantMembership) || null;
    },

    async removeMember(tenantId: string, userId: string): Promise<boolean> {
      const result = await getPool().query(
        `DELETE FROM ${membershipsTableFull}
         WHERE tenant_id = $1 AND user_id = $2`,
        [tenantId, userId]
      );
      return (result.rowCount ?? 0) > 0;
    },

    async getMembers(tenantId: string): Promise<TenantMembership[]> {
      const result = await getPool().query(
        `SELECT * FROM ${membershipsTableFull}
         WHERE tenant_id = $1
         ORDER BY joined_at ASC`,
        [tenantId]
      );

      return result.rows as TenantMembership[];
    },

    async getMembership(tenantId: string, userId: string): Promise<TenantMembership | null> {
      const result = await getPool().query(
        `SELECT * FROM ${membershipsTableFull}
         WHERE tenant_id = $1 AND user_id = $2`,
        [tenantId, userId]
      );

      return (result.rows[0] as TenantMembership) || null;
    },

    async shutdown(): Promise<void> {
      // PostgreSQL pool is managed externally, nothing to shutdown here
    },
  };
}
