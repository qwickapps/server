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
export function createCleanupJob(config: CleanupJobConfig): CleanupJob {
  const {
    store,
    intervalMs = 300000, // 5 minutes default
    debug = false,
  } = config;

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isRunningCleanup = false;

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[RateLimitCleanup] ${message}`, data || '');
    }
  }

  async function runCleanup(): Promise<number> {
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
    } catch (error) {
      console.error('[RateLimitCleanup] Error during cleanup:', error);
      return 0;
    } finally {
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

    async runNow(): Promise<number> {
      return runCleanup();
    },

    isRunning(): boolean {
      return intervalId !== null;
    },
  };
}
