/**
 * UsageManagementPage - Full management interface for usage tracking
 */

import React, { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, Column } from '@qwickapps/react-framework';

export interface UsageManagementPageProps {
  /** API endpoint prefix (default: '/api/usage') */
  apiPrefix?: string;
}

interface UsageEvent {
  id: string;
  userId: string;
  userEmail: string;
  eventType: string;
  featureName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function UsageManagementPage({ apiPrefix = '/api/usage' }: UsageManagementPageProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'features' | 'users' | 'config'>('recent');
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'recent') {
      fetch(`${apiPrefix}/events?limit=100`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data.events || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [activeTab, apiPrefix]);

  const columns: Column<UsageEvent>[] = [
    { key: 'timestamp', label: 'Time', sortable: true },
    { key: 'userEmail', label: 'User', sortable: true },
    { key: 'eventType', label: 'Event Type', sortable: true },
    { key: 'featureName', label: 'Feature', sortable: true },
    {
      key: 'metadata',
      label: 'Details',
      render: (val) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {val ? JSON.stringify(val).substring(0, 50) + '...' : '-'}
        </code>
      ),
    },
  ];

  const tabs = [
    { id: 'recent', label: 'Recent Events' },
    { id: 'features', label: 'By Feature' },
    { id: 'users', label: 'By User' },
    { id: 'config', label: 'Configuration' },
  ];

  return (
    <PluginManagementPage
      title="Usage Tracking"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
    >
      {activeTab === 'config' ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Usage tracking configuration and data retention policies.
            </p>
          </div>
        </div>
      ) : activeTab === 'recent' ? (
        <DataTable
          columns={columns}
          data={events}
          loading={loading}
          emptyMessage="No usage events found"
        />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {activeTab === 'features' ? 'Feature usage analytics' : 'User usage analytics'}
        </div>
      )}
    </PluginManagementPage>
  );
}
