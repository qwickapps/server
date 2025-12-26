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

// =============================================================================
// Plugin Event Types
// =============================================================================

/**
 * Events that plugins can react to
 */
export type PluginEvent =
  | { type: 'plugin:started'; pluginId: string; plugin: Plugin; config: unknown }
  | { type: 'plugin:stopped'; pluginId: string }
  | { type: 'plugin:config-changed'; pluginId: string; key: string; oldValue: unknown; newValue: unknown }
  | { type: 'plugin:error'; pluginId: string; error: Error };

/**
 * Event handler type
 */
export type PluginEventHandler = (event: PluginEvent) => void | Promise<void>;

// =============================================================================
// Plugin Interface
// =============================================================================

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
  slug?: string;  // Current slug (may be customized)
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

// =============================================================================
// UI Contribution Types
// =============================================================================

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
  badge?: string | { api: string };
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
 * Widget contribution for dashboards
 */
export interface WidgetContribution {
  /** Unique ID for this widget */
  id: string;
  /** Widget title */
  title: string;
  /** Component name to render (matched by frontend widget registry) */
  component: string;
  /** Priority for ordering (lower = first, default: 100) */
  priority?: number;
  /** Whether this widget is shown by default (default: false) */
  showByDefault?: boolean;
  /** Default size */
  defaultSize?: { width: number; height: number };
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
  routes: Array<{ method: string; path: string }>;
  menuItems: MenuContribution[];
  pages: PageContribution[];
  widgets: WidgetContribution[];
  config?: ConfigContribution;
}

// =============================================================================
// Plugin Registry Interface
// =============================================================================

/**
 * The Plugin Registry - a directory for plugins and their contributions
 *
 * Not frozen, mutable anytime. Query plugins, register contributions,
 * subscribe to events.
 */
export interface PluginRegistry {
  // ---------------------------------------------------------------------------
  // Plugin queries
  // ---------------------------------------------------------------------------

  /** Check if a plugin is registered and active */
  hasPlugin(id: string): boolean;

  /** Get a plugin by ID (cast to your expected type) */
  getPlugin<T extends Plugin = Plugin>(id: string): T | null;

  /** List all registered plugins */
  listPlugins(): PluginInfo[];

  // ---------------------------------------------------------------------------
  // Contribution registration
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Contribution queries
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  /** Get plugin configuration */
  getConfig<T = PluginConfig>(pluginId: string): T;

  /** Update plugin configuration (emits plugin:config-changed event) */
  setConfig<T = PluginConfig>(pluginId: string, config: Partial<T>): Promise<void>;

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /** Subscribe to plugin events, returns unsubscribe function */
  subscribe(handler: PluginEventHandler): () => void;

  /** Emit an event to all subscribers and plugins */
  emit(event: PluginEvent): void;

  // ---------------------------------------------------------------------------
  // Health checks
  // ---------------------------------------------------------------------------

  /** Register a health check */
  registerHealthCheck(check: HealthCheck): void;

  // ---------------------------------------------------------------------------
  // Express integration
  // ---------------------------------------------------------------------------

  /** Get the Express app (for advanced use cases) */
  getApp(): Application;

  /** Get the Express router (for advanced use cases) */
  getRouter(): Router;

  /** Get the logger for a plugin */
  getLogger(pluginId: string): Logger;
}

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
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
}

/**
 * Plugin Registry Implementation
 */
export class PluginRegistryImpl implements PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private pluginStatus = new Map<string, PluginInfo['status']>();
  private pluginErrors = new Map<string, string>();
  private pluginConfigs = new Map<string, PluginConfig>();
  private pluginSlugs = new Map<string, string>();  // pluginId -> slug
  private currentPlugin: string | null = null;  // Track plugin during onStart

  private routes: RouteDefinition[] = [];
  private menuItems: MenuContribution[] = [];
  private pages: PageContribution[] = [];
  private widgets: WidgetContribution[] = [];
  private configComponents: ConfigContribution[] = [];

  private eventHandlers = new Set<PluginEventHandler>();

  private app: Application;
  private router: Router;
  private logger: Logger;
  private healthManager: HealthManager;
  private loggerFactory: (name: string) => Logger;

  constructor(
    app: Application,
    router: Router,
    logger: Logger,
    healthManager: HealthManager,
    loggerFactory: (name: string) => Logger
  ) {
    this.app = app;
    this.router = router;
    this.logger = logger;
    this.healthManager = healthManager;
    this.loggerFactory = loggerFactory;
  }

  // ---------------------------------------------------------------------------
  // Plugin queries
  // ---------------------------------------------------------------------------

  hasPlugin(id: string): boolean {
    return this.plugins.has(id) && this.pluginStatus.get(id) === 'active';
  }

  getPlugin<T extends Plugin = Plugin>(id: string): T | null {
    const plugin = this.plugins.get(id);
    if (!plugin || this.pluginStatus.get(id) !== 'active') {
      return null;
    }
    return plugin as T;
  }

  listPlugins(): PluginInfo[] {
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

  addRoute(route: RouteDefinition): void {
    if (!this.currentPlugin) {
      throw new Error('addRoute can only be called during plugin.onStart()');
    }

    const plugin = this.plugins.get(this.currentPlugin)!;
    const pluginType = plugin.type || 'regular';
    const originalPath = route.path;
    let fullPath = route.path;

    // Auto-prefix for regular plugins
    if (pluginType === 'regular') {
      const slug = this.pluginSlugs.get(this.currentPlugin)!;
      fullPath = `/${slug}${route.path}`;
    }

    const routeWithMetadata: RouteDefinition = {
      ...route,
      path: fullPath,
      pluginId: this.currentPlugin,
      originalPath,
    };

    this.routes.push(routeWithMetadata);

    this.logger.debug(
      `Route registered: ${route.method.toUpperCase()} ${fullPath} by ${this.currentPlugin}` +
      (pluginType === 'regular' ? ` (original: ${originalPath})` : '')
    );
  }

  addMenuItem(menu: MenuContribution): void {
    this.menuItems.push(menu);
    this.logger.debug(`Menu item registered: ${menu.label} by ${menu.pluginId}`);
  }

  addPage(page: PageContribution): void {
    this.pages.push(page);
    this.logger.debug(`Page registered: ${page.route} by ${page.pluginId}`);
  }

  addWidget(widget: WidgetContribution): void {
    this.widgets.push(widget);
    this.logger.debug(`Widget registered: ${widget.title} by ${widget.pluginId}`);
  }

  addConfigComponent(config: ConfigContribution): void {
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

  getRoutes(): RouteDefinition[] {
    return [...this.routes];
  }

  getMenuItems(): MenuContribution[] {
    return [...this.menuItems].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }

  getPages(): PageContribution[] {
    return [...this.pages];
  }

  getWidgets(): WidgetContribution[] {
    return [...this.widgets];
  }

  getConfigComponents(): ConfigContribution[] {
    return [...this.configComponents];
  }

  getPluginContributions(pluginId: string): PluginContributions {
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

  getConfig<T = PluginConfig>(pluginId: string): T {
    return (this.pluginConfigs.get(pluginId) || {}) as T;
  }

  async setConfig<T = PluginConfig>(pluginId: string, config: Partial<T>): Promise<void> {
    const oldConfig = this.pluginConfigs.get(pluginId) || {};
    const newConfig = { ...oldConfig, ...config };
    this.pluginConfigs.set(pluginId, newConfig);

    // Emit config-changed events for each changed key
    for (const key of Object.keys(config as Record<string, unknown>)) {
      const oldValue = (oldConfig as Record<string, unknown>)[key];
      const newValue = (config as Record<string, unknown>)[key];
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

  subscribe(handler: PluginEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  emit(event: PluginEvent): void {
    // Notify all subscribers
    for (const handler of this.eventHandlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err) => {
            this.logger.error('Event handler error', { error: err.message, event: event.type });
          });
        }
      } catch (err) {
        this.logger.error('Event handler error', { error: (err as Error).message, event: event.type });
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
        } catch (err) {
          this.logger.error(`Plugin ${plugin.id} event handler error`, { error: (err as Error).message, event: event.type });
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Health checks
  // ---------------------------------------------------------------------------

  registerHealthCheck(check: HealthCheck): void {
    this.healthManager.register(check);
    this.logger.debug(`Health check registered: ${check.name}`);
  }

  // ---------------------------------------------------------------------------
  // Express integration
  // ---------------------------------------------------------------------------

  getApp(): Application {
    return this.app;
  }

  getRouter(): Router {
    return this.router;
  }

  getLogger(pluginId: string): Logger {
    return this.loggerFactory(pluginId);
  }

  // ---------------------------------------------------------------------------
  // Internal: Health Manager access
  // ---------------------------------------------------------------------------

  getHealthManager(): HealthManager {
    return this.healthManager;
  }

  // ---------------------------------------------------------------------------
  // Slug management (internal)
  // ---------------------------------------------------------------------------

  /**
   * Check if a slug is available
   */
  private isSlugAvailable(slug: string, excludePluginId?: string): boolean {
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
  async startPlugin(plugin: Plugin, config: PluginConfig): Promise<boolean> {
    this.plugins.set(plugin.id, plugin);
    this.pluginConfigs.set(plugin.id, config);
    this.pluginStatus.set(plugin.id, 'starting');
    this.currentPlugin = plugin.id;

    const pluginType = plugin.type || 'regular';

    // Handle slug for regular plugins
    if (pluginType === 'regular') {
      const slug = (config.slug as string | undefined) || plugin.slug || plugin.id;

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.pluginStatus.set(plugin.id, 'error');
      this.pluginErrors.set(plugin.id, errorMessage);
      this.currentPlugin = null;

      this.emit({
        type: 'plugin:error',
        pluginId: plugin.id,
        error: error instanceof Error ? error : new Error(errorMessage),
      });

      this.logger.error(`Plugin ${plugin.id} failed to start`, { error: errorMessage });
      return false;
    }
  }

  /**
   * Stop a plugin with error isolation
   */
  async stopPlugin(pluginId: string): Promise<boolean> {
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
    } catch (error) {
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
  async stopAllPlugins(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys()).reverse();
    for (const pluginId of pluginIds) {
      await this.stopPlugin(pluginId);
    }
  }
}

// =============================================================================
// Singleton and Factory
// =============================================================================

let registryInstance: PluginRegistryImpl | null = null;

/**
 * Create and initialize the plugin registry
 */
export function createPluginRegistry(
  app: Application,
  router: Router,
  logger: Logger,
  healthManager: HealthManager,
  loggerFactory: (name: string) => Logger
): PluginRegistryImpl {
  registryInstance = new PluginRegistryImpl(app, router, logger, healthManager, loggerFactory);
  return registryInstance;
}

/**
 * Get the plugin registry singleton
 */
export function getPluginRegistry(): PluginRegistry {
  if (!registryInstance) {
    throw new Error('Plugin registry not initialized. Call createPluginRegistry first.');
  }
  return registryInstance;
}

/**
 * Check if plugin registry is initialized
 */
export function hasPluginRegistry(): boolean {
  return registryInstance !== null;
}

/**
 * Reset the plugin registry (for testing)
 */
export function resetPluginRegistry(): void {
  registryInstance = null;
}
