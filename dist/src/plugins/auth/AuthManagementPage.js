import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AuthManagementPage - Full management interface for authentication
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function AuthManagementPage({ apiPrefix = '/api/auth' }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [providers, setProviders] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (activeTab === 'providers') {
            fetch(`${apiPrefix}/providers`)
                .then((res) => res.json())
                .then((data) => {
                setProviders(data.providers || []);
                setLoading(false);
            })
                .catch(() => setLoading(false));
        }
        else if (activeTab === 'sessions') {
            fetch(`${apiPrefix}/sessions?limit=100`)
                .then((res) => res.json())
                .then((data) => {
                setSessions(data.sessions || []);
                setLoading(false);
            })
                .catch(() => setLoading(false));
        }
    }, [activeTab, apiPrefix]);
    const providerColumns = [
        { key: 'name', label: 'Provider Name', sortable: true },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (val) => (_jsx("span", { className: "px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100", children: String(val).toUpperCase() })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`, children: String(val) })),
        },
        { key: 'userCount', label: 'Users', sortable: true },
        { key: 'lastUsed', label: 'Last Used', sortable: true },
    ];
    const sessionColumns = [
        { key: 'userEmail', label: 'User', sortable: true },
        { key: 'provider', label: 'Provider', sortable: true },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'createdAt', label: 'Created', sortable: true },
        { key: 'expiresAt', label: 'Expires', sortable: true },
    ];
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'providers', label: 'Providers' },
        { id: 'sessions', label: 'Active Sessions' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsxs(PluginManagementPage, { title: "Authentication Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: [activeTab === 'overview' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Total Providers" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: providers.length })] }), _jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Sessions" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: sessions.length })] }), _jsxs("div", { className: "p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Active Providers" }), _jsx("div", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: providers.filter((p) => p.status === 'active').length })] })] }) })), activeTab === 'providers' && (_jsx(DataTable, { columns: providerColumns, data: providers, loading: loading, emptyMessage: "No authentication providers configured" })), activeTab === 'sessions' && (_jsx(DataTable, { columns: sessionColumns, data: sessions, loading: loading, emptyMessage: "No active sessions", bulkActions: [
                    {
                        label: 'Revoke Selected',
                        onClick: (rows) => console.log('Revoke sessions:', rows),
                        variant: 'danger',
                    },
                ] })), activeTab === 'config' && (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Authentication configuration is managed through environment variables and plugin settings." }) }) }))] }));
}
//# sourceMappingURL=AuthManagementPage.js.map