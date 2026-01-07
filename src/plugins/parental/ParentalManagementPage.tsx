/**
 * ParentalManagementPage - Full management interface for parental controls
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface ParentalManagementPageProps {
  /** API endpoint prefix (default: '/api/parental') */
  apiPrefix?: string;
}

interface ParentalControl {
  id: string;
  childUserId: string;
  childEmail: string;
  parentUserId: string;
  parentEmail: string;
  restrictions: string[];
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export function ParentalManagementPage({ apiPrefix = '/api/parental' }: ParentalManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'violations' | 'config'>('all');
  const [controls, setControls] = useState<ParentalControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setControls(data.controls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, apiPrefix]);

  const columns: Column<ParentalControl>[] = [
    { key: 'childEmail', label: 'Child Account', sortable: true },
    { key: 'parentEmail', label: 'Parent Account', sortable: true },
    {
      key: 'restrictions',
      label: 'Restrictions',
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {Array.isArray(val) ? val.length : 0} active
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
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}
        >
          {String(val)}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'updatedAt', label: 'Updated', sortable: true },
  ];

  const tabs = [
    { id: 'all', label: 'All Controls' },
    { id: 'active', label: 'Active' },
    { id: 'violations', label: 'Violations' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Parental Controls Management"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'config' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Default restrictions and violation policies configuration.
            </p>
          </div>
        </div>
      ) : activeTab === 'violations' ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Violations log and alerts
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={controls}
          loading={loading}
          emptyMessage="No parental controls found"
          bulkActions={[
            {
              label: 'Suspend Selected',
              onClick: (rows) => console.log('Suspend:', rows),
              variant: 'danger',
            },
          ]}
        />
      )}
    </PluginManagementPage>
  );
}
