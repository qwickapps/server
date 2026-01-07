/**
 * PostgreSQL Status Widget Component
 * Displays connection pool status, query performance, and health metrics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  PluginStatusWidget,
  StatCard,
  type PluginStatusWidgetProps,
} from '@qwickapps/server/ui';

export interface PostgresStatusWidgetProps {
  apiPrefix?: string;
}

interface PostgresStats {
  total: number;
  idle: number;
  waiting: number;
  active: number;
  utilization: number;
  queryCount: number;
  avgQueryTime: number;
  health: 'healthy' | 'warning' | 'error';
}

export const PostgresStatusWidget: React.FC<PostgresStatusWidgetProps> = ({
  apiPrefix = '/api/plugins/postgres',
}) => {
  const [stats, setStats] = useState<PostgresStats | null>(null);
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
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [apiPrefix]);

  if (loading) {
    return (
      <PluginStatusWidget
        title="PostgreSQL Database"
        status="healthy"
        loading={true}
      />
    );
  }

  if (error || !stats) {
    return (
      <PluginStatusWidget
        title="PostgreSQL Database"
        status="error"
        message={error || 'Failed to load stats'}
      />
    );
  }

  const widgetStats: PluginStatusWidgetProps['stats'] = [
    {
      label: 'Active Connections',
      value: stats.active,
      unit: `/ ${stats.total}`,
      status: stats.utilization > 80 ? 'warning' : stats.utilization > 95 ? 'error' : 'healthy',
    },
    {
      label: 'Idle Connections',
      value: stats.idle,
      status: 'info',
    },
    {
      label: 'Waiting Requests',
      value: stats.waiting,
      status: stats.waiting > 5 ? 'warning' : stats.waiting > 10 ? 'error' : 'healthy',
    },
    {
      label: 'Pool Utilization',
      value: stats.utilization,
      unit: '%',
      status: stats.utilization > 80 ? 'warning' : stats.utilization > 95 ? 'error' : 'healthy',
    },
    {
      label: 'Queries/min',
      value: stats.queryCount,
      status: 'info',
    },
    {
      label: 'Avg Query Time',
      value: stats.avgQueryTime,
      unit: 'ms',
      status: stats.avgQueryTime > 100 ? 'warning' : stats.avgQueryTime > 500 ? 'error' : 'healthy',
    },
  ];

  return (
    <PluginStatusWidget
      title="PostgreSQL Database"
      status={stats.health}
      stats={widgetStats}
      actions={[
        {
          label: 'View Details',
          onClick: () => {
            window.location.href = '/cpanel/plugins/postgres';
          },
          variant: 'secondary',
        },
      ]}
    />
  );
};

export default PostgresStatusWidget;
