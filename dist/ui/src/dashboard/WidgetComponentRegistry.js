import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Widget Component Registry
 *
 * Maps widget component names (from server-side WidgetContribution) to actual React components.
 * Plugins register their widgets here so the dashboard can render them.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
const WidgetComponentRegistryContext = createContext(null);
/**
 * Provider for the widget component registry
 */
export function WidgetComponentRegistryProvider({ initialComponents = [], children, }) {
    const [components, setComponents] = useState(() => {
        const map = new Map();
        for (const comp of initialComponents) {
            map.set(comp.name, comp.component);
        }
        return map;
    });
    const registerComponent = useCallback((name, component) => {
        setComponents(prev => {
            const next = new Map(prev);
            next.set(name, component);
            return next;
        });
    }, []);
    const registerComponents = useCallback((comps) => {
        setComponents(prev => {
            const next = new Map(prev);
            for (const comp of comps) {
                next.set(comp.name, comp.component);
            }
            return next;
        });
    }, []);
    const getComponent = useCallback((name) => {
        return components.get(name) ?? null;
    }, [components]);
    const hasComponent = useCallback((name) => {
        return components.has(name);
    }, [components]);
    const getRegisteredNames = useCallback(() => {
        return Array.from(components.keys());
    }, [components]);
    // Memoize context value to prevent unnecessary re-renders of consumers
    const contextValue = useMemo(() => ({
        registerComponent,
        registerComponents,
        getComponent,
        hasComponent,
        getRegisteredNames,
    }), [registerComponent, registerComponents, getComponent, hasComponent, getRegisteredNames]);
    return (_jsx(WidgetComponentRegistryContext.Provider, { value: contextValue, children: children }));
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
//# sourceMappingURL=WidgetComponentRegistry.js.map