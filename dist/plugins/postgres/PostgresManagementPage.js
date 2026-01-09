import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PostgreSQL Management Page Component
 * Full dashboard for monitoring connections, queries, and database health
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const PostgresManagementPage = ({ apiPrefix = '/api/plugins/postgres', }) => {
    const [connections, setConnections] = useState([]);
    const [queryLogs, setQueryLogs] = useState([]);
    const [config, setConfig] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
        utilization: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, connectionsRes, logsRes, configRes] = await Promise.all([
                    fetch(`${apiPrefix}/stats`),
                    fetch(`${apiPrefix}/connections`),
                    fetch(`${apiPrefix}/query-logs`),
                    fetch(`${apiPrefix}/config`),
                ]);
                if (statsRes.ok)
                    setStats(await statsRes.json());
                if (connectionsRes.ok)
                    setConnections(await connectionsRes.json());
                if (logsRes.ok)
                    setQueryLogs(await logsRes.json());
                if (configRes.ok)
                    setConfig(await configRes.json());
            }
            catch (err) {
                console.error('Failed to fetch postgres data:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [apiPrefix]);
    const connectionColumns = [
        {
            key: 'pid',
            label: 'PID',
            sortable: true,
            render: (_value, row) => _jsx("code", { className: "text-sm", children: row.pid }),
        },
        {
            key: 'user',
            label: 'User',
            sortable: true,
        },
        {
            key: 'database',
            label: 'Database',
            sortable: true,
        },
        {
            key: 'state',
            label: 'State',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: `inline-block px-2 py-1 rounded text-xs ${row.state === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`, children: row.state })),
        },
        {
            key: 'duration',
            label: 'Duration',
            sortable: true,
            render: (_value, row) => `${row.duration}ms`,
        },
        {
            key: 'query',
            label: 'Query',
            render: (_value, row) => (_jsx("code", { className: "text-xs truncate max-w-xs block", title: row.query, children: row.query })),
        },
    ];
    const queryLogColumns = [
        {
            key: 'timestamp',
            label: 'Time',
            sortable: true,
            render: (_value, row) => new Date(row.timestamp).toLocaleString(),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: `inline-block px-2 py-1 rounded text-xs ${row.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`, children: row.status })),
        },
        {
            key: 'duration',
            label: 'Duration',
            sortable: true,
            render: (_value, row) => `${row.duration}ms`,
        },
        {
            key: 'rows',
            label: 'Rows',
            sortable: true,
        },
        {
            key: 'query',
            label: 'Query',
            render: (_value, row) => (_jsx("code", { className: "text-xs truncate max-w-md block", title: row.query, children: row.query })),
        },
    ];
    return (_jsxs(PluginManagementPage, { title: "PostgreSQL Database", description: "Monitor connection pool, active queries, and database health", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'PostgreSQL' },
        ], loading: loading, children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-700 mb-6", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: ['overview', 'connections', 'queries', 'config'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }) }), activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { label: "Total Connections", value: stats.total, status: "info" }), _jsx(StatCard, { label: "Active", value: stats.active, status: stats.utilization > 80 ? 'warning' : 'healthy' }), _jsx(StatCard, { label: "Idle", value: stats.idle, status: "info" }), _jsx(StatCard, { label: "Pool Utilization", value: stats.utilization, unit: "%", status: stats.utilization > 95 ? 'error' : stats.utilization > 80 ? 'warning' : 'healthy' })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Recent Queries" }), _jsx(DataTable, { columns: queryLogColumns, data: queryLogs.slice(0, 5), emptyMessage: "No recent queries" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Active Connections" }), _jsx(DataTable, { columns: connectionColumns, data: connections.filter((c) => c.state === 'active').slice(0, 5), emptyMessage: "No active connections" })] })] })] })), activeTab === 'connections' && (_jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: _jsx(DataTable, { columns: connectionColumns, data: connections, emptyMessage: "No connections found", bulkActions: [
                        {
                            label: 'Kill Selected',
                            onClick: (selected) => {
                                console.log('Kill connections:', selected);
                            },
                            variant: 'danger',
                        },
                    ], selectable: true, getRowKey: (row) => row.pid }) })), activeTab === 'queries' && (_jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: _jsx(DataTable, { columns: queryLogColumns, data: queryLogs, emptyMessage: "No query logs available", getRowKey: (row) => row.id }) })), activeTab === 'config' && config && (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Connection Pool Configuration" }), _jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Database URL" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: _jsx("code", { className: "bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded", children: config.url.replace(/:[^:@]+@/, ':***@') }) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Max Connections" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: config.maxConnections })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Min Connections" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: config.minConnections })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Idle Timeout" }), _jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: [config.idleTimeoutMs, "ms"] })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Connection Timeout" }), _jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: [config.connectionTimeoutMs, "ms"] })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Statement Timeout" }), _jsxs("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: [config.statementTimeoutMs, "ms"] })] })] })] }))] }));
};
export default PostgresManagementPage;
//# sourceMappingURL=PostgresManagementPage.js.map