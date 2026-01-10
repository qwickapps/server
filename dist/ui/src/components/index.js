/**
 * Control Panel UI Components
 *
 * Re-exports all public UI components for use by consumers.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { ControlPanelApp } from './ControlPanelApp';
export { StatCard, DataTable } from '@qwickapps/react-framework';
// Re-export base pages for consumers who want to use them directly
export { DashboardPage } from '../pages/DashboardPage';
export { LogsPage } from '../pages/LogsPage';
export { SystemPage } from '../pages/SystemPage';
export { NotFoundPage } from '../pages/NotFoundPage';
export { UsersPage } from '../pages/UsersPage';
export { EntitlementsPage } from '../pages/EntitlementsPage';
export { AcceptInvitationPage } from '../pages/AcceptInvitationPage';
// Re-export dashboard widget system (legacy context-based + new plugin-based)
export { 
// Legacy context-based widget system
DashboardWidgetProvider, useDashboardWidgets, useRegisterWidget, DashboardWidgetRenderer, 
// New plugin-based widget system
WidgetComponentRegistryProvider, useWidgetComponentRegistry, PluginWidgetRenderer, getBuiltInWidgetComponents, ServiceHealthWidget, } from '../dashboard';
// Re-export server plugin UI components
export { PluginManagementPage, PluginStatusWidget, PluginConfigPanel, } from './plugins';
// Re-export API client and types
export { api } from '../api/controlPanelApi';
//# sourceMappingURL=index.js.map