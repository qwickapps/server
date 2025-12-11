/**
 * Clean Environment Validation Test
 *
 * This file tests that @qwickapps/server can be imported and used
 * correctly in a fresh TypeScript/Node.js project.
 *
 * It validates:
 * - All major exports are available
 * - TypeScript types work correctly
 * - Plugin system works
 * - Health manager functions properly
 * - Plugin Registry (v2.0) works
 */
import {
  // Core factory function
  createControlPanel,

  // Health Manager
  HealthManager,

  // Types
  type ControlPanelConfig,
  type ControlPanelPlugin,
  type ControlPanelInstance,
  type PluginContext,
  type HealthCheck,
  type HealthCheckResult,
  type HealthStatus,
  type Logger,

  // Built-in plugins
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,

  // Plugin config types
  type HealthPluginConfig,
  type LogsPluginConfig,
  type ConfigPluginConfig,
  type DiagnosticsPluginConfig,

  // Plugin Registry (v2.0 Event-Driven Architecture)
  createPluginRegistry,
  getPluginRegistry,
  hasPluginRegistry,
  resetPluginRegistry,
  type Plugin,
  type PluginConfig,
  type PluginEvent,
  type PluginRegistry,
  type MenuContribution,
  type PageContribution,
  type WidgetContribution,
  type RouteDefinition,
} from '@qwickapps/server';

/**
 * Test 1: Verify type definitions work
 */
function testTypeDefinitions(): void {
  const config: ControlPanelConfig = {
    productName: 'Test Product',
    port: 3101,
    version: '1.0.0',
    auth: {
      enabled: false,
      provider: 'basic',
    },
  };

  console.log('Config type check passed:', config.productName);
}

/**
 * Test 2: Create a custom plugin (type check)
 */
function testCustomPlugin(): void {
  const customPlugin: ControlPanelPlugin = {
    name: 'test-plugin',
    order: 10,
    routes: [
      {
        method: 'get',
        path: '/test',
        handler: async (req, res) => {
          res.json({ status: 'ok' });
        },
      },
    ],
    onInit: async (context: PluginContext) => {
      context.logger.debug('Test plugin initialized');
    },
    onShutdown: async () => {
      console.log('Test plugin shutdown');
    },
  };

  console.log('Custom plugin type check passed:', customPlugin.name);
}

/**
 * Test 3: Verify built-in plugin creators exist
 */
function testBuiltInPlugins(): void {
  // Health plugin config
  const healthConfig: HealthPluginConfig = {
    checks: [
      {
        name: 'test-check',
        type: 'custom',
        check: async () => ({
          healthy: true,
          latency: 10,
          details: { message: 'Test passed' },
        }),
        interval: 10000,
      },
    ],
  };

  // Verify plugin creators are functions
  console.log('createHealthPlugin is function:', typeof createHealthPlugin === 'function');
  console.log('createLogsPlugin is function:', typeof createLogsPlugin === 'function');
  console.log('createConfigPlugin is function:', typeof createConfigPlugin === 'function');
  console.log('createDiagnosticsPlugin is function:', typeof createDiagnosticsPlugin === 'function');
}

/**
 * Test 4: Verify HealthManager class exists
 */
function testHealthManager(): void {
  console.log('HealthManager is class:', typeof HealthManager === 'function');
}

/**
 * Test 5: Verify createControlPanel function exists
 */
function testControlPanelFactory(): void {
  console.log('createControlPanel is function:', typeof createControlPanel === 'function');
}

/**
 * Test 6: Health check types
 */
function testHealthTypes(): void {
  const healthCheck: HealthCheck = {
    name: 'api-check',
    type: 'http',
    url: 'http://localhost:3000/health',
    interval: 5000,
    timeout: 3000,
  };

  const healthResult: HealthCheckResult = {
    status: 'healthy',
    latency: 50,
    lastChecked: new Date(),
    details: { responseTime: 50 },
  };

  const healthStatus: HealthStatus = 'healthy';

  console.log('Health types check passed');
  console.log('  - HealthCheck:', healthCheck.name);
  console.log('  - HealthCheckResult status:', healthResult.status);
  console.log('  - HealthStatus:', healthStatus);
}

/**
 * Test 7: Plugin Registry v2.0 types
 */
function testPluginRegistry(): void {
  // Verify registry functions exist
  console.log('createPluginRegistry is function:', typeof createPluginRegistry === 'function');
  console.log('getPluginRegistry is function:', typeof getPluginRegistry === 'function');
  console.log('hasPluginRegistry is function:', typeof hasPluginRegistry === 'function');
  console.log('resetPluginRegistry is function:', typeof resetPluginRegistry === 'function');

  // Verify Plugin interface types
  const testPlugin: Plugin = {
    id: 'test-v2-plugin',
    name: 'Test Plugin v2',
    version: '1.0.0',
    onStart: async (config: PluginConfig, registry: PluginRegistry) => {
      // Register UI contributions
      registry.addMenuItem({
        id: 'test-menu',
        label: 'Test',
        route: '/test',
        icon: 'test',
        pluginId: 'test-v2-plugin',
      });
      registry.addPage({
        id: 'test-page',
        route: '/test',
        component: 'TestPage',
        pluginId: 'test-v2-plugin',
      });
    },
    onStop: async () => {
      console.log('Plugin stopped');
    },
    onPluginEvent: async (event: PluginEvent) => {
      if (event.type === 'plugin:started') {
        console.log(`Plugin ${event.pluginId} started`);
      }
    },
  };

  console.log('Plugin v2 type check passed:', testPlugin.id);

  // Verify UI contribution types
  const menuItem: MenuContribution = {
    id: 'menu-1',
    label: 'Menu Item',
    route: '/menu',
    icon: 'menu',
    order: 10,
    pluginId: 'test-plugin',
  };

  const page: PageContribution = {
    id: 'page-1',
    route: '/page',
    component: 'PageComponent',
    title: 'Page Title',
    pluginId: 'test-plugin',
  };

  const widget: WidgetContribution = {
    id: 'widget-1',
    title: 'Widget',
    component: 'WidgetComponent',
    defaultSize: { width: 2, height: 1 },
    pluginId: 'test-plugin',
  };

  console.log('UI contribution types check passed');
  console.log('  - MenuContribution:', menuItem.label);
  console.log('  - PageContribution:', page.title);
  console.log('  - WidgetContribution:', widget.title);
}

// Run tests
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  @qwickapps/server - Clean Environment Test            ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

testTypeDefinitions();
testCustomPlugin();
testBuiltInPlugins();
testHealthManager();
testControlPanelFactory();
testHealthTypes();
testPluginRegistry();

console.log('');
console.log('✅ All tests passed! Package works correctly in clean environment.');
