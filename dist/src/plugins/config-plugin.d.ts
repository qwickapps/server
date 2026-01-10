/**
 * Config Plugin
 *
 * Displays configuration and environment variables with secret masking
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../core/plugin-registry.js';
import type { ConfigDisplayOptions } from '../core/types.js';
export interface ConfigPluginConfig extends ConfigDisplayOptions {
}
/**
 * Create a config display plugin
 */
export declare function createConfigPlugin(config: ConfigPluginConfig): Plugin;
//# sourceMappingURL=config-plugin.d.ts.map