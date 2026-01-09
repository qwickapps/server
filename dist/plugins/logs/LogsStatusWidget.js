import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Logs Status Widget Component
 * Displays log statistics and recent error count
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const LogsStatusWidget = ({ apiPrefix = '/api/plugins/logs', }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${apiPrefix}/stats`);
                if (!response.ok)
                    throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "Application Logs", status: "healthy", loading: true }));
    }
    if (error || !stats) {
        return (_jsx(PluginStatusWidget, { title: "Application Logs", status: "error", message: error || 'Failed to load log stats' }));
    }
    const widgetStats = [
        {
            label: 'Total Logs',
            value: stats.totalLogs,
            status: 'info',
        },
        {
            label: 'Errors',
            value: stats.byLevel.error,
            status: stats.byLevel.error > 10 ? 'error' : stats.byLevel.error > 0 ? 'warning' : 'healthy',
        },
        {
            label: 'Warnings',
            value: stats.byLevel.warn,
            status: stats.byLevel.warn > 20 ? 'warning' : 'info',
        },
        {
            label: 'Log File Size',
            value: stats.fileSize,
            status: 'info',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "Application Logs", status: stats.health, stats: widgetStats, message: stats.byLevel.error > 0
            ? `${stats.byLevel.error} error(s) logged`
            : 'No errors', actions: [
            {
                label: 'View Logs',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/logs';
                },
                variant: 'secondary',
            },
        ] }));
};
export default LogsStatusWidget;
//# sourceMappingURL=LogsStatusWidget.js.map