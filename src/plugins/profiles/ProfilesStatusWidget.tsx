/**
 * ProfilesStatusWidget - Dashboard widget for user profiles overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface ProfilesStatusWidgetProps {
  /** API endpoint prefix (default: '/api/profiles') */
  apiPrefix?: string;
}

export function ProfilesStatusWidget({ apiPrefix = '/api/profiles' }: ProfilesStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalProfiles: number;
    completeProfiles: number;
    incompleteProfiles: number;
    recentUpdates: number;
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
      title="User Profiles"
      stats={[
        { label: 'Total Profiles', value: stats?.totalProfiles ?? 0 },
        { label: 'Complete', value: stats?.completeProfiles ?? 0 },
        { label: 'Incomplete', value: stats?.incompleteProfiles ?? 0 },
        { label: 'Recent Updates', value: stats?.recentUpdates ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/profiles"
    />
  );
}
