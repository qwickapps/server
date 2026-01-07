/**
 * Logs Status Widget Component
 * Displays log statistics and recent error count
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  PluginStatusWidget,
  type PluginStatusWidgetProps,
} from '@qwickapps/server/ui';

export interface LogsStatusWidgetProps {
  apiPrefix?: string;
}

interface LogStats {
  totalLogs: number;
  byLevel: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  fileSize: string;
  health: 'healthy' | 'warning' | 'error';
}

export const LogsStatusWidget: React.FC<LogsStatusWidgetProps> = ({
  apiPrefix = '/api/plugins/logs',
}) => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiPrefix}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [apiPrefix]);

  if (loading) {
    return (
      <PluginStatusWidget
        title="Application Logs"
        status="healthy"
        loading={true}
      />
    );
  }

  if (error || !stats) {
    return (
      <PluginStatusWidget
        title="Application Logs"
        status="error"
        message={error || 'Failed to load log stats'}
      />
    );
  }

  const widgetStats: PluginStatusWidgetProps['stats'] = [
    {
      label: 'Total Logs',
      value: stats.totalLogs,
      status: 'info',
    },
    {
      label: 'Errors',
      value: stats.byLevel.error,
      status: stats.byLevel.error > 10 ? 'error' : stats.byLevel.error > 0 ? 'warning' : 'healthy',
    },
    {
      label: 'Warnings',
      value: stats.byLevel.warn,
      status: stats.byLevel.warn > 20 ? 'warning' : 'info',
    },
    {
      label: 'Log File Size',
      value: stats.fileSize,
      status: 'info',
    },
  ];

  return (
    <PluginStatusWidget
      title="Application Logs"
      status={stats.health}
      stats={widgetStats}
      message={
        stats.byLevel.error > 0
          ? `${stats.byLevel.error} error(s) logged`
          : 'No errors'
      }
      actions={[
        {
          label: 'View Logs',
          onClick: () => {
            window.location.href = '/cpanel/plugins/logs';
          },
          variant: 'secondary',
        },
      ]}
    />
  );
};

export default LogsStatusWidget;
