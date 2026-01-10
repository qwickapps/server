/**
 * Widget Component Registry
 *
 * Maps widget component names (from server-side WidgetContribution) to actual React components.
 * Plugins register their widgets here so the dashboard can render them.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import React, { type ReactNode } from 'react';
/**
 * Widget component definition
 *
 * IMPORTANT: We store component functions (ComponentType), not JSX instances (ReactNode).
 * This ensures cross-React-version compatibility when the library is used in apps
 * with different React versions.
 */
export interface WidgetComponent {
    /** Component name (must match server-side WidgetContribution.component) */
    name: string;
    /** The React component function to render */
    component: React.ComponentType;
}
interface WidgetComponentRegistryContextValue {
    /** Register a widget component */
    registerComponent: (name: string, component: React.ComponentType) => void;
    /** Register multiple widget components */
    registerComponents: (components: WidgetComponent[]) => void;
    /** Get a component by name */
    getComponent: (name: string) => React.ComponentType | null;
    /** Check if a component is registered */
    hasComponent: (name: string) => boolean;
    /** Get all registered component names */
    getRegisteredNames: () => string[];
}
export interface WidgetComponentRegistryProviderProps {
    /** Initial components to register */
    initialComponents?: WidgetComponent[];
    children: ReactNode;
}
/**
 * Provider for the widget component registry
 */
export declare function WidgetComponentRegistryProvider({ initialComponents, children, }: WidgetComponentRegistryProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access the widget component registry
 */
export declare function useWidgetComponentRegistry(): WidgetComponentRegistryContextValue;
export {};
//# sourceMappingURL=WidgetComponentRegistry.d.ts.map