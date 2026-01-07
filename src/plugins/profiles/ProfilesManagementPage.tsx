/**
 * ProfilesManagementPage - Full management interface for user profiles
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface ProfilesManagementPageProps {
  /** API endpoint prefix (default: '/api/profiles') */
  apiPrefix?: string;
}

interface Profile {
  id: string;
  userId: string;
  userEmail: string;
  displayName?: string;
  avatarUrl?: string;
  completionStatus: 'complete' | 'incomplete';
  updatedAt: string;
  createdAt: string;
}

export function ProfilesManagementPage({ apiPrefix = '/api/profiles' }: ProfilesManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'complete' | 'incomplete' | 'config'>('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, apiPrefix]);

  const columns: Column<Profile>[] = [
    {
      key: 'avatarUrl',
      label: '',
      width: '60px',
      render: (val) =>
        val ? (
          <img
            src={String(val)}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        ),
    },
    { key: 'displayName', label: 'Name', sortable: true },
    { key: 'userEmail', label: 'Email', sortable: true },
    {
      key: 'completionStatus',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            val === 'complete'
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    { key: 'updatedAt', label: 'Last Updated', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  const tabs = [
    { id: 'all', label: 'All Profiles' },
    { id: 'complete', label: 'Complete' },
    { id: 'incomplete', label: 'Incomplete' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Profiles Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'config' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Profile schema and required fields configuration.
            </p>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={profiles}
          loading={loading}
          emptyMessage="No profiles found"
        />
      )}
    </PluginManagementPage>
  );
}
