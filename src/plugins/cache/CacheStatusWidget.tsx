/**
 * Redis Cache Status Widget Component
 * Displays cache connection status, key count, memory usage, and performance metrics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  PluginStatusWidget,
  type PluginStatusWidgetProps,
} from '@qwickapps/server/ui';

export interface CacheStatusWidgetProps {
  apiPrefix?: string;
}

interface CacheStats {
  connected: boolean;
  keyCount: number;
  usedMemory: string;
  hitRate: number;
  missRate: number;
  opsPerSec: number;
  health: 'healthy' | 'warning' | 'error' | 'disabled';
}

export const CacheStatusWidget: React.FC<CacheStatusWidgetProps> = ({
  apiPrefix = '/api/plugins/cache',
}) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
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
        title="Redis Cache"
        status="healthy"
        loading={true}
      />
    );
  }

  if (error || !stats) {
    return (
      <PluginStatusWidget
        title="Redis Cache"
        status="error"
        message={error || 'Failed to load stats'}
      />
    );
  }

  const widgetStats: PluginStatusWidgetProps['stats'] = [
    {
      label: 'Connection',
      value: stats.connected ? 'Connected' : 'Disconnected',
      status: stats.connected ? 'healthy' : 'error',
    },
    {
      label: 'Cached Keys',
      value: stats.keyCount,
      status: stats.keyCount > 100000 ? 'warning' : 'healthy',
    },
    {
      label: 'Memory Used',
      value: stats.usedMemory,
      status: 'info',
    },
    {
      label: 'Cache Hit Rate',
      value: stats.hitRate,
      unit: '%',
      status: stats.hitRate < 50 ? 'warning' : stats.hitRate < 30 ? 'error' : 'healthy',
    },
    {
      label: 'Operations/sec',
      value: stats.opsPerSec,
      status: 'info',
    },
  ];

  return (
    <PluginStatusWidget
      title="Redis Cache"
      status={stats.health}
      stats={widgetStats}
      actions={[
        {
          label: 'View Details',
          onClick: () => {
            window.location.href = '/cpanel/plugins/cache';
          },
          variant: 'secondary',
        },
      ]}
    />
  );
};

export default CacheStatusWidget;
