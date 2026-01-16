/**
 * In-memory Tenant Store for Demo/Testing
 *
 * Implements the TenantStore interface with in-memory storage.
 * Pre-populated with demo tenants and memberships.
 */
/**
 * Default demo user ID used for pre-populated tenants.
 * Matches the user ID assigned by basic auth guard.
 */
export const DEMO_USER_ID = 'basic-auth-user';
/**
 * Creates an in-memory tenant store for demo/testing purposes.
 * Pre-populated with 4 demo tenants (organization, group, department, user).
 *
 * This store is NOT suitable for production use - data is lost on restart.
 * Use postgresTenantsStore for production deployments.
 *
 * @param options - Configuration options for the store
 * @returns TenantStore implementation with in-memory storage
 *
 * @example
 * ```typescript
 * import { createInMemoryTenantStore } from '@qwickapps/server';
 *
 * const store = createInMemoryTenantStore({
 *   demoUserId: 'test-user-123',
 *   logger: console,
 * });
 *
 * await store.initialize();
 * const tenants = await store.getTenantsForUser('test-user-123');
 * ```
 */
export function createInMemoryTenantStore(options = {}) {
    const demoUserId = options.demoUserId || DEMO_USER_ID;
    const logger = options.logger || {
        info: (msg) => console.log(msg),
        debug: (msg) => console.log(msg),
    };
    const tenants = new Map();
    const memberships = new Map();
    let tenantIdCounter = 1;
    let membershipIdCounter = 1;
    // Pre-populate demo tenants
    const demoTenants = [
        { name: 'Acme Corporation', type: 'organization', owner_id: demoUserId },
        { name: 'Engineering Team', type: 'group', owner_id: demoUserId },
        { name: 'Finance Department', type: 'department', owner_id: demoUserId },
        { name: 'Demo User Workspace', type: 'user', owner_id: demoUserId },
    ];
    demoTenants.forEach((t) => {
        const id = `tenant-${tenantIdCounter++}`;
        const tenant = {
            id,
            name: t.name,
            type: t.type,
            owner_id: t.owner_id,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date(),
        };
        tenants.set(id, tenant);
        // Auto-create membership for owner
        const membershipId = `membership-${membershipIdCounter++}`;
        const membership = {
            id: membershipId,
            tenant_id: id,
            user_id: t.owner_id,
            role: 'owner',
            joined_at: new Date(),
        };
        memberships.set(membershipId, membership);
    });
    return {
        name: 'in-memory',
        async initialize() {
            logger.info('[InMemoryTenantStore] Initialized with demo tenants');
        },
        async getById(id) {
            return tenants.get(id) || null;
        },
        async getByIds(ids) {
            return ids.map((id) => tenants.get(id)).filter((t) => t !== undefined);
        },
        async getByName(name) {
            for (const tenant of tenants.values()) {
                if (tenant.name.toLowerCase() === name.toLowerCase()) {
                    return tenant;
                }
            }
            return null;
        },
        async create(input) {
            const id = `tenant-${tenantIdCounter++}`;
            const tenant = {
                id,
                name: input.name,
                type: input.type,
                owner_id: input.owner_id,
                metadata: input.metadata || {},
                created_at: new Date(),
                updated_at: new Date(),
            };
            tenants.set(id, tenant);
            // Auto-create membership for owner
            const membershipId = `membership-${membershipIdCounter++}`;
            const membership = {
                id: membershipId,
                tenant_id: id,
                user_id: input.owner_id,
                role: 'owner',
                joined_at: new Date(),
            };
            memberships.set(membershipId, membership);
            return tenant;
        },
        async update(id, input) {
            const tenant = tenants.get(id);
            if (!tenant)
                return null;
            const updated = {
                ...tenant,
                ...input,
                id: tenant.id, // Preserve ID
                created_at: tenant.created_at, // Preserve created_at
                updated_at: new Date(),
            };
            tenants.set(id, updated);
            return updated;
        },
        async delete(id) {
            // Delete all memberships for this tenant
            for (const [key, membership] of memberships.entries()) {
                if (membership.tenant_id === id) {
                    memberships.delete(key);
                }
            }
            return tenants.delete(id);
        },
        async search(params = {}) {
            let result = Array.from(tenants.values());
            if (params.query) {
                const query = params.query.toLowerCase();
                result = result.filter((t) => t.name.toLowerCase().includes(query));
            }
            if (params.type) {
                result = result.filter((t) => t.type === params.type);
            }
            if (params.owner_id) {
                result = result.filter((t) => t.owner_id === params.owner_id);
            }
            const sortBy = params.sortBy || 'created_at';
            const sortOrder = params.sortOrder || 'desc';
            result.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];
                if (aVal == null || bVal == null)
                    return 0;
                if (aVal < bVal)
                    return sortOrder === 'asc' ? -1 : 1;
                if (aVal > bVal)
                    return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
            const total = result.length;
            const page = params.page || 1;
            const limit = params.limit || 20;
            const offset = (page - 1) * limit;
            result = result.slice(offset, offset + limit);
            return {
                tenants: result,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        },
        async getTenantsForUser(userId) {
            const userMemberships = Array.from(memberships.values()).filter((m) => m.user_id === userId);
            const results = [];
            for (const membership of userMemberships) {
                const tenant = tenants.get(membership.tenant_id);
                if (tenant) {
                    results.push({
                        ...tenant,
                        user_role: membership.role,
                        membership,
                    });
                }
            }
            return results;
        },
        async getTenantForUser(tenantId, userId) {
            const membership = await this.getMembership(tenantId, userId);
            if (!membership)
                return null;
            const tenant = tenants.get(tenantId);
            if (!tenant)
                return null;
            return {
                ...tenant,
                user_role: membership.role,
                membership,
            };
        },
        async getMembers(tenantId) {
            return Array.from(memberships.values()).filter((m) => m.tenant_id === tenantId);
        },
        async getMembership(tenantId, userId) {
            for (const membership of memberships.values()) {
                if (membership.tenant_id === tenantId && membership.user_id === userId) {
                    return membership;
                }
            }
            return null;
        },
        async addMember(input) {
            const id = `membership-${membershipIdCounter++}`;
            const membership = {
                id,
                tenant_id: input.tenant_id,
                user_id: input.user_id,
                role: input.role,
                joined_at: new Date(),
            };
            memberships.set(id, membership);
            return membership;
        },
        async updateMember(tenantId, userId, input) {
            for (const membership of memberships.values()) {
                if (membership.tenant_id === tenantId && membership.user_id === userId) {
                    const updated = {
                        ...membership,
                        ...input,
                    };
                    memberships.set(membership.id, updated);
                    return updated;
                }
            }
            return null;
        },
        async removeMember(tenantId, userId) {
            for (const [key, membership] of memberships.entries()) {
                if (membership.tenant_id === tenantId && membership.user_id === userId) {
                    memberships.delete(key);
                    return true;
                }
            }
            return false;
        },
        async shutdown() {
            logger.info('[InMemoryTenantStore] Shutdown');
        },
    };
}
//# sourceMappingURL=in-memory-store.js.map