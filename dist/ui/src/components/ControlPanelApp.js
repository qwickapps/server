import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Link } from '@mui/material';
import { QwickApp, ProductLogo, Text } from '@qwickapps/react-framework';
import { defaultConfig } from '../config/AppConfig';
// Base pages
import { DashboardPage } from '../pages/DashboardPage';
import { LogsPage } from '../pages/LogsPage';
import { SystemPage } from '../pages/SystemPage';
import { AuthPage } from '../pages/AuthPage';
import { NotFoundPage } from '../pages/NotFoundPage';
// Dashboard widget system
import { DashboardWidgetProvider, WidgetComponentRegistryProvider, getBuiltInWidgetComponents, } from '../dashboard';
// API
import { api } from '../api/controlPanelApi';
/**
 * Default footer with QwickApps Server branding
 */
function DefaultFooter({ version }) {
    return (_jsx(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 2 }, children: _jsxs(Text, { variant: "caption", customColor: "var(--theme-text-secondary)", children: ["Built with", ' ', _jsx(Link, { href: "https://qwickapps.com/products/qwickapps-server", target: "_blank", rel: "noopener noreferrer", sx: { color: 'primary.main' }, children: "QwickApps Server" }), version && ` v${version}`] }) }));
}
/**
 * Base navigation items for control panel
 * Routes are relative to BrowserRouter's basename (handled by NavigationProvider in QwickApp)
 */
function getBaseNavigationItems() {
    return [
        { id: 'dashboard', label: 'Dashboard', route: '/', icon: 'dashboard' },
        { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
        { id: 'auth', label: 'Auth', route: '/auth', icon: 'lock' },
        { id: 'system', label: 'System', route: '/system', icon: 'settings' },
    ];
}
export function ControlPanelApp({ productName = 'Control Panel', logo, footerContent, dashboardWidgets = [], widgetComponents = [], navigationItems = [], showBaseNavigation = true, hideBaseNavItems = [], showThemeSwitcher = true, showPaletteSwitcher = true, basePath: _basePath = '', // Keep for backwards compatibility but unused (API always at /api)
children, }) {
    const [version, setVersion] = useState('');
    // Combine built-in widget components with custom ones
    const allWidgetComponents = [...getBuiltInWidgetComponents(), ...widgetComponents];
    // Configure API base URL - API routes are always at '/api' regardless of control panel mount path
    // The control panel might be mounted at /cpanel, but API is always at /api (not /cpanel/api)
    const apiBasePath = '';
    api.setBaseUrl(apiBasePath);
    // Fetch version from API
    useEffect(() => {
        api.getInfo()
            .then((info) => setVersion(info.version || ''))
            .catch(() => { });
    }, [apiBasePath]); // Re-fetch when apiBasePath changes
    // Build navigation: base items (filtered by hideBaseNavItems) + custom items
    // Navigation routes are relative to BrowserRouter's basename
    const filteredBaseItems = showBaseNavigation
        ? getBaseNavigationItems().filter(item => !hideBaseNavItems.includes(item.id))
        : [];
    const allNavigationItems = [
        ...filteredBaseItems,
        ...navigationItems,
    ];
    // Default logo if not provided
    const effectiveLogo = logo || _jsx(ProductLogo, { name: productName });
    // Default footer if not provided
    const effectiveFooter = footerContent || _jsx(DefaultFooter, { version: version });
    return (_jsx(WidgetComponentRegistryProvider, { initialComponents: allWidgetComponents, children: _jsx(DashboardWidgetProvider, { initialWidgets: dashboardWidgets, children: _jsx(QwickApp, { config: defaultConfig, logo: effectiveLogo, footerContent: effectiveFooter, enableScaffolding: true, navigationItems: allNavigationItems, showThemeSwitcher: showThemeSwitcher, showPaletteSwitcher: showPaletteSwitcher, children: _jsxs(Routes, { children: [showBaseNavigation && (_jsxs(_Fragment, { children: [!hideBaseNavItems.includes('dashboard') && _jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), !hideBaseNavItems.includes('logs') && _jsx(Route, { path: "/logs", element: _jsx(LogsPage, {}) }), !hideBaseNavItems.includes('auth') && _jsx(Route, { path: "/auth", element: _jsx(AuthPage, {}) }), !hideBaseNavItems.includes('system') && _jsx(Route, { path: "/system", element: _jsx(SystemPage, {}) })] })), children, _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }) }) }));
}
//# sourceMappingURL=ControlPanelApp.js.map