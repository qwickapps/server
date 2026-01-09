/**
 * Logs Plugin
 *
 * Provides log viewing capabilities from various sources.
 * If no sources are configured, automatically uses the logging subsystem's log paths.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../core/plugin-registry.js';
import type { LogSource } from '../core/types.js';
export interface LogsPluginConfig {
    /** Log sources to display. If empty, uses default sources from logging subsystem */
    sources?: LogSource[];
    retention?: {
        maxLines?: number;
        autoRefresh?: number;
    };
}
/**
 * Create a logs plugin
 */
export declare function createLogsPlugin(config?: LogsPluginConfig): Plugin;
//# sourceMappingURL=logs-plugin.d.ts.map