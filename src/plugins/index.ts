/**
 * Built-in plugins for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export { createHealthPlugin } from './health-plugin.js';
export type { HealthPluginConfig } from './health-plugin.js';

export { createLogsPlugin } from './logs-plugin.js';
export type { LogsPluginConfig } from './logs-plugin.js';

export { createConfigPlugin } from './config-plugin.js';
export type { ConfigPluginConfig } from './config-plugin.js';

export { createDiagnosticsPlugin } from './diagnostics-plugin.js';
export type { DiagnosticsPluginConfig } from './diagnostics-plugin.js';

export { createFrontendAppPlugin } from './frontend-app-plugin.js';
export type { FrontendAppPluginConfig } from './frontend-app-plugin.js';
