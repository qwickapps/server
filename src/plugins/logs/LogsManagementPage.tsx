/**
 * Logs Management Page Component
 * Full log viewer with filtering, searching, and source selection
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface LogsManagementPageProps {
  apiPrefix?: string;
}

interface LogEntry {
  id: number;
  level: string;
  timestamp: string;
  namespace: string;
  message: string;
  [key: string]: unknown;
}

interface LogSource {
  name: string;
  type: string;
}

interface LogStats {
  totalLogs: number;
  byLevel: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  fileSize: number;
  fileSizeFormatted: string;
  oldestLog: string | null;
  newestLog: string | null;
}

export const LogsManagementPage: React.FC<LogsManagementPageProps> = ({
  apiPrefix = '/api/plugins/logs',
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sources, setSources] = useState<LogSource[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('app');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSources = async () => {
    try {
      const response = await fetch(`${apiPrefix}/sources`);
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
        if (data.sources.length > 0 && !selectedSource) {
          setSelectedSource(data.sources[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sources:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        source: selectedSource,
        limit: '100',
      });

      if (levelFilter) params.append('level', levelFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${apiPrefix}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiPrefix}/stats?source=${selectedSource}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [apiPrefix]);

  useEffect(() => {
    if (selectedSource) {
      fetchLogs();
      fetchStats();
    }
  }, [selectedSource, levelFilter, searchQuery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
        fetchStats();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedSource, levelFilter, searchQuery]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'warn':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'debug':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const logColumns: Column<LogEntry>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      render: (_value, row) => {
        const date = new Date(row.timestamp);
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {date.toLocaleTimeString()}
          </span>
        );
      },
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (_value, row) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getLevelColor(row.level)}`}>
          {row.level.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'namespace',
      label: 'Namespace',
      sortable: true,
      render: (_value, row) => (
        <code className="text-sm text-gray-900 dark:text-gray-100">{row.namespace}</code>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (_value, row) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">{row.message}</span>
      ),
    },
  ];

  return (
    <PluginManagementPage
      title="Application Logs"
      description="View and filter application logs from various sources"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Logs' },
      ]}
      loading={loading}
      searchPlaceholder="Search logs..."
      onSearch={(query) => setSearchQuery(query)}
      actions={[
        {
          label: autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh',
          onClick: () => setAutoRefresh(!autoRefresh),
          variant: autoRefresh ? 'danger' : 'secondary',
        },
        {
          label: 'Refresh',
          onClick: () => {
            fetchLogs();
            fetchStats();
          },
          variant: 'secondary',
        },
      ]}
      filters={
        <div className="flex gap-4">
          {/* Source Selector */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {sources.map((source) => (
              <option key={source.name} value={source.name}>
                {source.name} ({source.type})
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Levels</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      }
    >
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Logs"
            value={stats.totalLogs}
            status="info"
          />
          <StatCard
            label="Errors"
            value={stats.byLevel.error}
            status={stats.byLevel.error > 0 ? 'error' : 'healthy'}
          />
          <StatCard
            label="Warnings"
            value={stats.byLevel.warn}
            status={stats.byLevel.warn > 0 ? 'warning' : 'healthy'}
          />
          <StatCard
            label="Info"
            value={stats.byLevel.info}
            status="info"
          />
          <StatCard
            label="File Size"
            value={stats.fileSizeFormatted}
            status="info"
          />
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <DataTable
          columns={logColumns}
          data={logs}
          emptyMessage="No logs found"
          getRowKey={(row) => row.id}
        />
      </div>
    </PluginManagementPage>
  );
};

export default LogsManagementPage;
