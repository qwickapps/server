/**
 * Redis Cache Management Page Component
 * Full dashboard for browsing keys, viewing values, and managing cache
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface CacheManagementPageProps {
  apiPrefix?: string;
}

interface CacheKey {
  key: string;
  type: string;
  ttl: number;
  size: number;
  value?: string;
}

interface CacheInfo {
  connected: boolean;
  keyCount: number;
  usedMemory: string;
  hitRate: number;
  missRate: number;
  opsPerSec: number;
  uptime: number;
}

export const CacheManagementPage: React.FC<CacheManagementPageProps> = ({
  apiPrefix = '/api/plugins/cache',
}) => {
  const [keys, setKeys] = useState<CacheKey[]>([]);
  const [info, setInfo] = useState<CacheInfo | null>(null);
  const [searchPattern, setSearchPattern] = useState('*');
  const [selectedKey, setSelectedKey] = useState<CacheKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'stats'>('browse');

  const fetchKeys = async (pattern: string = '*') => {
    try {
      const response = await fetch(`${apiPrefix}/keys?pattern=${encodeURIComponent(pattern)}`);
      if (response.ok) {
        const data = await response.json();
        setKeys(data);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    }
  };

  const fetchInfo = async () => {
    try {
      const response = await fetch(`${apiPrefix}/info`);
      if (response.ok) {
        const data = await response.json();
        setInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(`Delete key: ${key}?`)) return;

    try {
      const response = await fetch(`${apiPrefix}/keys/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchKeys(searchPattern);
      }
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const handleFlushCache = async () => {
    if (!confirm('Flush entire cache? This will delete ALL keys.')) return;

    try {
      const response = await fetch(`${apiPrefix}/flush`, { method: 'POST' });
      if (response.ok) {
        await fetchKeys(searchPattern);
        await fetchInfo();
      }
    } catch (err) {
      console.error('Failed to flush cache:', err);
    }
  };

  const handleViewKey = async (key: string) => {
    try {
      const response = await fetch(`${apiPrefix}/keys/${encodeURIComponent(key)}/value`);
      if (response.ok) {
        const data = await response.json();
        setSelectedKey({ ...data, key });
      }
    } catch (err) {
      console.error('Failed to fetch key value:', err);
    }
  };

  useEffect(() => {
    fetchKeys(searchPattern);
    fetchInfo();

    const interval = setInterval(fetchInfo, 5000);
    return () => clearInterval(interval);
  }, [apiPrefix]);

  const keyColumns: Column<CacheKey>[] = [
    {
      key: 'key',
      label: 'Key',
      sortable: true,
      render: (_value, row) => (
        <button
          onClick={() => handleViewKey(row.key)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-left"
        >
          <code className="text-sm">{row.key}</code>
        </button>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (_value, row) => (
        <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          {row.type}
        </span>
      ),
    },
    {
      key: 'ttl',
      label: 'TTL',
      sortable: true,
      render: (_value, row) => {
        if (row.ttl === -1) return <span className="text-gray-500">No expiry</span>;
        if (row.ttl === -2) return <span className="text-red-500">Key not found</span>;
        const minutes = Math.floor(row.ttl / 60);
        const seconds = row.ttl % 60;
        return <span>{minutes}m {seconds}s</span>;
      },
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (_value, row) => {
        if (row.size < 1024) return `${row.size} B`;
        if (row.size < 1024 * 1024) return `${(row.size / 1024).toFixed(1)} KB`;
        return `${(row.size / (1024 * 1024)).toFixed(1)} MB`;
      },
    },
    {
      key: 'actions' as keyof CacheKey,
      label: 'Actions',
      render: (_value, row) => (
        <button
          onClick={() => handleDeleteKey(row.key)}
          className="text-red-600 dark:text-red-400 hover:underline text-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <PluginManagementPage
      title="Redis Cache"
      description="Browse cached keys, view values, and manage cache data"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Cache' },
      ]}
      loading={loading}
      searchPlaceholder="Search keys (e.g., user:* or session:*)"
      onSearch={(query) => {
        setSearchPattern(query || '*');
        fetchKeys(query || '*');
      }}
      actions={[
        {
          label: 'Flush Cache',
          onClick: handleFlushCache,
          variant: 'danger',
        },
        {
          label: 'Refresh',
          onClick: () => {
            fetchKeys(searchPattern);
            fetchInfo();
          },
          variant: 'secondary',
        },
      ]}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['browse', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Key Browser */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <DataTable
              columns={keyColumns}
              data={keys}
              emptyMessage="No keys found"
              bulkActions={[
                {
                  label: 'Delete Selected',
                  onClick: async (selected) => {
                    if (!confirm(`Delete ${selected.length} keys?`)) return;
                    for (const key of selected) {
                      await handleDeleteKey(key.key);
                    }
                  },
                  variant: 'danger',
                },
              ]}
              selectable
              getRowKey={(row) => row.key}
            />
          </div>

          {/* Key Value Viewer */}
          {selectedKey && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Key Value
                </h3>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Key:</span>
                  <code className="ml-2 text-sm text-gray-900 dark:text-gray-100">{selectedKey.key}</code>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Value:</span>
                  <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                    <code className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedKey.value || 'null'}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && info && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Connection Status"
              value={info.connected ? 'Connected' : 'Disconnected'}
              status={info.connected ? 'healthy' : 'error'}
            />
            <StatCard
              label="Total Keys"
              value={info.keyCount}
              status="info"
            />
            <StatCard
              label="Memory Used"
              value={info.usedMemory}
              status="info"
            />
            <StatCard
              label="Cache Hit Rate"
              value={info.hitRate}
              unit="%"
              status={info.hitRate < 50 ? 'warning' : 'healthy'}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Performance Metrics
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cache Hit Rate
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {info.hitRate.toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cache Miss Rate
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {info.missRate.toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Operations per Second
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {info.opsPerSec}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Uptime
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {Math.floor(info.uptime / 3600)}h {Math.floor((info.uptime % 3600) / 60)}m
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </PluginManagementPage>
  );
};

export default CacheManagementPage;
