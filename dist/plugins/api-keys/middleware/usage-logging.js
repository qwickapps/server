/**
 * Usage Logging Middleware
 *
 * Logs all API key requests for audit trails and usage analytics.
 * Logging is asynchronous and non-blocking to avoid performance impact.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create usage logging middleware
 *
 * Logs all requests made with API key authentication to the usage log store.
 * Logging happens asynchronously after the response is sent to avoid latency.
 *
 * @param store Usage log storage backend
 * @returns Express middleware
 */
export function createUsageLoggingMiddleware(store) {
    return (req, res, next) => {
        const apiKeyReq = req;
        // Skip if not API key authentication
        if (!apiKeyReq.apiKey) {
            return next();
        }
        // Capture request details
        const keyId = apiKeyReq.apiKey.id;
        const endpoint = req.path;
        const method = req.method;
        const ipAddress = (req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket?.remoteAddress);
        const userAgent = req.get('user-agent');
        // Intercept response to capture status code
        const originalSend = res.send;
        res.send = function (data) {
            const statusCode = res.statusCode;
            // Log asynchronously after response is sent (non-blocking)
            setImmediate(() => {
                store.log({
                    key_id: keyId,
                    endpoint,
                    method,
                    status_code: statusCode,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                }).catch((error) => {
                    // Log error but don't fail the request
                    console.error('[UsageLogging] Failed to log API key usage:', error);
                });
            });
            // Call original send
            return originalSend.call(this, data);
        };
        next();
    };
}
//# sourceMappingURL=usage-logging.js.map