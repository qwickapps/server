/**
 * Control Panel Core
 *
 * Creates and manages the control panel Express application
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import express, { type Application, type Router, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HealthManager } from './health-manager.js';
import { initializeLogging, getControlPanelLogger, type LoggingConfig } from './logging.js';
import { createRouteGuard } from './guards.js';
import type {
  ControlPanelConfig,
  ControlPanelInstance,
  DiagnosticsReport,
  HealthCheck,
  Logger,
} from './types.js';
import {
  createPluginRegistry,
  type Plugin,
  type PluginConfig,
  type PluginRegistryImpl,
} from './plugin-registry.js';

// Get the package root directory for serving UI assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Handle both src/core and dist/core paths - go up to find package root
const packageRoot = __dirname.includes('/src/')
  ? join(__dirname, '..', '..')
  : join(__dirname, '..', '..');
const uiDistPath = join(packageRoot, 'dist-ui');

// Read @qwickapps/server package version
let frameworkVersion = '1.0.0';
try {
  const packageJsonPath = join(packageRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    frameworkVersion = packageJson.version || '1.0.0';
  }
} catch {
  // Keep default version if reading fails
}

export interface CreateControlPanelOptions {
  config: ControlPanelConfig;
  /** Plugins to start with the control panel */
  plugins?: Array<{ plugin: Plugin; config?: PluginConfig }>;
  logger?: Logger;
  /** Logging configuration */
  logging?: LoggingConfig;
}

/**
 * Create a control panel instance
 */
export function createControlPanel(options: CreateControlPanelOptions): ControlPanelInstance {
  const { config, plugins = [], logging: loggingConfig } = options;

  // Initialize logging subsystem
  const loggingSubsystem = initializeLogging({
    namespace: config.productName,
    ...loggingConfig,
  });

  // Use provided logger or get one from the logging subsystem
  const logger = options.logger || loggingSubsystem.getRootLogger();

  const app: Application = express();
  const router: Router = express.Router();
  const healthManager = new HealthManager(logger);
  let server: ReturnType<typeof app.listen> | null = null;
  const startTime = Date.now();

  // Initialize the new plugin registry
  const pluginRegistry = createPluginRegistry(
    app,
    router,
    logger,
    healthManager,
    getControlPanelLogger
  );

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allow inline scripts for simple UI
    })
  );

  // CORS
  app.use(
    cors({
      origin: config.cors?.origins || '*',
      credentials: true,
    })
  );

  // Body parsing (skip for specified paths to allow proxy middleware to work)
  const skipBodyParserPaths = config.skipBodyParserPaths || [];
  if (skipBodyParserPaths.length > 0) {
    app.use((req, res, next) => {
      // Skip body parsing for specified paths (useful for proxy middleware)
      if (skipBodyParserPaths.some(path => req.path.startsWith(path))) {
        return next();
      }
      express.json()(req, res, next);
    });
  } else {
    app.use(express.json());
  }
  app.use(compression());

  // Get mount path (defaults to /cpanel)
  const mountPath = config.mountPath || '/cpanel';

  // Apply route guard if configured - only to the control panel mount path
  if (config.guard && config.guard.type !== 'none') {
    const guardMiddleware = createRouteGuard(config.guard);
    // Only protect the control panel path, not the root or other paths
    app.use(mountPath, guardMiddleware);
  }
  const apiBasePath = mountPath === '/' ? '/api' : `${mountPath}/api`;

  // Request logging
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // Mount router at the configured path
  app.use(apiBasePath, router);

  // Built-in routes

  /**
   * GET /api/health - Aggregated health status
   */
  router.get('/health', (_req: Request, res: Response) => {
    const results = healthManager.getResults();
    const status = healthManager.getAggregatedStatus();
    const uptime = Date.now() - startTime;

    res.status(status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      uptime,
      checks: results,
    });
  });

  /**
   * GET /api/info - Product information
   */
  router.get('/info', (_req: Request, res: Response) => {
    res.json({
      product: config.productName,
      logoName: config.logoName || config.productName,
      logoIconUrl: config.logoIconUrl,
      version: config.version || 'unknown',
      uptime: Date.now() - startTime,
      links: config.links || [],
      branding: config.branding || {},
    });
  });

  /**
   * GET /api/diagnostics - Full diagnostics for AI agents
   */
  router.get('/diagnostics', (_req: Request, res: Response) => {
    const report = getDiagnostics();
    res.json(report);
  });

  /**
   * GET /api/ui-contributions - UI contributions from all plugins
   *
   * Returns menu items, pages, and widgets registered by plugins.
   * Used by the React UI to build dynamic navigation and pages.
   */
  router.get('/ui-contributions', (_req: Request, res: Response) => {
    res.json({
      menuItems: pluginRegistry.getMenuItems(),
      pages: pluginRegistry.getPages(),
      widgets: pluginRegistry.getWidgets(),
      plugins: pluginRegistry.listPlugins(),
    });
  });

  /**
   * GET /api/plugins - List all registered plugins with contribution counts
   */
  router.get('/plugins', (_req: Request, res: Response) => {
    const plugins = pluginRegistry.listPlugins().map((plugin) => {
      const contributions = pluginRegistry.getPluginContributions(plugin.id);
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
  });

  /**
   * GET /api/plugins/:id - Get detailed plugin info with contributions
   */
  router.get('/plugins/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const plugins = pluginRegistry.listPlugins();
    const plugin = plugins.find((p) => p.id === id);

    if (!plugin) {
      res.status(404).json({ error: `Plugin not found: ${id}` });
      return;
    }

    const contributions = pluginRegistry.getPluginContributions(id);
    res.json({
      ...plugin,
      contributions,
    });
  });

  /**
   * Serve dashboard UI at the configured mount path
   *
   * Priority:
   * 1. If useRichUI is true and dist-ui exists, serve React SPA
   * 2. Otherwise serve simple static HTML dashboard
   */
  if (!config.disableDashboard) {
    // Use customUiPath if provided, otherwise fall back to package's dist-ui
    const effectiveUiPath = config.customUiPath || uiDistPath;
    const hasRichUI = existsSync(effectiveUiPath);
    const useRichUI = config.useRichUI !== false && hasRichUI;

    logger.debug(`Dashboard config: mountPath=${mountPath}, effectiveUiPath=${effectiveUiPath}, hasRichUI=${hasRichUI}, useRichUI=${useRichUI}`);

    if (useRichUI) {
      logger.debug(`Serving React UI from ${effectiveUiPath}`);

      // Read index.html template
      const indexHtmlPath = join(effectiveUiPath, 'index.html');
      const indexHtmlTemplate = readFileSync(indexHtmlPath, 'utf-8');

      /**
       * Get index.html with the base path injected.
       *
       * The server injects the base path as window.__APP_BASE_PATH__ so the React app
       * can read it at runtime without complex detection logic. This is the standard
       * pattern used by frameworks like Next.js (__NEXT_DATA__).
       *
       * When served behind a gateway proxy, use X-Forwarded-Prefix to determine
       * the public path for assets and the React Router basename.
       */
      const getIndexHtml = (req: Request): string => {
        // Determine the effective public path:
        // - If X-Forwarded-Prefix header is set (proxied), use that
        // - Otherwise, use the configured mountPath
        const forwardedPrefix = req.get('X-Forwarded-Prefix');
        const effectivePath = forwardedPrefix || mountPath;
        const normalizedPath = effectivePath === '/' ? '' : effectivePath;

        // Inject base path as global variable before other scripts
        const basePathScript = `<script>window.__APP_BASE_PATH__="${normalizedPath}";</script>`;
        let html = indexHtmlTemplate.replace('<head>', `<head>\n    ${basePathScript}`);

        // Rewrite asset paths if mounted at a subpath
        if (normalizedPath) {
          html = html.replace(/src="\/assets\//g, `src="${normalizedPath}/assets/`);
          html = html.replace(/href="\/assets\//g, `href="${normalizedPath}/assets/`);
        }

        return html;
      };

      // Serve static assets from dist-ui at the mount path
      // Disable index: false to prevent serving index.html automatically
      // We handle index.html separately with rewritten asset paths
      app.use(mountPath, express.static(effectiveUiPath, { index: false }));

      // SPA fallback - serve index.html for all non-API routes under the mount path
      const spaFallbackPath = mountPath === '/' ? '/*' : `${mountPath}/*`;
      app.get(spaFallbackPath, (req: Request, res: Response, next) => {
        // Skip API routes
        if (req.path.startsWith(apiBasePath)) {
          return next();
        }
        res.type('html').send(getIndexHtml(req));
      });

      // Also serve the mount path root
      if (mountPath !== '/') {
        app.get(mountPath, (req: Request, res: Response) => {
          res.type('html').send(getIndexHtml(req));
        });
      }
    } else {
      logger.debug(`Serving basic HTML dashboard`);
      const dashboardPath = mountPath === '/' ? '/' : mountPath;
      app.get(dashboardPath, (_req: Request, res: Response) => {
        const html = generateDashboardHtml(config, healthManager.getResults(), mountPath);
        res.type('html').send(html);
      });
    }
  }

  // Start a plugin with the registry
  const startPlugin = async (plugin: Plugin, pluginConfig: PluginConfig = {}): Promise<boolean> => {
    return pluginRegistry.startPlugin(plugin, pluginConfig);
  };

  // Get diagnostics report
  const getDiagnostics = (): DiagnosticsReport => {
    const memUsage = process.memoryUsage();

    return {
      timestamp: new Date().toISOString(),
      product: config.productName,
      version: config.version,
      frameworkVersion,
      uptime: Date.now() - startTime,
      health: healthManager.getResults(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: memUsage.heapTotal,
          used: memUsage.heapUsed,
          free: memUsage.heapTotal - memUsage.heapUsed,
        },
        cpu: {
          usage: 0, // Would need os.cpus() for real measurement
        },
      },
    };
  };

  // Start server
  const start = async (): Promise<void> => {
    // Start initial plugins via registry
    for (const { plugin, config: pluginConfig } of plugins) {
      const success = await pluginRegistry.startPlugin(plugin, pluginConfig || {});
      if (!success) {
        logger.error(`Failed to start plugin: ${plugin.id}`);
      }
    }

    return new Promise((resolve) => {
      server = app.listen(config.port, () => {
        logger.debug(`Control panel listening on port ${config.port}`);
        resolve();
      });
    });
  };

  // Stop server
  const stop = async (): Promise<void> => {
    // Stop all plugins via registry
    await pluginRegistry.stopAllPlugins();

    // Shutdown health manager
    healthManager.shutdown();

    // Close server
    if (server) {
      return new Promise((resolve) => {
        server!.close(() => {
          logger.debug('Control panel stopped');
          resolve();
        });
      });
    }
  };

  return {
    app,
    start,
    stop,
    startPlugin,
    getHealthStatus: () => healthManager.getResults(),
    getDiagnostics,
    getPluginRegistry: () => pluginRegistry,
  };
}

/**
 * Generate simple dashboard HTML
 */
function generateDashboardHtml(
  config: ControlPanelConfig,
  health: Record<string, { status: string; latency?: number; lastChecked: Date }>,
  mountPath: string = '/cpanel'
): string {
  const apiBasePath = mountPath === '/' ? '/api' : `${mountPath}/api`;
  const healthEntries = Object.entries(health);
  const overallStatus = healthEntries.every((e) => e[1].status === 'healthy')
    ? 'healthy'
    : healthEntries.some((e) => e[1].status === 'unhealthy')
    ? 'unhealthy'
    : 'degraded';

  const statusColor =
    overallStatus === 'healthy' ? '#22c55e' : overallStatus === 'degraded' ? '#f59e0b' : '#ef4444';

  const linksHtml = (config.links || [])
    .map(
      (link) =>
        `<a href="${link.url}" ${link.external ? 'target="_blank"' : ''} class="link">${link.label}</a>`
    )
    .join('');

  const healthHtml = healthEntries
    .map(
      ([name, result]) => `
      <div class="health-item">
        <span class="status-dot" style="background-color: ${
          result.status === 'healthy' ? '#22c55e' : result.status === 'degraded' ? '#f59e0b' : '#ef4444'
        }"></span>
        <span class="name">${name}</span>
        <span class="latency">${result.latency ? `${result.latency}ms` : '-'}</span>
      </div>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.productName} - Control Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #334155;
    }
    h1 { font-size: 1.5rem; color: ${config.branding?.primaryColor || '#6366f1'}; }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: ${statusColor}20;
      color: ${statusColor};
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .card {
      background: #1e293b;
      border-radius: 0.75rem;
      padding: 1.5rem;
      border: 1px solid #334155;
    }
    .card h2 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 1rem;
    }
    .health-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #334155;
    }
    .health-item:last-child { border-bottom: none; }
    .health-item .name { flex: 1; }
    .health-item .latency { color: #64748b; font-size: 0.875rem; }
    .links { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .link {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #334155;
      color: #e2e8f0;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: background 0.2s;
    }
    .link:hover { background: #475569; }
    .api-links { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #334155; }
    .api-links a { color: #6366f1; margin-right: 1.5rem; text-decoration: none; }
    .api-links a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${config.productName} Control Panel</h1>
      <div class="status-badge">
        <span class="status-dot"></span>
        ${overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
      </div>
    </header>

    <div class="cards">
      <div class="card">
        <h2>Health Checks</h2>
        ${healthHtml || '<p style="color: #64748b;">No health checks configured</p>'}
      </div>

      ${
        (config.links || []).length > 0
          ? `
      <div class="card">
        <h2>Quick Links</h2>
        <div class="links">${linksHtml}</div>
      </div>
      `
          : ''
      }
    </div>

    <div class="api-links">
      <strong>API:</strong>
      <a href="${apiBasePath}/health">Health</a>
      <a href="${apiBasePath}/info">Info</a>
      <a href="${apiBasePath}/diagnostics">Diagnostics</a>
    </div>
  </div>

  <script>
    // Auto-refresh health status every 10 seconds
    setTimeout(() => location.reload(), 10000);
  </script>
</body>
</html>`;
}
