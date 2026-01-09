/**
 * Usage Logging Middleware
 *
 * Logs all API key requests for audit trails and usage analytics.
 * Logging is asynchronous and non-blocking to avoid performance impact.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { RequestHandler } from 'express';
import type { UsageLogStore } from '../stores/usage-log-store.js';
/**
 * Create usage logging middleware
 *
 * Logs all requests made with API key authentication to the usage log store.
 * Logging happens asynchronously after the response is sent to avoid latency.
 *
 * @param store Usage log storage backend
 * @returns Express middleware
 */
export declare function createUsageLoggingMiddleware(store: UsageLogStore): RequestHandler;
//# sourceMappingURL=usage-logging.d.ts.map