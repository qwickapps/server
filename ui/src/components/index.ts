/**
 * Control Panel UI Components
 *
 * Re-exports all public UI components for use by consumers.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export { ControlPanelApp, type ControlPanelAppProps } from './ControlPanelApp';

// Re-export MenuItem from react-framework for convenience
export type { MenuItem } from '@qwickapps/react-framework';

// Re-export base pages for consumers who want to use them directly
export { DashboardPage } from '../pages/DashboardPage';
export { LogsPage } from '../pages/LogsPage';
export { SystemPage } from '../pages/SystemPage';
export { NotFoundPage } from '../pages/NotFoundPage';
export { UsersPage, type UsersPageProps } from '../pages/UsersPage';
export { EntitlementsPage, type EntitlementsPageProps } from '../pages/EntitlementsPage';

// Re-export dashboard widget system (legacy context-based + new plugin-based)
export {
  // Legacy context-based widget system
  DashboardWidgetProvider,
  useDashboardWidgets,
  useRegisterWidget,
  DashboardWidgetRenderer,
  type DashboardWidget,
  type DashboardWidgetProviderProps,
  // New plugin-based widget system
  WidgetComponentRegistryProvider,
  useWidgetComponentRegistry,
  PluginWidgetRenderer,
  getBuiltInWidgetComponents,
  ServiceHealthWidget,
  type WidgetComponent,
  type WidgetComponentRegistryProviderProps,
} from '../dashboard';

// Re-export API client and types
export { api } from '../api/controlPanelApi';
export type {
  HealthCheck,
  HealthResponse,
  InfoResponse,
  DiagnosticsResponse,
  ConfigResponse,
  LogEntry,
  LogsResponse,
  LogSource,
  // User management types
  User,
  UsersResponse,
  Ban,
  BansResponse,
  EntitlementDefinition,
  EntitlementResult,
  EntitlementSourceInfo,
  EntitlementsStatus,
  PluginFeatures,
} from '../api/controlPanelApi';
