/**
 * Dashboard Module
 *
 * Exports the dashboard widget system for dynamic dashboard customization.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { DashboardWidgetProvider, useDashboardWidgets, useRegisterWidget, type DashboardWidget, type DashboardWidgetProviderProps, } from './DashboardWidgetRegistry';
export { DashboardWidgetRenderer } from './DashboardWidgetRenderer';
export { WidgetComponentRegistryProvider, useWidgetComponentRegistry, type WidgetComponent, type WidgetComponentRegistryProviderProps, } from './WidgetComponentRegistry';
export { PluginWidgetRenderer } from './PluginWidgetRenderer';
export { ServiceHealthWidget } from './widgets';
export { builtInWidgetComponents, getBuiltInWidgetComponents } from './builtInWidgets';
