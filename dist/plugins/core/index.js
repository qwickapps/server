/**
 * Core Plugin - System Routes
 *
 * Registers core control panel routes (/info, /health, /ui-contributions, etc.)
 * as a system plugin so they appear in the API client manifest.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export function createCorePlugin(deps) {
    const { config, startTime, healthManager, getDiagnostics } = deps;
    return {
        id: 'core',
        name: 'Core',
        version: '1.0.0',
        type: 'system', // System plugin - no slug prefix
        async onStart(_config, registry) {
            /**
             * GET /api/health - Aggregated health status
             */
            registry.addRoute({
                method: 'get',
                path: '/health',
                handler: (_req, res) => {
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
                handler: (_req, res) => {
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
                handler: (_req, res) => {
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
                handler: (_req, res) => {
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
                handler: (_req, res) => {
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
                handler: (req, res) => {
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
        async onStop() {
            // No cleanup needed
        },
    };
}
//# sourceMappingURL=index.js.map