/**
 * @qwickapps/server
 *
 * Independent control panel and management UI for QwickApps services
 * Runs on a separate port, provides health checks, logs, config, and diagnostics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Core exports
export { createControlPanel } from './core/control-panel.js';
export { createGateway } from './core/gateway.js';
export { HealthManager } from './core/health-manager.js';

// Logging exports
export {
  initializeLogging,
  getControlPanelLogger,
  getLoggingSubsystem,
} from './core/logging.js';
export type { LoggingConfig } from './core/logging.js';

export type {
  ControlPanelConfig,
  ControlPanelPlugin,
  ControlPanelInstance,
  PluginContext,
  HealthCheck,
  HealthCheckType,
  HealthCheckResult,
  HealthStatus,
  LogSource,
  ConfigDisplayOptions,
  Logger,
  DiagnosticsReport,
} from './core/types.js';
export type {
  GatewayConfig,
  GatewayInstance,
  ServiceFactory,
} from './core/gateway.js';

// Built-in plugins
export {
  createHealthPlugin,
  createLogsPlugin,
  createConfigPlugin,
  createDiagnosticsPlugin,
} from './plugins/index.js';
export type {
  HealthPluginConfig,
  LogsPluginConfig,
  ConfigPluginConfig,
  DiagnosticsPluginConfig,
} from './plugins/index.js';
