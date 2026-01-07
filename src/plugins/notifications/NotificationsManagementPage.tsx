/**
 * Notifications Management Page Component
 * Full notifications management with filtering and status tracking
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface NotificationsManagementPageProps {
  apiPrefix?: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
}

interface NotificationsStats {
  totalNotifications: number;
  pendingNotifications: number;
  sentToday: number;
  failedToday: number;
}

export const NotificationsManagementPage: React.FC<NotificationsManagementPageProps> = ({
  apiPrefix = '/api/notifications',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiPrefix}/list`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiPrefix}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [apiPrefix]);

  const columns: Column<Notification>[] = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created' },
  ];

  const filteredNotifications = statusFilter
    ? notifications.filter((n) => n.status === statusFilter)
    : notifications;

  return (
    <PluginManagementPage title="Notifications Management">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
            label="Total Notifications"
          value={stats?.totalNotifications ?? 0}
        />
        <StatCard
            label="Pending"
          value={stats?.pendingNotifications ?? 0}
          status="warning"
        />
        <StatCard
            label="Sent Today"
          value={stats?.sentToday ?? 0}
          status="healthy"
        />
        <StatCard
            label="Failed Today"
          value={stats?.failedToday ?? 0}
          status="error"
        />
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredNotifications}
        loading={loading}
      />
    </PluginManagementPage>
  );
};

export default NotificationsManagementPage;
