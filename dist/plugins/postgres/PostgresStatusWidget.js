import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PostgreSQL Status Widget Component
 * Displays connection pool status, query performance, and health metrics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const PostgresStatusWidget = ({ apiPrefix = '/api/plugins/postgres', }) => {
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
        const interval = setInterval(fetchStats, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "PostgreSQL Database", status: "healthy", loading: true }));
    }
    if (error || !stats) {
        return (_jsx(PluginStatusWidget, { title: "PostgreSQL Database", status: "error", message: error || 'Failed to load stats' }));
    }
    const widgetStats = [
        {
            label: 'Active Connections',
            value: stats.active,
            unit: `/ ${stats.total}`,
            status: stats.utilization > 80 ? 'warning' : stats.utilization > 95 ? 'error' : 'healthy',
        },
        {
            label: 'Idle Connections',
            value: stats.idle,
            status: 'info',
        },
        {
            label: 'Waiting Requests',
            value: stats.waiting,
            status: stats.waiting > 5 ? 'warning' : stats.waiting > 10 ? 'error' : 'healthy',
        },
        {
            label: 'Pool Utilization',
            value: stats.utilization,
            unit: '%',
            status: stats.utilization > 80 ? 'warning' : stats.utilization > 95 ? 'error' : 'healthy',
        },
        {
            label: 'Queries/min',
            value: stats.queryCount,
            status: 'info',
        },
        {
            label: 'Avg Query Time',
            value: stats.avgQueryTime,
            unit: 'ms',
            status: stats.avgQueryTime > 100 ? 'warning' : stats.avgQueryTime > 500 ? 'error' : 'healthy',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "PostgreSQL Database", status: stats.health, stats: widgetStats, actions: [
            {
                label: 'View Details',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/postgres';
                },
                variant: 'secondary',
            },
        ] }));
};
export default PostgresStatusWidget;
//# sourceMappingURL=PostgresStatusWidget.js.map