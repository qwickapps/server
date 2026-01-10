/**
 * Dashboard Module
 *
 * Exports the dashboard widget system for dynamic dashboard customization.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Legacy context-based widget system (for backwards compatibility)
export { DashboardWidgetProvider, useDashboardWidgets, useRegisterWidget, } from './DashboardWidgetRegistry';
export { DashboardWidgetRenderer } from './DashboardWidgetRenderer';
// New plugin-based widget system
export { WidgetComponentRegistryProvider, useWidgetComponentRegistry, } from './WidgetComponentRegistry';
export { PluginWidgetRenderer } from './PluginWidgetRenderer';
// Built-in widgets
export { ServiceHealthWidget } from './widgets';
// Built-in widget component map (component name -> React component function)
// Product code should use getBuiltInWidgetComponents() to get the full list with JSX
export { builtInWidgetComponents, getBuiltInWidgetComponents } from './builtInWidgets';
//# sourceMappingURL=index.js.map