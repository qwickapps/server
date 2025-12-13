/**
 * Built-in Widget Components
 *
 * Maps built-in widget component names to their React components.
 * These are the widgets that qwickapps-server provides out of the box.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { ServiceHealthWidget } from './widgets';
import type { WidgetComponent } from './WidgetComponentRegistry';

/**
 * Map of built-in widget component names to their React component functions.
 * Use this when you need to look up a component by name.
 */
export const builtInWidgetComponents: Record<string, React.ComponentType> = {
  ServiceHealthWidget: ServiceHealthWidget,
};

/**
 * Get built-in widget components as WidgetComponent array with JSX elements.
 * Use this when registering with WidgetComponentRegistryProvider.
 */
export function getBuiltInWidgetComponents(): WidgetComponent[] {
  return [
    { name: 'ServiceHealthWidget', component: <ServiceHealthWidget /> },
  ];
}
