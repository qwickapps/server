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
import { ReactNode } from 'react';
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
export interface DashboardWidgetProviderProps {
    /** Initial widgets to register */
    initialWidgets?: DashboardWidget[];
    children: ReactNode;
}
export declare function DashboardWidgetProvider({ initialWidgets, children }: DashboardWidgetProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useDashboardWidgets(): DashboardWidgetContextValue;
/**
 * Hook to register a widget on mount and unregister on unmount
 */
export declare function useRegisterWidget(widget: DashboardWidget): () => void;
export {};
