/**
 * BansStatusWidget - Dashboard widget for user bans overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface BansStatusWidgetProps {
  /** API endpoint prefix (default: '/api/bans') */
  apiPrefix?: string;
}

export function BansStatusWidget({ apiPrefix = '/api/bans' }: BansStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalBans: number;
    activeBans: number;
    permanentBans: number;
    temporaryBans: number;
    recentBans: number;
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
      title="User Bans"
      stats={[
        { label: 'Total Bans', value: stats?.totalBans ?? 0 },
        { label: 'Active', value: stats?.activeBans ?? 0 },
        { label: 'Permanent', value: stats?.permanentBans ?? 0 },
        { label: 'Recent Bans', value: stats?.recentBans ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/bans"
    />
  );
}
