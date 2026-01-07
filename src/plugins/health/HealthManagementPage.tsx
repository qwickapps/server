/**
 * Health Check Management Page Component
 * Full dashboard for monitoring all health checks with detailed status and history
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface HealthManagementPageProps {
  apiPrefix?: string;
}

interface HealthCheckResult {
  name: string;
  type: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
  lastChecked: string;
  details?: Record<string, unknown>;
}

interface HealthSummary {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  totalChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  degradedChecks: number;
  checks: HealthCheckResult[];
}

export const HealthManagementPage: React.FC<HealthManagementPageProps> = ({
  apiPrefix = '/api/plugins/health',
}) => {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${apiPrefix}/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [apiPrefix]);

  const checkColumns: Column<HealthCheckResult>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (_value, row) => (
        <button
          onClick={() => setSelectedCheck(row)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-left font-medium"
        >
          {row.name}
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value, row) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            row.status === 'healthy'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : row.status === 'degraded'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'latency',
      label: 'Latency',
      sortable: true,
      render: (_value, row) => {
        if (!row.latency) return <span className="text-gray-400">-</span>;
        return (
          <span
            className={
              row.latency < 100
                ? 'text-green-600 dark:text-green-400'
                : row.latency < 500
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {row.latency}ms
          </span>
        );
      },
    },
    {
      key: 'lastChecked',
      label: 'Last Checked',
      sortable: true,
      render: (_value, row) => {
        const date = new Date(row.lastChecked);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        return date.toLocaleString();
      },
    },
    {
      key: 'message',
      label: 'Message',
      render: (_value, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block">
          {row.message || '-'}
        </span>
      ),
    },
  ];

  if (!summary) {
    return (
      <PluginManagementPage
        title="Service Health"
        description="Monitor health status of all services"
        breadcrumbs={[
          { label: 'Control Panel', href: '/cpanel' },
          { label: 'Plugins', href: '/cpanel/plugins' },
          { label: 'Health' },
        ]}
        loading={loading}
      >
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No health check data available
        </div>
      </PluginManagementPage>
    );
  }

  return (
    <PluginManagementPage
      title="Service Health"
      description="Monitor health status of all services and dependencies"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Health' },
      ]}
      loading={loading}
      actions={[
        {
          label: 'Refresh',
          onClick: fetchHealth,
          variant: 'secondary',
        },
      ]}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Overall Status"
          value={summary.overall.toUpperCase()}
          status={
            summary.overall === 'healthy' ? 'healthy' :
            summary.overall === 'degraded' ? 'warning' : 'error'
          }
        />
        <StatCard
          label="Total Checks"
          value={summary.totalChecks}
          status="info"
        />
        <StatCard
          label="Healthy"
          value={summary.healthyChecks}
          status="healthy"
        />
        <StatCard
          label="Degraded"
          value={summary.degradedChecks}
          status={summary.degradedChecks > 0 ? 'warning' : 'info'}
        />
        <StatCard
          label="Unhealthy"
          value={summary.unhealthyChecks}
          status={summary.unhealthyChecks > 0 ? 'error' : 'info'}
        />
      </div>

      {/* Health Checks Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable
          columns={checkColumns}
          data={summary.checks}
          emptyMessage="No health checks configured"
          getRowKey={(row) => row.name}
        />
      </div>

      {/* Health Check Details Modal */}
      {selectedCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Health Check Details
              </h3>
              <button
                onClick={() => setSelectedCheck(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedCheck.name}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedCheck.type}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      selectedCheck.status === 'healthy'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : selectedCheck.status === 'degraded'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {selectedCheck.status}
                  </span>
                </dd>
              </div>

              {selectedCheck.latency && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Latency</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedCheck.latency}ms
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Checked</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(selectedCheck.lastChecked).toLocaleString()}
                </dd>
              </div>

              {selectedCheck.message && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {selectedCheck.message}
                  </dd>
                </div>
              )}

              {selectedCheck.details && Object.keys(selectedCheck.details).length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Details</dt>
                  <dd className="mt-1">
                    <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
                      <code className="text-sm text-gray-900 dark:text-gray-100">
                        {JSON.stringify(selectedCheck.details, null, 2)}
                      </code>
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </PluginManagementPage>
  );
};

export default HealthManagementPage;
