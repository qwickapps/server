/**
 * PostgreSQL Parental Store
 *
 * Parental controls storage implementation using PostgreSQL.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export function postgresParentalStore(config) {
    const { pool: poolOrFn, settingsTable = 'guardian_settings', restrictionsTable = 'profile_restrictions', activityTable = 'activity_log', schema = 'public', autoCreateTables = true, } = config;
    const getPool = () => {
        const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
        return pool;
    };
    const settingsFull = `"${schema}"."${settingsTable}"`;
    const restrictionsFull = `"${schema}"."${restrictionsTable}"`;
    const activityFull = `"${schema}"."${activityTable}"`;
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${settingsFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL,
          adapter_type VARCHAR(50) NOT NULL,
          pin_hash VARCHAR(64),
          pin_failed_attempts INTEGER DEFAULT 0,
          pin_locked_until TIMESTAMPTZ,
          biometric_enabled BOOLEAN DEFAULT false,
          notifications_enabled BOOLEAN DEFAULT true,
          weekly_report_enabled BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}',
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_${settingsTable}_user ON ${settingsFull}(user_id);
      `);
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${restrictionsFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID NOT NULL,
          restriction_type VARCHAR(50) NOT NULL,
          daily_limit_minutes INTEGER,
          schedule JSONB,
          is_paused BOOLEAN DEFAULT false,
          pause_until TIMESTAMPTZ,
          pause_reason TEXT,
          is_active BOOLEAN DEFAULT true,
          metadata JSONB DEFAULT '{}',
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_${restrictionsTable}_profile ON ${restrictionsFull}(profile_id);
      `);
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${activityFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          profile_id UUID,
          device_id UUID,
          adapter_type VARCHAR(50) NOT NULL,
          activity_type VARCHAR(50) NOT NULL,
          details JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_${activityTable}_user_profile ON ${activityFull}(user_id, profile_id);
        CREATE INDEX IF NOT EXISTS idx_${activityTable}_created ON ${activityFull}(created_at DESC);
      `);
        },
        async getSettings(userId) {
            const result = await getPool().query(`SELECT * FROM ${settingsFull} WHERE user_id = $1`, [userId]);
            return result.rows[0] || null;
        },
        async createSettings(input) {
            const result = await getPool().query(`INSERT INTO ${settingsFull} (user_id, adapter_type, pin_hash, biometric_enabled, notifications_enabled, weekly_report_enabled, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [
                input.user_id,
                input.adapter_type,
                input.pin || null,
                input.biometric_enabled || false,
                input.notifications_enabled !== false,
                input.weekly_report_enabled !== false,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async updateSettings(userId, input) {
            const updates = [];
            const values = [];
            let idx = 1;
            if (input.biometric_enabled !== undefined) {
                updates.push(`biometric_enabled = $${idx++}`);
                values.push(input.biometric_enabled);
            }
            if (input.notifications_enabled !== undefined) {
                updates.push(`notifications_enabled = $${idx++}`);
                values.push(input.notifications_enabled);
            }
            if (input.weekly_report_enabled !== undefined) {
                updates.push(`weekly_report_enabled = $${idx++}`);
                values.push(input.weekly_report_enabled);
            }
            if (input.metadata !== undefined) {
                updates.push(`metadata = $${idx++}`);
                values.push(JSON.stringify(input.metadata));
            }
            if (updates.length === 0)
                return this.getSettings(userId);
            updates.push('updated_at = NOW()');
            values.push(userId);
            const result = await getPool().query(`UPDATE ${settingsFull} SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING *`, values);
            return result.rows[0] || null;
        },
        async setPin(userId, pinHash) {
            await getPool().query(`UPDATE ${settingsFull} SET pin_hash = $1, pin_failed_attempts = 0, pin_locked_until = NULL, updated_at = NOW() WHERE user_id = $2`, [pinHash, userId]);
        },
        async verifyPin(userId, pinHash) {
            const result = await getPool().query(`SELECT pin_hash, pin_locked_until FROM ${settingsFull} WHERE user_id = $1`, [userId]);
            if (!result.rows[0])
                return false;
            const settings = result.rows[0];
            if (settings.pin_locked_until && new Date() < settings.pin_locked_until)
                return false;
            return settings.pin_hash === pinHash;
        },
        async incrementFailedPinAttempts(userId) {
            const result = await getPool().query(`UPDATE ${settingsFull} SET pin_failed_attempts = pin_failed_attempts + 1, updated_at = NOW()
         WHERE user_id = $1 RETURNING pin_failed_attempts`, [userId]);
            return result.rows[0]?.pin_failed_attempts || 0;
        },
        async resetFailedPinAttempts(userId) {
            await getPool().query(`UPDATE ${settingsFull} SET pin_failed_attempts = 0, pin_locked_until = NULL, updated_at = NOW() WHERE user_id = $1`, [userId]);
        },
        async getRestrictions(profileId) {
            const result = await getPool().query(`SELECT * FROM ${restrictionsFull} WHERE profile_id = $1 AND is_active = true`, [profileId]);
            return result.rows;
        },
        async createRestriction(input) {
            const result = await getPool().query(`INSERT INTO ${restrictionsFull} (profile_id, restriction_type, daily_limit_minutes, schedule, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`, [
                input.profile_id,
                input.restriction_type,
                input.daily_limit_minutes || null,
                input.schedule ? JSON.stringify(input.schedule) : null,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async updateRestriction(id, updates) {
            const setClause = [];
            const values = [];
            let idx = 1;
            const allowedFields = ['daily_limit_minutes', 'schedule', 'is_paused', 'pause_until', 'pause_reason', 'is_active', 'metadata'];
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    setClause.push(`${field} = $${idx++}`);
                    const val = updates[field];
                    values.push(field === 'schedule' || field === 'metadata' ? JSON.stringify(val) : val);
                }
            }
            if (setClause.length === 0)
                return null;
            setClause.push('updated_at = NOW()');
            values.push(id);
            const result = await getPool().query(`UPDATE ${restrictionsFull} SET ${setClause.join(', ')} WHERE id = $${idx} RETURNING *`, values);
            return result.rows[0] || null;
        },
        async deleteRestriction(id) {
            const result = await getPool().query(`UPDATE ${restrictionsFull} SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
            return (result.rowCount ?? 0) > 0;
        },
        async pauseProfile(profileId, until, reason) {
            await getPool().query(`UPDATE ${restrictionsFull} SET is_paused = true, pause_until = $2, pause_reason = $3, updated_at = NOW()
         WHERE profile_id = $1 AND is_active = true`, [profileId, until || null, reason || null]);
        },
        async resumeProfile(profileId) {
            await getPool().query(`UPDATE ${restrictionsFull} SET is_paused = false, pause_until = NULL, pause_reason = NULL, updated_at = NOW()
         WHERE profile_id = $1`, [profileId]);
        },
        async logActivity(input) {
            const result = await getPool().query(`INSERT INTO ${activityFull} (user_id, profile_id, device_id, adapter_type, activity_type, details)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`, [
                input.user_id,
                input.profile_id || null,
                input.device_id || null,
                input.adapter_type,
                input.activity_type,
                JSON.stringify(input.details || {}),
            ]);
            return result.rows[0];
        },
        async getActivityLog(userId, limit = 100, profileId) {
            let query = `SELECT * FROM ${activityFull} WHERE user_id = $1`;
            const values = [userId];
            if (profileId) {
                query += ` AND profile_id = $2`;
                values.push(profileId);
            }
            query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
            values.push(limit);
            const result = await getPool().query(query, values);
            return result.rows;
        },
        async shutdown() { },
    };
}
//# sourceMappingURL=postgres-store.js.map