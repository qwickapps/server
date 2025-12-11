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

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DashboardWidget {
  /** Unique identifier for the widget */
  id: string;
  /** Display title for the widget section */
  title?: string;
  /** The widget component to render */
  component: ReactNode;
  /** Priority for ordering (lower = first, default: 100) */
  priority?: number;
  /** Whether the widget is visible */
  visible?: boolean;
}

interface DashboardWidgetContextValue {
  /** All registered widgets */
  widgets: DashboardWidget[];
  /** Register a new widget */
  registerWidget: (widget: DashboardWidget) => void;
  /** Unregister a widget by ID */
  unregisterWidget: (id: string) => void;
  /** Toggle widget visibility */
  toggleWidget: (id: string, visible?: boolean) => void;
  /** Get visible widgets sorted by priority */
  getVisibleWidgets: () => DashboardWidget[];
}

const DashboardWidgetContext = createContext<DashboardWidgetContextValue | null>(null);

export interface DashboardWidgetProviderProps {
  /** Initial widgets to register */
  initialWidgets?: DashboardWidget[];
  children: ReactNode;
}

export function DashboardWidgetProvider({ initialWidgets = [], children }: DashboardWidgetProviderProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(
    initialWidgets.map(w => ({ ...w, visible: w.visible !== false, priority: w.priority ?? 100 }))
  );

  const registerWidget = useCallback((widget: DashboardWidget) => {
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

  const unregisterWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleWidget = useCallback((id: string, visible?: boolean) => {
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

  return (
    <DashboardWidgetContext.Provider value={{ widgets, registerWidget, unregisterWidget, toggleWidget, getVisibleWidgets }}>
      {children}
    </DashboardWidgetContext.Provider>
  );
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
export function useRegisterWidget(widget: DashboardWidget) {
  const { registerWidget, unregisterWidget } = useDashboardWidgets();

  // Register on mount
  useState(() => {
    registerWidget(widget);
    return null;
  });

  // Return unregister function for manual cleanup
  return () => unregisterWidget(widget.id);
}
