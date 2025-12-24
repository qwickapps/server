/**
 * QwickBrain Plugin
 *
 * MCP proxy plugin for @qwickapps/server that exposes QwickBrain tools
 * to external AI clients via authenticated API endpoints.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response as ExpressResponse } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type {
  QwickBrainPluginConfig,
  MCPToolDefinition,
  MCPToolCallRequest,
  MCPToolCallResponse,
  QwickBrainConnectionStatus,
} from './types.js';
import { isAuthenticated, getAuthenticatedUser } from '../auth/auth-plugin.js';
import type { AuthenticatedUser } from '../auth/types.js';

// Connection status tracking
let connectionStatus: QwickBrainConnectionStatus = {
  connected: false,
  lastCheck: new Date(),
  tailscaleStatus: 'unknown',
};

// Health check interval
let healthCheckInterval: NodeJS.Timeout | null = null;

// In-memory rate limit tracking
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval for rate limit entries
let rateLimitCleanupInterval: NodeJS.Timeout | null = null;

/**
 * Response from proxy request
 */
interface ProxyResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

/**
 * Proxy a request to the QwickBrain instance
 */
async function proxyToQwickBrain(
  baseUrl: string,
  path: string,
  options: {
    method?: string;
    body?: unknown;
    timeout?: number;
  } = {}
): Promise<ProxyResponse> {
  const { method = 'GET', body, timeout = 30000 } = options;
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
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
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check Tailscale connectivity status
 */
async function checkTailscaleStatus(): Promise<'connected' | 'disconnected' | 'unknown'> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync('tailscale status --json', { timeout: 5000 });
    const status = JSON.parse(stdout);

    return status.BackendState === 'Running' ? 'connected' : 'disconnected';
  } catch {
    return 'unknown';
  }
}

/**
 * Check QwickBrain connectivity
 */
async function checkQwickBrainHealth(
  baseUrl: string,
  timeout: number
): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const startTime = Date.now();

  try {
    const response = await proxyToQwickBrain(baseUrl, '/health', { timeout });
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return { connected: true, latencyMs };
    } else {
      return { connected: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Create the QwickBrain plugin
 */
export function createQwickBrainPlugin(config: QwickBrainPluginConfig): Plugin {
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

  function log(message: string, data?: Record<string, unknown>) {
    if (debug) {
      console.log(`[QwickBrainPlugin] ${message}`, data || '');
    }
  }

  /**
   * Check rate limit for a key
   * Returns remaining requests or -1 if limited
   */
  function checkRateLimit(key: string, maxRequests: number): { limited: boolean; remaining: number; resetAt: number } {
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
  function checkRateLimits(userId: string | undefined): { status: number; body: Record<string, unknown>; headers: Record<string, string> } | null {
    if (!rateLimitEnabled) return null;

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
  function isToolExposed(toolName: string): boolean {
    if (exposedTools === '*') return true;
    return exposedTools.includes(toolName);
  }

  /**
   * Check if user has required role
   */
  function hasAllowedRole(user: AuthenticatedUser | null): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user || !user.roles) return false;
    return allowedRoles.some(role => user.roles?.includes(role));
  }

  /**
   * Check authentication and authorization for protected routes
   * Returns error response object if not authorized, null if authorized
   */
  function checkAuth(req: Request): { status: number; body: Record<string, unknown> } | null {
    if (!authRequired) return null;

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
    type: 'regular' as const,
    slug: 'mcp',
    configurable: {
      slug: true,  // Allow users to customize slug via UI
    },

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
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
      const tailscaleStatus = await checkTailscaleStatus();
      const healthResult = await checkQwickBrainHealth(config.qwickbrainUrl, timeout);

      connectionStatus = {
        connected: healthResult.connected,
        lastCheck: new Date(),
        latencyMs: healthResult.latencyMs,
        error: healthResult.error,
        tailscaleStatus,
      };

      log('Initial connection status', connectionStatus as unknown as Record<string, unknown>);

      // Set up periodic health check
      healthCheckInterval = setInterval(async () => {
        const tsStatus = await checkTailscaleStatus();
        const health = await checkQwickBrainHealth(config.qwickbrainUrl, timeout);

        connectionStatus = {
          connected: health.connected,
          lastCheck: new Date(),
          latencyMs: health.latencyMs,
          error: health.error,
          tailscaleStatus: tsStatus,
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

      registry.registerHealthCheck({
        name: 'qwickbrain-tailscale',
        type: 'custom',
        check: async () => {
          const status = await checkTailscaleStatus();
          return {
            healthy: status === 'connected',
            status,
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
          handler: async (_req: Request, res: ExpressResponse) => {
            res.json({
              connected: connectionStatus.connected,
              lastCheck: connectionStatus.lastCheck.toISOString(),
              latencyMs: connectionStatus.latencyMs,
              tailscaleStatus: connectionStatus.tailscaleStatus,
              error: connectionStatus.error,
            });
          },
        });

        // GET /mcp/tools - List available MCP tools (auth required)
        registry.addRoute({
          method: 'get',
          path: `${apiPrefix}/tools`,
          pluginId: 'qwickbrain',
          handler: async (req: Request, res: ExpressResponse) => {
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
              const response = await proxyToQwickBrain(
                config.qwickbrainUrl,
                '/tools',
                { timeout }
              );

              if (!response.ok) {
                res.status(response.status).json({
                  error: 'Failed to fetch tools from QwickBrain',
                });
                return;
              }

              const data = await response.json() as { tools?: MCPToolDefinition[] };
              const tools: MCPToolDefinition[] = data.tools || [];

              // Filter to exposed tools only
              const filteredTools = tools.filter(tool => isToolExposed(tool.name));

              res.json({
                tools: filteredTools,
                count: filteredTools.length,
              });
            } catch (error) {
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
          handler: async (req: Request, res: ExpressResponse) => {
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

              const toolRequest: MCPToolCallRequest = {
                name: toolName,
                arguments: req.body || {},
              };

              log('Executing tool', { tool: toolName, userId: user?.id, arguments: req.body });

              // Proxy the tool call to QwickBrain
              const response = await proxyToQwickBrain(
                config.qwickbrainUrl,
                `/tools/${toolName}`,
                {
                  method: 'POST',
                  body: toolRequest.arguments,
                  timeout,
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                res.status(response.status).json({
                  error: 'Tool execution failed',
                  details: errorText,
                });
                return;
              }

              const result = await response.json() as MCPToolCallResponse;

              log('Tool executed successfully', { tool: toolName });

              res.json(result);
            } catch (error) {
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
          handler: async (req: Request, res: ExpressResponse) => {
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

    async onStop(): Promise<void> {
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
        tailscaleStatus: 'unknown',
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
export function getConnectionStatus(): QwickBrainConnectionStatus {
  return { ...connectionStatus };
}

/**
 * Check if QwickBrain is connected
 */
export function isConnected(): boolean {
  return connectionStatus.connected;
}
