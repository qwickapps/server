/**
 * ParentalStatusWidget - Dashboard widget for parental controls overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface ParentalStatusWidgetProps {
  /** API endpoint prefix (default: '/api/parental') */
  apiPrefix?: string;
}

export function ParentalStatusWidget({ apiPrefix = '/api/parental' }: ParentalStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalControls: number;
    activeControls: number;
    protectedAccounts: number;
    recentViolations: number;
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
      title="Parental Controls"
      stats={[
        { label: 'Total Controls', value: stats?.totalControls ?? 0 },
        { label: 'Active', value: stats?.activeControls ?? 0 },
        { label: 'Protected Accounts', value: stats?.protectedAccounts ?? 0 },
        { label: 'Recent Violations', value: stats?.recentViolations ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/parental"
    />
  );
}
