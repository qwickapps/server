/**
 * PostgreSQL User Store
 *
 * User storage implementation using PostgreSQL.
 * Requires the 'pg' package to be installed.
 *
 * Note: Ban management is handled by the separate Bans Plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type {
  UserStore,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
  UserListResponse,
  PostgresUserStoreConfig,
  UserIdentifiers,
  StoredIdentifiers,
} from '../types.js';

// Pool interface (from pg package)
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

/**
 * Create a PostgreSQL user store
 *
 * @param config Configuration including a pg Pool instance
 * @returns UserStore implementation
 *
 * @example
 * ```ts
 * import { Pool } from 'pg';
 * import { postgresUserStore } from '@qwickapps/server';
 *
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const store = postgresUserStore({ pool });
 * ```
 */
export function postgresUserStore(config: PostgresUserStoreConfig): UserStore {
  const {
    pool: poolOrFn,
    usersTable = 'users',
    schema = 'public',
    autoCreateTables = true,
  } = config;

  // Helper to get pool (supports lazy initialization via function)
  const getPool = (): PgPool => {
    const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
    return pool as PgPool;
  };

  const usersTableFull = `"${schema}"."${usersTable}"`;

  return {
    name: 'postgres',

    async initialize(): Promise<void> {
      if (!autoCreateTables) return;

      try {
        // Create users table
        await getPool().query(`
          CREATE TABLE IF NOT EXISTS ${usersTableFull} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255),
            external_id VARCHAR(255),
            provider VARCHAR(50),
            picture TEXT,
            status VARCHAR(20) DEFAULT 'active',
            invitation_token VARCHAR(255),
            invitation_expires_at TIMESTAMPTZ,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            last_login_at TIMESTAMPTZ
          );
        `);

        // Add new columns to existing tables (migration)
        // Use parameterized approach to avoid SQL injection
        const pool = getPool();

        // Check and add status column
        const statusCheck = await pool.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2 AND column_name = 'status'`,
          [schema, usersTable]
        );
        if (statusCheck.rows.length === 0) {
          await pool.query(`ALTER TABLE ${usersTableFull} ADD COLUMN status VARCHAR(20) DEFAULT 'active'`);
        }

        // Check and add invitation_token column
        const tokenCheck = await pool.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2 AND column_name = 'invitation_token'`,
          [schema, usersTable]
        );
        if (tokenCheck.rows.length === 0) {
          await pool.query(`ALTER TABLE ${usersTableFull} ADD COLUMN invitation_token VARCHAR(255)`);
        }

        // Check and add invitation_expires_at column
        const expiresCheck = await pool.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2 AND column_name = 'invitation_expires_at'`,
          [schema, usersTable]
        );
        if (expiresCheck.rows.length === 0) {
          await pool.query(`ALTER TABLE ${usersTableFull} ADD COLUMN invitation_expires_at TIMESTAMPTZ`);
        }

        // Create indexes after ensuring all columns exist
        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_${usersTable}_email ON ${usersTableFull}(email);
          CREATE INDEX IF NOT EXISTS idx_${usersTable}_external_id ON ${usersTableFull}(external_id, provider);
          CREATE INDEX IF NOT EXISTS idx_${usersTable}_invitation_token ON ${usersTableFull}(invitation_token);
          CREATE INDEX IF NOT EXISTS idx_${usersTable}_status ON ${usersTableFull}(status);
        `);
      } catch (error) {
        console.error('[PostgresUserStore] Failed to initialize:', error);
        throw new Error(`Failed to initialize users table: ${error instanceof Error ? error.message : String(error)}`);
      }
    },

    async getById(id: string): Promise<User | null> {
      const result = await getPool().query(`SELECT * FROM ${usersTableFull} WHERE id = $1`, [id]);
      return (result.rows[0] as User) || null;
    },

    async getByIds(ids: string[]): Promise<User[]> {
      if (ids.length === 0) return [];
      const result = await getPool().query(`SELECT * FROM ${usersTableFull} WHERE id = ANY($1)`, [ids]);
      return result.rows as User[];
    },

    async getByEmail(email: string): Promise<User | null> {
      const result = await getPool().query(`SELECT * FROM ${usersTableFull} WHERE LOWER(email) = LOWER($1)`, [
        email,
      ]);
      return (result.rows[0] as User) || null;
    },

    async getByExternalId(externalId: string, provider: string): Promise<User | null> {
      const result = await getPool().query(
        `SELECT * FROM ${usersTableFull} WHERE external_id = $1 AND provider = $2`,
        [externalId, provider]
      );
      return (result.rows[0] as User) || null;
    },

    async getByIdentifier(identifiers: UserIdentifiers): Promise<User | null> {
      // Validate that at least one identifier is provided
      const hasIdentifier =
        identifiers.email ||
        identifiers.auth0_user_id ||
        identifiers.wp_user_id !== undefined ||
        identifiers.keap_contact_id !== undefined;

      if (!hasIdentifier) {
        throw new Error('At least one identifier must be provided');
      }

      // Priority 1: Email (most reliable, always unique)
      if (identifiers.email) {
        const result = await getPool().query(
          `SELECT * FROM ${usersTableFull} WHERE LOWER(email) = LOWER($1)`,
          [identifiers.email]
        );
        if (result.rows[0]) return result.rows[0] as User;
      }

      // Priority 2: Auth0 user ID (stored in metadata.identifiers.auth0_user_id)
      if (identifiers.auth0_user_id) {
        const result = await getPool().query(
          `SELECT * FROM ${usersTableFull}
           WHERE metadata->'identifiers'->>'auth0_user_id' = $1`,
          [identifiers.auth0_user_id]
        );
        if (result.rows[0]) return result.rows[0] as User;

        // Also check legacy external_id field for backwards compatibility
        const legacyResult = await getPool().query(
          `SELECT * FROM ${usersTableFull} WHERE external_id = $1`,
          [identifiers.auth0_user_id]
        );
        if (legacyResult.rows[0]) return legacyResult.rows[0] as User;
      }

      // Priority 3: WordPress user ID (stored in metadata.identifiers.wp_user_id)
      // Note: Use !== undefined to allow 0 as a valid ID
      if (identifiers.wp_user_id !== undefined) {
        const result = await getPool().query(
          `SELECT * FROM ${usersTableFull}
           WHERE (metadata->'identifiers'->>'wp_user_id')::int = $1`,
          [identifiers.wp_user_id]
        );
        if (result.rows[0]) return result.rows[0] as User;
      }

      // Priority 4: Keap contact ID (stored in metadata.identifiers.keap_contact_id)
      // Note: Use !== undefined to allow 0 as a valid ID
      if (identifiers.keap_contact_id !== undefined) {
        const result = await getPool().query(
          `SELECT * FROM ${usersTableFull}
           WHERE (metadata->'identifiers'->>'keap_contact_id')::int = $1`,
          [identifiers.keap_contact_id]
        );
        if (result.rows[0]) return result.rows[0] as User;
      }

      return null;
    },

    async linkIdentifiers(userId: string, identifiers: Partial<StoredIdentifiers>): Promise<void> {
      // Build the identifiers object to merge
      const identifiersToMerge: Record<string, unknown> = {};

      if (identifiers.wp_user_id !== undefined) {
        identifiersToMerge.wp_user_id = identifiers.wp_user_id;
      }
      if (identifiers.auth0_user_id !== undefined) {
        identifiersToMerge.auth0_user_id = identifiers.auth0_user_id;
      }
      if (identifiers.keap_contact_id !== undefined) {
        identifiersToMerge.keap_contact_id = identifiers.keap_contact_id;
      }

      if (Object.keys(identifiersToMerge).length === 0) {
        return; // Nothing to update
      }

      // Merge new identifiers with existing ones using jsonb_set and coalesce
      // This preserves existing identifiers while adding/updating new ones
      await getPool().query(
        `UPDATE ${usersTableFull}
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{identifiers}',
           COALESCE(metadata->'identifiers', '{}'::jsonb) || $1::jsonb
         ),
         updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify(identifiersToMerge), userId]
      );
    },

    async create(input: CreateUserInput): Promise<User> {
      const result = await getPool().query(
        `INSERT INTO ${usersTableFull} (email, name, external_id, provider, picture, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          input.email.toLowerCase(),
          input.name,
          input.external_id,
          input.provider,
          input.picture,
          JSON.stringify(input.metadata || {}),
        ]
      );
      return result.rows[0] as User;
    },

    async update(id: string, input: UpdateUserInput): Promise<User | null> {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (input.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }
      if (input.picture !== undefined) {
        updates.push(`picture = $${paramIndex++}`);
        values.push(input.picture);
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
        `UPDATE ${usersTableFull} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      return (result.rows[0] as User) || null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await getPool().query(`DELETE FROM ${usersTableFull} WHERE id = $1`, [id]);
      return (result.rowCount ?? 0) > 0;
    },

    async search(params: UserSearchParams): Promise<UserListResponse> {
      const {
        query,
        provider,
        status,
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = params;

      const conditions: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (query) {
        conditions.push(`(LOWER(email) LIKE $${paramIndex} OR LOWER(name) LIKE $${paramIndex})`);
        values.push(`%${query.toLowerCase()}%`);
        paramIndex++;
      }

      if (provider) {
        conditions.push(`provider = $${paramIndex}`);
        values.push(provider);
        paramIndex++;
      }

      if (status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sort column to prevent SQL injection
      const validSortColumns = ['email', 'name', 'created_at', 'last_login_at'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
      const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await getPool().query(
        `SELECT COUNT(*) FROM ${usersTableFull} ${whereClause}`,
        values
      );
      const total = parseInt((countResult.rows[0] as { count: string }).count, 10);

      // Get users
      const result = await getPool().query(
        `SELECT * FROM ${usersTableFull} ${whereClause}
         ORDER BY ${sortColumn} ${sortDir}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset]
      );

      return {
        users: result.rows as User[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async updateLastLogin(id: string): Promise<void> {
      await getPool().query(`UPDATE ${usersTableFull} SET last_login_at = NOW() WHERE id = $1`, [id]);
    },

    async getByInvitationToken(token: string): Promise<User | null> {
      const result = await getPool().query(
        `SELECT * FROM ${usersTableFull} WHERE invitation_token = $1 AND invitation_expires_at > NOW()`,
        [token]
      );
      return (result.rows[0] as User) || null;
    },

    async acceptInvitation(token: string): Promise<User | null> {
      const result = await getPool().query(
        `UPDATE ${usersTableFull}
         SET status = 'active',
             invitation_token = NULL,
             invitation_expires_at = NULL,
             updated_at = NOW()
         WHERE invitation_token = $1
           AND invitation_expires_at > NOW()
           AND status = 'invited'
         RETURNING *`,
        [token]
      );
      return (result.rows[0] as User) || null;
    },

    async shutdown(): Promise<void> {
      // Pool is managed externally, nothing to do here
    },
  };
}
