/**
 * RateLimitStatusWidget - Dashboard widget for rate limiting overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface RateLimitStatusWidgetProps {
  /** API endpoint prefix (default: '/api/rate-limit') */
  apiPrefix?: string;
}

export function RateLimitStatusWidget({ apiPrefix = '/api/rate-limit' }: RateLimitStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalRequests: number;
    blockedRequests: number;
    activeRules: number;
    requestsToday: number;
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
      title="Rate Limiting"
      stats={[
        { label: 'Total Requests', value: stats?.totalRequests ?? 0 },
        { label: 'Blocked', value: stats?.blockedRequests ?? 0 },
        { label: 'Active Rules', value: stats?.activeRules ?? 0 },
        { label: 'Requests Today', value: stats?.requestsToday ?? 0 },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/rate-limit"
    />
  );
}
