/**
 * BansManagementPage - Full management interface for user bans
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface BansManagementPageProps {
  /** API endpoint prefix (default: '/api/bans') */
  apiPrefix?: string;
}

interface Ban {
  id: string;
  userId: string;
  userEmail: string;
  reason: string;
  type: 'permanent' | 'temporary';
  status: 'active' | 'expired' | 'lifted';
  createdAt: string;
  expiresAt?: string;
  createdBy?: string;
}

export function BansManagementPage({ apiPrefix = '/api/bans' }: BansManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'config'>('all');
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setBans(data.bans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, apiPrefix]);

  const columns: Column<Ban>[] = [
    { key: 'userEmail', label: 'User', sortable: true },
    { key: 'reason', label: 'Reason', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            val === 'permanent'
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            val === 'active'
              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
              : val === 'expired'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'expiresAt', label: 'Expires', sortable: true },
    { key: 'createdBy', label: 'Created By' },
  ];

  const handleLiftBans = (selectedBans: Ban[]) => {
    console.log('Lift bans:', selectedBans);
  };

  const tabs = [
    { id: 'all', label: 'All Bans' },
    { id: 'active', label: 'Active' },
    { id: 'expired', label: 'Expired' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Bans Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'config' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Ban policies and automatic ban rules configuration.
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={bans}
          loading={loading}
          emptyMessage="No bans found"
          bulkActions={[
            {
              label: 'Lift Selected',
              onClick: handleLiftBans,
              variant: 'primary',
            },
          ]}
        />
      )}
    </PluginManagementPage>
  );
}
