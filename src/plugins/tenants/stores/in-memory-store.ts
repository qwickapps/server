/**
 * In-memory Tenant Store for Demo/Testing
 *
 * Implements the TenantStore interface with in-memory storage.
 * Pre-populated with demo tenants and memberships.
 */

import type {
  Tenant,
  TenantStore,
  CreateTenantInput,
  UpdateTenantInput,
  TenantSearchParams,
  TenantListResponse,
  TenantMembership,
  CreateTenantMembershipInput,
  UpdateTenantMembershipInput,
  TenantWithMembership,
  TenantType,
} from '../types.js';

/**
 * Default demo user ID used for pre-populated tenants.
 * Matches the user ID assigned by basic auth guard.
 */
export const DEMO_USER_ID = 'basic-auth-user';

/**
 * Logger interface for in-memory stores.
 */
export interface InMemoryStoreLogger {
  info: (message: string) => void;
  debug?: (message: string) => void;
}

/**
 * Options for creating an in-memory tenant store.
 */
export interface InMemoryTenantStoreOptions {
  /**
   * Demo user ID for pre-populated tenants.
   * @default 'basic-auth-user'
   */
  demoUserId?: string;

  /**
   * Optional logger for store operations.
   * If not provided, uses console.log as fallback.
   */
  logger?: InMemoryStoreLogger;
}

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
export function createInMemoryTenantStore(
  options: InMemoryTenantStoreOptions = {}
): TenantStore {
  const demoUserId = options.demoUserId || DEMO_USER_ID;
  const logger = options.logger || {
    info: (msg: string) => console.log(msg),
    debug: (msg: string) => console.log(msg),
  };

  const tenants = new Map<string, Tenant>();
  const memberships = new Map<string, TenantMembership>();
  let tenantIdCounter = 1;
  let membershipIdCounter = 1;

  // Pre-populate demo tenants
  const demoTenants: Array<{ name: string; type: TenantType; owner_id: string }> = [
    { name: 'Acme Corporation', type: 'organization', owner_id: demoUserId },
    { name: 'Engineering Team', type: 'group', owner_id: demoUserId },
    { name: 'Finance Department', type: 'department', owner_id: demoUserId },
    { name: 'Demo User Workspace', type: 'user', owner_id: demoUserId },
  ];

  demoTenants.forEach((t) => {
    const id = `tenant-${tenantIdCounter++}`;
    const tenant: Tenant = {
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
    const membership: TenantMembership = {
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

    async initialize(): Promise<void> {
      logger.info('[InMemoryTenantStore] Initialized with demo tenants');
    },

    async getById(id: string): Promise<Tenant | null> {
      return tenants.get(id) || null;
    },

    async getByIds(ids: string[]): Promise<Tenant[]> {
      return ids.map((id) => tenants.get(id)).filter((t): t is Tenant => t !== undefined);
    },

    async getByName(name: string): Promise<Tenant | null> {
      for (const tenant of tenants.values()) {
        if (tenant.name.toLowerCase() === name.toLowerCase()) {
          return tenant;
        }
      }
      return null;
    },

    async create(input: CreateTenantInput): Promise<Tenant> {
      const id = `tenant-${tenantIdCounter++}`;
      const tenant: Tenant = {
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
      const membership: TenantMembership = {
        id: membershipId,
        tenant_id: id,
        user_id: input.owner_id,
        role: 'owner',
        joined_at: new Date(),
      };
      memberships.set(membershipId, membership);

      return tenant;
    },

    async update(id: string, input: UpdateTenantInput): Promise<Tenant | null> {
      const tenant = tenants.get(id);
      if (!tenant) return null;

      const updated: Tenant = {
        ...tenant,
        ...input,
        id: tenant.id, // Preserve ID
        created_at: tenant.created_at, // Preserve created_at
        updated_at: new Date(),
      };
      tenants.set(id, updated);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      // Delete all memberships for this tenant
      for (const [key, membership] of memberships.entries()) {
        if (membership.tenant_id === id) {
          memberships.delete(key);
        }
      }
      return tenants.delete(id);
    },

    async search(params: TenantSearchParams = {}): Promise<TenantListResponse> {
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
        const aVal = a[sortBy as keyof Tenant];
        const bVal = b[sortBy as keyof Tenant];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
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

    async getTenantsForUser(userId: string): Promise<TenantWithMembership[]> {
      const userMemberships = Array.from(memberships.values()).filter(
        (m) => m.user_id === userId
      );
      const results: TenantWithMembership[] = [];
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

    async getTenantForUser(
      tenantId: string,
      userId: string
    ): Promise<TenantWithMembership | null> {
      const membership = await this.getMembership(tenantId, userId);
      if (!membership) return null;

      const tenant = tenants.get(tenantId);
      if (!tenant) return null;

      return {
        ...tenant,
        user_role: membership.role,
        membership,
      };
    },

    async getMembers(tenantId: string): Promise<TenantMembership[]> {
      return Array.from(memberships.values()).filter((m) => m.tenant_id === tenantId);
    },

    async getMembership(tenantId: string, userId: string): Promise<TenantMembership | null> {
      for (const membership of memberships.values()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          return membership;
        }
      }
      return null;
    },

    async addMember(input: CreateTenantMembershipInput): Promise<TenantMembership> {
      const id = `membership-${membershipIdCounter++}`;
      const membership: TenantMembership = {
        id,
        tenant_id: input.tenant_id,
        user_id: input.user_id,
        role: input.role,
        joined_at: new Date(),
      };
      memberships.set(id, membership);
      return membership;
    },

    async updateMember(
      tenantId: string,
      userId: string,
      input: UpdateTenantMembershipInput
    ): Promise<TenantMembership | null> {
      for (const membership of memberships.values()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          const updated: TenantMembership = {
            ...membership,
            ...input,
          };
          memberships.set(membership.id, updated);
          return updated;
        }
      }
      return null;
    },

    async removeMember(tenantId: string, userId: string): Promise<boolean> {
      for (const [key, membership] of memberships.entries()) {
        if (membership.tenant_id === tenantId && membership.user_id === userId) {
          memberships.delete(key);
          return true;
        }
      }
      return false;
    },

    async shutdown(): Promise<void> {
      logger.info('[InMemoryTenantStore] Shutdown');
    },
  };
}
