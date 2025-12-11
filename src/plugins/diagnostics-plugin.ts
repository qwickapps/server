/**
 * Diagnostics Plugin
 *
 * Provides AI-friendly diagnostic API for troubleshooting
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';

export interface DiagnosticsPluginConfig {
  include?: {
    logs?: {
      startup?: number; // Last N lines from startup log
      app?: number; // Last N lines from app log
    };
    health?: boolean;
    config?: boolean;
    system?: boolean;
  };
  logPaths?: {
    startup?: string;
    app?: string;
  };
  endpoint?: string;
}

/**
 * Create a diagnostics plugin for AI agents
 */
export function createDiagnosticsPlugin(config: DiagnosticsPluginConfig = {}): Plugin {
  const {
    include = { logs: { startup: 100, app: 200 }, health: true, config: true, system: true },
    logPaths = { startup: './logs/startup.log', app: './logs/app.log' },
    endpoint = '/diagnostics/full',
  } = config;

  return {
    id: 'diagnostics',
    name: 'Diagnostics Plugin',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('diagnostics');

      // Register full diagnostics endpoint
      registry.addRoute({
        method: 'get',
        path: endpoint,
        pluginId: 'diagnostics',
        handler: (_req: Request, res: Response) => {
          try {
            const report: Record<string, unknown> = {
              timestamp: new Date().toISOString(),
              generated_for: 'AI Agent Diagnostics',
            };

            // System info
            if (include.system) {
              const memUsage = process.memoryUsage();
              report.system = {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                pid: process.pid,
                cwd: process.cwd(),
                uptime: process.uptime(),
                memory: {
                  rss: formatBytes(memUsage.rss),
                  heapTotal: formatBytes(memUsage.heapTotal),
                  heapUsed: formatBytes(memUsage.heapUsed),
                  external: formatBytes(memUsage.external),
                },
              };
            }

            // Environment check (not values, just presence)
            if (include.config) {
              const envCheck: Record<string, boolean> = {
                NODE_ENV: !!process.env.NODE_ENV,
                DATABASE_URI: !!process.env.DATABASE_URI,
                PAYLOAD_SECRET: !!process.env.PAYLOAD_SECRET,
                LOGFIRE_TOKEN: !!process.env.LOGFIRE_TOKEN,
              };
              report.envCheck = envCheck;
            }

            // Logs
            if (include.logs) {
              const logs: Record<string, string[]> = {};

              if (include.logs.startup && logPaths.startup) {
                logs.startup = readLastNLines(logPaths.startup, include.logs.startup);
              }

              if (include.logs.app && logPaths.app) {
                logs.app = readLastNLines(logPaths.app, include.logs.app);
              }

              // Extract errors
              const allLogs = [...(logs.startup || []), ...(logs.app || [])];
              logs.errors = allLogs.filter((line) => {
                const lower = line.toLowerCase();
                return lower.includes('error') || lower.includes('fatal') || lower.includes('exception');
              });

              report.logs = logs;
            }

            res.json(report);
          } catch (error) {
            res.status(500).json({
              error: 'Failed to generate diagnostics',
              message: error instanceof Error ? error.message : String(error),
            });
          }
        },
      });

      // Register summary diagnostics endpoint
      registry.addRoute({
        method: 'get',
        path: '/diagnostics/summary',
        pluginId: 'diagnostics',
        handler: (_req: Request, res: Response) => {
          try {
            const memUsage = process.memoryUsage();

            res.json({
              status: 'ok',
              timestamp: new Date().toISOString(),
              uptime: process.uptime(),
              memory: {
                heapUsed: formatBytes(memUsage.heapUsed),
                heapTotal: formatBytes(memUsage.heapTotal),
              },
              env: process.env.NODE_ENV || 'development',
            });
          } catch (error) {
            res.status(500).json({
              status: 'error',
              message: error instanceof Error ? error.message : String(error),
            });
          }
        },
      });

      logger.debug('Diagnostics plugin initialized');
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}

/**
 * Read last N lines from a file
 */
function readLastNLines(filePath: string, n: number): string[] {
  const resolvedPath = resolve(filePath);

  if (!existsSync(resolvedPath)) {
    return [`File not found: ${filePath}`];
  }

  try {
    const content = readFileSync(resolvedPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.slice(-n);
  } catch (error) {
    return [`Error reading file: ${error instanceof Error ? error.message : String(error)}`];
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
