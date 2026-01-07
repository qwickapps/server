/**
 * QwickBrain Plugin Types
 *
 * Type definitions for the QwickBrain MCP proxy plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

/**
 * Configuration for the QwickBrain plugin
 */
export interface QwickBrainPluginConfig {
  /**
   * Base URL of the QwickBrain instance (via Tailscale)
   * Example: "http://macmini.tailnet-xxx.ts.net:8080"
   */
  qwickbrainUrl: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Which MCP tools to expose publicly
   * Use '*' to expose all tools, or provide a list of tool names
   * @default '*'
   */
  exposedTools?: string[] | '*';

  /**
   * API configuration
   */
  api?: {
    /**
     * Enable API routes
     * @default true
     */
    enabled?: boolean;

    /**
     * API route prefix (mounted under /api)
     * @default '/mcp'
     */
    prefix?: string;
  };

  /**
   * Authentication configuration
   */
  auth?: {
    /**
     * Require authentication for MCP tool endpoints
     * When true, /mcp/tools and /mcp/tools/:name require valid auth
     * Status endpoint (/mcp/status) is always public
     * @default true
     */
    required?: boolean;

    /**
     * Roles required to access MCP tools (optional)
     * If set, user must have at least one of these roles
     */
    allowedRoles?: string[];
  };

  /**
   * Rate limiting configuration
   */
  rateLimit?: MCPRateLimitConfig;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * MCP Tool definition from QwickBrain
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP Tool call request
 */
export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * MCP Tool call response
 */
export interface MCPToolCallResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * QwickBrain connection status
 */
export interface QwickBrainConnectionStatus {
  connected: boolean;
  lastCheck: Date;
  latencyMs?: number;
  error?: string;
}

/**
 * Rate limit configuration for MCP requests
 */
export interface MCPRateLimitConfig {
  /**
   * Enable rate limiting
   * @default true
   */
  enabled?: boolean;

  /**
   * Requests per minute per client
   * @default 60
   */
  perClientPerMinute?: number;

  /**
   * Total requests per minute (global)
   * @default 1000
   */
  globalPerMinute?: number;
}
