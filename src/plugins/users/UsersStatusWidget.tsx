/**
 * Users Status Widget Component
 * Displays user statistics and recent activity
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  PluginStatusWidget,
  type PluginStatusWidgetProps,
} from '@qwickapps/server/ui';

export interface UsersStatusWidgetProps {
  apiPrefix?: string;
}

interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  suspendedUsers: number;
  recentSignups: number;
  health: 'healthy' | 'warning' | 'error';
}

export const UsersStatusWidget: React.FC<UsersStatusWidgetProps> = ({
  apiPrefix = '/api/users',
}) => {
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${apiPrefix}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [apiPrefix]);

  if (loading) {
    return (
      <PluginStatusWidget
        title="User Management"
        status="healthy"
        loading={true}
      />
    );
  }

  if (error || !stats) {
    return (
      <PluginStatusWidget
        title="User Management"
        status="error"
        message={error || 'Failed to load user stats'}
      />
    );
  }

  const widgetStats: PluginStatusWidgetProps['stats'] = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      status: 'info',
    },
    {
      label: 'Active',
      value: stats.activeUsers,
      status: 'healthy',
    },
    {
      label: 'Invited',
      value: stats.invitedUsers,
      status: stats.invitedUsers > 0 ? 'info' : 'healthy',
    },
    {
      label: 'Suspended',
      value: stats.suspendedUsers,
      status: stats.suspendedUsers > 0 ? 'warning' : 'healthy',
    },
    {
      label: 'Recent (7d)',
      value: stats.recentSignups,
      status: 'info',
    },
  ];

  return (
    <PluginStatusWidget
      title="User Management"
      status={stats.health}
      stats={widgetStats}
      actions={[
        {
          label: 'Manage Users',
          onClick: () => {
            window.location.href = '/cpanel/plugins/users';
          },
          variant: 'secondary',
        },
      ]}
    />
  );
};

export default UsersStatusWidget;
