/**
 * Diagnostics Plugin
 *
 * Provides AI-friendly diagnostic API for troubleshooting
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../core/plugin-registry.js';
export interface DiagnosticsPluginConfig {
    include?: {
        logs?: {
            startup?: number;
            app?: number;
        };
        health?: boolean;
        config?: boolean;
        system?: boolean;
    };
    logPaths?: {
        startup?: string;
        app?: string;
    };
    endpoint?: string;
}
/**
 * Create a diagnostics plugin for AI agents
 */
export declare function createDiagnosticsPlugin(config?: DiagnosticsPluginConfig): Plugin;
//# sourceMappingURL=diagnostics-plugin.d.ts.map