/**
 * Type definitions for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Application, RequestHandler, Router } from 'express';

/**
 * Control Panel Configuration
 */
export interface ControlPanelConfig {
  /** Product name displayed in the control panel */
  productName: string;

  /** Port to run the control panel on */
  port: number;

  /** Optional: Product version */
  version?: string;

  /** Optional: Branding configuration */
  branding?: {
    logo?: string;
    primaryColor?: string;
    favicon?: string;
  };

  /** Optional: Authentication configuration */
  auth?: {
    enabled: boolean;
    provider: 'basic' | 'jwt' | 'custom';
    users?: Array<{ username: string; password: string }>;
    jwtSecret?: string;
    customMiddleware?: RequestHandler;
  };

  /** Optional: CORS configuration */
  cors?: {
    origins: string[];
  };

  /** Optional: Quick links to display */
  links?: Array<{
    label: string;
    url: string;
    icon?: string;
    external?: boolean;
    requiresHealth?: string; // Only show when this health check passes
  }>;

  /** Optional: Paths to skip body parsing for (useful for proxy middleware) */
  skipBodyParserPaths?: string[];

  /** Optional: Disable the built-in dashboard HTML (set true when serving a custom React UI) */
  disableDashboard?: boolean;

  /** Optional: Use rich React UI instead of basic HTML (default: true if dist-ui exists) */
  useRichUI?: boolean;

  /** Optional: Custom path to a dist-ui folder for serving a custom React UI */
  customUiPath?: string;
}

/**
 * Plugin Context - passed to plugins during initialization
 */
export interface PluginContext {
  config: ControlPanelConfig;
  app: Application;
  router: Router;
  logger: Logger;
  registerHealthCheck: (check: HealthCheck) => void;
}

/**
 * Control Panel Plugin interface
 */
export interface ControlPanelPlugin {
  /** Unique plugin name */
  name: string;

  /** Order for tab display (lower = first) */
  order?: number;

  /** API routes provided by this plugin */
  routes?: Array<{
    method: 'get' | 'post' | 'put' | 'delete';
    path: string;
    handler: RequestHandler;
  }>;

  /** Lifecycle: Initialize plugin */
  onInit?: (context: PluginContext) => Promise<void>;

  /** Lifecycle: Shutdown plugin */
  onShutdown?: () => Promise<void>;
}

/**
 * Health Check types
 */
export type HealthCheckType = 'http' | 'tcp' | 'custom';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthCheckResult {
  status: HealthStatus;
  latency?: number;
  message?: string;
  lastChecked: Date;
  details?: Record<string, unknown>;
}

export interface HealthCheck {
  name: string;
  type: HealthCheckType;
  /** For http checks */
  url?: string;
  /** For tcp checks */
  host?: string;
  port?: number;
  /** Check interval in ms */
  interval?: number;
  /** Timeout in ms */
  timeout?: number;
  /** For custom checks */
  check?: () => Promise<{ healthy: boolean; latency?: number; details?: Record<string, unknown> }>;
}

/**
 * Log Source Configuration
 */
export interface LogSource {
  name: string;
  type: 'file' | 'api';
  path?: string; // For file sources
  url?: string; // For API sources
}

/**
 * Config Display Configuration
 */
export interface ConfigDisplayOptions {
  /** Environment variables to show */
  show: string[];
  /** Environment variables to mask */
  mask: string[];
  /** Validation rules */
  validate?: Array<{
    key: string;
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
  }>;
}

/**
 * Simple logger interface
 */
export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;
}

/**
 * Control Panel Instance
 */
export interface ControlPanelInstance {
  /** Express application */
  app: Application;

  /** Start the control panel server */
  start: () => Promise<void>;

  /** Stop the control panel server */
  stop: () => Promise<void>;

  /** Register a plugin */
  registerPlugin: (plugin: ControlPanelPlugin) => Promise<void>;

  /** Get health check results */
  getHealthStatus: () => Record<string, HealthCheckResult>;

  /** Get diagnostics for AI agents */
  getDiagnostics: () => DiagnosticsReport;
}

/**
 * Diagnostics Report for AI agents
 */
export interface DiagnosticsReport {
  timestamp: string;
  product: string;
  version?: string;
  uptime: number;
  health: Record<string, HealthCheckResult>;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      total: number;
      used: number;
      free: number;
    };
    cpu: {
      usage: number;
    };
  };
  config?: Record<string, string>;
  logs?: {
    startup: string[];
    recent: string[];
    errors: string[];
  };
}
