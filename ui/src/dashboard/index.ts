/**
 * Dashboard Module
 *
 * Exports the dashboard widget system for dynamic dashboard customization.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

export {
  DashboardWidgetProvider,
  useDashboardWidgets,
  useRegisterWidget,
  type DashboardWidget,
  type DashboardWidgetProviderProps,
} from './DashboardWidgetRegistry';

export { DashboardWidgetRenderer } from './DashboardWidgetRenderer';
