/**
 * Health Plugin
 *
 * Provides health check monitoring capabilities
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a health check plugin
 */
export function createHealthPlugin(config) {
    return {
        id: 'health',
        name: 'Health Plugin',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
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
                    priority: 10,
                    showByDefault: true,
                    pluginId: 'health',
                });
            }
            logger.debug(`Registered ${config.checks.length} health checks`);
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
//# sourceMappingURL=health-plugin.js.map