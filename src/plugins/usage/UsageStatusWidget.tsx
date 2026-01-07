/**
 * UsageStatusWidget - Dashboard widget for usage tracking overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface UsageStatusWidgetProps {
  /** API endpoint prefix (default: '/api/usage') */
  apiPrefix?: string;
}

export function UsageStatusWidget({ apiPrefix = '/api/usage' }: UsageStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalEvents: number;
    activeUsers: number;
    eventsToday: number;
    topFeature: string;
    health: 'healthy' | 'warning' | 'error';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiPrefix}/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiPrefix]);

  return (
    <PluginStatusWidget
      title="Usage Tracking"
      stats={[
        { label: 'Total Events', value: stats?.totalEvents ?? 0 },
        { label: 'Active Users', value: stats?.activeUsers ?? 0 },
        { label: 'Events Today', value: stats?.eventsToday ?? 0 },
        { label: 'Top Feature', value: stats?.topFeature ?? 'N/A' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/usage"
    />
  );
}
