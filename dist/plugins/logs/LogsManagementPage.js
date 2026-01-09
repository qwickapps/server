import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Logs Management Page Component
 * Full log viewer with filtering, searching, and source selection
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const LogsManagementPage = ({ apiPrefix = '/api/plugins/logs', }) => {
    const [logs, setLogs] = useState([]);
    const [sources, setSources] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedSource, setSelectedSource] = useState('app');
    const [levelFilter, setLevelFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const fetchSources = async () => {
        try {
            const response = await fetch(`${apiPrefix}/sources`);
            if (response.ok) {
                const data = await response.json();
                setSources(data.sources);
                if (data.sources.length > 0 && !selectedSource) {
                    setSelectedSource(data.sources[0].name);
                }
            }
        }
        catch (err) {
            console.error('Failed to fetch sources:', err);
        }
    };
    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                source: selectedSource,
                limit: '100',
            });
            if (levelFilter)
                params.append('level', levelFilter);
            if (searchQuery)
                params.append('search', searchQuery);
            const response = await fetch(`${apiPrefix}?${params}`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            }
        }
        catch (err) {
            console.error('Failed to fetch logs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchStats = async () => {
        try {
            const response = await fetch(`${apiPrefix}/stats?source=${selectedSource}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };
    useEffect(() => {
        fetchSources();
    }, [apiPrefix]);
    useEffect(() => {
        if (selectedSource) {
            fetchLogs();
            fetchStats();
        }
    }, [selectedSource, levelFilter, searchQuery]);
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchLogs();
                fetchStats();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, selectedSource, levelFilter, searchQuery]);
    const getLevelColor = (level) => {
        switch (level.toLowerCase()) {
            case 'error':
                return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'warn':
                return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
            case 'debug':
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };
    const logColumns = [
        {
            key: 'timestamp',
            label: 'Time',
            sortable: true,
            render: (_value, row) => {
                const date = new Date(row.timestamp);
                return (_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: date.toLocaleTimeString() }));
            },
        },
        {
            key: 'level',
            label: 'Level',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getLevelColor(row.level)}`, children: row.level.toUpperCase() })),
        },
        {
            key: 'namespace',
            label: 'Namespace',
            sortable: true,
            render: (_value, row) => (_jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: row.namespace })),
        },
        {
            key: 'message',
            label: 'Message',
            render: (_value, row) => (_jsx("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: row.message })),
        },
    ];
    return (_jsxs(PluginManagementPage, { title: "Application Logs", description: "View and filter application logs from various sources", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Logs' },
        ], loading: loading, searchPlaceholder: "Search logs...", onSearch: (query) => setSearchQuery(query), actions: [
            {
                label: autoRefresh ? 'Stop Auto-Refresh' : 'Auto-Refresh',
                onClick: () => setAutoRefresh(!autoRefresh),
                variant: autoRefresh ? 'danger' : 'secondary',
            },
            {
                label: 'Refresh',
                onClick: () => {
                    fetchLogs();
                    fetchStats();
                },
                variant: 'secondary',
            },
        ], filters: _jsxs("div", { className: "flex gap-4", children: [_jsx("select", { value: selectedSource, onChange: (e) => setSelectedSource(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: sources.map((source) => (_jsxs("option", { value: source.name, children: [source.name, " (", source.type, ")"] }, source.name))) }), _jsxs("select", { value: levelFilter, onChange: (e) => setLevelFilter(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: [_jsx("option", { value: "", children: "All Levels" }), _jsx("option", { value: "error", children: "Error" }), _jsx("option", { value: "warn", children: "Warning" }), _jsx("option", { value: "info", children: "Info" }), _jsx("option", { value: "debug", children: "Debug" })] })] }), children: [stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Logs", value: stats.totalLogs, status: "info" }), _jsx(StatCard, { label: "Errors", value: stats.byLevel.error, status: stats.byLevel.error > 0 ? 'error' : 'healthy' }), _jsx(StatCard, { label: "Warnings", value: stats.byLevel.warn, status: stats.byLevel.warn > 0 ? 'warning' : 'healthy' }), _jsx(StatCard, { label: "Info", value: stats.byLevel.info, status: "info" }), _jsx(StatCard, { label: "File Size", value: stats.fileSizeFormatted, status: "info" })] })), _jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow", children: _jsx(DataTable, { columns: logColumns, data: logs, emptyMessage: "No logs found", getRowKey: (row) => row.id }) })] }));
};
export default LogsManagementPage;
//# sourceMappingURL=LogsManagementPage.js.map