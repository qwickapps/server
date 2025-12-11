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

import { ReactNode, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Link } from '@mui/material';
import { QwickApp, ProductLogo, Text, type MenuItem } from '@qwickapps/react-framework';
import { defaultConfig } from '../config/AppConfig';

// Base pages
import { DashboardPage } from '../pages/DashboardPage';
import { HealthPage } from '../pages/HealthPage';
import { LogsPage } from '../pages/LogsPage';
import { SystemPage } from '../pages/SystemPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Dashboard widget system
import { DashboardWidgetProvider, type DashboardWidget } from '../dashboard';

// API
import { api } from '../api/controlPanelApi';

export interface ControlPanelAppProps {
  /** Product name displayed in the header */
  productName?: string;

  /** Custom logo component */
  logo?: ReactNode;

  /** Custom footer content (replaces default) */
  footerContent?: ReactNode;

  /** Initial dashboard widgets to register */
  dashboardWidgets?: DashboardWidget[];

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

/**
 * Default footer with QwickApps Server branding
 */
function DefaultFooter({ version }: { version: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 2 }}>
      <Text variant="caption" customColor="var(--theme-text-secondary)">
        Built with{' '}
        <Link
          href="https://qwickapps.com/products/qwickapps-server"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'primary.main' }}
        >
          QwickApps Server
        </Link>
        {version && ` v${version}`}
      </Text>
    </Box>
  );
}

/**
 * Base navigation items for control panel
 * Routes are relative to BrowserRouter's basename (handled by NavigationProvider in QwickApp)
 */
function getBaseNavigationItems(): MenuItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', route: '/', icon: 'dashboard' },
    { id: 'health', label: 'Health', route: '/health', icon: 'favorite' },
    { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
    { id: 'system', label: 'System', route: '/system', icon: 'settings' },
  ];
}

export function ControlPanelApp({
  productName = 'Control Panel',
  logo,
  footerContent,
  dashboardWidgets = [],
  navigationItems = [],
  showBaseNavigation = true,
  hideBaseNavItems = [],
  showThemeSwitcher = true,
  showPaletteSwitcher = true,
  basePath = '',
  children,
}: ControlPanelAppProps) {
  const [version, setVersion] = useState<string>('');

  // Configure API base URL based on basePath - do this synchronously before any renders
  // If basePath is '/cpanel', API is at '/cpanel/api'
  // If basePath is '' or '/', API is at '/api'
  const apiBasePath = basePath && basePath !== '/' ? basePath : '';
  api.setBaseUrl(apiBasePath);

  // Fetch version from API
  useEffect(() => {
    api.getInfo()
      .then((info) => setVersion(info.version || ''))
      .catch(() => {});
  }, [apiBasePath]); // Re-fetch when apiBasePath changes

  // Build navigation: base items (filtered by hideBaseNavItems) + custom items
  // Navigation routes are relative to BrowserRouter's basename
  const filteredBaseItems = showBaseNavigation
    ? getBaseNavigationItems().filter(item => !hideBaseNavItems.includes(item.id))
    : [];
  const allNavigationItems: MenuItem[] = [
    ...filteredBaseItems,
    ...navigationItems,
  ];

  // Default logo if not provided
  const effectiveLogo = logo || <ProductLogo name={productName} />;

  // Default footer if not provided
  const effectiveFooter = footerContent || <DefaultFooter version={version} />;

  return (
    <DashboardWidgetProvider initialWidgets={dashboardWidgets}>
      <QwickApp
        config={defaultConfig}
        logo={effectiveLogo}
        footerContent={effectiveFooter}
        enableScaffolding={true}
        navigationItems={allNavigationItems}
        showThemeSwitcher={showThemeSwitcher}
        showPaletteSwitcher={showPaletteSwitcher}
      >
        <Routes>
          {/* Base control panel routes (filtered by hideBaseNavItems) */}
          {showBaseNavigation && (
            <>
              {!hideBaseNavItems.includes('dashboard') && <Route path="/" element={<DashboardPage />} />}
              {!hideBaseNavItems.includes('health') && <Route path="/health" element={<HealthPage />} />}
              {!hideBaseNavItems.includes('logs') && <Route path="/logs" element={<LogsPage />} />}
              {!hideBaseNavItems.includes('system') && <Route path="/system" element={<SystemPage />} />}
            </>
          )}

          {/* Custom routes from consumer */}
          {children}

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </QwickApp>
    </DashboardWidgetProvider>
  );
}
