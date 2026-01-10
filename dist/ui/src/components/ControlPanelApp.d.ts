/**
 * ControlPanelApp Component
 *
 * A wrapper around QwickApp that provides control panel functionality.
 * Injects base control panel routes (Dashboard, Health, Logs, System)
 * and allows consumers to add custom routes.
 *
 * Usage:
 * ```tsx
 * import { ControlPanelApp } from '@qwickapps/server/ui';
 *
 * function App() {
 *   return (
 *     <ControlPanelApp
 *       productName="My Service"
 *       logo={<MyLogo />}
 *       customDashboard={<MyDashboard />}
 *     >
 *       <Route path="/users" element={<UsersPage />} />
 *       <Route path="/settings" element={<SettingsPage />} />
 *     </ControlPanelApp>
 *   );
 * }
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { ReactNode } from 'react';
import { type MenuItem } from '@qwickapps/react-framework';
import { type DashboardWidget, type WidgetComponent } from '../dashboard';
export interface ControlPanelAppProps {
    /** Product name displayed in the header */
    productName?: string;
    /** Custom logo component */
    logo?: ReactNode;
    /** Custom footer content (replaces default) */
    footerContent?: ReactNode;
    /** Initial dashboard widgets to register (legacy context-based system) */
    dashboardWidgets?: DashboardWidget[];
    /**
     * Widget components to register for the plugin-based widget system.
     * These map component names (from server WidgetContribution) to React components.
     * Built-in widgets (ServiceHealthWidget, etc.) are registered automatically.
     */
    widgetComponents?: WidgetComponent[];
    /** Additional navigation items to add to the base control panel nav */
    navigationItems?: MenuItem[];
    /** Whether to show the base control panel navigation (Dashboard, Health, etc.) */
    showBaseNavigation?: boolean;
    /** Base navigation item IDs to hide (e.g., ['health'] to hide the Health page) */
    hideBaseNavItems?: string[];
    /** Whether to show theme switcher in settings */
    showThemeSwitcher?: boolean;
    /** Whether to show palette switcher in settings */
    showPaletteSwitcher?: boolean;
    /** Base path for the control panel (e.g., '/cpanel') */
    basePath?: string;
    /** Custom routes to add (as Route elements) */
    children?: ReactNode;
}
export declare function ControlPanelApp({ productName, logo, footerContent, dashboardWidgets, widgetComponents, navigationItems, showBaseNavigation, hideBaseNavItems, showThemeSwitcher, showPaletteSwitcher, basePath: _basePath, // Keep for backwards compatibility but unused (API always at /api)
children, }: ControlPanelAppProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ControlPanelApp.d.ts.map