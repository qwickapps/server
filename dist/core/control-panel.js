/**
 * Control Panel Core
 *
 * Creates and manages the control panel Express application
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HealthManager } from './health-manager.js';
import { initializeLogging, getControlPanelLogger } from './logging.js';
import { createRouteGuard } from './guards.js';
import { createPluginRegistry, } from './plugin-registry.js';
import { bearerTokenAuth } from '../plugins/api-keys/index.js';
import { createCorePlugin } from '../plugins/core/index.js';
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
}
catch {
    // Keep default version if reading fails
}
/**
 * Infer a descriptive route name from path and method
 * Examples:
 *   /api/logs + GET → query
 *   /api/logs/sources + GET → sources
 *   /api/users/:id + GET → get
 *   /api/users + POST → create
 */
function inferRouteName(path, method, pluginId) {
    // Remove /api prefix and leading/trailing slashes
    let cleanPath = path.replace(/^\/api\//, '').replace(/^\/|\/$/g, '');
    // For non-core plugins, strip the plugin slug prefix from the path
    if (pluginId && pluginId !== 'core' && cleanPath.startsWith(pluginId + '/')) {
        cleanPath = cleanPath.substring(pluginId.length + 1);
    }
    else if (pluginId && pluginId !== 'core' && cleanPath === pluginId) {
        // Handle root path for plugin (e.g., /logs -> '')
        cleanPath = '';
    }
    // Split into segments
    const segments = cleanPath.split('/').filter(Boolean);
    // If path has parameters (e.g., /users/:id), use method-based naming
    if (path.includes(':')) {
        const methodMap = {
            get: 'get',
            post: 'create',
            put: 'update',
            patch: 'update',
            delete: 'delete',
        };
        return methodMap[method.toLowerCase()] || method.toLowerCase();
    }
    // For root paths (plugin root), use 'query' for GET, otherwise method name
    if (segments.length === 0) {
        if (method.toLowerCase() === 'get') {
            return 'query';
        }
        return method.toLowerCase();
    }
    if (segments.length === 1) {
        // Single segment paths like /sources, /health, /info, /invite, /sync, /stats
        // Use the segment name directly for all methods
        const segment = segments[0];
        // Convert hyphens to camelCase (ui-contributions -> uiContributions)
        return segment.replace(/-./g, x => x[1].toUpperCase());
    }
    // Multi-segment paths like /logs/sources - use last segment
    return segments[segments.length - 1];
}
/**
 * Create a control panel instance
 */
export function createControlPanel(options) {
    const { config, plugins = [], logging: loggingConfig } = options;
    // Initialize logging subsystem
    const loggingSubsystem = initializeLogging({
        namespace: config.productName,
        ...loggingConfig,
    });
    // Use provided logger or get one from the logging subsystem
    const logger = options.logger || loggingSubsystem.getRootLogger();
    const app = express();
    const router = express.Router();
    const healthManager = new HealthManager(logger);
    let server = null;
    const startTime = Date.now();
    // Initialize the new plugin registry
    const pluginRegistry = createPluginRegistry(app, router, logger, healthManager, getControlPanelLogger);
    // Security middleware
    app.use(helmet({
        contentSecurityPolicy: false, // Allow inline scripts for simple UI
    }));
    // CORS
    app.use(cors({
        origin: config.cors?.origins || '*',
        credentials: true,
    }));
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
    }
    else {
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
    // Request logging
    app.use((req, _res, next) => {
        logger.debug(`${req.method} ${req.path}`);
        next();
    });
    // CRITICAL: System APIs always mount at /api regardless of mountPath
    // This ensures consistent API paths across all products
    // See: ADR-012-QwickApps-Server-Routing-Architecture
    app.use('/api', router);
    // Built-in routes
    // Core routes (/health, /info, /diagnostics, /ui-contributions, /plugins) have been moved
    // to the core plugin (src/plugins/core/index.ts) so they appear in the API client manifest
    /**
     * GET /api/client-manifest - Route manifest for client code generation
     *
     * Returns all registered API routes with metadata for dynamic client building.
     * Frontend applications can fetch this manifest to auto-generate typed API clients.
     */
    router.get('/client-manifest', (_req, res) => {
        const routes = pluginRegistry.getRoutes();
        // Build manifest with namespaced keys (pluginId.routeName)
        const manifest = {};
        for (const route of routes) {
            // Skip middleware routes (method: 'use')
            if (route.method === 'use') {
                continue;
            }
            const pluginId = route.pluginId || 'core';
            const routeName = inferRouteName(route.path, route.method, pluginId);
            const key = `${pluginId}.${routeName}`;
            manifest[key] = {
                method: route.method.toUpperCase(),
                path: `/api${route.path}`,
                auth: route.auth?.required || false,
            };
        }
        res.json({ routes: manifest, version: '1.0' });
    });
    /**
     * Serve dashboard UI at the configured mount path
     *
     * ONLY serves the React SPA from dist-ui. No HTML fallback.
     */
    if (!config.disableDashboard) {
        // Use customUiPath if provided, otherwise fall back to package's dist-ui
        const effectiveUiPath = config.customUiPath || uiDistPath;
        const hasRichUI = existsSync(effectiveUiPath);
        if (!hasRichUI) {
            logger.error(`React UI not found at ${effectiveUiPath}. Control panel UI will not be available.`);
            logger.error(`Build the UI first: cd packages/qwickapps-server && npm run build:ui`);
        }
        else {
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
            const getIndexHtml = (req) => {
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
            app.get(spaFallbackPath, (req, res, next) => {
                // Skip API routes (always at /api)
                if (req.path.startsWith('/api')) {
                    return next();
                }
                res.type('html').send(getIndexHtml(req));
            });
            // Also serve the mount path root
            if (mountPath !== '/') {
                app.get(mountPath, (req, res) => {
                    res.type('html').send(getIndexHtml(req));
                });
            }
        }
    }
    // Serve landing page at root (/) when control panel is mounted elsewhere
    if (mountPath !== '/' && config.landingPage !== false) {
        const landingConfig = config.landingPage || {};
        app.get('/', (_req, res) => {
            const html = generateLandingPageHtml({
                productName: config.productName,
                title: landingConfig.title || config.productName,
                heading: landingConfig.heading || `Welcome to ${config.productName}`,
                description: landingConfig.description || `${config.productName} is running.`,
                controlPanelPath: mountPath,
                links: landingConfig.links,
            });
            res.type('html').send(html);
        });
    }
    // Start a plugin with the registry
    const startPlugin = async (plugin, pluginConfig = {}) => {
        return pluginRegistry.startPlugin(plugin, pluginConfig);
    };
    // Get diagnostics report
    const getDiagnostics = () => {
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
    const start = async () => {
        // Start core plugin first (registers /info, /health, /diagnostics, etc.)
        const corePlugin = createCorePlugin({
            config,
            startTime,
            healthManager,
            getDiagnostics,
        });
        const coreSuccess = await pluginRegistry.startPlugin(corePlugin, {});
        if (!coreSuccess) {
            logger.error('Failed to start core plugin');
        }
        // Start initial plugins via registry
        for (const { plugin, config: pluginConfig } of plugins) {
            const success = await pluginRegistry.startPlugin(plugin, pluginConfig || {});
            if (!success) {
                // Retrieve error details from registry for better debugging
                const pluginInfo = pluginRegistry.listPlugins().find(p => p.id === plugin.id);
                const errorDetails = pluginInfo?.error || 'Unknown error';
                logger.error(`Failed to start plugin: ${plugin.id}`, { error: errorDetails });
            }
        }
        // Register all routes with automatic ordering by path specificity
        const routes = pluginRegistry.getRoutes();
        // Sort routes by path specificity (longest first, wildcards last)
        routes.sort((a, b) => {
            // Wildcards last
            const aWild = a.path.includes('*') ? 1 : 0;
            const bWild = b.path.includes('*') ? 1 : 0;
            if (aWild !== bWild)
                return aWild - bWild;
            // Longer paths first (more specific)
            return b.path.length - a.path.length;
        });
        // Register routes with Express router (mounted at apiBasePath)
        logger.debug(`Registering ${routes.length} routes in priority order:`);
        for (const route of routes) {
            const handlers = [];
            // Add auth middleware if route requires it
            if (route.auth?.required) {
                handlers.push(bearerTokenAuth({
                    allowedKeyTypes: ['m2m'], // M2M keys for authenticated routes
                    requiredScopes: [], // No specific scopes required for now
                }));
            }
            handlers.push(route.handler);
            switch (route.method) {
                case 'get':
                    router.get(route.path, ...handlers);
                    break;
                case 'post':
                    router.post(route.path, ...handlers);
                    break;
                case 'put':
                    router.put(route.path, ...handlers);
                    break;
                case 'delete':
                    router.delete(route.path, ...handlers);
                    break;
                case 'patch':
                    router.patch(route.path, ...handlers);
                    break;
                case 'use':
                    router.use(route.path, ...handlers);
                    break;
            }
            logger.debug(`  ${route.method.toUpperCase()} /api${route.path}`);
        }
        return new Promise((resolve) => {
            server = app.listen(config.port, () => {
                logger.debug(`Control panel listening on port ${config.port}`);
                resolve();
            });
        });
    };
    // Stop server
    const stop = async () => {
        // Stop all plugins via registry
        await pluginRegistry.stopAllPlugins();
        // Shutdown health manager
        healthManager.shutdown();
        // Close server
        if (server) {
            return new Promise((resolve) => {
                server.close(() => {
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
 * Generate landing page HTML for root path
 */
function generateLandingPageHtml(options) {
    const { productName, title, heading, description, controlPanelPath, links = [] } = options;
    const linksHtml = links
        .map((link) => `<a href="${link.url}" class="link">${link.label}</a>`)
        .join('');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      max-width: 600px;
      padding: 2rem;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 20px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      color: #94a3b8;
      font-size: 1.125rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .link {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      text-decoration: none;
      border-radius: 0.75rem;
      font-weight: 600;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .link:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
    }
    .footer {
      margin-top: 3rem;
      color: #475569;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">${productName.charAt(0)}</div>
    <h1>${heading}</h1>
    <p>${description}</p>
    <div class="links">${linksHtml}</div>
    <div class="footer">
      Powered by QwickApps Server
    </div>
  </div>
</body>
</html>`;
}
//# sourceMappingURL=control-panel.js.map