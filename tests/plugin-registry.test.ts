/**
 * Unit tests for Plugin Registry (Event-Driven Architecture v2.0)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express, { type Application, type Router } from 'express';
import type { Logger } from '../src/core/types.js';
import { HealthManager } from '../src/core/health-manager.js';
import {
  PluginRegistryImpl,
  createPluginRegistry,
  getPluginRegistry,
  hasPluginRegistry,
  resetPluginRegistry,
  type Plugin,
  type PluginConfig,
  type PluginEvent,
  type MenuContribution,
  type PageContribution,
  type WidgetContribution,
  type RouteDefinition,
} from '../src/core/plugin-registry.js';

// Mock logger
function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

// Mock Express app and router
function createMockExpress(): { app: Application; router: Router } {
  const router = express.Router();
  const app = express();
  return { app, router };
}

// Logger factory for tests
function createMockLoggerFactory(): (name: string) => Logger {
  return (_name: string) => createMockLogger();
}

// Simple test plugin
function createTestPlugin(
  id: string,
  options: {
    onStartFn?: (config: PluginConfig, registry: any) => Promise<void>;
    onStopFn?: () => Promise<void>;
    onPluginEventFn?: (event: PluginEvent) => Promise<void>;
  } = {}
): Plugin {
  return {
    id,
    name: `Test Plugin ${id}`,
    version: '1.0.0',
    onStart: options.onStartFn || (async () => {}),
    onStop: options.onStopFn || (async () => {}),
    onPluginEvent: options.onPluginEventFn,
  };
}

describe('PluginRegistry', () => {
  let registry: PluginRegistryImpl;
  let logger: Logger;
  let app: Application;
  let router: Router;
  let healthManager: HealthManager;

  beforeEach(() => {
    resetPluginRegistry();
    logger = createMockLogger();
    const expressSetup = createMockExpress();
    app = expressSetup.app;
    router = expressSetup.router;
    healthManager = new HealthManager(logger);
    registry = createPluginRegistry(app, router, logger, healthManager, createMockLoggerFactory());
  });

  afterEach(() => {
    resetPluginRegistry();
  });

  describe('Plugin Lifecycle', () => {
    it('should start a plugin successfully', async () => {
      const onStart = vi.fn();
      const plugin = createTestPlugin('test-1', { onStartFn: onStart });

      const result = await registry.startPlugin(plugin, { foo: 'bar' });

      expect(result).toBe(true);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onStart).toHaveBeenCalledWith({ foo: 'bar' }, registry);
      expect(registry.hasPlugin('test-1')).toBe(true);
    });

    it('should emit plugin:started event when plugin starts', async () => {
      const eventHandler = vi.fn();
      registry.subscribe(eventHandler);

      const plugin = createTestPlugin('test-1');
      await registry.startPlugin(plugin, { foo: 'bar' });

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'plugin:started',
        pluginId: 'test-1',
        config: { foo: 'bar' },
      });
    });

    it('should stop a plugin successfully', async () => {
      const onStop = vi.fn();
      const plugin = createTestPlugin('test-1', { onStopFn: onStop });

      await registry.startPlugin(plugin, {});
      const result = await registry.stopPlugin('test-1');

      expect(result).toBe(true);
      expect(onStop).toHaveBeenCalledTimes(1);
      expect(registry.hasPlugin('test-1')).toBe(false);
    });

    it('should emit plugin:stopped event when plugin stops', async () => {
      const eventHandler = vi.fn();
      const plugin = createTestPlugin('test-1');

      await registry.startPlugin(plugin, {});
      registry.subscribe(eventHandler);
      await registry.stopPlugin('test-1');

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'plugin:stopped',
        pluginId: 'test-1',
      });
    });

    it('should handle plugin start failure with error isolation', async () => {
      const plugin = createTestPlugin('failing-plugin', {
        onStartFn: async () => {
          throw new Error('Plugin failed to start');
        },
      });

      const result = await registry.startPlugin(plugin, {});

      expect(result).toBe(false);
      expect(registry.hasPlugin('failing-plugin')).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should emit plugin:error event when plugin fails', async () => {
      const eventHandler = vi.fn();
      registry.subscribe(eventHandler);

      const plugin = createTestPlugin('failing-plugin', {
        onStartFn: async () => {
          throw new Error('Plugin failed');
        },
      });

      await registry.startPlugin(plugin, {});

      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'plugin:error',
          pluginId: 'failing-plugin',
        })
      );
    });

    it('should return false when stopping non-existent plugin', async () => {
      const result = await registry.stopPlugin('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Plugin Queries', () => {
    it('should list all plugins', async () => {
      const plugin1 = createTestPlugin('plugin-1');
      const plugin2 = createTestPlugin('plugin-2');

      await registry.startPlugin(plugin1, {});
      await registry.startPlugin(plugin2, {});

      const plugins = registry.listPlugins();

      expect(plugins).toHaveLength(2);
      expect(plugins.map((p) => p.id)).toContain('plugin-1');
      expect(plugins.map((p) => p.id)).toContain('plugin-2');
    });

    it('should return correct plugin status', async () => {
      const plugin = createTestPlugin('test-plugin');

      await registry.startPlugin(plugin, {});
      let plugins = registry.listPlugins();
      expect(plugins[0].status).toBe('active');

      await registry.stopPlugin('test-plugin');
      plugins = registry.listPlugins();
      expect(plugins[0].status).toBe('stopped');
    });

    it('should return null for non-existent plugin', () => {
      expect(registry.getPlugin('non-existent')).toBeNull();
    });

    it('should return plugin instance for active plugin', async () => {
      const plugin = createTestPlugin('test-plugin');
      await registry.startPlugin(plugin, {});

      const retrieved = registry.getPlugin('test-plugin');
      expect(retrieved).toBe(plugin);
    });
  });

  describe('UI Contributions', () => {
    it('should register and retrieve menu items', async () => {
      const plugin = createTestPlugin('menu-plugin', {
        onStartFn: async (_, reg) => {
          reg.addMenuItem({
            id: 'menu-1',
            label: 'Test Menu',
            route: '/test',
            icon: 'test-icon',
            pluginId: 'menu-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});

      const menuItems = registry.getMenuItems();
      expect(menuItems).toHaveLength(1);
      expect(menuItems[0].label).toBe('Test Menu');
      expect(menuItems[0].pluginId).toBe('menu-plugin');
    });

    it('should register and retrieve pages', async () => {
      const plugin = createTestPlugin('page-plugin', {
        onStartFn: async (_, reg) => {
          reg.addPage({
            id: 'page-1',
            route: '/test-page',
            component: 'TestPage',
            title: 'Test Page',
            pluginId: 'page-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});

      const pages = registry.getPages();
      expect(pages).toHaveLength(1);
      expect(pages[0].route).toBe('/test-page');
    });

    it('should register and retrieve widgets', async () => {
      const plugin = createTestPlugin('widget-plugin', {
        onStartFn: async (_, reg) => {
          reg.addWidget({
            id: 'widget-1',
            title: 'Test Widget',
            component: 'TestWidget',
            defaultSize: { width: 2, height: 1 },
            pluginId: 'widget-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});

      const widgets = registry.getWidgets();
      expect(widgets).toHaveLength(1);
      expect(widgets[0].title).toBe('Test Widget');
    });

    it('should remove contributions when plugin stops', async () => {
      const plugin = createTestPlugin('contrib-plugin', {
        onStartFn: async (_, reg) => {
          reg.addMenuItem({
            id: 'menu-1',
            label: 'Test Menu',
            route: '/test',
            pluginId: 'contrib-plugin',
          });
          reg.addPage({
            id: 'page-1',
            route: '/test-page',
            component: 'TestPage',
            pluginId: 'contrib-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});
      expect(registry.getMenuItems()).toHaveLength(1);
      expect(registry.getPages()).toHaveLength(1);

      await registry.stopPlugin('contrib-plugin');
      expect(registry.getMenuItems()).toHaveLength(0);
      expect(registry.getPages()).toHaveLength(0);
    });

    it('should sort menu items by order', async () => {
      const plugin = createTestPlugin('menu-plugin', {
        onStartFn: async (_, reg) => {
          reg.addMenuItem({
            id: 'menu-c',
            label: 'C Menu',
            route: '/c',
            order: 30,
            pluginId: 'menu-plugin',
          });
          reg.addMenuItem({
            id: 'menu-a',
            label: 'A Menu',
            route: '/a',
            order: 10,
            pluginId: 'menu-plugin',
          });
          reg.addMenuItem({
            id: 'menu-b',
            label: 'B Menu',
            route: '/b',
            order: 20,
            pluginId: 'menu-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});

      const menuItems = registry.getMenuItems();
      expect(menuItems[0].label).toBe('A Menu');
      expect(menuItems[1].label).toBe('B Menu');
      expect(menuItems[2].label).toBe('C Menu');
    });
  });

  describe('Route Registration', () => {
    it('should register routes with Express router', async () => {
      const handler = vi.fn();
      const plugin = createTestPlugin('route-plugin', {
        onStartFn: async (_, reg) => {
          reg.addRoute({
            method: 'get',
            path: '/test-route',
            handler,
            pluginId: 'route-plugin',
          });
        },
      });

      await registry.startPlugin(plugin, {});

      const routes = registry.getRoutes();
      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/test-route');
      expect(routes[0].method).toBe('get');
    });
  });

  describe('Configuration', () => {
    it('should get and set plugin config', async () => {
      const plugin = createTestPlugin('config-plugin');
      await registry.startPlugin(plugin, { initial: 'value' });

      expect(registry.getConfig('config-plugin')).toEqual({ initial: 'value' });

      await registry.setConfig('config-plugin', { updated: 'new-value' });
      expect(registry.getConfig('config-plugin')).toEqual({
        initial: 'value',
        updated: 'new-value',
      });
    });

    it('should emit config-changed events', async () => {
      const eventHandler = vi.fn();
      const plugin = createTestPlugin('config-plugin');

      await registry.startPlugin(plugin, { foo: 'bar' });
      registry.subscribe(eventHandler);
      await registry.setConfig('config-plugin', { foo: 'baz' });

      expect(eventHandler).toHaveBeenCalledWith({
        type: 'plugin:config-changed',
        pluginId: 'config-plugin',
        key: 'foo',
        oldValue: 'bar',
        newValue: 'baz',
      });
    });
  });

  describe('Event System', () => {
    it('should subscribe and unsubscribe from events', async () => {
      const handler = vi.fn();
      const unsubscribe = registry.subscribe(handler);

      registry.emit({ type: 'plugin:started', pluginId: 'test', config: {} });
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      registry.emit({ type: 'plugin:stopped', pluginId: 'test' });
      expect(handler).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should notify plugins via onPluginEvent', async () => {
      const onPluginEvent = vi.fn();
      const plugin = createTestPlugin('listener-plugin', { onPluginEventFn: onPluginEvent });

      await registry.startPlugin(plugin, {});

      // Emit an event
      registry.emit({ type: 'plugin:stopped', pluginId: 'some-other-plugin' });

      expect(onPluginEvent).toHaveBeenCalledWith({
        type: 'plugin:stopped',
        pluginId: 'some-other-plugin',
      });
    });

    it('should handle errors in event handlers gracefully', async () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      registry.subscribe(errorHandler);
      registry.emit({ type: 'plugin:started', pluginId: 'test', config: {} });

      // Should not throw, error logged
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Dependencies', () => {
    it('should allow plugins to check dependencies', async () => {
      const dependentOnStart = vi.fn().mockImplementation(async (_, reg) => {
        if (!reg.hasPlugin('dependency-plugin')) {
          throw new Error('Dependency plugin not found');
        }
      });

      const dependencyPlugin = createTestPlugin('dependency-plugin');
      const dependentPlugin = createTestPlugin('dependent-plugin', {
        onStartFn: dependentOnStart,
      });

      // Start dependency first
      await registry.startPlugin(dependencyPlugin, {});

      // Now dependent should succeed
      const result = await registry.startPlugin(dependentPlugin, {});
      expect(result).toBe(true);
    });

    it('should fail when dependency is missing', async () => {
      const dependentOnStart = vi.fn().mockImplementation(async (_, reg) => {
        if (!reg.hasPlugin('missing-dependency')) {
          throw new Error('Missing dependency');
        }
      });

      const dependentPlugin = createTestPlugin('dependent-plugin', {
        onStartFn: dependentOnStart,
      });

      const result = await registry.startPlugin(dependentPlugin, {});
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should allow plugins to react to dependency stopping', async () => {
      const onPluginEvent = vi.fn();

      const dependencyPlugin = createTestPlugin('dependency-plugin');
      const dependentPlugin = createTestPlugin('dependent-plugin', {
        onPluginEventFn: onPluginEvent,
      });

      await registry.startPlugin(dependencyPlugin, {});
      await registry.startPlugin(dependentPlugin, {});

      // Stop the dependency
      await registry.stopPlugin('dependency-plugin');

      // Dependent should have been notified
      expect(onPluginEvent).toHaveBeenCalledWith({
        type: 'plugin:stopped',
        pluginId: 'dependency-plugin',
      });
    });
  });

  describe('Singleton Functions', () => {
    it('should throw when getting registry before creation', () => {
      resetPluginRegistry();
      expect(() => getPluginRegistry()).toThrow('Plugin registry not initialized');
    });

    it('should return registry after creation', () => {
      expect(hasPluginRegistry()).toBe(true);
      expect(getPluginRegistry()).toBe(registry);
    });
  });

  describe('Stop All Plugins', () => {
    it('should stop all plugins in reverse order', async () => {
      const stopOrder: string[] = [];

      const plugin1 = createTestPlugin('plugin-1', {
        onStopFn: async () => {
          stopOrder.push('plugin-1');
        },
      });
      const plugin2 = createTestPlugin('plugin-2', {
        onStopFn: async () => {
          stopOrder.push('plugin-2');
        },
      });
      const plugin3 = createTestPlugin('plugin-3', {
        onStopFn: async () => {
          stopOrder.push('plugin-3');
        },
      });

      await registry.startPlugin(plugin1, {});
      await registry.startPlugin(plugin2, {});
      await registry.startPlugin(plugin3, {});

      await registry.stopAllPlugins();

      // Should stop in reverse order (LIFO)
      expect(stopOrder).toEqual(['plugin-3', 'plugin-2', 'plugin-1']);
    });
  });
});
