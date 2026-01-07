/**
 * PostgreSQL Management Page Component
 * Full dashboard for monitoring connections, queries, and database health
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface PostgresManagementPageProps {
  apiPrefix?: string;
}

interface ConnectionInfo {
  pid: number;
  user: string;
  database: string;
  state: string;
  query: string;
  duration: number;
  waitEvent: string | null;
}

interface QueryLog {
  id: string;
  timestamp: string;
  query: string;
  duration: number;
  rows: number;
  status: 'success' | 'error';
}

interface PoolConfig {
  url: string;
  maxConnections: number;
  minConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
}

export const PostgresManagementPage: React.FC<PostgresManagementPageProps> = ({
  apiPrefix = '/api/plugins/postgres',
}) => {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [queryLogs, setQueryLogs] = useState<QueryLog[]>([]);
  const [config, setConfig] = useState<PoolConfig | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    idle: 0,
    waiting: 0,
    utilization: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'queries' | 'config'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, connectionsRes, logsRes, configRes] = await Promise.all([
          fetch(`${apiPrefix}/stats`),
          fetch(`${apiPrefix}/connections`),
          fetch(`${apiPrefix}/query-logs`),
          fetch(`${apiPrefix}/config`),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (connectionsRes.ok) setConnections(await connectionsRes.json());
        if (logsRes.ok) setQueryLogs(await logsRes.json());
        if (configRes.ok) setConfig(await configRes.json());
      } catch (err) {
        console.error('Failed to fetch postgres data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [apiPrefix]);

  const connectionColumns: Column<ConnectionInfo>[] = [
    {
      key: 'pid',
      label: 'PID',
      sortable: true,
      render: (_value, row) => <code className="text-sm">{row.pid}</code>,
    },
    {
      key: 'user',
      label: 'User',
      sortable: true,
    },
    {
      key: 'database',
      label: 'Database',
      sortable: true,
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
      render: (_value, row) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            row.state === 'active'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {row.state}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (_value, row) => `${row.duration}ms`,
    },
    {
      key: 'query',
      label: 'Query',
      render: (_value, row) => (
        <code className="text-xs truncate max-w-xs block" title={row.query}>
          {row.query}
        </code>
      ),
    },
  ];

  const queryLogColumns: Column<QueryLog>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      render: (_value, row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value, row) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            row.status === 'success'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (_value, row) => `${row.duration}ms`,
    },
    {
      key: 'rows',
      label: 'Rows',
      sortable: true,
    },
    {
      key: 'query',
      label: 'Query',
      render: (_value, row) => (
        <code className="text-xs truncate max-w-md block" title={row.query}>
          {row.query}
        </code>
      ),
    },
  ];

  return (
    <PluginManagementPage
      title="PostgreSQL Database"
      description="Monitor connection pool, active queries, and database health"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'PostgreSQL' },
      ]}
      loading={loading}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'connections', 'queries', 'config'] as const).map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Connections"
              value={stats.total}
              status="info"
            />
            <StatCard
              label="Active"
              value={stats.active}
              status={stats.utilization > 80 ? 'warning' : 'healthy'}
            />
            <StatCard
              label="Idle"
              value={stats.idle}
              status="info"
            />
            <StatCard
              label="Pool Utilization"
              value={stats.utilization}
              unit="%"
              status={stats.utilization > 95 ? 'error' : stats.utilization > 80 ? 'warning' : 'healthy'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Recent Queries
              </h3>
              <DataTable
                columns={queryLogColumns}
                data={queryLogs.slice(0, 5)}
                emptyMessage="No recent queries"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Active Connections
              </h3>
              <DataTable
                columns={connectionColumns}
                data={connections.filter((c) => c.state === 'active').slice(0, 5)}
                emptyMessage="No active connections"
              />
            </div>
          </div>
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <DataTable
            columns={connectionColumns}
            data={connections}
            emptyMessage="No connections found"
            bulkActions={[
              {
                label: 'Kill Selected',
                onClick: (selected) => {
                  console.log('Kill connections:', selected);
                },
                variant: 'danger',
              },
            ]}
            selectable
            getRowKey={(row) => row.pid}
          />
        </div>
      )}

      {/* Queries Tab */}
      {activeTab === 'queries' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <DataTable
            columns={queryLogColumns}
            data={queryLogs}
            emptyMessage="No query logs available"
            getRowKey={(row) => row.id}
          />
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && config && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Connection Pool Configuration
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Database URL
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {config.url.replace(/:[^:@]+@/, ':***@')}
                </code>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Max Connections
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {config.maxConnections}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Min Connections
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {config.minConnections}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Idle Timeout
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {config.idleTimeoutMs}ms
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Connection Timeout
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {config.connectionTimeoutMs}ms
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Statement Timeout
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {config.statementTimeoutMs}ms
              </dd>
            </div>
          </dl>
        </div>
      )}
    </PluginManagementPage>
  );
};

export default PostgresManagementPage;
