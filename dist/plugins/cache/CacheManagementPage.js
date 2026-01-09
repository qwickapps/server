import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Redis Cache Management Page Component
 * Full dashboard for browsing keys, viewing values, and managing cache
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const CacheManagementPage = ({ apiPrefix = '/api/plugins/cache', }) => {
    const [keys, setKeys] = useState([]);
    const [info, setInfo] = useState(null);
    const [searchPattern, setSearchPattern] = useState('*');
    const [selectedKey, setSelectedKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('browse');
    const fetchKeys = async (pattern = '*') => {
        try {
            const response = await fetch(`${apiPrefix}/keys?pattern=${encodeURIComponent(pattern)}`);
            if (response.ok) {
                const data = await response.json();
                setKeys(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch keys:', err);
        }
    };
    const fetchInfo = async () => {
        try {
            const response = await fetch(`${apiPrefix}/info`);
            if (response.ok) {
                const data = await response.json();
                setInfo(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch info:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteKey = async (key) => {
        if (!confirm(`Delete key: ${key}?`))
            return;
        try {
            const response = await fetch(`${apiPrefix}/keys/${encodeURIComponent(key)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchKeys(searchPattern);
            }
        }
        catch (err) {
            console.error('Failed to delete key:', err);
        }
    };
    const handleFlushCache = async () => {
        if (!confirm('Flush entire cache? This will delete ALL keys.'))
            return;
        try {
            const response = await fetch(`${apiPrefix}/flush`, { method: 'POST' });
            if (response.ok) {
                await fetchKeys(searchPattern);
                await fetchInfo();
            }
        }
        catch (err) {
            console.error('Failed to flush cache:', err);
        }
    };
    const handleViewKey = async (key) => {
        try {
            const response = await fetch(`${apiPrefix}/keys/${encodeURIComponent(key)}/value`);
            if (response.ok) {
                const data = await response.json();
                setSelectedKey({ ...data, key });
            }
        }
        catch (err) {
            console.error('Failed to fetch key value:', err);
        }
    };
    useEffect(() => {
        fetchKeys(searchPattern);
        fetchInfo();
        const interval = setInterval(fetchInfo, 5000);
        return () => clearInterval(interval);
    }, [apiPrefix]);
    const keyColumns = [
        {
            key: 'key',
            label: 'Key',
            sortable: true,
            render: (_value, row) => (_jsx("button", { onClick: () => handleViewKey(row.key), className: "text-blue-600 dark:text-blue-400 hover:underline text-left", children: _jsx("code", { className: "text-sm", children: row.key }) })),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: "inline-block px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200", children: row.type })),
        },
        {
            key: 'ttl',
            label: 'TTL',
            sortable: true,
            render: (_value, row) => {
                if (row.ttl === -1)
                    return _jsx("span", { className: "text-gray-500", children: "No expiry" });
                if (row.ttl === -2)
                    return _jsx("span", { className: "text-red-500", children: "Key not found" });
                const minutes = Math.floor(row.ttl / 60);
                const seconds = row.ttl % 60;
                return _jsxs("span", { children: [minutes, "m ", seconds, "s"] });
            },
        },
        {
            key: 'size',
            label: 'Size',
            sortable: true,
            render: (_value, row) => {
                if (row.size < 1024)
                    return `${row.size} B`;
                if (row.size < 1024 * 1024)
                    return `${(row.size / 1024).toFixed(1)} KB`;
                return `${(row.size / (1024 * 1024)).toFixed(1)} MB`;
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_value, row) => (_jsx("button", { onClick: () => handleDeleteKey(row.key), className: "text-red-600 dark:text-red-400 hover:underline text-sm", children: "Delete" })),
        },
    ];
    return (_jsxs(PluginManagementPage, { title: "Redis Cache", description: "Browse cached keys, view values, and manage cache data", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Cache' },
        ], loading: loading, searchPlaceholder: "Search keys (e.g., user:* or session:*)", onSearch: (query) => {
            setSearchPattern(query || '*');
            fetchKeys(query || '*');
        }, actions: [
            {
                label: 'Flush Cache',
                onClick: handleFlushCache,
                variant: 'danger',
            },
            {
                label: 'Refresh',
                onClick: () => {
                    fetchKeys(searchPattern);
                    fetchInfo();
                },
                variant: 'secondary',
            },
        ], children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-700 mb-6", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: ['browse', 'stats'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }) }), activeTab === 'browse' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: _jsx(DataTable, { columns: keyColumns, data: keys, emptyMessage: "No keys found", bulkActions: [
                                {
                                    label: 'Delete Selected',
                                    onClick: async (selected) => {
                                        if (!confirm(`Delete ${selected.length} keys?`))
                                            return;
                                        for (const key of selected) {
                                            await handleDeleteKey(key.key);
                                        }
                                    },
                                    variant: 'danger',
                                },
                            ], selectable: true, getRowKey: (row) => row.key }) }), selectedKey && (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Key Value" }), _jsx("button", { onClick: () => setSelectedKey(null), className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Close" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Key:" }), _jsx("code", { className: "ml-2 text-sm text-gray-900 dark:text-gray-100", children: selectedKey.key })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Value:" }), _jsx("pre", { className: "mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto", children: _jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: selectedKey.value || 'null' }) })] })] })] }))] })), activeTab === 'stats' && info && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { label: "Connection Status", value: info.connected ? 'Connected' : 'Disconnected', status: info.connected ? 'healthy' : 'error' }), _jsx(StatCard, { label: "Total Keys", value: info.keyCount, status: "info" }), _jsx(StatCard, { label: "Memory Used", value: info.usedMemory, status: "info" }), _jsx(StatCard, { label: "Cache Hit Rate", value: info.hitRate, unit: "%", status: info.hitRate < 50 ? 'warning' : 'healthy' })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Performance Metrics" }), _jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Cache Hit Rate" }), _jsxs("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: [info.hitRate.toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Cache Miss Rate" }), _jsxs("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: [info.missRate.toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Operations per Second" }), _jsx("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: info.opsPerSec })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Uptime" }), _jsxs("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: [Math.floor(info.uptime / 3600), "h ", Math.floor((info.uptime % 3600) / 60), "m"] })] })] })] })] }))] }));
};
export default CacheManagementPage;
//# sourceMappingURL=CacheManagementPage.js.map