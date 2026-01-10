import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * ApiKeysManagementPage - Full management interface for API keys
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function ApiKeysManagementPage({ apiPrefix = '/api/api-keys' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setKeys(data.keys || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'key',
            label: 'API Key',
            render: (val) => (_jsxs("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded", children: [String(val).substring(0, 20), "..."] })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : val === 'expired'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}`, children: String(val) })),
        },
        {
            key: 'permissions',
            label: 'Permissions',
            render: (val) => (_jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: Array.isArray(val) ? val.join(', ') : '' })),
        },
        { key: 'usageCount', label: 'Usage', sortable: true },
        { key: 'lastUsedAt', label: 'Last Used', sortable: true },
        { key: 'expiresAt', label: 'Expires', sortable: true },
    ];
    const handleRevoke = (selectedKeys) => {
        console.log('Revoke keys:', selectedKeys);
    };
    const tabs = [
        { id: 'all', label: 'All Keys' },
        { id: 'active', label: 'Active' },
        { id: 'expired', label: 'Expired' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "API Keys Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "API key configuration settings and security policies." }) }) })) : (_jsx(DataTable, { columns: columns, data: keys, loading: loading, emptyMessage: "No API keys found", bulkActions: [
                {
                    label: 'Revoke Selected',
                    onClick: handleRevoke,
                    variant: 'danger',
                },
            ] })) }));
}
//# sourceMappingURL=ApiKeysManagementPage.js.map