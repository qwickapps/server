/**
 * PostgreSQL Subscriptions Store
 *
 * Subscriptions storage implementation using PostgreSQL.
 * Manages tiers, entitlements, and user subscriptions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a PostgreSQL subscriptions store
 */
export function postgresSubscriptionsStore(config) {
    const { pool: poolOrFn, tiersTable = 'subscription_tiers', entitlementsTable = 'subscription_entitlements', userSubscriptionsTable = 'user_subscriptions', schema = 'public', autoCreateTables = true, } = config;
    // Helper to get pool (supports lazy initialization via function)
    const getPool = () => {
        const pool = typeof poolOrFn === 'function' ? poolOrFn() : poolOrFn;
        return pool;
    };
    const tiersTableFull = `"${schema}"."${tiersTable}"`;
    const entitlementsTableFull = `"${schema}"."${entitlementsTable}"`;
    const userSubsTableFull = `"${schema}"."${userSubscriptionsTable}"`;
    return {
        name: 'postgres',
        async initialize() {
            if (!autoCreateTables)
                return;
            // Create subscription_tiers table
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${tiersTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          slug VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price_monthly_cents INTEGER,
          price_yearly_cents INTEGER,
          stripe_price_id_monthly VARCHAR(100),
          stripe_price_id_yearly VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_${tiersTable}_slug ON ${tiersTableFull}(slug);
        CREATE INDEX IF NOT EXISTS idx_${tiersTable}_active ON ${tiersTableFull}(is_active);
      `);
            // Create subscription_entitlements table
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${entitlementsTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tier_id UUID NOT NULL REFERENCES ${tiersTableFull}(id) ON DELETE CASCADE,
          feature_code VARCHAR(100) NOT NULL,
          limit_value INTEGER,
          metadata JSONB DEFAULT '{}',
          UNIQUE(tier_id, feature_code)
        );

        CREATE INDEX IF NOT EXISTS idx_${entitlementsTable}_tier ON ${entitlementsTableFull}(tier_id);
        CREATE INDEX IF NOT EXISTS idx_${entitlementsTable}_feature ON ${entitlementsTableFull}(feature_code);
      `);
            // Create user_subscriptions table
            await getPool().query(`
        CREATE TABLE IF NOT EXISTS ${userSubsTableFull} (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          tier_id UUID NOT NULL REFERENCES ${tiersTableFull}(id),
          stripe_customer_id VARCHAR(100),
          stripe_subscription_id VARCHAR(100),
          status VARCHAR(20) DEFAULT 'active'
            CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
          current_period_start TIMESTAMPTZ,
          current_period_end TIMESTAMPTZ,
          cancel_at_period_end BOOLEAN DEFAULT false,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_${userSubscriptionsTable}_user ON ${userSubsTableFull}(user_id);
        CREATE INDEX IF NOT EXISTS idx_${userSubscriptionsTable}_stripe ON ${userSubsTableFull}(stripe_customer_id);
        CREATE INDEX IF NOT EXISTS idx_${userSubscriptionsTable}_stripe_sub ON ${userSubsTableFull}(stripe_subscription_id);
        CREATE INDEX IF NOT EXISTS idx_${userSubscriptionsTable}_status ON ${userSubsTableFull}(status);
      `);
        },
        // ═══════════════════════════════════════════════════════════════════════
        // Tiers
        // ═══════════════════════════════════════════════════════════════════════
        async createTier(input) {
            const result = await getPool().query(`INSERT INTO ${tiersTableFull}
         (slug, name, description, price_monthly_cents, price_yearly_cents,
          stripe_price_id_monthly, stripe_price_id_yearly, is_active, sort_order, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`, [
                input.slug,
                input.name,
                input.description || null,
                input.price_monthly_cents || null,
                input.price_yearly_cents || null,
                input.stripe_price_id_monthly || null,
                input.stripe_price_id_yearly || null,
                input.is_active !== false,
                input.sort_order || 0,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async getTierById(id) {
            const result = await getPool().query(`SELECT * FROM ${tiersTableFull} WHERE id = $1`, [id]);
            return result.rows[0] || null;
        },
        async getTierBySlug(slug) {
            const result = await getPool().query(`SELECT * FROM ${tiersTableFull} WHERE slug = $1`, [slug]);
            return result.rows[0] || null;
        },
        async listTiers(activeOnly = true) {
            let query = `SELECT * FROM ${tiersTableFull}`;
            if (activeOnly) {
                query += ` WHERE is_active = true`;
            }
            query += ` ORDER BY sort_order ASC, name ASC`;
            const result = await getPool().query(query);
            return result.rows;
        },
        async updateTier(id, input) {
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (input.name !== undefined) {
                updates.push(`name = $${paramIndex++}`);
                values.push(input.name);
            }
            if (input.description !== undefined) {
                updates.push(`description = $${paramIndex++}`);
                values.push(input.description);
            }
            if (input.price_monthly_cents !== undefined) {
                updates.push(`price_monthly_cents = $${paramIndex++}`);
                values.push(input.price_monthly_cents);
            }
            if (input.price_yearly_cents !== undefined) {
                updates.push(`price_yearly_cents = $${paramIndex++}`);
                values.push(input.price_yearly_cents);
            }
            if (input.stripe_price_id_monthly !== undefined) {
                updates.push(`stripe_price_id_monthly = $${paramIndex++}`);
                values.push(input.stripe_price_id_monthly);
            }
            if (input.stripe_price_id_yearly !== undefined) {
                updates.push(`stripe_price_id_yearly = $${paramIndex++}`);
                values.push(input.stripe_price_id_yearly);
            }
            if (input.is_active !== undefined) {
                updates.push(`is_active = $${paramIndex++}`);
                values.push(input.is_active);
            }
            if (input.sort_order !== undefined) {
                updates.push(`sort_order = $${paramIndex++}`);
                values.push(input.sort_order);
            }
            if (input.metadata !== undefined) {
                updates.push(`metadata = $${paramIndex++}`);
                values.push(JSON.stringify(input.metadata));
            }
            if (updates.length === 0) {
                return this.getTierById(id);
            }
            updates.push(`updated_at = NOW()`);
            values.push(id);
            const result = await getPool().query(`UPDATE ${tiersTableFull} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
            return result.rows[0] || null;
        },
        async deleteTier(id) {
            // Soft delete by setting is_active = false
            const result = await getPool().query(`UPDATE ${tiersTableFull} SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
            return (result.rowCount ?? 0) > 0;
        },
        // ═══════════════════════════════════════════════════════════════════════
        // Entitlements
        // ═══════════════════════════════════════════════════════════════════════
        async createEntitlement(input) {
            const result = await getPool().query(`INSERT INTO ${entitlementsTableFull} (tier_id, feature_code, limit_value, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (tier_id, feature_code) DO UPDATE SET
           limit_value = EXCLUDED.limit_value,
           metadata = EXCLUDED.metadata
         RETURNING *`, [
                input.tier_id,
                input.feature_code,
                input.limit_value ?? null,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async getEntitlementsByTier(tierId) {
            const result = await getPool().query(`SELECT * FROM ${entitlementsTableFull} WHERE tier_id = $1 ORDER BY feature_code`, [tierId]);
            return result.rows;
        },
        async updateEntitlement(id, limitValue) {
            const result = await getPool().query(`UPDATE ${entitlementsTableFull} SET limit_value = $1 WHERE id = $2 RETURNING *`, [limitValue, id]);
            return result.rows[0] || null;
        },
        async deleteEntitlement(id) {
            const result = await getPool().query(`DELETE FROM ${entitlementsTableFull} WHERE id = $1`, [id]);
            return (result.rowCount ?? 0) > 0;
        },
        async setTierEntitlements(tierId, entitlements) {
            // Delete existing entitlements
            await getPool().query(`DELETE FROM ${entitlementsTableFull} WHERE tier_id = $1`, [tierId]);
            // Insert new entitlements
            for (const ent of entitlements) {
                await this.createEntitlement({
                    tier_id: tierId,
                    feature_code: ent.feature_code,
                    limit_value: ent.limit_value,
                });
            }
        },
        // ═══════════════════════════════════════════════════════════════════════
        // User Subscriptions
        // ═══════════════════════════════════════════════════════════════════════
        async createUserSubscription(input) {
            const result = await getPool().query(`INSERT INTO ${userSubsTableFull}
         (user_id, tier_id, stripe_customer_id, stripe_subscription_id, status,
          current_period_start, current_period_end, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [
                input.user_id,
                input.tier_id,
                input.stripe_customer_id || null,
                input.stripe_subscription_id || null,
                input.status || 'active',
                input.current_period_start || null,
                input.current_period_end || null,
                JSON.stringify(input.metadata || {}),
            ]);
            return result.rows[0];
        },
        async getUserSubscriptionById(id) {
            const result = await getPool().query(`SELECT * FROM ${userSubsTableFull} WHERE id = $1`, [id]);
            return result.rows[0] || null;
        },
        async getActiveSubscription(userId) {
            const result = await getPool().query(`SELECT us.*, t.slug as tier_slug, t.name as tier_name, t.description as tier_description,
                t.price_monthly_cents, t.price_yearly_cents, t.metadata as tier_metadata
         FROM ${userSubsTableFull} us
         JOIN ${tiersTableFull} t ON us.tier_id = t.id
         WHERE us.user_id = $1 AND us.status = 'active'
         ORDER BY us.created_at DESC
         LIMIT 1`, [userId]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                id: row.id,
                user_id: row.user_id,
                tier_id: row.tier_id,
                stripe_customer_id: row.stripe_customer_id,
                stripe_subscription_id: row.stripe_subscription_id,
                status: row.status,
                current_period_start: row.current_period_start,
                current_period_end: row.current_period_end,
                cancel_at_period_end: row.cancel_at_period_end,
                metadata: row.metadata,
                created_at: row.created_at,
                updated_at: row.updated_at,
                tier: {
                    id: row.tier_id,
                    slug: row.tier_slug,
                    name: row.tier_name,
                    description: row.tier_description,
                    price_monthly_cents: row.price_monthly_cents,
                    price_yearly_cents: row.price_yearly_cents,
                    is_active: true,
                    sort_order: 0,
                    metadata: row.tier_metadata,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                },
            };
        },
        async getByStripeSubscriptionId(stripeSubId) {
            const result = await getPool().query(`SELECT * FROM ${userSubsTableFull} WHERE stripe_subscription_id = $1`, [stripeSubId]);
            return result.rows[0] || null;
        },
        async updateUserSubscription(id, input) {
            const updates = [];
            const values = [];
            let paramIndex = 1;
            if (input.tier_id !== undefined) {
                updates.push(`tier_id = $${paramIndex++}`);
                values.push(input.tier_id);
            }
            if (input.stripe_customer_id !== undefined) {
                updates.push(`stripe_customer_id = $${paramIndex++}`);
                values.push(input.stripe_customer_id);
            }
            if (input.stripe_subscription_id !== undefined) {
                updates.push(`stripe_subscription_id = $${paramIndex++}`);
                values.push(input.stripe_subscription_id);
            }
            if (input.status !== undefined) {
                updates.push(`status = $${paramIndex++}`);
                values.push(input.status);
            }
            if (input.current_period_start !== undefined) {
                updates.push(`current_period_start = $${paramIndex++}`);
                values.push(input.current_period_start);
            }
            if (input.current_period_end !== undefined) {
                updates.push(`current_period_end = $${paramIndex++}`);
                values.push(input.current_period_end);
            }
            if (input.cancel_at_period_end !== undefined) {
                updates.push(`cancel_at_period_end = $${paramIndex++}`);
                values.push(input.cancel_at_period_end);
            }
            if (input.metadata !== undefined) {
                updates.push(`metadata = $${paramIndex++}`);
                values.push(JSON.stringify(input.metadata));
            }
            if (updates.length === 0) {
                return this.getUserSubscriptionById(id);
            }
            updates.push(`updated_at = NOW()`);
            values.push(id);
            const result = await getPool().query(`UPDATE ${userSubsTableFull} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
            return result.rows[0] || null;
        },
        async cancelSubscription(id) {
            const result = await getPool().query(`UPDATE ${userSubsTableFull}
         SET cancel_at_period_end = true, updated_at = NOW()
         WHERE id = $1`, [id]);
            return (result.rowCount ?? 0) > 0;
        },
        async getFeatureLimit(userId, featureCode) {
            const result = await getPool().query(`SELECT se.limit_value
         FROM ${userSubsTableFull} us
         JOIN ${entitlementsTableFull} se ON us.tier_id = se.tier_id
         WHERE us.user_id = $1 AND us.status = 'active' AND se.feature_code = $2
         ORDER BY us.created_at DESC
         LIMIT 1`, [userId, featureCode]);
            if (result.rows.length === 0) {
                return null; // No subscription or feature not found
            }
            return result.rows[0].limit_value;
        },
        async hasFeature(userId, featureCode) {
            const limit = await this.getFeatureLimit(userId, featureCode);
            // Has feature if limit is not null and not 0 (0 means disabled)
            return limit !== null && limit !== 0;
        },
        async shutdown() {
            // Pool is managed externally, nothing to do here
        },
    };
}
//# sourceMappingURL=postgres-store.js.map