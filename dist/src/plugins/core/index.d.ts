/**
 * Core Plugin - System Routes
 *
 * Registers core control panel routes (/info, /health, /ui-contributions, etc.)
 * as a system plugin so they appear in the API client manifest.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { HealthManager } from '../../core/health-manager.js';
interface CorePluginDependencies {
    config: {
        productName: string;
        logoName?: string;
        logoIconUrl?: string;
        version?: string;
        links?: Array<{
            label: string;
            url: string;
            icon?: string;
            external?: boolean;
            requiresHealth?: string;
        }>;
        branding?: Record<string, unknown>;
    };
    startTime: number;
    healthManager: HealthManager;
    getDiagnostics: () => unknown;
}
export declare function createCorePlugin(deps: CorePluginDependencies): Plugin;
export {};
//# sourceMappingURL=index.d.ts.map