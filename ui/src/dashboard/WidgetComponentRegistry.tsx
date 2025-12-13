/**
 * Widget Component Registry
 *
 * Maps widget component names (from server-side WidgetContribution) to actual React components.
 * Plugins register their widgets here so the dashboard can render them.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { ReactNode, createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Widget component definition
 */
export interface WidgetComponent {
  /** Component name (must match server-side WidgetContribution.component) */
  name: string;
  /** The React component to render */
  component: ReactNode;
}

interface WidgetComponentRegistryContextValue {
  /** Register a widget component */
  registerComponent: (name: string, component: ReactNode) => void;
  /** Register multiple widget components */
  registerComponents: (components: WidgetComponent[]) => void;
  /** Get a component by name */
  getComponent: (name: string) => ReactNode | null;
  /** Check if a component is registered */
  hasComponent: (name: string) => boolean;
  /** Get all registered component names */
  getRegisteredNames: () => string[];
}

const WidgetComponentRegistryContext = createContext<WidgetComponentRegistryContextValue | null>(null);

export interface WidgetComponentRegistryProviderProps {
  /** Initial components to register */
  initialComponents?: WidgetComponent[];
  children: ReactNode;
}

/**
 * Provider for the widget component registry
 */
export function WidgetComponentRegistryProvider({
  initialComponents = [],
  children,
}: WidgetComponentRegistryProviderProps) {
  const [components, setComponents] = useState<Map<string, ReactNode>>(() => {
    const map = new Map<string, ReactNode>();
    for (const comp of initialComponents) {
      map.set(comp.name, comp.component);
    }
    return map;
  });

  const registerComponent = useCallback((name: string, component: ReactNode) => {
    setComponents(prev => {
      const next = new Map(prev);
      next.set(name, component);
      return next;
    });
  }, []);

  const registerComponents = useCallback((comps: WidgetComponent[]) => {
    setComponents(prev => {
      const next = new Map(prev);
      for (const comp of comps) {
        next.set(comp.name, comp.component);
      }
      return next;
    });
  }, []);

  const getComponent = useCallback((name: string): ReactNode | null => {
    return components.get(name) ?? null;
  }, [components]);

  const hasComponent = useCallback((name: string): boolean => {
    return components.has(name);
  }, [components]);

  const getRegisteredNames = useCallback((): string[] => {
    return Array.from(components.keys());
  }, [components]);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      registerComponent,
      registerComponents,
      getComponent,
      hasComponent,
      getRegisteredNames,
    }),
    [registerComponent, registerComponents, getComponent, hasComponent, getRegisteredNames]
  );

  return (
    <WidgetComponentRegistryContext.Provider value={contextValue}>
      {children}
    </WidgetComponentRegistryContext.Provider>
  );
}

/**
 * Hook to access the widget component registry
 */
export function useWidgetComponentRegistry() {
  const context = useContext(WidgetComponentRegistryContext);
  if (!context) {
    throw new Error('useWidgetComponentRegistry must be used within a WidgetComponentRegistryProvider');
  }
  return context;
}
