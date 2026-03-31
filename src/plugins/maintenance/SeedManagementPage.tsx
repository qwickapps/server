/**
 * Seed Management Page
 *
 * Main page for managing and executing seed scripts and custom tasks.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { SeedList } from './SeedList.js';
import { SeedExecutor } from './SeedExecutor.js';
import { SeedHistory } from './SeedHistory.js';

export interface SeedManagementPageProps {
  apiPrefix?: string;
}

type Tab = 'list' | 'execute' | 'history';

export const SeedManagementPage: React.FC<SeedManagementPageProps> = ({
  apiPrefix = '/qapi/plugins/maintenance',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('file');
  const [selectedOptions, setSelectedOptions] = useState<any>(undefined);

  const handleExecute = (seedName: string, type: string = 'file', options?: any) => {
    setSelectedSeed(seedName);
    setSelectedType(type);
    setSelectedOptions(options);
    setActiveTab('execute');
  };

  const handleExecutionComplete = () => {
    setActiveTab('history');
  };

  return (
    <PluginManagementPage
      title="Seed Management"
      description="Manage and execute database seed scripts and custom tasks"
    >
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '8px 16px',
            marginRight: '8px',
            backgroundColor: activeTab === 'list' ? '#1976d2' : '#f5f5f5',
            color: activeTab === 'list' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Available Seeds & Tasks
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'history' ? '#1976d2' : '#f5f5f5',
            color: activeTab === 'history' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Execution History
        </button>
      </div>

      {activeTab === 'list' && (
        <SeedList apiPrefix={apiPrefix} onExecute={handleExecute} />
      )}

      {activeTab === 'execute' && selectedSeed && (
        <SeedExecutor
          apiPrefix={apiPrefix}
          seedName={selectedSeed}
          seedType={selectedType}
          seedOptions={selectedOptions}
          onComplete={handleExecutionComplete}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {activeTab === 'history' && (
        <SeedHistory apiPrefix={apiPrefix} />
      )}
    </PluginManagementPage>
  );
};

export default SeedManagementPage;
