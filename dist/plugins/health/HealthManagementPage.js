import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Health Check Management Page Component
 * Full dashboard for monitoring all health checks with detailed status and history
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const HealthManagementPage = ({ apiPrefix = '/api/plugins/health', }) => {
    const [summary, setSummary] = useState(null);
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchHealth = async () => {
        try {
            const response = await fetch(`${apiPrefix}/summary`);
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch health:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, [apiPrefix]);
    const checkColumns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (_value, row) => (_jsx("button", { onClick: () => setSelectedCheck(row), className: "text-blue-600 dark:text-blue-400 hover:underline text-left font-medium", children: row.name })),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: "inline-block px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200", children: row.type })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${row.status === 'healthy'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : row.status === 'degraded'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`, children: row.status })),
        },
        {
            key: 'latency',
            label: 'Latency',
            sortable: true,
            render: (_value, row) => {
                if (!row.latency)
                    return _jsx("span", { className: "text-gray-400", children: "-" });
                return (_jsxs("span", { className: row.latency < 100
                        ? 'text-green-600 dark:text-green-400'
                        : row.latency < 500
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400', children: [row.latency, "ms"] }));
            },
        },
        {
            key: 'lastChecked',
            label: 'Last Checked',
            sortable: true,
            render: (_value, row) => {
                const date = new Date(row.lastChecked);
                const now = new Date();
                const diff = now.getTime() - date.getTime();
                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                if (seconds < 60)
                    return `${seconds}s ago`;
                if (minutes < 60)
                    return `${minutes}m ago`;
                return date.toLocaleString();
            },
        },
        {
            key: 'message',
            label: 'Message',
            render: (_value, row) => (_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs block", children: row.message || '-' })),
        },
    ];
    if (!summary) {
        return (_jsx(PluginManagementPage, { title: "Service Health", description: "Monitor health status of all services", breadcrumbs: [
                { label: 'Control Panel', href: '/cpanel' },
                { label: 'Plugins', href: '/cpanel/plugins' },
                { label: 'Health' },
            ], loading: loading, children: _jsx("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12", children: "No health check data available" }) }));
    }
    return (_jsxs(PluginManagementPage, { title: "Service Health", description: "Monitor health status of all services and dependencies", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Health' },
        ], loading: loading, actions: [
            {
                label: 'Refresh',
                onClick: fetchHealth,
                variant: 'secondary',
            },
        ], children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6", children: [_jsx(StatCard, { label: "Overall Status", value: summary.overall.toUpperCase(), status: summary.overall === 'healthy' ? 'healthy' :
                            summary.overall === 'degraded' ? 'warning' : 'error' }), _jsx(StatCard, { label: "Total Checks", value: summary.totalChecks, status: "info" }), _jsx(StatCard, { label: "Healthy", value: summary.healthyChecks, status: "healthy" }), _jsx(StatCard, { label: "Degraded", value: summary.degradedChecks, status: summary.degradedChecks > 0 ? 'warning' : 'info' }), _jsx(StatCard, { label: "Unhealthy", value: summary.unhealthyChecks, status: summary.unhealthyChecks > 0 ? 'error' : 'info' })] }), _jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: _jsx(DataTable, { columns: checkColumns, data: summary.checks, emptyMessage: "No health checks configured", getRowKey: (row) => row.name }) }), selectedCheck && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Health Check Details" }), _jsx("button", { onClick: () => setSelectedCheck(null), className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Close" })] }), _jsxs("dl", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: selectedCheck.name })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Type" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: selectedCheck.type })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Status" }), _jsx("dd", { className: "mt-1", children: _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${selectedCheck.status === 'healthy'
                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    : selectedCheck.status === 'degraded'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`, children: selectedCheck.status }) })] }), selectedCheck.latency && (_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Latency" }), _jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: [selectedCheck.latency, "ms"] })] })), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Last Checked" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(selectedCheck.lastChecked).toLocaleString() })] }), selectedCheck.message && (_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Message" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: selectedCheck.message })] })), selectedCheck.details && Object.keys(selectedCheck.details).length > 0 && (_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Details" }), _jsx("dd", { className: "mt-1", children: _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto", children: _jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: JSON.stringify(selectedCheck.details, null, 2) }) }) })] }))] })] }) }))] }));
};
export default HealthManagementPage;
//# sourceMappingURL=HealthManagementPage.js.map