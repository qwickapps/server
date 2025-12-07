import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QwickApp, ProductLogo, Text } from '@qwickapps/react-framework';
import { Link, Box } from '@mui/material';
import { defaultConfig } from './config/AppConfig';
import { DashboardPage } from './pages/DashboardPage';
import { HealthPage } from './pages/HealthPage';
import { LogsPage } from './pages/LogsPage';
import { ConfigPage } from './pages/ConfigPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Package version - injected at build time or fallback
const SERVER_VERSION = '1.0.0';

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
    <BrowserRouter>
      <QwickApp
        config={defaultConfig}
        logo={logo}
        footerContent={footerContent}
        enableScaffolding={true}
        navigationItems={[
          { id: 'dashboard', label: 'Dashboard', route: '/', icon: 'dashboard' },
          { id: 'health', label: 'Health', route: '/health', icon: 'favorite' },
          { id: 'logs', label: 'Logs', route: '/logs', icon: 'article' },
          { id: 'config', label: 'Config', route: '/config', icon: 'settings' },
          { id: 'diagnostics', label: 'Diagnostics', route: '/diagnostics', icon: 'bug_report' },
        ]}
        showThemeSwitcher={true}
        showPaletteSwitcher={true}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </QwickApp>
    </BrowserRouter>
  );
}
