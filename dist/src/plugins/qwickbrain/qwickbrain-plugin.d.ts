/**
 * QwickBrain Plugin
 *
 * MCP proxy plugin for @qwickapps/server that exposes QwickBrain tools
 * to external AI clients via authenticated API endpoints.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { QwickBrainPluginConfig, QwickBrainConnectionStatus } from './types.js';
/**
 * Create the QwickBrain plugin
 */
export declare function createQwickBrainPlugin(config: QwickBrainPluginConfig): Plugin;
/**
 * Get the current connection status
 */
export declare function getConnectionStatus(): QwickBrainConnectionStatus;
/**
 * Check if QwickBrain is connected
 */
export declare function isConnected(): boolean;
//# sourceMappingURL=qwickbrain-plugin.d.ts.map