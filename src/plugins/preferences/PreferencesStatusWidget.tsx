/**
 * PreferencesStatusWidget - Dashboard widget for user preferences overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface PreferencesStatusWidgetProps {
  /** API endpoint prefix (default: '/api/preferences') */
  apiPrefix?: string;
}

export function PreferencesStatusWidget({ apiPrefix = '/api/preferences' }: PreferencesStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalPreferences: number;
    activeUsers: number;
    preferenceSets: number;
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
      title="User Preferences"
      stats={[
        { label: 'Preference Sets', value: stats?.preferenceSets ?? 0 },
        { label: 'Active Users', value: stats?.activeUsers ?? 0 },
        { label: 'Total Prefs', value: stats?.totalPreferences ?? 0 },
        { label: 'Recent Updates', value: stats?.recentUpdates ?? 0, suffix: '/7d' },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/preferences"
    />
  );
}
