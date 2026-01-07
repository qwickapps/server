/**
 * AuthManagementPage - Full management interface for authentication
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface AuthManagementPageProps {
  /** API endpoint prefix (default: '/api/auth') */
  apiPrefix?: string;
}

interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth2' | 'saml' | 'local' | 'ldap';
  status: 'active' | 'inactive';
  userCount: number;
  lastUsed?: string;
}

interface AuthSession {
  id: string;
  userId: string;
  userEmail: string;
  provider: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
}

export function AuthManagementPage({ apiPrefix = '/api/auth' }: AuthManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'sessions' | 'config'>('overview');
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'providers') {
      fetch(`${apiPrefix}/providers`)
        .then((res) => res.json())
        .then((data) => {
          setProviders(data.providers || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === 'sessions') {
      fetch(`${apiPrefix}/sessions?limit=100`)
        .then((res) => res.json())
        .then((data) => {
          setSessions(data.sessions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab, apiPrefix]);

  const providerColumns: Column<AuthProvider>[] = [
    { key: 'name', label: 'Provider Name', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
          {String(val).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            val === 'active'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    { key: 'userCount', label: 'Users', sortable: true },
    { key: 'lastUsed', label: 'Last Used', sortable: true },
  ];

  const sessionColumns: Column<AuthSession>[] = [
    { key: 'userEmail', label: 'User', sortable: true },
    { key: 'provider', label: 'Provider', sortable: true },
    { key: 'ipAddress', label: 'IP Address' },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'expiresAt', label: 'Expires', sortable: true },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'providers', label: 'Providers' },
    { id: 'sessions', label: 'Active Sessions' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Authentication Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Providers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{providers.length}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Sessions</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sessions.length}</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Active Providers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {providers.filter((p) => p.status === 'active').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'providers' && (
        <DataTable
          columns={providerColumns}
          data={providers}
          loading={loading}
          emptyMessage="No authentication providers configured"
        />
      )}

      {activeTab === 'sessions' && (
        <DataTable
          columns={sessionColumns}
          data={sessions}
          loading={loading}
          emptyMessage="No active sessions"
          bulkActions={[
            {
              label: 'Revoke Selected',
              onClick: (rows) => console.log('Revoke sessions:', rows),
              variant: 'danger',
            },
          ]}
        />
      )}

      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Authentication configuration is managed through environment variables and plugin settings.
            </p>
          </div>
        </div>
      )}
    </PluginManagementPage>
  );
}
