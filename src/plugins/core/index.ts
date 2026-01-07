/**
 * Core Plugin - System Routes
 *
 * Registers core control panel routes (/info, /health, /ui-contributions, etc.)
 * as a system plugin so they appear in the API client manifest.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response } from 'express';
import type { Plugin, PluginConfig, PluginRegistry } from '../../core/plugin-registry.js';
import type { HealthManager } from '../../core/health-manager.js';

interface CorePluginDependencies {
  config: {
    productName: string;
    logoName?: string;
    logoIconUrl?: string;
    version?: string;
    links?: Array<{
      label: string;
      url: string;
      icon?: string;
      external?: boolean;
      requiresHealth?: string;
    }>;
    branding?: Record<string, unknown>;
  };
  startTime: number;
  healthManager: HealthManager;
  getDiagnostics: () => unknown;
}

export function createCorePlugin(deps: CorePluginDependencies): Plugin {
  const { config, startTime, healthManager, getDiagnostics } = deps;

  return {
    id: 'core',
    name: 'Core',
    version: '1.0.0',
    type: 'system', // System plugin - no slug prefix

    async onStart(_config: PluginConfig, registry: PluginRegistry): Promise<void> {
      /**
       * GET /api/health - Aggregated health status
       */
      registry.addRoute({
        method: 'get',
        path: '/health',
        handler: (_req: Request, res: Response) => {
          const results = healthManager.getResults();
          const status = healthManager.getAggregatedStatus();
          const uptime = Date.now() - startTime;

          res.status(status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503).json({
            status,
            timestamp: new Date().toISOString(),
            uptime,
            checks: results,
          });
        },
      });

      /**
       * GET /api/info - Product information
       */
      registry.addRoute({
        method: 'get',
        path: '/info',
        handler: (_req: Request, res: Response) => {
          res.json({
            product: config.productName,
            logoName: config.logoName || config.productName,
            logoIconUrl: config.logoIconUrl,
            version: config.version || 'unknown',
            uptime: Date.now() - startTime,
            links: config.links || [],
            branding: config.branding || {},
          });
        },
      });

      /**
       * GET /api/diagnostics - Full diagnostics for AI agents
       */
      registry.addRoute({
        method: 'get',
        path: '/diagnostics',
        handler: (_req: Request, res: Response) => {
          const report = getDiagnostics();
          res.json(report);
        },
      });

      /**
       * GET /api/ui-contributions - UI contributions from all plugins
       */
      registry.addRoute({
        method: 'get',
        path: '/ui-contributions',
        handler: (_req: Request, res: Response) => {
          res.json({
            menuItems: registry.getMenuItems(),
            pages: registry.getPages(),
            widgets: registry.getWidgets(),
            plugins: registry.listPlugins(),
          });
        },
      });

      /**
       * GET /api/plugins - List all registered plugins
       */
      registry.addRoute({
        method: 'get',
        path: '/plugins',
        handler: (_req: Request, res: Response) => {
          const plugins = registry.listPlugins().map((plugin) => {
            const contributions = registry.getPluginContributions(plugin.id);
            return {
              ...plugin,
              contributionCounts: {
                routes: contributions.routes.length,
                menuItems: contributions.menuItems.length,
                pages: contributions.pages.length,
                widgets: contributions.widgets.length,
                hasConfig: !!contributions.config,
              },
            };
          });
          res.json({ plugins });
        },
      });

      /**
       * GET /api/plugins/:id - Get detailed plugin info
       */
      registry.addRoute({
        method: 'get',
        path: '/plugins/:id',
        handler: (req: Request, res: Response) => {
          const { id } = req.params;
          const plugins = registry.listPlugins();
          const plugin = plugins.find((p) => p.id === id);

          if (!plugin) {
            res.status(404).json({ error: `Plugin not found: ${id}` });
            return;
          }

          const contributions = registry.getPluginContributions(id);
          res.json({
            ...plugin,
            contributions,
          });
        },
      });
    },

    async onStop(): Promise<void> {
      // No cleanup needed
    },
  };
}
