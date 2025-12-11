import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QwickApp, ProductLogo, Text } from '@qwickapps/react-framework';
import { Link, Box } from '@mui/material';
import { defaultConfig } from './config/AppConfig';
import { DashboardWidgetProvider } from './dashboard';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { SystemPage } from './pages/SystemPage';
import { UsersPage } from './pages/UsersPage';
import { EntitlementsPage } from './pages/EntitlementsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { api } from './api/controlPanelApi';

// Navigation item type
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: string;
}

// Core navigation items always shown
const coreNavigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/', icon: 'dashboard' },
  { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
  { id: 'system', label: 'System', route: '/system', icon: 'settings' },
];

// Optional navigation items - only shown if corresponding plugin is registered
const optionalNavigationItems: Record<string, NavigationItem> = {
  users: { id: 'users', label: 'Users', route: '/users', icon: 'people' },
  entitlements: { id: 'entitlements', label: 'Entitlements', route: '/entitlements', icon: 'local_offer' },
};

// Package version - injected at build time or fallback
const SERVER_VERSION = '1.0.0';

// Declare global type for injected base path
declare global {
  interface Window {
    __APP_BASE_PATH__?: string;
  }
}

/**
 * Get the base path for the application.
 *
 * The server injects window.__APP_BASE_PATH__ at runtime based on
 * either the configured mountPath or X-Forwarded-Prefix header.
 * This is a simple, robust approach - no complex detection needed.
 */
const basePath = window.__APP_BASE_PATH__ ?? '';

// Configure API with the detected base path
api.setBaseUrl(basePath);

// Footer content with QwickApps Server branding
const footerContent = (
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
      {' '}v{SERVER_VERSION}
    </Text>
  </Box>
);

export function App() {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(coreNavigationItems);
  const [registeredPlugins, setRegisteredPlugins] = useState<Set<string>>(new Set());
  const [logoName, setLogoName] = useState<string>('Control Panel');

  // Fetch product info and registered plugins on mount
  useEffect(() => {
    // Fetch product info for logo
    api.getInfo()
      .then((info) => {
        setLogoName(info.logoName);
      })
      .catch((err) => {
        console.warn('Failed to fetch product info:', err);
      });

    // Fetch plugins for navigation
    api.getPlugins()
      .then((response) => {
        const pluginIds = new Set(response.plugins.map((p: { id: string }) => p.id));
        setRegisteredPlugins(pluginIds);

        // Build navigation: core items + optional items for registered plugins
        const dynamicNav = [...coreNavigationItems];
        for (const [pluginId, navItem] of Object.entries(optionalNavigationItems)) {
          if (pluginIds.has(pluginId)) {
            dynamicNav.push(navItem);
          }
        }
        setNavigationItems(dynamicNav);
      })
      .catch((err) => {
        console.warn('Failed to fetch plugins, using core navigation only:', err);
      });
  }, []);

  // Dynamic logo based on logoName from API
  const logo = <ProductLogo name={logoName} />;

  return (
    <BrowserRouter basename={basePath || undefined}>
      <DashboardWidgetProvider>
        <QwickApp
          config={defaultConfig}
          logo={logo}
          footerContent={footerContent}
          enableScaffolding={true}
          navigationItems={navigationItems}
          showThemeSwitcher={true}
          showPaletteSwitcher={true}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/system" element={<SystemPage />} />
            {registeredPlugins.has('users') && (
              <Route path="/users" element={<UsersPage />} />
            )}
            {registeredPlugins.has('entitlements') && (
              <Route path="/entitlements" element={<EntitlementsPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </QwickApp>
      </DashboardWidgetProvider>
    </BrowserRouter>
  );
}
