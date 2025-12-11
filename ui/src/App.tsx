import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QwickApp, ProductLogo, Text } from '@qwickapps/react-framework';
import { Link, Box } from '@mui/material';
import { defaultConfig } from './config/AppConfig';
import { DashboardWidgetProvider } from './dashboard';
import { DashboardPage } from './pages/DashboardPage';
import { HealthPage } from './pages/HealthPage';
import { LogsPage } from './pages/LogsPage';
import { SystemPage } from './pages/SystemPage';
import { UsersPage } from './pages/UsersPage';
import { EntitlementsPage } from './pages/EntitlementsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { api } from './api/controlPanelApi';

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

// Default logo - consumers can customize
const logo = <ProductLogo name="Control Panel" />;

// Default footer content with QwickApps Server branding
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
  return (
    <BrowserRouter basename={basePath || undefined}>
      <DashboardWidgetProvider>
        <QwickApp
          config={defaultConfig}
          logo={logo}
          footerContent={footerContent}
          enableScaffolding={true}
          navigationItems={[
            { id: 'dashboard', label: 'Dashboard', route: '/', icon: 'dashboard' },
            { id: 'health', label: 'Health', route: '/health', icon: 'favorite' },
            { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
            { id: 'system', label: 'System', route: '/system', icon: 'settings' },
            { id: 'users', label: 'Users', route: '/users', icon: 'people' },
            { id: 'entitlements', label: 'Entitlements', route: '/entitlements', icon: 'local_offer' },
          ]}
          showThemeSwitcher={true}
          showPaletteSwitcher={true}
        >
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/entitlements" element={<EntitlementsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </QwickApp>
      </DashboardWidgetProvider>
    </BrowserRouter>
  );
}
