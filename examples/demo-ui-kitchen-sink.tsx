/**
 * UI Kitchen-Sink Demo - Comprehensive showcase of all plugin UI components
 *
 * This demo provides a visual reference for all 38 UI components across 19 plugins:
 * - 19 StatusWidget components (dashboard cards)
 * - 19 ManagementPage components (full admin interfaces)
 *
 * ## Categories
 *
 * CORE INFRASTRUCTURE (6 plugins):
 *   - postgres, cache, health, diagnostics, logs, config
 *
 * USER & AUTH MANAGEMENT (5 plugins):
 *   - auth, api-keys, users, bans, preferences
 *
 * BUSINESS LOGIC (6 plugins):
 *   - devices, profiles, subscriptions, entitlements, usage, parental
 *
 * ADVANCED FEATURES (2 plugins):
 *   - notifications, qwickbrain, rate-limit
 *
 * ## Usage
 *
 * ```bash
 * # Start the backend demo first
 * pnpm tsx examples/demo-kitchen-sink.ts
 *
 * # Then run this UI demo (in development mode)
 * pnpm dev
 * ```
 *
 * Visit: http://localhost:5173/demo-ui-kitchen-sink
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// Core Infrastructure StatusWidgets
import { PostgresStatusWidget } from '../src/plugins/postgres/PostgresStatusWidget.js';
import { CacheStatusWidget } from '../src/plugins/cache/CacheStatusWidget.js';
import { HealthStatusWidget } from '../src/plugins/health/HealthStatusWidget.js';
import { DiagnosticsStatusWidget } from '../src/plugins/diagnostics/DiagnosticsStatusWidget.js';
import { LogsStatusWidget } from '../src/plugins/logs/LogsStatusWidget.js';
import { ConfigStatusWidget } from '../src/plugins/config/ConfigStatusWidget.js';

// User & Auth StatusWidgets
import { AuthStatusWidget } from '../src/plugins/auth/AuthStatusWidget.js';
import { ApiKeysStatusWidget } from '../src/plugins/api-keys/ApiKeysStatusWidget.js';
import { UsersStatusWidget } from '../src/plugins/users/UsersStatusWidget.js';
import { BansStatusWidget } from '../src/plugins/bans/BansStatusWidget.js';
import { PreferencesStatusWidget } from '../src/plugins/preferences/PreferencesStatusWidget.js';

// Business Logic StatusWidgets
import { DevicesStatusWidget } from '../src/plugins/devices/DevicesStatusWidget.js';
import { ProfilesStatusWidget } from '../src/plugins/profiles/ProfilesStatusWidget.js';
import { SubscriptionsStatusWidget } from '../src/plugins/subscriptions/SubscriptionsStatusWidget.js';
import { EntitlementsStatusWidget } from '../src/plugins/entitlements/EntitlementsStatusWidget.js';
import { UsageStatusWidget } from '../src/plugins/usage/UsageStatusWidget.js';
import { ParentalStatusWidget } from '../src/plugins/parental/ParentalStatusWidget.js';

// Advanced Features StatusWidgets
import { NotificationsStatusWidget } from '../src/plugins/notifications/NotificationsStatusWidget.js';
import { QwickbrainStatusWidget } from '../src/plugins/qwickbrain/QwickbrainStatusWidget.js';
import { RateLimitStatusWidget } from '../src/plugins/rate-limit/RateLimitStatusWidget.js';

// Core Infrastructure ManagementPages
import { PostgresManagementPage } from '../src/plugins/postgres/PostgresManagementPage.js';
import { CacheManagementPage } from '../src/plugins/cache/CacheManagementPage.js';
import { HealthManagementPage } from '../src/plugins/health/HealthManagementPage.js';
import { DiagnosticsManagementPage } from '../src/plugins/diagnostics/DiagnosticsManagementPage.js';
import { LogsManagementPage } from '../src/plugins/logs/LogsManagementPage.js';
import { ConfigManagementPage } from '../src/plugins/config/ConfigManagementPage.js';

// User & Auth ManagementPages
import { AuthManagementPage } from '../src/plugins/auth/AuthManagementPage.js';
import { ApiKeysManagementPage } from '../src/plugins/api-keys/ApiKeysManagementPage.js';
import { UsersManagementPage } from '../src/plugins/users/UsersManagementPage.js';
import { BansManagementPage } from '../src/plugins/bans/BansManagementPage.js';
import { PreferencesManagementPage } from '../src/plugins/preferences/PreferencesManagementPage.js';

// Business Logic ManagementPages
import { DevicesManagementPage } from '../src/plugins/devices/DevicesManagementPage.js';
import { ProfilesManagementPage } from '../src/plugins/profiles/ProfilesManagementPage.js';
import { SubscriptionsManagementPage } from '../src/plugins/subscriptions/SubscriptionsManagementPage.js';
import { EntitlementsManagementPage } from '../src/plugins/entitlements/EntitlementsManagementPage.js';
import { UsageManagementPage } from '../src/plugins/usage/UsageManagementPage.js';
import { ParentalManagementPage } from '../src/plugins/parental/ParentalManagementPage.js';

// Advanced Features ManagementPages
import { NotificationsManagementPage } from '../src/plugins/notifications/NotificationsManagementPage.js';
import { QwickbrainManagementPage } from '../src/plugins/qwickbrain/QwickbrainManagementPage.js';
import { RateLimitManagementPage } from '../src/plugins/rate-limit/RateLimitManagementPage.js';

type ViewType = 'dashboard' | 'management';
type PluginName =
  | 'postgres'
  | 'cache'
  | 'health'
  | 'diagnostics'
  | 'logs'
  | 'config'
  | 'auth'
  | 'api-keys'
  | 'users'
  | 'bans'
  | 'preferences'
  | 'devices'
  | 'profiles'
  | 'subscriptions'
  | 'entitlements'
  | 'usage'
  | 'parental'
  | 'notifications'
  | 'qwickbrain'
  | 'rate-limit';

const PLUGIN_CATEGORIES = {
  'Core Infrastructure': [
    'postgres',
    'cache',
    'health',
    'diagnostics',
    'logs',
    'config',
  ] as PluginName[],
  'User & Auth Management': [
    'auth',
    'api-keys',
    'users',
    'bans',
    'preferences',
  ] as PluginName[],
  'Business Logic': [
    'devices',
    'profiles',
    'subscriptions',
    'entitlements',
    'usage',
    'parental',
  ] as PluginName[],
  'Advanced Features': [
    'notifications',
    'qwickbrain',
    'rate-limit',
  ] as PluginName[],
};

const API_PREFIX = 'http://localhost:3200/api';

function UIKitchenSinkDemo() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginName | null>(null);

  const renderStatusWidget = (pluginName: PluginName) => {
    const apiPrefix = `${API_PREFIX}/${pluginName}`;

    switch (pluginName) {
      // Core Infrastructure
      case 'postgres':
        return <PostgresStatusWidget apiPrefix={apiPrefix} />;
      case 'cache':
        return <CacheStatusWidget apiPrefix={apiPrefix} />;
      case 'health':
        return <HealthStatusWidget apiPrefix={apiPrefix} />;
      case 'diagnostics':
        return <DiagnosticsStatusWidget apiPrefix={apiPrefix} />;
      case 'logs':
        return <LogsStatusWidget apiPrefix={apiPrefix} />;
      case 'config':
        return <ConfigStatusWidget apiPrefix={apiPrefix} />;

      // User & Auth
      case 'auth':
        return <AuthStatusWidget apiPrefix={apiPrefix} />;
      case 'api-keys':
        return <ApiKeysStatusWidget apiPrefix={apiPrefix} />;
      case 'users':
        return <UsersStatusWidget apiPrefix={apiPrefix} />;
      case 'bans':
        return <BansStatusWidget apiPrefix={apiPrefix} />;
      case 'preferences':
        return <PreferencesStatusWidget apiPrefix={apiPrefix} />;

      // Business Logic
      case 'devices':
        return <DevicesStatusWidget apiPrefix={apiPrefix} />;
      case 'profiles':
        return <ProfilesStatusWidget apiPrefix={apiPrefix} />;
      case 'subscriptions':
        return <SubscriptionsStatusWidget apiPrefix={apiPrefix} />;
      case 'entitlements':
        return <EntitlementsStatusWidget apiPrefix={apiPrefix} />;
      case 'usage':
        return <UsageStatusWidget apiPrefix={apiPrefix} />;
      case 'parental':
        return <ParentalStatusWidget apiPrefix={apiPrefix} />;

      // Advanced Features
      case 'notifications':
        return <NotificationsStatusWidget apiPrefix={apiPrefix} />;
      case 'qwickbrain':
        return <QwickbrainStatusWidget apiPrefix={apiPrefix} />;
      case 'rate-limit':
        return <RateLimitStatusWidget apiPrefix={apiPrefix} />;

      default:
        return null;
    }
  };

  const renderManagementPage = (pluginName: PluginName) => {
    const apiPrefix = `${API_PREFIX}/${pluginName}`;

    switch (pluginName) {
      // Core Infrastructure
      case 'postgres':
        return <PostgresManagementPage apiPrefix={apiPrefix} />;
      case 'cache':
        return <CacheManagementPage apiPrefix={apiPrefix} />;
      case 'health':
        return <HealthManagementPage apiPrefix={apiPrefix} />;
      case 'diagnostics':
        return <DiagnosticsManagementPage apiPrefix={apiPrefix} />;
      case 'logs':
        return <LogsManagementPage apiPrefix={apiPrefix} />;
      case 'config':
        return <ConfigManagementPage apiPrefix={apiPrefix} />;

      // User & Auth
      case 'auth':
        return <AuthManagementPage apiPrefix={apiPrefix} />;
      case 'api-keys':
        return <ApiKeysManagementPage apiPrefix={apiPrefix} />;
      case 'users':
        return <UsersManagementPage apiPrefix={apiPrefix} />;
      case 'bans':
        return <BansManagementPage apiPrefix={apiPrefix} />;
      case 'preferences':
        return <PreferencesManagementPage apiPrefix={apiPrefix} />;

      // Business Logic
      case 'devices':
        return <DevicesManagementPage apiPrefix={apiPrefix} />;
      case 'profiles':
        return <ProfilesManagementPage apiPrefix={apiPrefix} />;
      case 'subscriptions':
        return <SubscriptionsManagementPage apiPrefix={apiPrefix} />;
      case 'entitlements':
        return <EntitlementsManagementPage apiPrefix={apiPrefix} />;
      case 'usage':
        return <UsageManagementPage apiPrefix={apiPrefix} />;
      case 'parental':
        return <ParentalManagementPage apiPrefix={apiPrefix} />;

      // Advanced Features
      case 'notifications':
        return <NotificationsManagementPage apiPrefix={apiPrefix} />;
      case 'qwickbrain':
        return <QwickbrainManagementPage apiPrefix={apiPrefix} />;
      case 'rate-limit':
        return <RateLimitManagementPage apiPrefix={apiPrefix} />;

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '20px',
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
          QwickApps Server - UI Kitchen Sink
        </h1>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Comprehensive showcase of all 38 UI components across 19 plugins
        </p>

        <nav style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setView('dashboard');
              setSelectedPlugin(null);
            }}
            style={{
              padding: '10px 20px',
              border: view === 'dashboard' ? '2px solid #1976d2' : '1px solid #ccc',
              background: view === 'dashboard' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Dashboard (All StatusWidgets)
          </button>
          <button
            onClick={() => setView('management')}
            style={{
              padding: '10px 20px',
              border: view === 'management' ? '2px solid #1976d2' : '1px solid #ccc',
              background: view === 'management' ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Management Pages
          </button>
        </nav>
      </header>

      {view === 'dashboard' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>All StatusWidgets</h2>

          {Object.entries(PLUGIN_CATEGORIES).map(([category, plugins]) => (
            <section key={category} style={{ marginBottom: '40px' }}>
              <h3
                style={{
                  fontSize: '20px',
                  marginBottom: '15px',
                  color: '#333',
                }}
              >
                {category}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                }}
              >
                {plugins.map((pluginName) => (
                  <div key={pluginName}>{renderStatusWidget(pluginName)}</div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {view === 'management' && (
        <div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Sidebar navigation */}
            <aside
              style={{
                width: '250px',
                borderRight: '1px solid #e0e0e0',
                paddingRight: '20px',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Plugins</h3>

              {Object.entries(PLUGIN_CATEGORIES).map(([category, plugins]) => (
                <div key={category} style={{ marginBottom: '20px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      color: '#999',
                      marginBottom: '10px',
                    }}
                  >
                    {category}
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plugins.map((pluginName) => (
                      <li key={pluginName} style={{ marginBottom: '5px' }}>
                        <button
                          onClick={() => setSelectedPlugin(pluginName)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 12px',
                            border:
                              selectedPlugin === pluginName
                                ? '2px solid #1976d2'
                                : '1px solid transparent',
                            background:
                              selectedPlugin === pluginName ? '#e3f2fd' : 'transparent',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          {pluginName}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>

            {/* Main content area */}
            <main style={{ flex: 1 }}>
              {selectedPlugin ? (
                renderManagementPage(selectedPlugin)
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#666',
                  }}
                >
                  <h3>Select a plugin to view its management page</h3>
                  <p>Choose from the sidebar to explore ManagementPage components</p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      <footer
        style={{
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0',
          color: '#666',
          fontSize: '14px',
        }}
      >
        <p>
          <strong>Backend Demo:</strong> Make sure demo-kitchen-sink.ts is running at
          http://localhost:3200
        </p>
        <p>
          <strong>Total Components:</strong> 38 (19 StatusWidgets + 19 ManagementPages)
        </p>
        <p>Copyright (c) 2025 QwickApps.com. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Mount the demo app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<UIKitchenSinkDemo />);
}
