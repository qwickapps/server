/**
 * Diagnostics Management Page Component
 * Full system diagnostics dashboard with logs, environment, and system info
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { StatCard } from '@qwickapps/react-framework';

export interface DiagnosticsManagementPageProps {
  apiPrefix?: string;
}

interface DiagnosticsReport {
  timestamp: string;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    pid: number;
    cwd: string;
    uptime: number;
    memory: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
      external: string;
    };
  };
  envCheck: Record<string, boolean>;
  logs?: {
    startup?: string[];
    app?: string[];
  };
  health?: unknown;
}

export const DiagnosticsManagementPage: React.FC<DiagnosticsManagementPageProps> = ({
  apiPrefix = '/api/plugins/diagnostics',
}) => {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'system' | 'environment' | 'logs'>('system');

  const fetchDiagnostics = async () => {
    try {
      const response = await fetch(`${apiPrefix}/full`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [apiPrefix]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  if (!report) {
    return (
      <PluginManagementPage
        title="System Diagnostics"
        description="View detailed system information and logs"
        breadcrumbs={[
          { label: 'Control Panel', href: '/cpanel' },
          { label: 'Plugins', href: '/cpanel/plugins' },
          { label: 'Diagnostics' },
        ]}
        loading={loading}
      >
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          No diagnostics data available
        </div>
      </PluginManagementPage>
    );
  }

  return (
    <PluginManagementPage
      title="System Diagnostics"
      description="View detailed system information, environment configuration, and logs"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Diagnostics' },
      ]}
      loading={loading}
      actions={[
        {
          label: 'Refresh',
          onClick: fetchDiagnostics,
          variant: 'secondary',
        },
        {
          label: 'Download Report',
          onClick: () => {
            const blob = new Blob([JSON.stringify(report, null, 2)], {
              type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `diagnostics-${new Date().toISOString()}.json`;
            a.click();
          },
          variant: 'secondary',
        },
      ]}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['system', 'environment', 'logs'] as const).map((tab) => (
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

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Node Version"
              value={report.system.nodeVersion}
              status="info"
            />
            <StatCard
              label="Platform"
              value={`${report.system.platform} ${report.system.arch}`}
              status="info"
            />
            <StatCard
              label="Uptime"
              value={formatUptime(report.system.uptime)}
              status="healthy"
            />
            <StatCard
              label="Process ID"
              value={report.system.pid}
              status="info"
            />
          </div>

          {/* Memory Usage */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Memory Usage
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Resident Set Size
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {report.system.memory.rss}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Heap Total
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {report.system.memory.heapTotal}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Heap Used
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {report.system.memory.heapUsed}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  External
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {report.system.memory.external}
                </dd>
              </div>
            </dl>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              System Information
            </h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Working Directory
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">
                  <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {report.system.cwd}
                  </code>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Report Generated
                </dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(report.timestamp).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === 'environment' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Environment Variables
          </h3>
          <div className="space-y-2">
            {Object.entries(report.envCheck).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <code className="text-sm font-medium text-gray-900 dark:text-gray-100">{key}</code>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    value
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {value ? 'Configured' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && report.logs && (
        <div className="space-y-6">
          {report.logs.startup && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Startup Logs
              </h3>
              <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <code className="text-xs text-gray-900 dark:text-gray-100">
                  {report.logs.startup.join('\n')}
                </code>
              </pre>
            </div>
          )}

          {report.logs.app && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Application Logs
              </h3>
              <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto max-h-96 overflow-y-auto">
                <code className="text-xs text-gray-900 dark:text-gray-100">
                  {report.logs.app.join('\n')}
                </code>
              </pre>
            </div>
          )}

          {!report.logs.startup && !report.logs.app && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              No logs available
            </div>
          )}
        </div>
      )}
    </PluginManagementPage>
  );
};

export default DiagnosticsManagementPage;
