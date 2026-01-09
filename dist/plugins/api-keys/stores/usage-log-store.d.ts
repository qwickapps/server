/**
 * API Key Usage Log Store - PostgreSQL Implementation
 *
 * Tracks all API calls made with API keys for audit trails and usage analytics.
 * Uses table partitioning for efficient storage and querying of large log volumes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Pool } from 'pg';
/**
 * API key usage log entry
 */
export interface UsageLogEntry {
    /** Log entry ID */
    id?: string;
    /** API key ID that made the request */
    key_id: string;
    /** Endpoint path (e.g., '/cpanel/api/qwickbrain/tools') */
    endpoint: string;
    /** HTTP method (GET, POST, etc.) */
    method: string;
    /** HTTP response status code */
    status_code?: number;
    /** Client IP address */
    ip_address?: string;
    /** User agent string */
    user_agent?: string;
    /** Request timestamp */
    timestamp?: Date;
}
/**
 * Usage log query options
 */
export interface UsageLogQueryOptions {
    /** Limit number of results */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
    /** Filter by start date */
    since?: Date;
    /** Filter by end date */
    until?: Date;
    /** Filter by endpoint pattern */
    endpoint?: string;
    /** Filter by HTTP method */
    method?: string;
    /** Filter by status code */
    statusCode?: number;
}
/**
 * Usage log statistics
 */
export interface UsageLogStats {
    /** Total number of calls */
    totalCalls: number;
    /** Last call timestamp */
    lastUsed?: Date;
    /** Calls by status code */
    callsByStatus: Record<number, number>;
    /** Calls by endpoint */
    callsByEndpoint: Record<string, number>;
}
/**
 * Usage log store interface
 */
export interface UsageLogStore {
    /** Store name */
    name: string;
    /**
     * Initialize the store (create tables, partitions, indexes, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Log an API key usage
     */
    log(entry: UsageLogEntry): Promise<void>;
    /**
     * Batch log multiple entries (more efficient)
     */
    logBatch(entries: UsageLogEntry[]): Promise<void>;
    /**
     * Get usage logs for a specific API key
     */
    getKeyUsage(keyId: string, options?: UsageLogQueryOptions): Promise<UsageLogEntry[]>;
    /**
     * Get usage statistics for a specific API key
     */
    getKeyStats(keyId: string, options?: Pick<UsageLogQueryOptions, 'since' | 'until'>): Promise<UsageLogStats>;
    /**
     * Delete old logs (for retention policy)
     */
    deleteOlderThan(date: Date): Promise<number>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL usage log store configuration
 */
export interface PostgresUsageLogStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: Pool | (() => Pool);
    /** Table name (default: 'api_key_usage_logs') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
    /** Enable table partitioning (default: true) */
    enablePartitioning?: boolean;
    /** Partition interval in days (default: 30) */
    partitionIntervalDays?: number;
}
/**
 * PostgreSQL implementation of UsageLogStore
 */
export declare function createPostgresUsageLogStore(config: PostgresUsageLogStoreConfig): UsageLogStore;
//# sourceMappingURL=usage-log-store.d.ts.map