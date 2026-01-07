/**
 * ApiKeysStatusWidget - Dashboard widget for API keys overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface ApiKeysStatusWidgetProps {
  /** API endpoint prefix (default: '/api/api-keys') */
  apiPrefix?: string;
}

export function ApiKeysStatusWidget({ apiPrefix = '/api/api-keys' }: ApiKeysStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    revokedKeys: number;
    recentlyUsed: number;
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
      title="API Keys"
      stats={[
        { label: 'Total Keys', value: stats?.totalKeys ?? 0 },
        { label: 'Active', value: stats?.activeKeys ?? 0 },
        { label: 'Expired', value: stats?.expiredKeys ?? 0 },
        { label: 'Recently Used', value: stats?.recentlyUsed ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/api-keys"
    />
  );
}
