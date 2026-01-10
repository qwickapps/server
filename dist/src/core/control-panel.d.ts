/**
 * Control Panel Core
 *
 * Creates and manages the control panel Express application
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { type LoggingConfig } from './logging.js';
import type { ControlPanelConfig, ControlPanelInstance, Logger } from './types.js';
import { type Plugin, type PluginConfig } from './plugin-registry.js';
export interface CreateControlPanelOptions {
    config: ControlPanelConfig;
    /** Plugins to start with the control panel */
    plugins?: Array<{
        plugin: Plugin;
        config?: PluginConfig;
    }>;
    logger?: Logger;
    /** Logging configuration */
    logging?: LoggingConfig;
}
/**
 * Create a control panel instance
 */
export declare function createControlPanel(options: CreateControlPanelOptions): ControlPanelInstance;
//# sourceMappingURL=control-panel.d.ts.map