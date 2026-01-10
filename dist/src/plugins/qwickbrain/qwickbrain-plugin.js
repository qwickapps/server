/**
 * QwickBrain Plugin
 *
 * MCP proxy plugin for @qwickapps/server that exposes QwickBrain tools
 * to external AI clients via authenticated API endpoints.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { isAuthenticated, getAuthenticatedUser } from '../auth/auth-plugin.js';
// Connection status tracking
let connectionStatus = {
    connected: false,
    lastCheck: new Date(),
};
// Health check interval
let healthCheckInterval = null;
const rateLimitStore = new Map();
// Cleanup interval for rate limit entries
let rateLimitCleanupInterval = null;
/**
 * Proxy a request to the QwickBrain instance
 */
async function proxyToQwickBrain(baseUrl, path, options = {}) {
    const { method = 'GET', body, timeout = 30000 } = options;
    const url = `${baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
        const fetchOptions = {
            method,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };
        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }
        const response = await fetch(url, fetchOptions);
        return {
            ok: response.ok,
            status: response.status,
            json: () => response.json(),
            text: () => response.text(),
        };
    }
    finally {
        clearTimeout(timeoutId);
    }
}
/**
 * Check QwickBrain connectivity
 */
async function checkQwickBrainHealth(baseUrl, timeout) {
    const startTime = Date.now();
    try {
        const response = await proxyToQwickBrain(baseUrl, '/health', { timeout });
        const latencyMs = Date.now() - startTime;
        if (response.ok) {
            return { connected: true, latencyMs };
        }
        else {
            return { connected: false, error: `HTTP ${response.status}` };
        }
    }
    catch (error) {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Connection failed',
        };
    }
}
/**
 * Create the QwickBrain plugin
 */
export function createQwickBrainPlugin(config) {
    const debug = config.debug || false;
    // Note: For regular plugins with slug-based routing, routes are auto-prefixed with slug
    // So we use empty prefix here. The framework will add /mcp (or configured slug) automatically
    const apiPrefix = '';
    const apiEnabled = config.api?.enabled !== false;
    const timeout = config.timeout || 30000;
    const exposedTools = config.exposedTools || '*';
    const authRequired = config.auth?.required !== false; // Default true
    const allowedRoles = config.auth?.allowedRoles;
    const rateLimitEnabled = config.rateLimit?.enabled !== false; // Default true
    const perClientPerMinute = config.rateLimit?.perClientPerMinute || 60;
    const globalPerMinute = config.rateLimit?.globalPerMinute || 1000;
    const windowMs = 60000; // 1 minute window
    function log(message, data) {
        if (debug) {
            console.log(`[QwickBrainPlugin] ${message}`, data || '');
        }
    }
    /**
     * Check rate limit for a key
     * Returns remaining requests or -1 if limited
     */
    function checkRateLimit(key, maxRequests) {
        const now = Date.now();
        const entry = rateLimitStore.get(key);
        if (!entry || now - entry.windowStart >= windowMs) {
            // New window
            rateLimitStore.set(key, { count: 1, windowStart: now });
            return { limited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
        }
        // Within window
        if (entry.count >= maxRequests) {
            return { limited: true, remaining: 0, resetAt: entry.windowStart + windowMs };
        }
        entry.count++;
        return { limited: false, remaining: maxRequests - entry.count, resetAt: entry.windowStart + windowMs };
    }
    /**
     * Check rate limits for a request (per-client and global)
     * Returns error response if limited, null otherwise
     */
    function checkRateLimits(userId) {
        if (!rateLimitEnabled)
            return null;
        // Check global rate limit
        const globalKey = 'global:mcp';
        const globalResult = checkRateLimit(globalKey, globalPerMinute);
        if (globalResult.limited) {
            log('Global rate limit exceeded');
            return {
                status: 429,
                body: {
                    error: 'Too Many Requests',
                    message: 'Global rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((globalResult.resetAt - Date.now()) / 1000),
                },
                headers: {
                    'Retry-After': String(Math.ceil((globalResult.resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(globalPerMinute),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(globalResult.resetAt / 1000)),
                },
            };
        }
        // Check per-client rate limit (by user ID or IP)
        const clientKey = `client:${userId || 'anonymous'}`;
        const clientResult = checkRateLimit(clientKey, perClientPerMinute);
        if (clientResult.limited) {
            log('Client rate limit exceeded', { userId });
            return {
                status: 429,
                body: {
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((clientResult.resetAt - Date.now()) / 1000),
                },
                headers: {
                    'Retry-After': String(Math.ceil((clientResult.resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(perClientPerMinute),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(clientResult.resetAt / 1000)),
                },
            };
        }
        return null;
    }
    /**
     * Check if a tool should be exposed
     */
    function isToolExposed(toolName) {
        if (exposedTools === '*')
            return true;
        return exposedTools.includes(toolName);
    }
    /**
     * Check if user has required role
     */
    function hasAllowedRole(user) {
        if (!allowedRoles || allowedRoles.length === 0)
            return true;
        if (!user || !user.roles)
            return false;
        return allowedRoles.some(role => user.roles?.includes(role));
    }
    /**
     * Check authentication and authorization for protected routes
     * Returns error response object if not authorized, null if authorized
     */
    function checkAuth(req) {
        if (!authRequired)
            return null;
        if (!isAuthenticated(req)) {
            log('Unauthorized access attempt', { path: req.path });
            return {
                status: 401,
                body: {
                    error: 'Unauthorized',
                    message: 'Authentication required to access MCP tools',
                },
            };
        }
        const user = getAuthenticatedUser(req);
        if (!hasAllowedRole(user)) {
            log('Forbidden access attempt', { path: req.path, userId: user?.id });
            return {
                status: 403,
                body: {
                    error: 'Forbidden',
                    message: 'Insufficient permissions to access MCP tools',
                    requiredRoles: allowedRoles,
                },
            };
        }
        return null;
    }
    return {
        id: 'qwickbrain',
        name: 'QwickBrain MCP',
        version: '1.0.0',
        type: 'regular',
        slug: 'mcp',
        configurable: {
            slug: true, // Allow users to customize slug via UI
        },
        scopes: [
            {
                name: 'qwickbrain:read',
                description: 'Read access to MCP tools list, status, and health information',
                category: 'read',
            },
            {
                name: 'qwickbrain:execute',
                description: 'Execute MCP tools (search_codebase, explain_function, etc.)',
                category: 'write',
            },
        ],
        async onStart(_pluginConfig, registry) {
            log('Starting QwickBrain plugin');
            log('Configuration', {
                qwickbrainUrl: config.qwickbrainUrl,
                timeout,
                exposedTools: exposedTools === '*' ? 'all' : exposedTools,
                authRequired,
                allowedRoles: allowedRoles || 'any',
                rateLimitEnabled,
                perClientPerMinute,
                globalPerMinute,
            });
            // Set up rate limit cleanup (every 5 minutes)
            rateLimitCleanupInterval = setInterval(() => {
                const now = Date.now();
                let cleaned = 0;
                for (const [key, entry] of rateLimitStore.entries()) {
                    if (now - entry.windowStart >= windowMs * 2) {
                        rateLimitStore.delete(key);
                        cleaned++;
                    }
                }
                if (cleaned > 0) {
                    log('Rate limit cleanup', { cleaned, remaining: rateLimitStore.size });
                }
            }, 300000); // 5 minutes
            // Initial health check
            const healthResult = await checkQwickBrainHealth(config.qwickbrainUrl, timeout);
            connectionStatus = {
                connected: healthResult.connected,
                lastCheck: new Date(),
                latencyMs: healthResult.latencyMs,
                error: healthResult.error,
            };
            log('Initial connection status', connectionStatus);
            // Set up periodic health check
            healthCheckInterval = setInterval(async () => {
                const health = await checkQwickBrainHealth(config.qwickbrainUrl, timeout);
                connectionStatus = {
                    connected: health.connected,
                    lastCheck: new Date(),
                    latencyMs: health.latencyMs,
                    error: health.error,
                };
            }, 30000); // Check every 30 seconds
            // Register health checks
            registry.registerHealthCheck({
                name: 'qwickbrain-connection',
                type: 'custom',
                check: async () => {
                    const health = await checkQwickBrainHealth(config.qwickbrainUrl, timeout);
                    return {
                        healthy: health.connected,
                        latencyMs: health.latencyMs,
                        error: health.error,
                    };
                },
            });
            // Add API routes if enabled
            if (apiEnabled) {
                // GET /mcp/status - Connection status (no auth required)
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/status`,
                    pluginId: 'qwickbrain',
                    handler: async (_req, res) => {
                        res.json({
                            connected: connectionStatus.connected,
                            lastCheck: connectionStatus.lastCheck.toISOString(),
                            latencyMs: connectionStatus.latencyMs,
                            error: connectionStatus.error,
                        });
                    },
                });
                // GET /mcp/tools - List available MCP tools (auth required)
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/tools`,
                    pluginId: 'qwickbrain',
                    handler: async (req, res) => {
                        // Check authentication
                        const authError = checkAuth(req);
                        if (authError) {
                            res.status(authError.status).json(authError.body);
                            return;
                        }
                        const user = getAuthenticatedUser(req);
                        // Check rate limits
                        const rateLimitError = checkRateLimits(user?.id);
                        if (rateLimitError) {
                            Object.entries(rateLimitError.headers).forEach(([key, value]) => {
                                res.setHeader(key, value);
                            });
                            res.status(rateLimitError.status).json(rateLimitError.body);
                            return;
                        }
                        try {
                            if (!connectionStatus.connected) {
                                res.status(503).json({
                                    error: 'QwickBrain not connected',
                                    details: connectionStatus.error,
                                });
                                return;
                            }
                            // Fetch tools from QwickBrain
                            const response = await proxyToQwickBrain(config.qwickbrainUrl, '/tools', { timeout });
                            if (!response.ok) {
                                res.status(response.status).json({
                                    error: 'Failed to fetch tools from QwickBrain',
                                });
                                return;
                            }
                            const data = await response.json();
                            const tools = data.tools || [];
                            // Filter to exposed tools only
                            const filteredTools = tools.filter(tool => isToolExposed(tool.name));
                            res.json({
                                tools: filteredTools,
                                count: filteredTools.length,
                            });
                        }
                        catch (error) {
                            log('Error fetching tools', { error: String(error) });
                            res.status(500).json({
                                error: 'Failed to fetch tools',
                                details: error instanceof Error ? error.message : 'Unknown error',
                            });
                        }
                    },
                });
                // POST /mcp/tools/:name - Execute an MCP tool (auth required)
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/tools/:name`,
                    pluginId: 'qwickbrain',
                    handler: async (req, res) => {
                        // Check authentication
                        const authError = checkAuth(req);
                        if (authError) {
                            res.status(authError.status).json(authError.body);
                            return;
                        }
                        const toolName = req.params.name;
                        const user = getAuthenticatedUser(req);
                        // Check rate limits
                        const rateLimitError = checkRateLimits(user?.id);
                        if (rateLimitError) {
                            Object.entries(rateLimitError.headers).forEach(([key, value]) => {
                                res.setHeader(key, value);
                            });
                            res.status(rateLimitError.status).json(rateLimitError.body);
                            return;
                        }
                        try {
                            // Check if tool is exposed
                            if (!isToolExposed(toolName)) {
                                res.status(403).json({
                                    error: 'Tool not available',
                                    tool: toolName,
                                });
                                return;
                            }
                            if (!connectionStatus.connected) {
                                res.status(503).json({
                                    error: 'QwickBrain not connected',
                                    details: connectionStatus.error,
                                });
                                return;
                            }
                            const toolRequest = {
                                name: toolName,
                                arguments: req.body || {},
                            };
                            log('Executing tool', { tool: toolName, userId: user?.id, arguments: req.body });
                            // Proxy the tool call to QwickBrain
                            const response = await proxyToQwickBrain(config.qwickbrainUrl, `/tools/${toolName}`, {
                                method: 'POST',
                                body: toolRequest.arguments,
                                timeout,
                            });
                            if (!response.ok) {
                                const errorText = await response.text();
                                res.status(response.status).json({
                                    error: 'Tool execution failed',
                                    details: errorText,
                                });
                                return;
                            }
                            const result = await response.json();
                            log('Tool executed successfully', { tool: toolName });
                            res.json(result);
                        }
                        catch (error) {
                            log('Error executing tool', { tool: toolName, error: String(error) });
                            res.status(500).json({
                                error: 'Tool execution failed',
                                tool: toolName,
                                details: error instanceof Error ? error.message : 'Unknown error',
                            });
                        }
                    },
                });
                // GET /mcp/sse - Server-Sent Events endpoint for streaming (auth required)
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/sse`,
                    pluginId: 'qwickbrain',
                    handler: async (req, res) => {
                        // Check authentication
                        const authError = checkAuth(req);
                        if (authError) {
                            res.status(authError.status).json(authError.body);
                            return;
                        }
                        const user = getAuthenticatedUser(req);
                        // Set SSE headers
                        res.setHeader('Content-Type', 'text/event-stream');
                        res.setHeader('Cache-Control', 'no-cache');
                        res.setHeader('Connection', 'keep-alive');
                        res.setHeader('X-Accel-Buffering', 'no');
                        // Send initial connection event
                        res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId: user?.id })}\n\n`);
                        // Keep connection alive with periodic pings
                        const pingInterval = setInterval(() => {
                            res.write(`event: ping\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
                        }, 30000);
                        // Handle client disconnect
                        req.on('close', () => {
                            clearInterval(pingInterval);
                            log('SSE client disconnected', { userId: user?.id });
                        });
                        log('SSE client connected', { userId: user?.id });
                    },
                });
            }
            log('QwickBrain plugin started');
        },
        async onStop() {
            log('Stopping QwickBrain plugin');
            if (healthCheckInterval) {
                clearInterval(healthCheckInterval);
                healthCheckInterval = null;
            }
            if (rateLimitCleanupInterval) {
                clearInterval(rateLimitCleanupInterval);
                rateLimitCleanupInterval = null;
            }
            // Clear rate limit store
            rateLimitStore.clear();
            connectionStatus = {
                connected: false,
                lastCheck: new Date(),
            };
            log('QwickBrain plugin stopped');
        },
    };
}
// ========================================
// Helper Functions
// ========================================
/**
 * Get the current connection status
 */
export function getConnectionStatus() {
    return { ...connectionStatus };
}
/**
 * Check if QwickBrain is connected
 */
export function isConnected() {
    return connectionStatus.connected;
}
//# sourceMappingURL=qwickbrain-plugin.js.map