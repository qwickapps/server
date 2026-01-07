/**
 * PreferencesManagementPage - Full management interface for user preferences
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface PreferencesManagementPageProps {
  /** API endpoint prefix (default: '/api/preferences') */
  apiPrefix?: string;
}

interface PreferenceSet {
  id: string;
  userId?: string;
  userEmail?: string;
  scope: 'user' | 'global' | 'app';
  preferenceCount: number;
  updatedAt: string;
  createdAt: string;
}

interface Preference {
  key: string;
  value: unknown;
  type: 'string' | 'number' | 'boolean' | 'json';
  scope: 'user' | 'global' | 'app';
  updatedAt: string;
}

export function PreferencesManagementPage({ apiPrefix = '/api/preferences' }: PreferencesManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'user' | 'global' | 'config'>('overview');
  const [preferenceSets, setPreferenceSets] = useState<PreferenceSet[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetch(`${apiPrefix}/sets`)
        .then((res) => res.json())
        .then((data) => {
          setPreferenceSets(data.sets || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (activeTab === 'user' || activeTab === 'global') {
      fetch(`${apiPrefix}?scope=${activeTab}`)
        .then((res) => res.json())
        .then((data) => {
          setPreferences(data.preferences || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab, apiPrefix]);

  const setColumns: Column<PreferenceSet>[] = [
    { key: 'userEmail', label: 'User', sortable: true },
    {
      key: 'scope',
      label: 'Scope',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
          {String(val).toUpperCase()}
        </span>
      ),
    },
    { key: 'preferenceCount', label: 'Count', sortable: true },
    { key: 'updatedAt', label: 'Updated', sortable: true },
  ];

  const prefColumns: Column<Preference>[] = [
    { key: 'key', label: 'Key', sortable: true },
    {
      key: 'value',
      label: 'Value',
      render: (val) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
        </code>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{String(val)}</span>
      ),
    },
    { key: 'updatedAt', label: 'Updated', sortable: true },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'user', label: 'User Preferences' },
    { id: 'global', label: 'Global Preferences' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Preferences Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'overview' && (
        <DataTable
          columns={setColumns}
          data={preferenceSets}
          loading={loading}
          emptyMessage="No preference sets found"
        />
      )}

      {(activeTab === 'user' || activeTab === 'global') && (
        <DataTable
          columns={prefColumns}
          data={preferences}
          loading={loading}
          emptyMessage={`No ${activeTab} preferences found`}
        />
      )}

      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Preference schema and validation rules configuration.
            </p>
          </div>
        </div>
      )}
    </PluginManagementPage>
  );
}
