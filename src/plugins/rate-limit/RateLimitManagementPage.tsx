/**
 * Rate Limit Management Page Component
 * Manage rate limiting rules and monitor request patterns
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface RateLimitManagementPageProps {
  apiPrefix?: string;
}

interface RateLimitRule {
  id: string;
  name: string;
  endpoint: string;
  limit: number;
  window: string;
  status: 'active' | 'inactive';
  hits_today: number;
}

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  activeRules: number;
  requestsToday: number;
}

export const RateLimitManagementPage: React.FC<RateLimitManagementPageProps> = ({
  apiPrefix = '/api/rate-limit',
}) => {
  const [rules, setRules] = useState<RateLimitRule[]>([]);
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchRules = async () => {
    try {
      const response = await fetch(`${apiPrefix}/rules`);
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching rules:', error);
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
    fetchRules();
    fetchStats();
  }, [apiPrefix]);

  const columns: Column<RateLimitRule>[] = [
    { key: 'name', label: 'Rule Name' },
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'limit', label: 'Limit' },
    { key: 'window', label: 'Window' },
    { key: 'status', label: 'Status' },
  ];

  const filteredRules = statusFilter
    ? rules.filter((r) => r.status === statusFilter)
    : rules;

  return (
    <PluginManagementPage title="Rate Limiting Management">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
            label="Total Requests"
          value={stats?.totalRequests ?? 0}
        />
        <StatCard
            label="Blocked Requests"
          value={stats?.blockedRequests ?? 0}
          status="warning"
        />
        <StatCard
            label="Active Rules"
          value={stats?.activeRules ?? 0}
          status="healthy"
        />
        <StatCard
            label="Requests Today"
          value={stats?.requestsToday ?? 0}
          status="info"
        />
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRules}
        loading={loading}
      />
    </PluginManagementPage>
  );
};

export default RateLimitManagementPage;
