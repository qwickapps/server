import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Diagnostics Status Widget Component
 * Displays system diagnostics overview including memory, uptime, and environment status
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const DiagnosticsStatusWidget = ({ apiPrefix = '/api/plugins/diagnostics', }) => {
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
        const interval = setInterval(fetchStats, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "System Diagnostics", status: "healthy", loading: true }));
    }
    if (error || !stats) {
        return (_jsx(PluginStatusWidget, { title: "System Diagnostics", status: "error", message: error || 'Failed to load diagnostics' }));
    }
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (days > 0)
            return `${days}d ${hours}h`;
        if (hours > 0)
            return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };
    const widgetStats = [
        {
            label: 'Uptime',
            value: formatUptime(stats.uptime),
            status: 'info',
        },
        {
            label: 'Memory Used',
            value: stats.memoryUsed,
            unit: `/ ${stats.memoryTotal}`,
            status: 'info',
        },
        {
            label: 'CPU Usage',
            value: stats.cpuUsage,
            unit: '%',
            status: stats.cpuUsage > 80 ? 'warning' : stats.cpuUsage > 95 ? 'error' : 'healthy',
        },
        {
            label: 'Environment',
            value: stats.envVarsConfigured,
            unit: `/ ${stats.envVarsTotal}`,
            status: stats.envVarsConfigured < stats.envVarsTotal ? 'warning' : 'healthy',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "System Diagnostics", status: stats.health, stats: widgetStats, actions: [
            {
                label: 'View Details',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/diagnostics';
                },
                variant: 'secondary',
            },
        ] }));
};
export default DiagnosticsStatusWidget;
//# sourceMappingURL=DiagnosticsStatusWidget.js.map