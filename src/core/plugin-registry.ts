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
  | { type: 'plugin:started'; pluginId: string; config: unknown }
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
  status: 'starting' | 'active' | 'stopped' | 'error';
  error?: string;
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
 * Route definition for API routes
 */
export interface RouteDefinition {
  /** HTTP method */
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  /** Route path */
  path: string;
  /** Request handler */
  handler: RequestHandler;
  /** Plugin ID that contributed this */
  pluginId: string;
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

  private routes: RouteDefinition[] = [];
  private menuItems: MenuContribution[] = [];
  private pages: PageContribution[] = [];
  private widgets: WidgetContribution[] = [];

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
      status: this.pluginStatus.get(plugin.id) || 'stopped',
      error: this.pluginErrors.get(plugin.id),
    }));
  }

  // ---------------------------------------------------------------------------
  // Contribution registration
  // ---------------------------------------------------------------------------

  addRoute(route: RouteDefinition): void {
    this.routes.push(route);

    // Register with Express router
    switch (route.method) {
      case 'get':
        this.router.get(route.path, route.handler);
        break;
      case 'post':
        this.router.post(route.path, route.handler);
        break;
      case 'put':
        this.router.put(route.path, route.handler);
        break;
      case 'delete':
        this.router.delete(route.path, route.handler);
        break;
      case 'patch':
        this.router.patch(route.path, route.handler);
        break;
    }

    this.logger.debug(`Route registered: ${route.method.toUpperCase()} ${route.path} by ${route.pluginId}`);
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
  // Plugin lifecycle management (internal)
  // ---------------------------------------------------------------------------

  /**
   * Start a plugin with error isolation
   */
  async startPlugin(plugin: Plugin, config: PluginConfig): Promise<boolean> {
    this.plugins.set(plugin.id, plugin);
    this.pluginConfigs.set(plugin.id, config);
    this.pluginStatus.set(plugin.id, 'starting');

    try {
      await Promise.race([
        plugin.onStart(config, this),
        timeout(DEFAULT_TIMEOUT),
      ]);

      this.pluginStatus.set(plugin.id, 'active');
      this.pluginErrors.delete(plugin.id);

      this.emit({
        type: 'plugin:started',
        pluginId: plugin.id,
        config,
      });

      this.logger.debug(`Plugin started: ${plugin.id}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.pluginStatus.set(plugin.id, 'error');
      this.pluginErrors.set(plugin.id, errorMessage);

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
