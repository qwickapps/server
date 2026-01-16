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
import type { RequestHandler, Application, Router } from 'express';
import type { Logger, HealthCheck } from './types.js';
import { HealthManager } from './health-manager.js';
/**
 * Events that plugins can react to
 */
export type PluginEvent = {
    type: 'plugin:started';
    pluginId: string;
    plugin: Plugin;
    config: unknown;
} | {
    type: 'plugin:stopped';
    pluginId: string;
} | {
    type: 'plugin:config-changed';
    pluginId: string;
    key: string;
    oldValue: unknown;
    newValue: unknown;
} | {
    type: 'plugin:error';
    pluginId: string;
    error: Error;
};
/**
 * Event handler type
 */
export type PluginEventHandler = (event: PluginEvent) => void | Promise<void>;
/**
 * Plugin configuration passed to onStart
 */
export interface PluginConfig {
    [key: string]: unknown;
}
/**
 * Plugin info for listing
 */
export interface PluginInfo {
    id: string;
    name: string;
    version?: string;
    type: PluginType;
    slug?: string;
    status: 'starting' | 'active' | 'stopped' | 'error';
    error?: string;
}
/**
 * Plugin type determines routing capabilities
 * - regular: Can only handle routes under their slug prefix (e.g., /mcp/*)
 * - system: Can handle any path (e.g., /*, /auth/*)
 */
export type PluginType = 'regular' | 'system';
/**
 * Plugin scope definition for API key authorization
 */
export interface PluginScope {
    /** Scope name in format 'plugin-id:action' (e.g., 'qwickbrain:execute') */
    name: string;
    /** Human-readable description for UI */
    description: string;
    /** Optional category for grouping (read, write, admin) */
    category?: 'read' | 'write' | 'admin';
}
/**
 * The Plugin interface - simple lifecycle with event handling
 */
export interface Plugin {
    /** Unique plugin identifier */
    id: string;
    /** Human-readable plugin name */
    name: string;
    /** Plugin version (semver) */
    version?: string;
    /**
     * Plugin type determines routing capabilities
     * - regular: Must use slug prefix for all routes
     * - system: Can register routes at any path
     * Default: 'regular'
     */
    type?: PluginType;
    /**
     * Default slug for regular plugins (path prefix for routes)
     * Example: 'mcp' makes routes available under /mcp/*
     * Can be overridden via plugin config
     * Ignored for system plugins
     */
    slug?: string;
    /**
     * Scopes that this plugin declares for API key authorization
     * Format: 'plugin-id:action' (e.g., 'qwickbrain:execute')
     *
     * Scopes are registered automatically when the plugin starts and
     * can be assigned to API keys for fine-grained access control.
     */
    scopes?: PluginScope[];
    /**
     * Configuration options for this plugin
     */
    configurable?: {
        /** Allow users to customize the slug via UI */
        slug?: boolean;
    };
    /**
     * Called when the plugin starts.
     * Initialize resources, register routes/UI contributions here.
     * Check dependencies with registry.hasPlugin().
     */
    onStart(config: PluginConfig, registry: PluginRegistry): Promise<void>;
    /**
     * Called when the plugin stops.
     * Clean up resources here.
     */
    onStop(): Promise<void>;
    /**
     * React to system events (optional).
     * Called when other plugins start/stop, configs change, or errors occur.
     */
    onPluginEvent?(event: PluginEvent): Promise<void>;
}
/**
 * Menu item contribution for sidebar/navigation
 */
export interface MenuContribution {
    /** Unique ID for this menu item */
    id: string;
    /** Display label */
    label: string;
    /** Icon name (e.g., 'users', 'settings', 'ban') */
    icon?: string;
    /** Route path this menu item links to */
    route: string;
    /** Display order (lower = higher) */
    order?: number;
    /** Badge to display (static string or API endpoint) */
    badge?: string | {
        api: string;
    };
    /** Parent menu ID for submenus */
    parent?: string;
    /** Plugin ID that contributed this */
    pluginId: string;
}
/**
 * Page contribution for control panel
 */
export interface PageContribution {
    /** Unique ID for this page */
    id: string;
    /** Route path (e.g., '/users', '/bans/:id') */
    route: string;
    /** Component name to render (matched by frontend) */
    component: string;
    /** Page title */
    title?: string;
    /** Plugin ID that contributed this */
    pluginId: string;
}
/**
 * Widget contribution for dashboards and pages
 */
export interface WidgetContribution {
    /** Unique ID for this widget */
    id: string;
    /** Widget title */
    title: string;
    /** Component name to render (matched by frontend widget registry) */
    component: string;
    /**
     * Widget type/category - determines which page(s) can display this widget
     * - 'status': System health, service status, monitoring metrics (Dashboard)
     * - 'maintenance': Operational tasks like seeding, service control, config (Maintenance page)
     * - 'analytics': Charts, graphs, usage metrics (Dashboard or Analytics page)
     * - 'monitoring': Performance, logs, real-time data (Monitoring page)
     * - 'custom': Custom widgets for specific use cases
     */
    type: 'status' | 'maintenance' | 'analytics' | 'monitoring' | 'custom';
    /** Priority for ordering (lower = first, default: 100) */
    priority?: number;
    /**
     * Whether this widget is shown by default on its page (default: false)
     * true = widget appears by default in the initial layout
     * false = widget is available but admin must add it manually
     */
    showByDefault?: boolean;
    /** Default size */
    defaultSize?: {
        width: number;
        height: number;
    };
    /** Plugin ID that contributed this */
    pluginId: string;
}
/**
 * Auth configuration for routes
 */
export interface RouteAuthConfig {
    /** Whether authentication is required */
    required: boolean;
    /** Allowed roles (if auth required) */
    roles?: string[];
    /** Paths to exclude from auth (for middleware routes using 'use' method) */
    excludePaths?: string[];
}
/**
 * Route definition for API routes
 */
export interface RouteDefinition {
    /** HTTP method (including 'use' for middleware) */
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'use';
    /** Route path (will be auto-prefixed with slug for regular plugins) */
    path: string;
    /** Request handler */
    handler: RequestHandler;
    /** Authentication configuration */
    auth?: RouteAuthConfig;
    /** Plugin ID that contributed this (set automatically) */
    pluginId?: string;
    /** Original path before slug prefixing (set automatically) */
    originalPath?: string;
}
/**
 * Configuration UI contribution for plugin settings
 */
export interface ConfigContribution {
    /** Unique ID for this config contribution */
    id: string;
    /** React component name to render (matched by frontend registry) */
    component: string;
    /** Display title for the config section */
    title?: string;
    /** Plugin ID that contributed this */
    pluginId: string;
}
/**
 * Aggregated contributions for a specific plugin
 */
export interface PluginContributions {
    routes: Array<{
        method: string;
        path: string;
    }>;
    menuItems: MenuContribution[];
    pages: PageContribution[];
    widgets: WidgetContribution[];
    config?: ConfigContribution;
}
/**
 * The Plugin Registry - a directory for plugins and their contributions
 *
 * Not frozen, mutable anytime. Query plugins, register contributions,
 * subscribe to events.
 */
export interface PluginRegistry {
    /** Check if a plugin is registered and active */
    hasPlugin(id: string): boolean;
    /** Get a plugin by ID (cast to your expected type) */
    getPlugin<T extends Plugin = Plugin>(id: string): T | null;
    /** List all registered plugins */
    listPlugins(): PluginInfo[];
    /** Register an API route */
    addRoute(route: RouteDefinition): void;
    /** Register a menu item */
    addMenuItem(menu: MenuContribution): void;
    /** Register a page */
    addPage(page: PageContribution): void;
    /** Register a widget */
    addWidget(widget: WidgetContribution): void;
    /** Register a config component for plugin settings UI */
    addConfigComponent(config: ConfigContribution): void;
    /** Get all registered routes */
    getRoutes(): RouteDefinition[];
    /** Get all menu items */
    getMenuItems(): MenuContribution[];
    /** Get all pages */
    getPages(): PageContribution[];
    /** Get all widgets */
    getWidgets(): WidgetContribution[];
    /** Get all config components */
    getConfigComponents(): ConfigContribution[];
    /** Get all contributions for a specific plugin */
    getPluginContributions(pluginId: string): PluginContributions;
    /** Get plugin configuration */
    getConfig<T = PluginConfig>(pluginId: string): T;
    /** Update plugin configuration (emits plugin:config-changed event) */
    setConfig<T = PluginConfig>(pluginId: string, config: Partial<T>): Promise<void>;
    /** Subscribe to plugin events, returns unsubscribe function */
    subscribe(handler: PluginEventHandler): () => void;
    /** Emit an event to all subscribers and plugins */
    emit(event: PluginEvent): void;
    /** Register a health check */
    registerHealthCheck(check: HealthCheck): void;
    /** Get the Express app (for advanced use cases) */
    getApp(): Application;
    /** Get the Express router (for advanced use cases) */
    getRouter(): Router;
    /** Get the logger for a plugin */
    getLogger(pluginId: string): Logger;
}
/**
 * Plugin Registry Implementation
 */
export declare class PluginRegistryImpl implements PluginRegistry {
    private plugins;
    private pluginStatus;
    private pluginErrors;
    private pluginConfigs;
    private pluginSlugs;
    private currentPlugin;
    private routes;
    private menuItems;
    private pages;
    private widgets;
    private configComponents;
    private eventHandlers;
    private app;
    private router;
    private logger;
    private healthManager;
    private loggerFactory;
    constructor(app: Application, router: Router, logger: Logger, healthManager: HealthManager, loggerFactory: (name: string) => Logger);
    hasPlugin(id: string): boolean;
    getPlugin<T extends Plugin = Plugin>(id: string): T | null;
    listPlugins(): PluginInfo[];
    addRoute(route: RouteDefinition): void;
    addMenuItem(menu: MenuContribution): void;
    addPage(page: PageContribution): void;
    addWidget(widget: WidgetContribution): void;
    addConfigComponent(config: ConfigContribution): void;
    getRoutes(): RouteDefinition[];
    getMenuItems(): MenuContribution[];
    getPages(): PageContribution[];
    getWidgets(): WidgetContribution[];
    getConfigComponents(): ConfigContribution[];
    getPluginContributions(pluginId: string): PluginContributions;
    getConfig<T = PluginConfig>(pluginId: string): T;
    setConfig<T = PluginConfig>(pluginId: string, config: Partial<T>): Promise<void>;
    subscribe(handler: PluginEventHandler): () => void;
    emit(event: PluginEvent): void;
    registerHealthCheck(check: HealthCheck): void;
    getApp(): Application;
    getRouter(): Router;
    getLogger(pluginId: string): Logger;
    getHealthManager(): HealthManager;
    /**
     * Check if a slug is available
     */
    private isSlugAvailable;
    /**
     * Start a plugin with error isolation
     */
    startPlugin(plugin: Plugin, config: PluginConfig): Promise<boolean>;
    /**
     * Stop a plugin with error isolation
     */
    stopPlugin(pluginId: string): Promise<boolean>;
    /**
     * Stop all plugins (in reverse order they were started)
     */
    stopAllPlugins(): Promise<void>;
}
/**
 * Create and initialize the plugin registry
 */
export declare function createPluginRegistry(app: Application, router: Router, logger: Logger, healthManager: HealthManager, loggerFactory: (name: string) => Logger): PluginRegistryImpl;
/**
 * Get the plugin registry singleton
 */
export declare function getPluginRegistry(): PluginRegistry;
/**
 * Check if plugin registry is initialized
 */
export declare function hasPluginRegistry(): boolean;
/**
 * Reset the plugin registry (for testing)
 */
export declare function resetPluginRegistry(): void;
//# sourceMappingURL=plugin-registry.d.ts.map