/**
 * CMS Plugin
 *
 * Manages Payload CMS service integration, monitoring, and control.
 * Provides dashboard widgets, restart capabilities, and seed management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
export interface CMSPluginConfig {
    /** Payload CMS service URL (e.g., http://localhost:3301) */
    serviceUrl: string;
    /** Path to seed scripts directory */
    seedsPath?: string;
    /** Whether to show dashboard widget (default: true) */
    showDashboardWidget?: boolean;
    /** Whether to show maintenance widget (default: true) */
    showMaintenanceWidget?: boolean;
}
/**
 * Create a CMS plugin for Payload CMS service management
 */
export declare function createCMSPlugin(config: CMSPluginConfig): Plugin;
//# sourceMappingURL=cms-plugin.d.ts.map