/**
 * Plugin Registry - Event-Driven Plugin Architecture v2.0
 *
 * A simple, event-driven plugin system where:
 * - Plugins register in `onStart`, cleanup in `onStop`
 * - Changes are broadcast via events
 * - Plugins react to events via `onPluginEvent`
 *
 * No frozen registries, no complex phases. Just start, events, stop.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// =============================================================================
// Plugin Registry Implementation
// =============================================================================
/**
 * Default timeout for plugin operations (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;
/**
 * Create a timeout promise
 */
function timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms));
}
/**
 * Plugin Registry Implementation
 */
export class PluginRegistryImpl {
    constructor(app, router, logger, healthManager, loggerFactory) {
        this.plugins = new Map();
        this.pluginStatus = new Map();
        this.pluginErrors = new Map();
        this.pluginConfigs = new Map();
        this.pluginSlugs = new Map(); // pluginId -> slug
        this.currentPlugin = null; // Track plugin during onStart
        this.routes = [];
        this.menuItems = [];
        this.pages = [];
        this.widgets = [];
        this.configComponents = [];
        this.eventHandlers = new Set();
        this.app = app;
        this.router = router;
        this.logger = logger;
        this.healthManager = healthManager;
        this.loggerFactory = loggerFactory;
    }
    // ---------------------------------------------------------------------------
    // Plugin queries
    // ---------------------------------------------------------------------------
    hasPlugin(id) {
        return this.plugins.has(id) && this.pluginStatus.get(id) === 'active';
    }
    getPlugin(id) {
        const plugin = this.plugins.get(id);
        if (!plugin || this.pluginStatus.get(id) !== 'active') {
            return null;
        }
        return plugin;
    }
    listPlugins() {
        return Array.from(this.plugins.values()).map((plugin) => ({
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            type: plugin.type || 'regular',
            slug: this.pluginSlugs.get(plugin.id),
            status: this.pluginStatus.get(plugin.id) || 'stopped',
            error: this.pluginErrors.get(plugin.id),
        }));
    }
    // ---------------------------------------------------------------------------
    // Contribution registration
    // ---------------------------------------------------------------------------
    addRoute(route) {
        if (!this.currentPlugin) {
            throw new Error('addRoute can only be called during plugin.onStart()');
        }
        const plugin = this.plugins.get(this.currentPlugin);
        const pluginType = plugin.type || 'regular';
        const originalPath = route.path;
        let fullPath = route.path;
        // Auto-prefix for regular plugins
        if (pluginType === 'regular') {
            const slug = this.pluginSlugs.get(this.currentPlugin);
            // Detect and auto-fix duplicate slug prefix (defensive measure)
            // Example: Plugin 'users' should use prefix '/' not '/users'
            // If configured as '/users', we auto-fix to '/' to prevent /api/users/users
            let normalizedPath = route.path;
            if (route.path.startsWith(`/${slug}/`) || route.path === `/${slug}`) {
                normalizedPath = route.path.substring(slug.length + 1) || '/';
                this.logger.warn(`⚠️  DUPLICATE SLUG PREFIX DETECTED: Plugin '${this.currentPlugin}' configured with prefix='${route.path}'` +
                    `\n   Auto-fixed to prefix='${normalizedPath}' to prevent double-prefixing.` +
                    `\n   Please update plugin configuration to use prefix='${normalizedPath}' instead of prefix='${route.path}'.` +
                    `\n   See: packages/qwickapps-server/src/plugins/*/types.ts for correct prefix documentation.`);
            }
            fullPath = `/${slug}${normalizedPath}`;
        }
        const routeWithMetadata = {
            ...route,
            path: fullPath,
            pluginId: this.currentPlugin,
            originalPath,
        };
        this.routes.push(routeWithMetadata);
        this.logger.debug(`Route registered: ${route.method.toUpperCase()} ${fullPath} by ${this.currentPlugin}` +
            (pluginType === 'regular' ? ` (original: ${originalPath})` : ''));
    }
    addMenuItem(menu) {
        this.menuItems.push(menu);
        this.logger.debug(`Menu item registered: ${menu.label} by ${menu.pluginId}`);
    }
    addPage(page) {
        this.pages.push(page);
        this.logger.debug(`Page registered: ${page.route} by ${page.pluginId}`);
    }
    addWidget(widget) {
        this.widgets.push(widget);
        this.logger.debug(`Widget registered: ${widget.title} by ${widget.pluginId}`);
    }
    addConfigComponent(config) {
        // Only one config component per plugin - warn if replacing
        const existing = this.configComponents.find((c) => c.pluginId === config.pluginId);
        if (existing) {
            this.logger.warn(`Replacing config component for plugin ${config.pluginId}: ${existing.component} → ${config.component}`);
        }
        this.configComponents = this.configComponents.filter((c) => c.pluginId !== config.pluginId);
        this.configComponents.push(config);
        this.logger.debug(`Config component registered: ${config.component} by ${config.pluginId}`);
    }
    // ---------------------------------------------------------------------------
    // Contribution queries
    // ---------------------------------------------------------------------------
    getRoutes() {
        return [...this.routes];
    }
    getMenuItems() {
        return [...this.menuItems].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    }
    getPages() {
        return [...this.pages];
    }
    getWidgets() {
        return [...this.widgets];
    }
    getConfigComponents() {
        return [...this.configComponents];
    }
    getPluginContributions(pluginId) {
        return {
            routes: this.routes
                .filter((r) => r.pluginId === pluginId)
                .map((r) => ({ method: r.method, path: r.path })),
            menuItems: this.menuItems.filter((m) => m.pluginId === pluginId),
            pages: this.pages.filter((p) => p.pluginId === pluginId),
            widgets: this.widgets.filter((w) => w.pluginId === pluginId),
            config: this.configComponents.find((c) => c.pluginId === pluginId),
        };
    }
    // ---------------------------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------------------------
    getConfig(pluginId) {
        return (this.pluginConfigs.get(pluginId) || {});
    }
    async setConfig(pluginId, config) {
        const oldConfig = this.pluginConfigs.get(pluginId) || {};
        const newConfig = { ...oldConfig, ...config };
        this.pluginConfigs.set(pluginId, newConfig);
        // Emit config-changed events for each changed key
        for (const key of Object.keys(config)) {
            const oldValue = oldConfig[key];
            const newValue = config[key];
            if (oldValue !== newValue) {
                this.emit({
                    type: 'plugin:config-changed',
                    pluginId,
                    key,
                    oldValue,
                    newValue,
                });
            }
        }
    }
    // ---------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------
    subscribe(handler) {
        this.eventHandlers.add(handler);
        return () => {
            this.eventHandlers.delete(handler);
        };
    }
    emit(event) {
        // Notify all subscribers
        for (const handler of this.eventHandlers) {
            try {
                const result = handler(event);
                if (result instanceof Promise) {
                    result.catch((err) => {
                        this.logger.error('Event handler error', { error: err.message, event: event.type });
                    });
                }
            }
            catch (err) {
                this.logger.error('Event handler error', { error: err.message, event: event.type });
            }
        }
        // Notify all plugins that implement onPluginEvent
        for (const plugin of this.plugins.values()) {
            if (plugin.onPluginEvent) {
                try {
                    const result = plugin.onPluginEvent(event);
                    if (result instanceof Promise) {
                        result.catch((err) => {
                            this.logger.error(`Plugin ${plugin.id} event handler error`, { error: err.message, event: event.type });
                        });
                    }
                }
                catch (err) {
                    this.logger.error(`Plugin ${plugin.id} event handler error`, { error: err.message, event: event.type });
                }
            }
        }
    }
    // ---------------------------------------------------------------------------
    // Health checks
    // ---------------------------------------------------------------------------
    registerHealthCheck(check) {
        this.healthManager.register(check);
        this.logger.debug(`Health check registered: ${check.name}`);
    }
    // ---------------------------------------------------------------------------
    // Express integration
    // ---------------------------------------------------------------------------
    getApp() {
        return this.app;
    }
    getRouter() {
        return this.router;
    }
    getLogger(pluginId) {
        return this.loggerFactory(pluginId);
    }
    // ---------------------------------------------------------------------------
    // Internal: Health Manager access
    // ---------------------------------------------------------------------------
    getHealthManager() {
        return this.healthManager;
    }
    // ---------------------------------------------------------------------------
    // Slug management (internal)
    // ---------------------------------------------------------------------------
    /**
     * Check if a slug is available
     */
    isSlugAvailable(slug, excludePluginId) {
        for (const [pluginId, existingSlug] of this.pluginSlugs.entries()) {
            if (pluginId !== excludePluginId && existingSlug === slug) {
                return false;
            }
        }
        return true;
    }
    // ---------------------------------------------------------------------------
    // Plugin lifecycle management (internal)
    // ---------------------------------------------------------------------------
    /**
     * Start a plugin with error isolation
     */
    async startPlugin(plugin, config) {
        this.plugins.set(plugin.id, plugin);
        this.pluginConfigs.set(plugin.id, config);
        this.pluginStatus.set(plugin.id, 'starting');
        this.currentPlugin = plugin.id;
        const pluginType = plugin.type || 'regular';
        // Handle slug for regular plugins
        if (pluginType === 'regular') {
            const slug = config.slug || plugin.slug || plugin.id;
            // Validate slug uniqueness
            if (!this.isSlugAvailable(slug, plugin.id)) {
                this.currentPlugin = null;
                const errorMessage = `Slug conflict: "${slug}" already in use`;
                this.pluginStatus.set(plugin.id, 'error');
                this.pluginErrors.set(plugin.id, errorMessage);
                this.logger.error(`Plugin ${plugin.id} failed to start: ${errorMessage}`);
                return false;
            }
            this.pluginSlugs.set(plugin.id, slug);
            this.logger.debug(`Plugin ${plugin.id} registered with slug: ${slug}`);
        }
        try {
            await Promise.race([
                plugin.onStart(config, this),
                timeout(DEFAULT_TIMEOUT),
            ]);
            this.pluginStatus.set(plugin.id, 'active');
            this.pluginErrors.delete(plugin.id);
            this.currentPlugin = null;
            this.emit({
                type: 'plugin:started',
                pluginId: plugin.id,
                plugin,
                config,
            });
            this.logger.debug(`Plugin started: ${plugin.id}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.pluginStatus.set(plugin.id, 'error');
            this.pluginErrors.set(plugin.id, errorMessage);
            this.currentPlugin = null;
            this.emit({
                type: 'plugin:error',
                pluginId: plugin.id,
                error: error instanceof Error ? error : new Error(errorMessage),
            });
            // Log full error with stack trace for debugging
            if (error instanceof Error) {
                this.logger.error(`Plugin ${plugin.id} failed to start: ${errorMessage}`, {
                    error: error.message,
                    stack: error.stack,
                    plugin: plugin.id,
                });
            }
            else {
                this.logger.error(`Plugin ${plugin.id} failed to start: ${errorMessage}`, {
                    error: errorMessage,
                    plugin: plugin.id,
                });
            }
            return false;
        }
    }
    /**
     * Stop a plugin with error isolation
     */
    async stopPlugin(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            return false;
        }
        try {
            await Promise.race([
                plugin.onStop(),
                timeout(DEFAULT_TIMEOUT),
            ]);
            this.pluginStatus.set(pluginId, 'stopped');
            // Remove contributions from this plugin
            this.routes = this.routes.filter((r) => r.pluginId !== pluginId);
            this.menuItems = this.menuItems.filter((m) => m.pluginId !== pluginId);
            this.pages = this.pages.filter((p) => p.pluginId !== pluginId);
            this.widgets = this.widgets.filter((w) => w.pluginId !== pluginId);
            this.configComponents = this.configComponents.filter((c) => c.pluginId !== pluginId);
            this.emit({
                type: 'plugin:stopped',
                pluginId,
            });
            this.logger.debug(`Plugin stopped: ${pluginId}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Plugin ${pluginId} failed to stop cleanly`, { error: errorMessage });
            // Still mark as stopped
            this.pluginStatus.set(pluginId, 'stopped');
            this.emit({ type: 'plugin:stopped', pluginId });
            return false;
        }
    }
    /**
     * Stop all plugins (in reverse order they were started)
     */
    async stopAllPlugins() {
        const pluginIds = Array.from(this.plugins.keys()).reverse();
        for (const pluginId of pluginIds) {
            await this.stopPlugin(pluginId);
        }
    }
}
// =============================================================================
// Singleton and Factory
// =============================================================================
let registryInstance = null;
/**
 * Create and initialize the plugin registry
 */
export function createPluginRegistry(app, router, logger, healthManager, loggerFactory) {
    registryInstance = new PluginRegistryImpl(app, router, logger, healthManager, loggerFactory);
    return registryInstance;
}
/**
 * Get the plugin registry singleton
 */
export function getPluginRegistry() {
    if (!registryInstance) {
        throw new Error('Plugin registry not initialized. Call createPluginRegistry first.');
    }
    return registryInstance;
}
/**
 * Check if plugin registry is initialized
 */
export function hasPluginRegistry() {
    return registryInstance !== null;
}
/**
 * Reset the plugin registry (for testing)
 */
export function resetPluginRegistry() {
    registryInstance = null;
}
//# sourceMappingURL=plugin-registry.js.map