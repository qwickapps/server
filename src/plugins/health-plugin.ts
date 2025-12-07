/**
 * Health Plugin
 *
 * Provides health check monitoring capabilities
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { ControlPanelPlugin, HealthCheck, PluginContext } from '../core/types.js';

export interface HealthPluginConfig {
  checks: HealthCheck[];
  aggregateEndpoint?: string;
}

/**
 * Create a health check plugin
 */
export function createHealthPlugin(config: HealthPluginConfig): ControlPanelPlugin {
  return {
    name: 'health',
    order: 10,

    async onInit(context: PluginContext): Promise<void> {
      const { registerHealthCheck, logger } = context;

      // Register all health checks
      for (const check of config.checks) {
        registerHealthCheck(check);
      }

      logger.debug(`Registered ${config.checks.length} health checks`);
    },
  };
}
