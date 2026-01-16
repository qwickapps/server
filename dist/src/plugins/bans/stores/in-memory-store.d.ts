/**
 * In-memory Ban Store for Demo/Testing
 *
 * Implements the BanStore interface with in-memory storage.
 * Supports temporary and permanent bans with expiration.
 */
export declare function createInMemoryBanStore(): {
    name: string;
    initialize(): Promise<void>;
    isBanned(userId: string): Promise<boolean>;
    getActiveBan(userId: string): Promise<any>;
    createBan(input: any): Promise<{
        id: string;
        user_id: any;
        reason: any;
        banned_by: any;
        banned_at: Date;
        expires_at: Date | null;
        is_active: boolean;
        metadata: any;
    }>;
    removeBan(input: any): Promise<boolean>;
    listBans(userId: string): Promise<any[]>;
    listActiveBans(options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        bans: any[];
        total: number;
    }>;
    cleanupExpiredBans(): Promise<number>;
    shutdown(): Promise<void>;
};
//# sourceMappingURL=in-memory-store.d.ts.map