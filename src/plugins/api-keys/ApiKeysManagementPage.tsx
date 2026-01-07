/**
 * ApiKeysManagementPage - Full management interface for API keys
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface ApiKeysManagementPageProps {
  /** API endpoint prefix (default: '/api/api-keys') */
  apiPrefix?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId?: string;
  status: 'active' | 'expired' | 'revoked';
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
}

export function ApiKeysManagementPage({ apiPrefix = '/api/api-keys' }: ApiKeysManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'config'>('all');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setKeys(data.keys || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, apiPrefix]);

  const columns: Column<ApiKey>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'key',
      label: 'API Key',
      render: (val) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {String(val).substring(0, 20)}...
        </code>
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
              : val === 'expired'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {Array.isArray(val) ? val.join(', ') : ''}
        </span>
      ),
    },
    { key: 'usageCount', label: 'Usage', sortable: true },
    { key: 'lastUsedAt', label: 'Last Used', sortable: true },
    { key: 'expiresAt', label: 'Expires', sortable: true },
  ];

  const handleRevoke = (selectedKeys: ApiKey[]) => {
    console.log('Revoke keys:', selectedKeys);
  };

  const tabs = [
    { id: 'all', label: 'All Keys' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="API Keys Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'config' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              API key configuration settings and security policies.
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={keys}
          loading={loading}
          emptyMessage="No API keys found"
          bulkActions={[
            {
              label: 'Revoke Selected',
              onClick: handleRevoke,
              variant: 'danger',
            },
          ]}
        />
      )}
    </PluginManagementPage>
  );
}
