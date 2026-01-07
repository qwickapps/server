/**
 * NotificationsStatusWidget - Dashboard widget for notifications overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface NotificationsStatusWidgetProps {
  /** API endpoint prefix (default: '/api/notifications') */
  apiPrefix?: string;
}

export function NotificationsStatusWidget({ apiPrefix = '/api/notifications' }: NotificationsStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalNotifications: number;
    pendingNotifications: number;
    sentToday: number;
    failedToday: number;
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
      title="Notifications"
      stats={[
        { label: 'Total', value: stats?.totalNotifications ?? 0 },
        { label: 'Pending', value: stats?.pendingNotifications ?? 0 },
        { label: 'Sent Today', value: stats?.sentToday ?? 0 },
        { label: 'Failed Today', value: stats?.failedToday ?? 0 },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/notifications"
    />
  );
}
