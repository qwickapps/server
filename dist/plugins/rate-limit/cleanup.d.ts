/**
 * Rate Limit Cleanup Job
 *
 * Periodically removes expired rate limit records from the database.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RateLimitStore } from './types.js';
/**
 * Cleanup job configuration
 */
export interface CleanupJobConfig {
    /** Store to clean up */
    store: RateLimitStore;
    /** Cleanup interval in milliseconds (default: 300000 = 5 min) */
    intervalMs?: number;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Cleanup job state
 */
export interface CleanupJob {
    /** Start the cleanup job */
    start(): void;
    /** Stop the cleanup job */
    stop(): void;
    /** Run cleanup immediately */
    runNow(): Promise<number>;
    /** Check if job is running */
    isRunning(): boolean;
}
/**
 * Create a cleanup job
 *
 * @param config Cleanup configuration
 * @returns CleanupJob instance
 */
export declare function createCleanupJob(config: CleanupJobConfig): CleanupJob;
//# sourceMappingURL=cleanup.d.ts.map