/**
 * PostgreSQL Profile Store
 *
 * Profile storage implementation using PostgreSQL.
 * Includes automatic age group calculation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Default age thresholds
const DEFAULT_AGE_THRESHOLDS = {
    child: 12,
    teen: 17,
};
/**
 * Calculate age group from birth date or age
 */
function calculateAgeGroup(birthDate, age, thresholds = DEFAULT_AGE_THRESHOLDS) {
    let calculatedAge = null;
    if (birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            calculatedAge--;
        }
    }
    else if (age !== undefined && age !== null) {
        calculatedAge = age;
    }
    if (calculatedAge === null) {
        return null;
    }
    if (calculatedAge <= thresholds.child) {
        return 'child';
    }
    else if (calculatedAge <= thresholds.teen) {
        return 'teen';
    }
    else {
        return 'adult';
    }
}
/**
 * Create a PostgreSQL profile store
 *
 * @param config Configuration including a pg Pool instance
 * @param ageThresholds Optional age thresholds for categorization
 * @returns ProfileStore implementation
 */
export function postgresProfileStore(config, ageThresholds = DEFAULT_AGE_THRESHOLDS) {
    const { pool: poolOrFn, tableName = 'profiles', schema = 'public', autoCreateTables = true, } = config;
    // Helper to get pool (supports lazy initialization via function)
    const getPool = () => {
        const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
        return pool;
    };
    const profilesTableFull = `"${schema}"."${tableName}"`;
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            // Create profiles table
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${profilesTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          org_id UUID,
          user_id UUID NOT NULL,
          name VARCHAR(100) NOT NULL,
          avatar VARCHAR(255),

          -- Age-based features
          birth_date DATE,
          age INTEGER,
          age_group VARCHAR(20) CHECK (age_group IN ('child', 'teen', 'adult')),

          -- Content/access control
          content_filter_level VARCHAR(20) DEFAULT 'moderate'
            CHECK (content_filter_level IN ('strict', 'moderate', 'minimal', 'none')),

          -- Time restrictions
          daily_time_limit_minutes INTEGER,
          allowed_hours_start TIME,
          allowed_hours_end TIME,

          -- Status
          is_active BOOLEAN DEFAULT true,
          is_default BOOLEAN DEFAULT false,

          -- Extensibility
          metadata JSONB DEFAULT '{}',

          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          deleted_at TIMESTAMPTZ
        );

        CREATE INDEX IF NOT EXISTS idx_${tableName}_org ON ${profilesTableFull}(org_id) WHERE deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_user ON ${profilesTableFull}(user_id) WHERE deleted_at IS NULL;
        CREATE INDEX IF NOT EXISTS idx_${tableName}_age_group ON ${profilesTableFull}(age_group) WHERE age_group IS NOT NULL AND deleted_at IS NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_${tableName}_default ON ${profilesTableFull}(user_id) WHERE is_default = true AND deleted_at IS NULL;
      `);
        },
        async getById(id) {
            const result = await getPool().query(`SELECT * FROM ${profilesTableFull} WHERE id = $1 AND deleted_at IS NULL`, [id]);
            return result.rows[0] || null;
        },
        async create(input) {
            // Calculate age group
            const ageGroup = calculateAgeGroup(input.birth_date, input.age, ageThresholds);
            // If this is set as default, unset other defaults first
            if (input.is_default) {
                await getPool().query(`UPDATE ${profilesTableFull} SET is_default = false, updated_at = NOW()
           WHERE user_id = $1 AND is_default = true AND deleted_at IS NULL`, [input.user_id]);
            }
            const result = await getPool().query(`INSERT INTO ${profilesTableFull}
         (org_id, user_id, name, avatar, birth_date, age, age_group,
          content_filter_level, daily_time_limit_minutes,
          allowed_hours_start, allowed_hours_end, is_default, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`, [
                input.org_id || null,
                input.user_id,
                input.name,
                input.avatar || null,
                input.birth_date || null,
                input.age || null,
                ageGroup,
                input.content_filter_level || 'moderate',
                input.daily_time_limit_minutes || null,
                input.allowed_hours_start || null,
                input.allowed_hours_end || null,
                input.is_default || false,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async update(id, input) {
            // First get the current profile to get user_id
            const current = await this.getById(id);
            if (!current) {
                return null;
            }
            const updates = [];
            const values = [];
            let paramIndex = 1;
            // Handle is_default first (needs to unset others)
            if (input.is_default === true) {
                await getPool().query(`UPDATE ${profilesTableFull} SET is_default = false, updated_at = NOW()
           WHERE user_id = $1 AND id != $2 AND is_default = true AND deleted_at IS NULL`, [current.user_id, id]);
                updates.push(`is_default = $${paramIndex++}`);
                values.push(true);
            }
            else if (input.is_default === false) {
                updates.push(`is_default = $${paramIndex++}`);
                values.push(false);
            }
            if (input.name !== undefined) {
                updates.push(`name = $${paramIndex++}`);
                values.push(input.name);
            }
            if (input.avatar !== undefined) {
                updates.push(`avatar = $${paramIndex++}`);
                values.push(input.avatar);
            }
            // Handle birth_date (null means clear it)
            if (input.birth_date !== undefined) {
                updates.push(`birth_date = $${paramIndex++}`);
                values.push(input.birth_date);
            }
            // Handle age (null means clear it)
            if (input.age !== undefined) {
                updates.push(`age = $${paramIndex++}`);
                values.push(input.age);
            }
            // Recalculate age group if birth_date or age changed
            if (input.birth_date !== undefined || input.age !== undefined) {
                const newBirthDate = input.birth_date !== undefined ? input.birth_date : current.birth_date;
                const newAge = input.age !== undefined ? input.age : current.age;
                const ageGroup = calculateAgeGroup(newBirthDate, newAge, ageThresholds);
                updates.push(`age_group = $${paramIndex++}`);
                values.push(ageGroup);
            }
            if (input.content_filter_level !== undefined) {
                updates.push(`content_filter_level = $${paramIndex++}`);
                values.push(input.content_filter_level);
            }
            if (input.daily_time_limit_minutes !== undefined) {
                updates.push(`daily_time_limit_minutes = $${paramIndex++}`);
                values.push(input.daily_time_limit_minutes);
            }
            if (input.allowed_hours_start !== undefined) {
                updates.push(`allowed_hours_start = $${paramIndex++}`);
                values.push(input.allowed_hours_start);
            }
            if (input.allowed_hours_end !== undefined) {
                updates.push(`allowed_hours_end = $${paramIndex++}`);
                values.push(input.allowed_hours_end);
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
                return current;
            }
            updates.push(`updated_at = NOW()`);
            values.push(id);
            const result = await getPool().query(`UPDATE ${profilesTableFull}
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND deleted_at IS NULL
         RETURNING *`, values);
            return result.rows[0] || null;
        },
        async delete(id) {
            // Soft delete
            const result = await getPool().query(`UPDATE ${profilesTableFull}
         SET deleted_at = NOW(), is_active = false, is_default = false, updated_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL`, [id]);
            return (result.rowCount ?? 0) > 0;
        },
        async search(params) {
            const { org_id, user_id, age_group, is_active, query, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', } = params;
            const conditions = ['deleted_at IS NULL'];
            const values = [];
            let paramIndex = 1;
            if (org_id) {
                conditions.push(`org_id = $${paramIndex++}`);
                values.push(org_id);
            }
            if (user_id) {
                conditions.push(`user_id = $${paramIndex++}`);
                values.push(user_id);
            }
            if (age_group) {
                conditions.push(`age_group = $${paramIndex++}`);
                values.push(age_group);
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
            const validSortColumns = ['name', 'created_at', 'age'];
            const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
            const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC';
            const offset = (page - 1) * limit;
            // Get total count
            const countResult = await getPool().query(`SELECT COUNT(*) FROM ${profilesTableFull} ${whereClause}`, values);
            const total = parseInt(countResult.rows[0].count, 10);
            // Get profiles
            const result = await getPool().query(`SELECT * FROM ${profilesTableFull} ${whereClause}
         ORDER BY ${sortColumn} ${sortDir}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...values, limit, offset]);
            return {
                profiles: result.rows,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        },
        async listByUser(userId) {
            const result = await getPool().query(`SELECT * FROM ${profilesTableFull}
         WHERE user_id = $1 AND deleted_at IS NULL
         ORDER BY is_default DESC, created_at ASC`, [userId]);
            return result.rows;
        },
        async getDefaultProfile(userId) {
            const result = await getPool().query(`SELECT * FROM ${profilesTableFull}
         WHERE user_id = $1 AND is_default = true AND deleted_at IS NULL`, [userId]);
            return result.rows[0] || null;
        },
        async getProfileCount(userId) {
            const result = await getPool().query(`SELECT COUNT(*) FROM ${profilesTableFull}
         WHERE user_id = $1 AND deleted_at IS NULL`, [userId]);
            const row = result.rows[0];
            return row ? parseInt(row.count, 10) : 0;
        },
        async getByAgeGroup(userId, ageGroup) {
            const result = await getPool().query(`SELECT * FROM ${profilesTableFull}
         WHERE user_id = $1 AND age_group = $2 AND deleted_at IS NULL
         ORDER BY created_at ASC`, [userId, ageGroup]);
            return result.rows;
        },
        async setDefaultProfile(profileId, userId) {
            // Unset current default
            await getPool().query(`UPDATE ${profilesTableFull} SET is_default = false, updated_at = NOW()
         WHERE user_id = $1 AND is_default = true AND deleted_at IS NULL`, [userId]);
            // Set new default
            const result = await getPool().query(`UPDATE ${profilesTableFull} SET is_default = true, updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [profileId, userId]);
            return (result.rowCount ?? 0) > 0;
        },
        async shutdown() {
            // Pool is managed externally, nothing to do here
        },
    };
}
//# sourceMappingURL=postgres-store.js.map