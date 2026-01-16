/**
 * Health Plugin
 *
 * Provides health check monitoring capabilities
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Plugin, PluginConfig, PluginRegistry } from '../core/plugin-registry.js';
import type { HealthCheck } from '../core/types.js';

export interface HealthPluginConfig {
  checks: HealthCheck[];
  aggregateEndpoint?: string;
  /** Whether to show the ServiceHealthWidget on the dashboard (default: true) */
  showWidget?: boolean;
}

/**
 * Create a health check plugin
 */
export function createHealthPlugin(config: HealthPluginConfig): Plugin {
  return {
    id: 'health',
    name: 'Health Plugin',
    version: '1.0.0',

    async onStart(_pluginConfig: PluginConfig, registry: PluginRegistry): Promise<void> {
      const logger = registry.getLogger('health');

      // Register all health checks
      for (const check of config.checks) {
        registry.registerHealthCheck(check);
      }

      // Register the ServiceHealthWidget (shown by default unless disabled)
      if (config.showWidget !== false) {
        registry.addWidget({
          id: 'service-health',
          title: 'Service Health',
          component: 'ServiceHealthWidget',
          type: 'status',
          priority: 10,
          showByDefault: true,
          pluginId: 'health',
        });
      }

      logger.debug(`Registered ${config.checks.length} health checks`);
    },

    async onStop(): Promise<void> {
      // Nothing to cleanup
    },
  };
}
