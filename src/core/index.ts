/**
 * Core exports for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export { createControlPanel } from './control-panel.js';
export type { CreateControlPanelOptions } from './control-panel.js';

export { HealthManager } from './health-manager.js';

export type {
  ControlPanelConfig,
  ControlPanelPlugin,
  ControlPanelInstance,
  PluginContext,
  HealthCheck,
  HealthCheckType,
  HealthStatus,
  HealthCheckResult,
  LogSource,
  ConfigDisplayOptions,
  Logger,
  DiagnosticsReport,
} from './types.js';
