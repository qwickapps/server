/**
 * SubscriptionsStatusWidget - Dashboard widget for subscriptions overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface SubscriptionsStatusWidgetProps {
  /** API endpoint prefix (default: '/api/subscriptions') */
  apiPrefix?: string;
}

export function SubscriptionsStatusWidget({ apiPrefix = '/api/subscriptions' }: SubscriptionsStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiringSoon: number;
    cancelledToday: number;
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
      title="Subscriptions"
      stats={[
        { label: 'Total Subs', value: stats?.totalSubscriptions ?? 0 },
        { label: 'Active', value: stats?.activeSubscriptions ?? 0 },
        { label: 'Expiring Soon', value: stats?.expiringSoon ?? 0 },
        { label: 'Cancelled Today', value: stats?.cancelledToday ?? 0 },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/subscriptions"
    />
  );
}
