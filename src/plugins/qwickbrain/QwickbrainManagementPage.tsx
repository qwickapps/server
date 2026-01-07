/**
 * QwickBrain Management Page Component
 * Manage AI documents, repositories, and query analytics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface QwickbrainManagementPageProps {
  apiPrefix?: string;
}

interface Repository {
  id: string;
  name: string;
  owner: string;
  status: 'indexed' | 'indexing' | 'failed';
  document_count: number;
  last_updated: string;
}

interface QwickbrainStats {
  totalDocuments: number;
  indexedRepositories: number;
  queriesToday: number;
  cacheHitRate: number;
}

export const QwickbrainManagementPage: React.FC<QwickbrainManagementPageProps> = ({
  apiPrefix = '/api/qwickbrain',
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [stats, setStats] = useState<QwickbrainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchRepositories = async () => {
    try {
      const response = await fetch(`${apiPrefix}/repositories`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
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
    fetchRepositories();
    fetchStats();
  }, [apiPrefix]);

  const columns: Column<Repository>[] = [
    { key: 'name', label: 'Repository' },
    { key: 'owner', label: 'Owner' },
    { key: 'status', label: 'Status' },
    { key: 'document_count', label: 'Documents' },
  ];

  const filteredRepositories = statusFilter
    ? repositories.filter((r) => r.status === statusFilter)
    : repositories;

  return (
    <PluginManagementPage title="QwickBrain AI Management">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
            label="Total Documents"
          value={stats?.totalDocuments ?? 0}
        />
        <StatCard
            label="Indexed Repos"
          value={stats?.indexedRepositories ?? 0}
          status="healthy"
        />
        <StatCard
            label="Queries Today"
          value={stats?.queriesToday ?? 0}
          status="info"
        />
        <StatCard
            label="Cache Hit Rate"
          value={stats?.cacheHitRate ? `${stats.cacheHitRate}%` : '0%'}
          status="healthy"
        />
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="indexed">Indexed</option>
          <option value="indexing">Indexing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRepositories}
        loading={loading}
      />
    </PluginManagementPage>
  );
};

export default QwickbrainManagementPage;
