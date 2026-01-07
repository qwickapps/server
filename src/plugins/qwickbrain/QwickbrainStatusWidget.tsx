/**
 * QwickbrainStatusWidget - Dashboard widget for QwickBrain AI overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface QwickbrainStatusWidgetProps {
  /** API endpoint prefix (default: '/api/qwickbrain') */
  apiPrefix?: string;
}

export function QwickbrainStatusWidget({ apiPrefix = '/api/qwickbrain' }: QwickbrainStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalDocuments: number;
    indexedRepositories: number;
    queriesToday: number;
    cacheHitRate: number;
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
      title="QwickBrain AI"
      stats={[
        { label: 'Documents', value: stats?.totalDocuments ?? 0 },
        { label: 'Repositories', value: stats?.indexedRepositories ?? 0 },
        { label: 'Queries Today', value: stats?.queriesToday ?? 0 },
        { label: 'Cache Hit Rate', value: stats?.cacheHitRate ? `${stats.cacheHitRate}%` : '0%' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/qwickbrain"
    />
  );
}
