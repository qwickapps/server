import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Dashboard Widget Registry
 *
 * A context-based registry for dashboard widgets that allows:
 * - Registration of widgets at runtime
 * - Dynamic adding/removing of widgets
 * - Priority-based ordering of widgets
 *
 * Usage:
 * ```tsx
 * // In your app setup:
 * const { registerWidget } = useDashboardWidgets();
 * registerWidget({
 *   id: 'user-stats',
 *   title: 'User Statistics',
 *   component: <UserStatsWidget />,
 *   priority: 10,
 * });
 *
 * // Or via the provider:
 * <DashboardWidgetProvider initialWidgets={[...]} />
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { createContext, useContext, useState, useCallback } from 'react';
const DashboardWidgetContext = createContext(null);
export function DashboardWidgetProvider({ initialWidgets = [], children }) {
    const [widgets, setWidgets] = useState(initialWidgets.map(w => ({ ...w, visible: w.visible !== false, priority: w.priority ?? 100 })));
    const registerWidget = useCallback((widget) => {
        setWidgets(prev => {
            // Check if widget already exists
            const exists = prev.some(w => w.id === widget.id);
            if (exists) {
                // Update existing widget
                return prev.map(w => w.id === widget.id ? { ...widget, visible: widget.visible !== false, priority: widget.priority ?? 100 } : w);
            }
            // Add new widget
            return [...prev, { ...widget, visible: widget.visible !== false, priority: widget.priority ?? 100 }];
        });
    }, []);
    const unregisterWidget = useCallback((id) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
    }, []);
    const toggleWidget = useCallback((id, visible) => {
        setWidgets(prev => prev.map(w => {
            if (w.id === id) {
                return { ...w, visible: visible ?? !w.visible };
            }
            return w;
        }));
    }, []);
    const getVisibleWidgets = useCallback(() => {
        return widgets
            .filter(w => w.visible !== false)
            .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    }, [widgets]);
    return (_jsx(DashboardWidgetContext.Provider, { value: { widgets, registerWidget, unregisterWidget, toggleWidget, getVisibleWidgets }, children: children }));
}
export function useDashboardWidgets() {
    const context = useContext(DashboardWidgetContext);
    if (!context) {
        throw new Error('useDashboardWidgets must be used within a DashboardWidgetProvider');
    }
    return context;
}
/**
 * Hook to register a widget on mount and unregister on unmount
 */
export function useRegisterWidget(widget) {
    const { registerWidget, unregisterWidget } = useDashboardWidgets();
    // Register on mount
    useState(() => {
        registerWidget(widget);
        return null;
    });
    // Return unregister function for manual cleanup
    return () => unregisterWidget(widget.id);
}
//# sourceMappingURL=DashboardWidgetRegistry.js.map