/**
 * DevicesStatusWidget - Dashboard widget for device management overview
 */

import React, { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';

export interface DevicesStatusWidgetProps {
  /** API endpoint prefix (default: '/api/devices') */
  apiPrefix?: string;
}

export function DevicesStatusWidget({ apiPrefix = '/api/devices' }: DevicesStatusWidgetProps) {
  const [stats, setStats] = useState<{
    totalDevices: number;
    activeDevices: number;
    registeredToday: number;
    pendingApproval: number;
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
      title="Devices"
      stats={[
        { label: 'Total Devices', value: stats?.totalDevices ?? 0 },
        { label: 'Active', value: stats?.activeDevices ?? 0 },
        { label: 'Registered Today', value: stats?.registeredToday ?? 0 },
        { label: 'Pending Approval', value: stats?.pendingApproval ?? 0 },
      ]}
      health={stats?.health ?? 'error'}
      loading={loading}
      error={error}
      detailsPath="/cpanel/plugins/devices"
    />
  );
}
