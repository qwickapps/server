/**
 * Built-in Widget Components
 *
 * Maps built-in widget component names to their React components.
 * These are the widgets that qwickapps-server provides out of the box.
 *
 * IMPORTANT: We export component functions, not JSX instances.
 * This ensures cross-React-version compatibility.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { ServiceHealthWidget, IntegrationStatusWidget, AuthStatusWidget, NotificationsStatsWidget } from './widgets';
import type { WidgetComponent } from './WidgetComponentRegistry';

/**
 * Map of built-in widget component names to their React component functions.
 * Use this when you need to look up a component by name.
 */
export const builtInWidgetComponents: Record<string, React.ComponentType> = {
  ServiceHealthWidget: ServiceHealthWidget,
  IntegrationStatusWidget: IntegrationStatusWidget,
  AuthStatusWidget: AuthStatusWidget,
  NotificationsStatsWidget: NotificationsStatsWidget,
};

/**
 * Get built-in widget components as WidgetComponent array.
 * Use this when registering with WidgetComponentRegistryProvider.
 *
 * Returns component functions (not JSX instances) to ensure compatibility
 * across different React versions.
 */
export function getBuiltInWidgetComponents(): WidgetComponent[] {
  return [
    { name: 'ServiceHealthWidget', component: ServiceHealthWidget },
    { name: 'IntegrationStatusWidget', component: IntegrationStatusWidget },
    { name: 'AuthStatusWidget', component: AuthStatusWidget },
    { name: 'NotificationsStatsWidget', component: NotificationsStatsWidget },
  ];
}
