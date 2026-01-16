import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QwickApp, ProductLogo, Text } from '@qwickapps/react-framework';
import { Link, Box } from '@mui/material';
import { defaultConfig } from './config/AppConfig';
import {
  DashboardWidgetProvider,
  WidgetComponentRegistryProvider,
  getBuiltInWidgetComponents,
} from './dashboard';
import { DashboardPage } from './pages/DashboardPage';
import { LogsPage } from './pages/LogsPage';
import { SystemPage } from './pages/SystemPage';
import { PluginsPage } from './pages/PluginsPage';
import { UsersPage } from './pages/UsersPage';
import { EntitlementsPage } from './pages/EntitlementsPage';
import { AuthPage } from './pages/AuthPage';
import { RateLimitPage } from './pages/RateLimitPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { APIKeysPage } from './pages/APIKeysPage';
import { ContentOpsJobsPage } from './pages/ContentOpsJobsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { PluginPage } from './pages/PluginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { api, type MenuContribution } from './api/controlPanelApi';

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
  { id: 'plugins', label: 'Plugins', route: '/plugins', icon: 'extension' },
  { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
  { id: 'system', label: 'System', route: '/system', icon: 'settings' },
];

// Built-in optional navigation items - shown if corresponding plugin is registered
const builtInPluginNavItems: Record<string, NavigationItem> = {
  users: { id: 'users', label: 'Users', route: '/users', icon: 'people' },
  'api-keys': { id: 'api-keys', label: 'API Keys', route: '/api-keys', icon: 'key' },
};

// Routes that have dedicated page components
const dedicatedRoutes = new Set(['/', '/plugins', '/logs', '/system', '/users', '/entitlements', '/auth', '/rate-limits', '/notifications', '/integrations', '/api-keys', '/contentops/jobs', '/maintenance']);

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
 * This is used for BrowserRouter routing, but NOT for API calls.
 */
const basePath = window.__APP_BASE_PATH__ ?? '';

// API routes are always at '/api' regardless of control panel mount path
// The control panel might be mounted at /cpanel, but API is always at /api
api.setBaseUrl('');

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
  const [pluginMenuItems, setPluginMenuItems] = useState<MenuContribution[]>([]);
  const [logoName, setLogoName] = useState<string>('Control Panel');
  const [logoIconUrl, setLogoIconUrl] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product info and UI contributions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch both in parallel
        const [infoResult, contributionsResult] = await Promise.allSettled([
          api.getInfo(),
          api.getUiContributions(),
        ]);

        // Update logo name and icon URL if info fetch succeeded
        if (infoResult.status === 'fulfilled') {
          setLogoName(infoResult.value.logoName);
          setLogoIconUrl(infoResult.value.logoIconUrl);
        } else {
          console.warn('Failed to fetch product info:', infoResult.reason);
        }

        // Update navigation from UI contributions
        if (contributionsResult.status === 'fulfilled') {
          const { plugins, menuItems } = contributionsResult.value;
          const pluginIds = new Set(plugins.map((p) => p.id));
          setRegisteredPlugins(pluginIds);
          setPluginMenuItems(menuItems);

          // Build navigation: core items + built-in plugin items + dynamic menu items
          const dynamicNav = [...coreNavigationItems];

          // Add built-in plugin nav items (like Users)
          for (const [pluginId, navItem] of Object.entries(builtInPluginNavItems)) {
            if (pluginIds.has(pluginId)) {
              dynamicNav.push(navItem);
            }
          }

          // Add plugin-contributed menu items (sorted by order)
          const sortedMenuItems = [...menuItems].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
          for (const menuItem of sortedMenuItems) {
            // Skip if we already have a nav item for this route
            if (dynamicNav.some(nav => nav.route === menuItem.route)) {
              continue;
            }
            dynamicNav.push({
              id: menuItem.id,
              label: menuItem.label,
              route: menuItem.route,
              icon: menuItem.icon || 'extension',
            });
          }

          setNavigationItems(dynamicNav);
        } else {
          console.warn('Failed to fetch UI contributions:', contributionsResult.reason);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Dynamic logo based on logoName and logoIconUrl from API
  // When logoIconUrl is provided, use it as a custom icon instead of the default QwickIcon
  const logoIcon = logoIconUrl ? (
    <img
      src={logoIconUrl}
      alt={logoName}
      style={{ width: 32, height: 32, objectFit: 'contain' }}
    />
  ) : undefined;
  const logo = <ProductLogo icon={logoIcon} name={logoName} />;

  // Show loading state until plugins are loaded
  // This ensures QwickApp receives the correct navigation on first render
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'var(--theme-background, #1a1a2e)',
        }}
      />
    );
  }

  return (
    <BrowserRouter basename={basePath || undefined}>
      <WidgetComponentRegistryProvider initialComponents={getBuiltInWidgetComponents()}>
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
            {/* Core routes */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/system" element={<SystemPage />} />

            {/* Built-in plugin routes */}
            {registeredPlugins.has('users') && (
              <Route path="/users" element={<UsersPage />} />
            )}
            {registeredPlugins.has('entitlements') && (
              <Route path="/entitlements" element={<EntitlementsPage />} />
            )}
            {registeredPlugins.has('auth') && (
              <Route path="/auth" element={<AuthPage />} />
            )}
            {registeredPlugins.has('rate-limit') && (
              <Route path="/rate-limits" element={<RateLimitPage />} />
            )}
            {registeredPlugins.has('notifications') && (
              <Route path="/notifications" element={<NotificationsPage />} />
            )}
            {registeredPlugins.has('ai-proxy') && (
              <Route path="/integrations" element={<IntegrationsPage />} />
            )}
            {registeredPlugins.has('api-keys') && (
              <Route path="/api-keys" element={<APIKeysPage />} />
            )}
            {registeredPlugins.has('contentops') && (
              <Route path="/contentops/jobs" element={<ContentOpsJobsPage />} />
            )}
            {registeredPlugins.has('maintenance') && (
              <Route path="/maintenance" element={<MaintenancePage />} />
            )}

            {/* Dynamic plugin routes - render generic PluginPage for non-dedicated routes */}
            {pluginMenuItems
              .filter(item => !dedicatedRoutes.has(item.route))
              .map(item => (
                <Route
                  key={item.id}
                  path={item.route}
                  element={<PluginPage pluginId={item.pluginId} title={item.label} route={item.route} />}
                />
              ))}

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </QwickApp>
        </DashboardWidgetProvider>
      </WidgetComponentRegistryProvider>
    </BrowserRouter>
  );
}
