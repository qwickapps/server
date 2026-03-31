import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Seed Management Page
 *
 * Main page for managing and executing seed scripts and custom tasks.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { SeedList } from './SeedList.js';
import { SeedExecutor } from './SeedExecutor.js';
import { SeedHistory } from './SeedHistory.js';
export const SeedManagementPage = ({ apiPrefix = '/qapi/plugins/maintenance', }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [selectedSeed, setSelectedSeed] = useState(null);
    const [selectedType, setSelectedType] = useState('file');
    const [selectedOptions, setSelectedOptions] = useState(undefined);
    const handleExecute = (seedName, type = 'file', options) => {
        setSelectedSeed(seedName);
        setSelectedType(type);
        setSelectedOptions(options);
        setActiveTab('execute');
    };
    const handleExecutionComplete = () => {
        setActiveTab('history');
    };
    return (_jsxs(PluginManagementPage, { title: "Seed Management", description: "Manage and execute database seed scripts and custom tasks", children: [_jsxs("div", { style: { marginBottom: '20px' }, children: [_jsx("button", { onClick: () => setActiveTab('list'), style: {
                            padding: '8px 16px',
                            marginRight: '8px',
                            backgroundColor: activeTab === 'list' ? '#1976d2' : '#f5f5f5',
                            color: activeTab === 'list' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }, children: "Available Seeds & Tasks" }), _jsx("button", { onClick: () => setActiveTab('history'), style: {
                            padding: '8px 16px',
                            backgroundColor: activeTab === 'history' ? '#1976d2' : '#f5f5f5',
                            color: activeTab === 'history' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }, children: "Execution History" })] }), activeTab === 'list' && (_jsx(SeedList, { apiPrefix: apiPrefix, onExecute: handleExecute })), activeTab === 'execute' && selectedSeed && (_jsx(SeedExecutor, { apiPrefix: apiPrefix, seedName: selectedSeed, seedType: selectedType, seedOptions: selectedOptions, onComplete: handleExecutionComplete, onCancel: () => setActiveTab('list') })), activeTab === 'history' && (_jsx(SeedHistory, { apiPrefix: apiPrefix }))] }));
};
export default SeedManagementPage;
//# sourceMappingURL=SeedManagementPage.js.map