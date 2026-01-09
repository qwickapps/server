/**
 * Health Plugin
 *
 * Provides health check monitoring capabilities
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../core/plugin-registry.js';
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
export declare function createHealthPlugin(config: HealthPluginConfig): Plugin;
//# sourceMappingURL=health-plugin.d.ts.map