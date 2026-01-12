/**
 * Tenants Plugin Types
 *
 * Type definitions for multi-tenant data isolation and organization management.
 * Storage-agnostic - supports any database through the TenantStore interface.
 *
 * Tenant-first design: Every user belongs to at least one tenant (their personal tenant).
 * Organizations are multi-user tenants with role-based access control.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Tenant type determines isolation level and capabilities
 */
export type TenantType = 'user' | 'organization' | 'group' | 'department';
/**
 * Tenant record in the database
 */
export interface Tenant {
    /** Primary key - UUID */
    id: string;
    /** Tenant name (user's email for user tenants, org name for organizations) */
    name: string;
    /** Tenant type */
    type: TenantType;
    /** Owner user ID (user who created/owns this tenant) */
    owner_id: string;
    /** Additional metadata (JSON) */
    metadata?: Record<string, unknown>;
    /** When the tenant was created */
    created_at: Date;
    /** When the tenant was last updated */
    updated_at: Date;
}
/**
 * Tenant creation payload
 */
export interface CreateTenantInput {
    name: string;
    type: TenantType;
    owner_id: string;
    metadata?: Record<string, unknown>;
}
/**
 * Tenant update payload
 */
export interface UpdateTenantInput {
    name?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Tenant search parameters
 */
export interface TenantSearchParams {
    /** Search query (searches name) */
    query?: string;
    /** Filter by type */
    type?: TenantType;
    /** Filter by owner */
    owner_id?: string;
    /** Page number (1-indexed) */
    page?: number;
    /** Items per page */
    limit?: number;
    /** Sort field */
    sortBy?: 'name' | 'type' | 'created_at';
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
}
/**
 * Paginated tenant list response
 */
export interface TenantListResponse {
    tenants: Tenant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Tenant membership record (many-to-many: users <-> tenants)
 */
export interface TenantMembership {
    /** Primary key - UUID */
    id: string;
    /** Tenant ID */
    tenant_id: string;
    /** User ID */
    user_id: string;
    /** Role in this tenant (owner, admin, member, viewer) */
    role: string;
    /** When the user joined this tenant */
    joined_at: Date;
}
/**
 * Tenant membership creation payload
 */
export interface CreateTenantMembershipInput {
    tenant_id: string;
    user_id: string;
    role: string;
}
/**
 * Tenant membership update payload
 */
export interface UpdateTenantMembershipInput {
    role?: string;
}
/**
 * Tenant with membership info (for current user)
 */
export interface TenantWithMembership extends Tenant {
    /** Current user's role in this tenant */
    user_role: string;
    /** Current user's membership record */
    membership: TenantMembership;
}
/**
 * Tenant store interface - all storage backends must implement this
 */
export interface TenantStore {
    /** Store name (e.g., 'postgres', 'memory') */
    name: string;
    /**
     * Initialize the store (create tables, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Get a tenant by ID
     */
    getById(id: string): Promise<Tenant | null>;
    /**
     * Get multiple tenants by IDs (batch query)
     */
    getByIds(ids: string[]): Promise<Tenant[]>;
    /**
     * Get a tenant by name
     */
    getByName(name: string): Promise<Tenant | null>;
    /**
     * Create a new tenant
     */
    create(input: CreateTenantInput): Promise<Tenant>;
    /**
     * Update a tenant
     */
    update(id: string, input: UpdateTenantInput): Promise<Tenant | null>;
    /**
     * Delete a tenant (hard delete)
     */
    delete(id: string): Promise<boolean>;
    /**
     * Search tenants with pagination
     */
    search(params: TenantSearchParams): Promise<TenantListResponse>;
    /**
     * Get all tenants for a user (via memberships)
     */
    getTenantsForUser(userId: string): Promise<TenantWithMembership[]>;
    /**
     * Get a tenant for a user with membership info
     */
    getTenantForUser(tenantId: string, userId: string): Promise<TenantWithMembership | null>;
    /**
     * Add a user to a tenant (create membership)
     */
    addMember(input: CreateTenantMembershipInput): Promise<TenantMembership>;
    /**
     * Update a user's role in a tenant
     */
    updateMember(tenantId: string, userId: string, input: UpdateTenantMembershipInput): Promise<TenantMembership | null>;
    /**
     * Remove a user from a tenant (delete membership)
     */
    removeMember(tenantId: string, userId: string): Promise<boolean>;
    /**
     * Get all members of a tenant
     */
    getMembers(tenantId: string): Promise<TenantMembership[]>;
    /**
     * Get a specific membership
     */
    getMembership(tenantId: string, userId: string): Promise<TenantMembership | null>;
    /**
     * Shutdown the store (close connections, cleanup)
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL tenant store configuration
 */
export interface PostgresTenantStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: unknown | (() => unknown);
    /** Tenants table name (default: 'tenants') */
    tenantsTable?: string;
    /** Tenant memberships table name (default: 'tenant_memberships') */
    membershipsTable?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
}
/**
 * Tenants plugin configuration
 */
export interface TenantsPluginConfig {
    /** Tenant store implementation */
    store: TenantStore;
    /** API route prefix (default: '/tenants') */
    apiPrefix?: string;
    /** Enable API endpoints (default: true) */
    apiEnabled?: boolean;
    /** Enable debug logging (default: false) */
    debug?: boolean;
}
//# sourceMappingURL=types.d.ts.map