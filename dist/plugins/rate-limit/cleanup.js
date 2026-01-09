/**
 * Rate Limit Cleanup Job
 *
 * Periodically removes expired rate limit records from the database.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a cleanup job
 *
 * @param config Cleanup configuration
 * @returns CleanupJob instance
 */
export function createCleanupJob(config) {
    const { store, intervalMs = 300000, // 5 minutes default
    debug = false, } = config;
    let intervalId = null;
    let isRunningCleanup = false;
    function log(message, data) {
        if (debug) {
            console.log(`[RateLimitCleanup] ${message}`, data || '');
        }
    }
    async function runCleanup() {
        if (isRunningCleanup) {
            log('Cleanup already in progress, skipping');
            return 0;
        }
        isRunningCleanup = true;
        try {
            log('Starting cleanup');
            const startTime = Date.now();
            const deletedCount = await store.cleanup();
            const duration = Date.now() - startTime;
            log('Cleanup complete', { deletedCount, durationMs: duration });
            return deletedCount;
        }
        catch (error) {
            console.error('[RateLimitCleanup] Error during cleanup:', error);
            return 0;
        }
        finally {
            isRunningCleanup = false;
        }
    }
    return {
        start() {
            if (intervalId) {
                log('Cleanup job already running');
                return;
            }
            log('Starting cleanup job', { intervalMs });
            intervalId = setInterval(runCleanup, intervalMs);
            // Run initial cleanup after a short delay
            setTimeout(runCleanup, 10000);
        },
        stop() {
            if (intervalId) {
                log('Stopping cleanup job');
                clearInterval(intervalId);
                intervalId = null;
            }
        },
        async runNow() {
            return runCleanup();
        },
        isRunning() {
            return intervalId !== null;
        },
    };
}
//# sourceMappingURL=cleanup.js.map