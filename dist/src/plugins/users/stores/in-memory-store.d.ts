/**
 * In-memory User Store for Demo/Testing
 *
 * Implements the UserStore interface with in-memory storage.
 * Pre-populated with demo users for testing and showcase purposes.
 */
export declare function createInMemoryUserStore(): {
    name: string;
    initialize(): Promise<void>;
    getById(id: string): Promise<any>;
    getByEmail(email: string): Promise<any>;
    getByExternalId(externalId: string, provider: string): Promise<any>;
    create(input: any): Promise<{
        id: string;
        email: any;
        name: any;
        external_id: any;
        provider: any;
        picture: any;
        created_at: Date;
        updated_at: Date;
        metadata: any;
    }>;
    update(id: string, input: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    search(params?: any): Promise<{
        users: any[];
        total: number;
        page: any;
        limit: any;
        totalPages: number;
    }>;
    updateLastLogin(id: string): Promise<void>;
    shutdown(): Promise<void>;
};
//# sourceMappingURL=in-memory-store.d.ts.map