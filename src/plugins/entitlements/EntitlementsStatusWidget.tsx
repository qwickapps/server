/**
 * EntitlementsStatusWidget - Dashboard widget for entitlements overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface EntitlementsStatusWidgetProps {
  /** API endpoint prefix (default: '/api/entitlements') */
  apiPrefix?: string;
}

export function EntitlementsStatusWidget({ apiPrefix = '/api/entitlements' }: EntitlementsStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalEntitlements: number;
    activeEntitlements: number;
    expiredEntitlements: number;
    recentGrants: number;
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
      title="Entitlements"
      stats={[
        { label: 'Total Entitlements', value: stats?.totalEntitlements ?? 0 },
        { label: 'Active', value: stats?.activeEntitlements ?? 0 },
        { label: 'Expired', value: stats?.expiredEntitlements ?? 0 },
        { label: 'Recent Grants', value: stats?.recentGrants ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/entitlements"
    />
  );
}
