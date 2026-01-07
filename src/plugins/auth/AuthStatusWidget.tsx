/**
 * AuthStatusWidget - Dashboard widget for authentication overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface AuthStatusWidgetProps {
  /** API endpoint prefix (default: '/api/auth') */
  apiPrefix?: string;
}

export function AuthStatusWidget({ apiPrefix = '/api/auth' }: AuthStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalProviders: number;
    activeProviders: number;
    totalSessions: number;
    activeSessions: number;
    recentLogins: number;
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
      title="Authentication"
      stats={[
        { label: 'Total Providers', value: stats?.totalProviders ?? 0 },
        { label: 'Active Providers', value: stats?.activeProviders ?? 0 },
        { label: 'Active Sessions', value: stats?.activeSessions ?? 0 },
        { label: 'Recent Logins', value: stats?.recentLogins ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/auth"
    />
  );
}
