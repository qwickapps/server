import { jsx as _jsx } from "react/jsx-runtime";
/**
 * UsageManagementPage - Full management interface for usage tracking
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function UsageManagementPage({ apiPrefix = '/api/usage' }) {
    const [activeTab, setActiveTab] = useState('recent');
    const [events, setEvents] = useState([]);
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
    const columns = [
        { key: 'timestamp', label: 'Time', sortable: true },
        { key: 'userEmail', label: 'User', sortable: true },
        { key: 'eventType', label: 'Event Type', sortable: true },
        { key: 'featureName', label: 'Feature', sortable: true },
        {
            key: 'metadata',
            label: 'Details',
            render: (val) => (_jsx("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded", children: val ? JSON.stringify(val).substring(0, 50) + '...' : '-' })),
        },
    ];
    const tabs = [
        { id: 'recent', label: 'Recent Events' },
        { id: 'features', label: 'By Feature' },
        { id: 'users', label: 'By User' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Usage Tracking", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Usage tracking configuration and data retention policies." }) }) })) : activeTab === 'recent' ? (_jsx(DataTable, { columns: columns, data: events, loading: loading, emptyMessage: "No usage events found" })) : (_jsx("div", { className: "p-8 text-center text-gray-500 dark:text-gray-400", children: activeTab === 'features' ? 'Feature usage analytics' : 'User usage analytics' })) }));
}
//# sourceMappingURL=UsageManagementPage.js.map